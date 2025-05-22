import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import formidable from 'formidable';
import { readFile } from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

const storage = new Storage({
  projectId: process.env.FIREBASE_PROJECT_ID,
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET!);

async function parseForm(req: Request) {
  return new Promise((resolve, reject) => {
    const form = formidable();
    form.parse(req as any, (err: any, fields: any, files: any) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export async function POST(req: Request) {
  try {
    // @ts-ignore
    const { files } = await parseForm(req);

    const file = files?.file;
    if (!file) return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });

    // Read file buffer
    const buffer = await readFile(file.filepath);

    // Upload to Firebase Storage
    const firebaseFile = bucket.file(`uploads/${file.originalFilename}`);
    await firebaseFile.save(buffer, {
      contentType: file.mimetype,
      resumable: false,
      public: true,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${file.originalFilename}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message });
  }
}