import { NextResponse } from 'next/server';
import { resend } from '@/lib/resendClient';
import { supabase } from '@/lib/supabaseClient';
import { IncomingForm } from 'formidable';
import type { NextApiRequest } from 'next';

export const config = {
  api: {
    bodyParser: false, // Disables Next's default body parsing
  },
};

function parseForm(req: any) {
  return new Promise<{ fields: any; files: any }>((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export async function POST(req: Request) {
  try {
    // @ts-ignore
    const { fields, files } = await parseForm(req);
    console.log("Received fields:", fields);
    console.log("Received files:", files);

    const { fullName, email, phone, subject, message } = fields;

    // Save to Supabase
    const { data: dbData, error: dbError } = await supabase
      .from('submissions')
      .insert([{ fullName, email, phone, subject, message }])
      .select();

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    // Send email via Resend
    const emailHtml = `
      <h2>New Form Submission</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong> ${message}</p>
    `;

    const emailRes = await resend.emails.send({
      from: 'noreply@ncs.gov.ng',
      to: ['suleiman.idris@customs.gov.ng', 'bisulaiman2010@gmail.com'],
      subject: `Customs Form Submission: ${subject || 'New Entry'}`,
      html: emailHtml,
    });

    console.log("Resend response:", emailRes);

    if (emailRes.error) {
      return NextResponse.json({ success: false, error: emailRes.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, dbData, emailRes });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
