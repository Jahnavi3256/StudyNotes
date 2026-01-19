/* 1) structure the code in the good format 
2) see what is happening 
3) if the folder of the unique name already exist then do not create it again okay
4) proceed with other db structuring + how you will store the files to the google drive  
5) push this on github 
*/

/* how to list the recent activity */

// server.js
require('dotenv').config({path: "../.env"});
import express, { json } from 'express';
import { post } from 'axios';
import { Pool } from 'pg';
import cookieParser from 'cookie-parser';
import { sign, verify } from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import cors from 'cors';
import { google } from 'googleapis';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(json());
app.use(cookieParser());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  JWT_SECRET,
  APP_BASE_URL
} = process.env;

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Utility: generate cryptographically secure random string (for state)
function generateState() {
  return randomBytes(16).toString('hex');
}

// ----------------------------------
async function createNotesFolder(accessToken) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth });

  const folderMetadata = {
    name: 'notes',
    mimeType: 'application/vnd.google-apps.folder',
  };

  const folder = await drive.files.create({
    resource: folderMetadata,
    fields: 'id',
  });

  return folder.data.id;
}

// ----------------------------------

// 1) Redirect user to Google
app.get('/auth/google', (req, res) => {
  const state = generateState();
  // store state in cookie for CSRF protection
  res.cookie('oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax', // in production consider 'none' with secure true for cross-site cookies
    secure: false, // set true on HTTPS in production
    maxAge: 5 * 60 * 1000 // 5 minutes
  });

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile https://www.googleapis.com/auth/drive.file', // minimal scopes
    access_type: 'offline', // request refresh_token
    include_granted_scopes: 'true',
    state
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.redirect(authUrl);
});

// 2) Callback handler
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const storedState = req.cookies['oauth_state'];
    if (!state || !storedState || state !== storedState) {
      return res.status(400).send('Invalid state parameter (possible CSRF)');
    }
    // Clear the state cookie
    res.clearCookie('oauth_state');

    // Exchange code for tokens
    const tokenRes = await post('https://oauth2.googleapis.com/token', new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { id_token, access_token, refresh_token } = tokenRes.data;

    // Verify id_token and get payload
    const ticket = await oauth2Client.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    // payload contains: sub (Google user id), email, email_verified, name, picture, locale, etc.
    const googleId = payload.sub;
    const email = payload.email;
    const fullName = payload.name;
    const avatar = payload.picture;

    // Upsert user in DB
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const findRes = await client.query('SELECT id FROM users WHERE google_id=$1 OR email=$2', [googleId, email]);
      let userId;
      if (findRes.rows.length === 0) {
        // create the folder first 
        driveFolderId = await createNotesFolder(access_token);

        const insertRes = await client.query(
          `INSERT INTO users (google_id, email, full_name, avatar_url, refresh_token,drive_folder_id)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
          [googleId, email, fullName, avatar, refresh_token || null, driveFolderId]
        );
        userId = insertRes.rows[0].id;
      } else {
        userId = findRes.rows[0].id;
        // update refresh_token if provided and maybe update profile fields
        if (refresh_token) {
          await client.query(
            `UPDATE users SET refresh_token=$1, full_name=$2, avatar_url=$3, updated_at=now() WHERE id=$4`,
            [refresh_token, fullName, avatar, userId]
          );
        }
      }
      await client.query('COMMIT');

      // Create our own session (JWT)
      const tokenPayload = { userId, email, name: fullName };
      const appToken = sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

      // Set cookie (HTTP-only)
      res.cookie('app_session', appToken, {
        httpOnly: true,
        secure: false, // set true in production (HTTPS)
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      // Redirect back to frontend app
      res.redirect(`${APP_BASE_URL}/auth-success`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('OAuth callback error', err.response?.data || err.message || err);
    res.status(500).send('Authentication failed');
  }
});

// 3) Example protected endpoint: get current user
app.get('/api/me', async (req, res) => {
  try {
    const token = req.cookies['app_session'] || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    let payload;
    try {
      payload = verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const userRes = await pool.query('SELECT id, email, full_name, avatar_url FROM users WHERE id=$1', [payload.userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: userRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log('Server started on port', process.env.PORT || 4000);
});
