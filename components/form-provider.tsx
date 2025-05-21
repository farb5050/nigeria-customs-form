"\"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { saveFormProgress, loadFormProgress } from "@/lib/form-storage"

type FormData = {
  // Exporter Details
  companyName: string
  physicalAddress: string
  cityState: string
  postalCode: string
  tinNumber: string
  contactPerson: string
  phoneNumber: string
  emailAddress: string
  applicationDate: string

  // Origin Criteria
  originCriteria: "wholly-obtained" | "tariff-heading" | "value-addition" | "specific-procedure" | ""
  procedureDescription: string

  // Final Product Details
  productDescription: string
  brandName: string
  hsCode: string
  countryOfExport: string
  destinationCountry: string
  commercialInvoiceNo: string
  invoiceDate: string
  exFactoryPrice: string
  fobValue: string
  quantityUnit: string
  packagingType: string

  // Input Materials
  inputMaterials: Array<{
    description: string
    hsCode: string
    countryOfOrigin: string
    invoiceNo: string
    purchaseDate: string
    valueUSD: string
    percentageFinalValue: string
    certificateRequired: boolean
    certificateFile: File | null
    invoiceFile: File | null
  }>

  // Manufacturing Process
  manufacturingProcess: string

  // Declaration
  declarantName: string
  signatureName: string
  signaturePosition: string
  signatureDate: string
}

const defaultFormData: FormData = {
  companyName: "",
  physicalAddress: "",
  cityState: "",
  postalCode: "",
  tinNumber: "",
  contactPerson: "",
  phoneNumber: "",
  emailAddress: "",
  applicationDate: "",

  originCriteria: "",
  procedureDescription: "",

  productDescription: "",
  brandName: "",
  hsCode: "",
  countryOfExport: "",
  destinationCountry: "",
  commercialInvoiceNo: "",
  invoiceDate: "",
  exFactoryPrice: "",
  fobValue: "",
  quantityUnit: "",
  packagingType: "",

  inputMaterials: Array(1).fill({
    description: "",
    hsCode: "",
    countryOfOrigin: "",
    invoiceNo: "",
    purchaseDate: "",
    valueUSD: "",
    percentageFinalValue: "",
    certificateRequired: false,
    certificateFile: null,
    invoiceFile: null,
  }),

  manufacturingProcess: "",

  declarantName: "",
  signatureName: "",
  signaturePosition: "",
  signatureDate: "",
}

type FormContextType = {
  formData: FormData
  updateFormData: (newData: Partial<FormData>) => void
  updateInputMaterial: (index: number, data: Partial<FormData["inputMaterials"][0]>) => void
}

const FormContext = createContext<FormContextType | undefined>(undefined)

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<FormData>(defaultFormData)

  // Load saved form data on mount
  useEffect(() => {
    const { formData: savedFormData } = loadFormProgress()
    if (savedFormData) {
      setFormData(savedFormData)
    }
  }, [])

  // Set up event listener for saving form data
  useEffect(() => {
    const handleSaveFormProgress = () => {
      saveFormProgress(formData)
    }

    const formContextAccessor = document.getElementById("form-context-accessor")
    if (formContextAccessor) {
      formContextAccessor.addEventListener("save-form-progress", handleSaveFormProgress)
    }

    return () => {
      if (formContextAccessor) {
        formContextAccessor.removeEventListener("save-form-progress", handleSaveFormProgress)
      }
    }
  }, [formData])

  const updateFormData = (newData: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }))
  }

  const updateInputMaterial = (index: number, data: Partial<FormData["inputMaterials"][0]>) => {
    setFormData((prev) => {
      const newInputMaterials = [...prev.inputMaterials]
      newInputMaterials[index] = { ...newInputMaterials[index], ...data }
      return { ...prev, inputMaterials: newInputMaterials }
    })
  }

  return (
    <FormContext.Provider value={{ formData, updateFormData, updateInputMaterial }}>
      {/* Hidden element for accessing form context from outside */}
      <div id="form-context-accessor" style={{ display: "none" }} />
      {children}
    </FormContext.Provider>
  )
}

export function useFormData() {
  const context = useContext(FormContext)
  if (context === undefined) {
    throw new Error("useFormData must be used within a FormProvider")
  }
  return context
}
