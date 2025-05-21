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
    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export async function POST(req: Request) {
  console.log("API handler started");
  try {
    // @ts-ignore
    const { fields, files } = await parseForm(req);
    console.log("Received fields:", fields);
    console.log("Received files:", files);

    let formData = {};

    if (fields.formDataJson) {
      try {
        formData = JSON.parse(fields.formDataJson);
      } catch (e) {
        console.error('Error parsing formDataJson:', e);
        formData = {};
      }
    } else {
      formData = fields; // fallback if sent as flat fields
    }

    const {
      companyName,
      physicalAddress,
      cityState,
      postalCode,
      tinNumber,
      contactPerson,
      phoneNumber,
      emailAddress,
      applicationDate,
      originCriteria,
      procedureDescription,
      productDescription,
      brandName,
      hsCode,
      countryOfExport,
      destinationCountry,
      commercialInvoiceNo,
      invoiceDate,
      exFactoryPrice,
      fobValue,
      quantityUnit,
      packagingType,
      inputMaterials,
      manufacturingProcess,
      declarantName,
      signatureName,
      signaturePosition,
      signatureDate
    } = formData;

    // Save to Supabase
    const { data: dbData, error: dbError } = await supabase
      .from('submissions')
      .insert([{
        companyName,
        physicalAddress,
        cityState,
        postalCode,
        tinNumber,
        contactPerson,
        phoneNumber,
        emailAddress,
        applicationDate,
        originCriteria,
        procedureDescription,
        productDescription,
        brandName,
        hsCode,
        countryOfExport,
        destinationCountry,
        commercialInvoiceNo,
        invoiceDate,
        exFactoryPrice,
        fobValue,
        quantityUnit,
        packagingType,
        inputMaterials: JSON.stringify(inputMaterials),
        manufacturingProcess,
        declarantName,
        signatureName,
        signaturePosition,
        signatureDate
      }])
      .select();

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    // Send email via Resend
    const emailHtml = `
      <h2>New Form Submission</h2>
      <ul>
        <li><b>Company Name:</b> ${companyName}</li>
        <li><b>Physical Address:</b> ${physicalAddress}</li>
        <li><b>City/State:</b> ${cityState}</li>
        <li><b>Postal Code:</b> ${postalCode}</li>
        <li><b>TIN Number:</b> ${tinNumber}</li>
        <li><b>Contact Person:</b> ${contactPerson}</li>
        <li><b>Phone Number:</b> ${phoneNumber}</li>
        <li><b>Email Address:</b> ${emailAddress}</li>
        <li><b>Application Date:</b> ${applicationDate}</li>
        <li><b>Origin Criteria:</b> ${originCriteria}</li>
        <li><b>Procedure Description:</b> ${procedureDescription}</li>
        <li><b>Product Description:</b> ${productDescription}</li>
        <li><b>Brand Name:</b> ${brandName}</li>
        <li><b>HS Code:</b> ${hsCode}</li>
        <li><b>Country of Export:</b> ${countryOfExport}</li>
        <li><b>Destination Country:</b> ${destinationCountry}</li>
        <li><b>Commercial Invoice No.:</b> ${commercialInvoiceNo}</li>
        <li><b>Invoice Date:</b> ${invoiceDate}</li>
        <li><b>Ex-Factory Price:</b> ${exFactoryPrice}</li>
        <li><b>FOB Value:</b> ${fobValue}</li>
        <li><b>Quantity/Unit:</b> ${quantityUnit}</li>
        <li><b>Packaging Type:</b> ${packagingType}</li>
        <li><b>Input Materials:</b> <pre>${JSON.stringify(inputMaterials, null, 2)}</pre></li>
        <li><b>Manufacturing Process:</b> ${manufacturingProcess}</li>
        <li><b>Declarant Name:</b> ${declarantName}</li>
        <li><b>Signature Name:</b> ${signatureName}</li>
        <li><b>Signature Position:</b> ${signaturePosition}</li>
        <li><b>Signature Date:</b> ${signatureDate}</li>
      </ul>
    `;

    let emailRes;
    try {
      emailRes = await resend.emails.send({
        from: 'noreply@ncs.gov.ng',
        to: ['suleiman.idris@customs.gov.ng', 'bisulaiman2010@gmail.com'],
        subject: `Customs Form Submission: ${productDescription || companyName || 'New Entry'}`,
        html: emailHtml,
      });
      console.log("Resend response:", emailRes);
    } catch (err: any) {
      console.error('Email sending error:', err);
      return NextResponse.json(
        { success: false, error: err?.message ?? String(err) ?? "Unknown email error" },
        { status: 500 }
      );
    }

    if (emailRes?.error) {
      return NextResponse.json({ success: false, error: emailRes.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, dbData, emailRes });
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json(
      { success: false, error: err?.message ?? String(err) ?? "Unknown error" },
      { status: 500 }
    );
  }
}
