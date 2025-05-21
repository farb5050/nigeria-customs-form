import { NextResponse } from 'next/server';
import { resend } from '@/lib/resendClient';
import { supabase } from '@/lib/supabaseClient';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const { fullName, email, phone, subject, message } = data;

    // Save to Supabase
    const { error } = await supabase.from('submissions').insert([
      { fullName, email, phone, subject, message }
    ]);

    if (error) {
      console.error('Supabase insert error:', error);
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

    await resend.emails.send({
      from: 'noreply@ncs.gov.ng',
      to: ['suleiman.idris@customs.gov.ng', 'bisulaiman2010@gmail.com'],
      subject: `Customs Form Submission: ${subject || 'New Entry'}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
