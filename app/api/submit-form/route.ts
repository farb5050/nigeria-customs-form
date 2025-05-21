import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resend } from '../../../lib/resendClient';

// Initialize Supabase Admin client with Service Role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // 1) Upload any File entries to Supabase Storage
    const attachments: { field: string; url: string }[] = [];
    for (const [field, value] of formData.entries()) {
      if (value instanceof File) {
        const file = value;
        const path = `attachments/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabaseAdmin
          .storage
          .from('attachments')
          .upload(path, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabaseAdmin
          .storage
          .from('attachments')
          .getPublicUrl(path);

        attachments.push({ field, url: urlData.publicUrl });
      }
    }

    // 2) Build the record object for text/other fields
    const record: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (!(value instanceof File)) {
        record[key] = value;
      }
    }
    record.attachments = attachments;

    // 3) Insert into Supabase 'submissions' table
    const { error: dbError } = await supabaseAdmin
      .from('submissions')
      .insert(record);

    if (dbError) throw dbError;

    // 4) Send notification email via Resend
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.RESEND_TO_EMAILS!.split(','),
      subject: `New Submission: ${record.company_name || 'Form Submission'}`,
      html: `<p>A new form was submitted by <strong>${record.company_name || 'a user'}</strong>.</p>
             <p>Check the dashboard for full details.</p>`
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API submit error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
