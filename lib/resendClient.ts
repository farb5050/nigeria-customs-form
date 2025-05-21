import { NextResponse } from 'next/server';
import { resend } from '@/lib/resendClient';
import { supabase } from '@/lib/supabaseClient';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("Received data:", data);

    const { fullName, email, phone, subject, message } = data;

    // Validate required fields
    if (!fullName || !email) {
      return NextResponse.json({ success: false, error: "Full name and email required" }, { status: 400 });
    }

    // Save to Supabase
    const { data: dbData, error: dbError } = await supabase
      .from('submissions')
      .insert([{ fullName, email, phone, subject, message }])
      .select();

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    console.log("Inserted in Supabase:", dbData);

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
