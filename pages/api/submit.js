// pages/api/submit.js

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, message } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'noreply@yourdomain.com', // ✅ Replace with verified domain email
      to: ['zahraddeen.mamman@customs.gov.ng', 'suleiman.idris@customs.gov.ng'],
      subject: 'New Form Submission',
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong> ${message}</p>`,
    });

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}