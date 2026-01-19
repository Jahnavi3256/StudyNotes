import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import { Pool } from 'pg';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import cors from 'cors';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

/* -------------------- ENV -------------------- */
const {
  DATABASE_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  JWT_SECRET,
  APP_BASE_URL,
} = process.env;

/* -------------------- DB -------------------- */
const pool = new Pool({ connectionString: DATABASE_URL });

/* -------------------- GOOGLE -------------------- */
const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

/* -------------------- UTILS -------------------- */
const generateState = () => randomBytes(16).toString('hex');

/* -------------------- GOOGLE DRIVE -------------------- */
async function getOrCreateNotesFolder(accessToken) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth });

  // Check if folder already exists
  const listRes = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.folder' and name='notes' and trashed=false",
    fields: 'files(id, name)',
  });

  if (listRes.data.files.length > 0) {
    return listRes.data.files[0].id;
  }

  // Create only if NOT exists
  const createRes = await drive.files.create({
    resource: {
      name: 'notes',
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });

  return createRes.data.id;
}

/* -------------------- AUTH ROUTES -------------------- */

// Step 1: Redirect to Google
app.get('/auth/google', (req, res) => {
  const state = generateState();

  res.cookie('oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 5 * 60 * 1000,
  });

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile https://www.googleapis.com/auth/drive.file',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// Step 2: Callback
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const savedState = req.cookies.oauth_state;

    if (!state || state !== savedState) {
      return res.status(400).send('Invalid OAuth state');
    }

    res.clearCookie('oauth_state');

    // Exchange code for tokens
    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { id_token, access_token, refresh_token } = tokenRes.data;

    // Verify user
    const ticket = await oauth2Client.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const avatar = payload.picture;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const userRes = await client.query(
        'SELECT id, drive_folder_id FROM users WHERE google_id=$1 OR email=$2',
        [googleId, email]
      );

      let userId;
      let driveFolderId;

      if (userRes.rows.length === 0) {
        driveFolderId = await getOrCreateNotesFolder(access_token);

        const insert = await client.query(
          `INSERT INTO users 
           (google_id, email, full_name, avatar_url, refresh_token, drive_folder_id)
           VALUES ($1,$2,$3,$4,$5,$6)
           RETURNING id`,
          [googleId, email, name, avatar, refresh_token, driveFolderId]
        );

        userId = insert.rows[0].id;
      } else {
        userId = userRes.rows[0].id;
        driveFolderId = userRes.rows[0].drive_folder_id;

        if (refresh_token) {
          await client.query(
            `UPDATE users SET refresh_token=$1, updated_at=now() WHERE id=$2`,
            [refresh_token, userId]
          );
        }
      }

      await client.query('COMMIT');

      const appToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

      res.cookie('app_session', appToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`${APP_BASE_URL}/auth-success`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Authentication failed');
  }
});

/* -------------------- PROTECTED ROUTE -------------------- */
app.get('/api/me', async (req, res) => {
  try {
    const token = req.cookies.app_session;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await pool.query(
      'SELECT id, email, full_name, avatar_url FROM users WHERE id=$1',
      [decoded.userId]
    );

    res.json(user.rows[0]);
  } catch {
    res.status(401).json({ error: 'Invalid session' });
  }
});

/* -------------------- START -------------------- */
app.listen(4000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:4000');
});
