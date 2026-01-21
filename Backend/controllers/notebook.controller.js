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
import {PrismaClient} from '@prisma/client';

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET, 
} = process.env;


async function createNotebookFolder(accessToken, parentFolderId, notebookTitle) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.create({
    resource: {
      name: notebookTitle,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id',
  });

  const folderId = res.data.id;

  return {
    folderId,
    folderUrl: `https://drive.google.com/drive/folders/${folderId}`,
  };
}

 export const newNotebook = async (req, res) => {
  
  const prisma = new PrismaClient();

  
  
  
  // get the data from body
  const {title,colour} = req.body;
  if(!title){
    throw new Error("Notebook name is required");
  }
  
  // auth check will already add the user to the req obj 
  const userId = req.user;
  // get the user`s folder_id and reference token by quering the db
  const userRes = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      drive_folder_id:true,
      refresh_token: true,
    },
  })

  console.log("response of user query", userRes);
  const {drive_folder_id, refresh_token} = userRes;

  // 2. Get fresh access token
  const tokenRes = await axios.post(
    'https://oauth2.googleapis.com/token',
    new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token,
      grant_type: 'refresh_token',
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const accessToken = tokenRes.data.access_token;

  // call the function to create the notebook
  const { folderId, folderUrl } = await createNotebookFolder(
        accessToken,
        drive_folder_id,
        title
  );

  // insert the new notebook data in db
  try{
    const notebookRes = await prisma.notebook.create({
    data: {
      title: title,
      colour: colour || '#6366f1',
      owner_id: userId,
    },
    select:{
      id: true,
      title: true,
      colour: true,
      created_at: true,
    }
  });

  res.status(201).json({
    notebook: notebookRes,
    drive: {
      folderId,
      folderUrl,
    },
  });

  }catch(error){
    console.log("error in creating notebook", error);
    res.status(401).json({
      message: error
    });
  }

};


