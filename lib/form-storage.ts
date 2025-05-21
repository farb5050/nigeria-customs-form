"use client"

import type { FormData } from "@/components/form-provider"

// Save form data to localStorage
export function saveFormProgress(formData: FormData): void {
  try {
    // Create a copy of the form data without File objects (they can't be serialized)
    const serializableFormData = {
      ...formData,
      inputMaterials: formData.inputMaterials.map((material) => ({
        ...material,
        certificateFile: null, // Files can't be serialized to localStorage
        invoiceFile: null, // Files can't be serialized to localStorage
      })),
    }

    localStorage.setItem("nigeriaCustomsFormData", JSON.stringify(serializableFormData))

    // Store timestamp of when the form was saved
    localStorage.setItem("nigeriaCustomsFormSavedAt", new Date().toISOString())
  } catch (error) {
    console.error("Error saving form progress:", error)
    throw new Error("Failed to save form progress")
  }
}

// Load form data from localStorage
export function loadFormProgress(): { formData: FormData | null; savedAt: string | null } {
  try {
    const savedFormData = localStorage.getItem("nigeriaCustomsFormData")
    const savedAt = localStorage.getItem("nigeriaCustomsFormSavedAt")

    if (!savedFormData) {
      return { formData: null, savedAt: null }
    }

    return {
      formData: JSON.parse(savedFormData) as FormData,
      savedAt,
    }
  } catch (error) {
    console.error("Error loading form progress:", error)
    return { formData: null, savedAt: null }
  }
}

// Clear saved form data
export function clearFormProgress(): void {
  try {
    localStorage.removeItem("nigeriaCustomsFormData")
    localStorage.removeItem("nigeriaCustomsFormSavedAt")
  } catch (error) {
    console.error("Error clearing form progress:", error)
  }
}
