import 'dotenv/config';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  JWT_SECRET,
  APP_BASE_URL,
} = process.env;

//GOOGLE 
const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

//UTILS 
const generateState = () => randomBytes(16).toString('hex');

//GOOGLE DRIVE 
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

//AUTH ROUTES 

// Step 1: Redirect to Google
export const googleAuth = async (req, res) => {
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
};

// Step 2: Callback
export const googleCallback = async (req, res) => {
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

    const prisma = new PrismaClient();

    try {
      const userRes = await prisma.user.findFirst({
        where: {
          OR: [
            { google_id: googleId },
            { email: email },
          ],
        },
        select: {
          id: true,
          drive_folder_id: true,
        },
      })

      let userId;
      let driveFolderId;

      if (!userRes) {

        driveFolderId = await getOrCreateNotesFolder(access_token);

        const insert = await prisma.user.create({
          data: {
            google_id: googleId,
            email: email,
            full_name: name,
            avatar_url: avatar,
            refresh_token: refresh_token,
            drive_folder_id: driveFolderId,
          },
          select: {
            id: true,
          },
        });


        userId = insert.id;
      } else {
        userId = userRes.id;
        driveFolderId = userRes.drive_folder_id;

        if (refresh_token) {
          await prisma.user.update({
            where: {
              id: userId,
            },
            data: {
              refresh_token: refresh_token,
              updated_at: new Date(),
            },
          });
        }
      }

      const appToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

      res.cookie('app_session', appToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`${APP_BASE_URL}/auth-success`);
    } catch (err) {
      throw err;
    } finally {

    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Authentication failed');
  }
};

export const getMe = async (req, res) => {
  try {
    const token = req.cookies.app_session;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
      },
    })

    res.json(user);
  } catch {
    res.status(401).json({ error: 'Invalid session' });
  }
};

