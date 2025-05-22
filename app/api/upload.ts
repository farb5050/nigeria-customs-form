// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

// 1️⃣ Disable Next’s built-in parser so formidable can read the stream
export const config = {
  api: { bodyParser: false },
};

// 2️⃣ Initialize Firebase Admin once (singleton)
const firebaseApp = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  } as ServiceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});
const bucket = getStorage(firebaseApp).bucket();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 3️⃣ Parse incoming form data
  const form = new formidable.IncomingForm({ keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("⚠️ Form parse error:", err);
      return res.status(500).json({ error: "Failed to parse form" });
    }

    try {
      // Adjust “attachment” to whatever your <input name="…"> is
      const file = files.attachment as formidable.File;
      const destPath = `uploads/${Date.now()}_${file.originalFilename}`;

      // 4️⃣ Upload file to Firebase Storage
      await bucket.upload(file.filepath, {
        destination: destPath,
        metadata: { contentType: file.mimetype },
      });

      // 5️⃣ Generate a signed URL (24h expiry)
      const uploaded = bucket.file(destPath);
      const [url] = await uploaded.getSignedUrl({
        action: "read",
        expires: Date.now() + 1000 * 60 * 60 * 24,
      });

      // 6️⃣ Return success payload
      return res.status(200).json({
        message: "Upload successful",
        data: { fields, fileUrl: url },
      });
    } catch (uploadErr) {
      console.error("⚠️ Upload error:", uploadErr);
      return res.status(500).json({ error: "Upload failed" });
    }
  });
}