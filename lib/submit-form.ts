"use client"

import type { FormData } from "@/components/form-provider"

export async function submitFormWithAttachments(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    // Create a FormData object to send to the server
    const submitFormData = new FormData();

    // Add basic form information
    submitFormData.append("exporterName", formData.companyName);
    submitFormData.append("exporterEmail", formData.emailAddress);

    // Prepare the JSON payload (excluding file objects)
    const formDataForJson = {
      ...formData,
      inputMaterials: formData.inputMaterials.map((material) => ({
        ...material,
        certificateFile: material.certificateFile ? material.certificateFile.name : null,
        invoiceFile: material.invoiceFile ? material.invoiceFile.name : null,
      })),
    };

    submitFormData.append("formDataJson", JSON.stringify(formDataForJson));

    // Append all file attachments
    formData.inputMaterials.forEach((material, index) => {
      if (material.certificateFile) {
        submitFormData.append(`certificate_${index}`, material.certificateFile);
      }
      if (material.invoiceFile) {
        submitFormData.append(`invoice_${index}`, material.invoiceFile);
      }
    });

    // Send the form data to the server
    const response = await fetch("/api/submit-form", {
      method: "POST",
      body: submitFormData,
    });

    // Check if response is empty or not JSON
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error("Server did not return valid JSON");
    }

    if (!response.ok) {
      throw new Error(result.message || "Form submission failed");
    }

    return {
      success: true,
      message: "Form submitted successfully. You will receive a confirmation email shortly.",
    };
  } catch (error) {
    console.error("Error submitting form:", error);
    return {
      success: false,
      message: `Form submission failed: ${(error as Error).message}`,
    };
  }
}
