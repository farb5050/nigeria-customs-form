"use client"

import type React from "react"

import { useFormData } from "./form-provider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormField } from "./form-field"
import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
import { PlusCircle, Loader2 } from "lucide-react"
import { submitFormWithAttachments } from "@/lib/submit-form"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// AfCFTA State Parties list
const afcftaStates = [
  "Algeria",
  "Angola",
  "Benin",
  "Botswana",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cameroon",
  "Central African Republic",
  "Chad",
  "Comoros",
  "Congo, Dem. Rep.",
  "Congo, Rep.",
  "Cote d'Ivoire",
  "Djibouti",
  "Egypt",
  "Equatorial Guinea",
  "Eritrea",
  "Eswatini",
  "Ethiopia",
  "Gabon",
  "Gambia",
  "Ghana",
  "Guinea",
  "Guinea-Bissau",
  "Kenya",
  "Lesotho",
  "Liberia",
  "Libya",
  "Madagascar",
  "Malawi",
  "Mali",
  "Mauritania",
  "Mauritius",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Niger",
  "Rwanda",
  "Sao Tome and Principe",
  "Senegal",
  "Seychelles",
  "Sierra Leone",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Sudan",
  "Tanzania",
  "Togo",
  "Tunisia",
  "Uganda",
  "Zambia",
  "Zimbabwe",
]

// Other countries list
const otherCountries = ["United States", "China", "India", "United Kingdom", "Germany", "Japan", "Nigeria"]

export default function FormPage2() {
  const { formData, updateFormData, updateInputMaterial } = useFormData()
  const [inputMaterials, setInputMaterials] = useState(formData.inputMaterials)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean; message: string } | null>(null)
  const { toast } = useToast()

  // Update local state when form data changes
  useEffect(() => {
    setInputMaterials(formData.inputMaterials)
  }, [formData.inputMaterials])

  // Add a new input material
  const addInputMaterial = () => {
    const newInputMaterials = [
      ...inputMaterials,
      {
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
      },
    ]
    setInputMaterials(newInputMaterials)
    updateFormData({ inputMaterials: newInputMaterials })
  }

  // Handle country selection and toggle certificate requirement
  const handleCountryChange = (value: string, index: number) => {
    const certificateRequired = afcftaStates.includes(value) && value !== "Nigeria"

    const updatedMaterial = {
      ...inputMaterials[index],
      countryOfOrigin: value,
      certificateRequired,
    }

    const newInputMaterials = [...inputMaterials]
    newInputMaterials[index] = updatedMaterial

    setInputMaterials(newInputMaterials)
    updateFormData({ inputMaterials: newInputMaterials })
  }

  // Handle certificate file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0] || null

    const updatedMaterial = {
      ...inputMaterials[index],
      certificateFile: file,
    }

    const newInputMaterials = [...inputMaterials]
    newInputMaterials[index] = updatedMaterial

    setInputMaterials(newInputMaterials)
    updateFormData({ inputMaterials: newInputMaterials })
  }

  // Handle invoice file upload
  const handleInvoiceFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0] || null

    const updatedMaterial = {
      ...inputMaterials[index],
      invoiceFile: file,
    }

    const newInputMaterials = [...inputMaterials]
    newInputMaterials[index] = updatedMaterial

    setInputMaterials(newInputMaterials)
    updateFormData({ inputMaterials: newInputMaterials })
  }

  // Validate form before submission
  const validateForm = () => {
    // Check required fields
    if (!formData.companyName || !formData.physicalAddress || !formData.tinNumber || !formData.emailAddress) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields in the Exporter Details section.",
        variant: "destructive",
      })
      return false
    }

    if (!formData.originCriteria) {
      toast({
        title: "Missing Information",
        description: "Please select an Origin Criteria.",
        variant: "destructive",
      })
      return false
    }

    if (!formData.productDescription || !formData.hsCode || !formData.countryOfExport) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields in the Final Product Details section.",
        variant: "destructive",
      })
      return false
    }

    // Check if at least one input material is provided
    if (
      !formData.inputMaterials[0].description ||
      !formData.inputMaterials[0].hsCode ||
      !formData.inputMaterials[0].countryOfOrigin
    ) {
      toast({
        title: "Missing Information",
        description: "Please provide at least one input material with all required fields.",
        variant: "destructive",
      })
      return false
    }

    // Check if declaration is completed
    if (!formData.declarantName || !formData.signatureName || !formData.signaturePosition) {
      toast({
        title: "Missing Information",
        description: "Please complete the Declaration section.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setShowConfirmDialog(true)
  }

  // Confirm and submit form
  const confirmAndSubmit = async () => {
    setIsSubmitting(true)
    setShowConfirmDialog(false)

    try {
      const result = await submitFormWithAttachments(formData)
      setSubmissionResult(result)

      if (result.success) {
        toast({
          title: "Form Submitted",
          description: result.message,
        })
      } else {
        toast({
          title: "Submission Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmissionResult({
        success: false,
        message: `An unexpected error occurred: ${(error as Error).message}`,
      })
      toast({
        title: "Submission Failed",
        description: `An unexpected error occurred: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-[#1a5276]">INPUT MATERIALS DETAILS</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="italic mb-4">List all materials used in manufacturing the final product</p>

          <div id="input-materials-wrapper" className="space-y-8">
            {inputMaterials.map((material, index) => (
              <div key={index} className="input-material-entry p-4 border border-gray-200 rounded-md">
                <FormField label={`Input Material ${index + 1} Description`} required={index === 0}>
                  <Input
                    id={`input_material_description_${index + 1}`}
                    value={material.description}
                    onChange={(e) => {
                      const newInputMaterials = [...inputMaterials]
                      newInputMaterials[index] = { ...material, description: e.target.value }
                      setInputMaterials(newInputMaterials)
                      updateFormData({ inputMaterials: newInputMaterials })
                    }}
                    placeholder="e.g., Raw Hibiscus Flowers"
                    required={index === 0}
                  />
                </FormField>

                <FormField label={`Input Material ${index + 1} HS Code`} required={index === 0}>
                  <Input
                    id={`input_material_hs_code_${index + 1}`}
                    value={material.hsCode}
                    onChange={(e) => {
                      const newInputMaterials = [...inputMaterials]
                      newInputMaterials[index] = { ...material, hsCode: e.target.value }
                      setInputMaterials(newInputMaterials)
                      updateFormData({ inputMaterials: newInputMaterials })
                    }}
                    placeholder="e.g., 1211.90"
                    required={index === 0}
                  />
                </FormField>

                <FormField label={`Input Material ${index + 1} Ex-Factory Price (USD)`} required={index === 0}>
                  <Input
                    id={`input_material_ex_factory_price_${index + 1}`}
                    type="number"
                    step="0.01"
                    value={material.valueUSD}
                    onChange={(e) => {
                      const newInputMaterials = [...inputMaterials]
                      newInputMaterials[index] = { ...material, valueUSD: e.target.value }
                      setInputMaterials(newInputMaterials)
                      updateFormData({ inputMaterials: newInputMaterials })
                    }}
                    placeholder="e.g., 150.75"
                    required={index === 0}
                  />
                </FormField>

                <FormField label={`Input Material ${index + 1} Country of Origin`} required={index === 0}>
                  <Select value={material.countryOfOrigin} onValueChange={(value) => handleCountryChange(value, index)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select Country --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>AfCFTA State Parties</SelectLabel>
                        {afcftaStates.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Other Countries</SelectLabel>
                        {otherCountries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label={`Input Material ${index + 1} Invoice No.`} required={index === 0}>
                  <Input
                    id={`input_material_invoice_no_${index + 1}`}
                    value={material.invoiceNo}
                    onChange={(e) => {
                      const newInputMaterials = [...inputMaterials]
                      newInputMaterials[index] = { ...material, invoiceNo: e.target.value }
                      setInputMaterials(newInputMaterials)
                      updateFormData({ inputMaterials: newInputMaterials })
                    }}
                    placeholder="e.g., INV-2023-001"
                    required={index === 0}
                  />
                </FormField>

                <FormField label={`Attach Invoice for Input Material ${index + 1}`}>
                  <Input
                    id={`input_material_invoice_file_${index + 1}`}
                    type="file"
                    accept=".pdf, .jpg, .jpeg, .png"
                    onChange={(e) => handleInvoiceFileChange(e, index)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {material.invoiceFile
                      ? `Selected file: ${material.invoiceFile.name}`
                      : "Attach the invoice for this input material"}
                  </p>
                </FormField>

                {material.certificateRequired && (
                  <div className="input-material-cert-upload mt-4 p-4 bg-gray-100 rounded-md">
                    <FormField label={`Upload Certificate of Origin (for this input material)`}>
                      <Input
                        id={`input_material_certificate_${index + 1}`}
                        type="file"
                        accept=".pdf, .jpg, .jpeg, .png"
                        onChange={(e) => handleFileChange(e, index)}
                        required={material.certificateRequired}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {material.certificateFile
                          ? `Selected file: ${material.certificateFile.name}`
                          : "Certificate of Origin is required for this country"}
                      </p>
                    </FormField>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button type="button" onClick={addInputMaterial} className="mt-4 bg-green-600 hover:bg-green-700">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Another Input Material
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-[#1a5276]">MANUFACTURING PROCESS SUMMARY</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="italic mb-2">Brief description of manufacturing/processing operations performed:</p>
          <Textarea
            rows={4}
            value={formData.manufacturingProcess}
            onChange={(e) => updateFormData({ manufacturingProcess: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-[#1a5276]">DECLARATION</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            I,{" "}
            <Input
              className="inline-block w-64 mx-2"
              value={formData.declarantName}
              onChange={(e) => updateFormData({ declarantName: e.target.value })}
            />
            , being the authorized representative of the company mentioned above, hereby declare that:
          </p>

          <ol className="list-decimal pl-5 space-y-2 mb-6">
            <li>The information provided in this form is true and accurate to the best of my knowledge.</li>
            <li>All supporting documents submitted are genuine and valid.</li>
            <li>
              I understand that providing false information may result in rejection of the Certificate of Origin
              application and possible legal consequences.
            </li>
            <li>
              I will maintain all relevant records for a minimum of five years and make them available for verification
              if required.
            </li>
          </ol>

          <div className="mt-8 space-y-4">
            <div className="border-t-2 border-black w-48 pt-2">
              <p className="font-bold">Signature</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <FormField label="Name">
                <Input
                  value={formData.signatureName}
                  onChange={(e) => updateFormData({ signatureName: e.target.value })}
                />
              </FormField>

              <FormField label="Position">
                <Input
                  value={formData.signaturePosition}
                  onChange={(e) => updateFormData({ signaturePosition: e.target.value })}
                />
              </FormField>

              <FormField label="Date">
                <Input
                  type="date"
                  value={formData.signatureDate}
                  onChange={(e) => updateFormData({ signatureDate: e.target.value })}
                />
              </FormField>
            </div>

            <div className="border border-dashed border-gray-400 w-48 h-24 flex items-center justify-center mt-6">
              <p className="text-center text-gray-500">Company Stamp/Seal</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-[#1a5276]">FOR OFFICIAL USE ONLY</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Application Received Date</Label>
              <Input type="date" className="mt-1" />
            </div>

            <div>
              <Label>Verification Officer</Label>
              <Input className="mt-1" />
            </div>

            <div>
              <Label>Documentation Complete</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center">
                  <Input type="radio" id="doc-complete-yes" name="doc-complete" className="w-4 h-4" />
                  <Label htmlFor="doc-complete-yes" className="ml-2">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center">
                  <Input type="radio" id="doc-complete-no" name="doc-complete" className="w-4 h-4" />
                  <Label htmlFor="doc-complete-no" className="ml-2">
                    No
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Label>Origin Criteria Verified</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center">
                  <Input type="radio" id="criteria-approved" name="criteria-verified" className="w-4 h-4" />
                  <Label htmlFor="criteria-approved" className="ml-2">
                    Approved
                  </Label>
                </div>
                <div className="flex items-center">
                  <Input type="radio" id="criteria-rejected" name="criteria-verified" className="w-4 h-4" />
                  <Label htmlFor="criteria-rejected" className="ml-2">
                    Rejected
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Label>Certificate No. (if approved)</Label>
              <Input className="mt-1" />
            </div>

            <div className="md:col-span-2">
              <Label>Remarks</Label>
              <Textarea rows={3} className="mt-1" />
            </div>
          </div>

          <div className="mt-8">
            <div className="border-t-2 border-black w-48 pt-2">
              <p className="font-bold">Authorized Signature</p>
            </div>

            <div className="mt-4">
              <Label>Date:</Label>
              <Input type="date" className="w-48 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-8">
        <Button className="bg-[#1a5276] hover:bg-[#154360]" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Form"
          )}
        </Button>
      </div>

      <div className="text-center text-gray-500 italic">
        <p>Page 2 of 2</p>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this Certificate of Origin request? All information and attachments will
              be sent to the Nigeria Customs Service.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAndSubmit} className="bg-[#1a5276] hover:bg-[#154360]">
              Confirm Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submission Result Dialog */}
      {submissionResult && (
        <Dialog open={!!submissionResult} onOpenChange={() => setSubmissionResult(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{submissionResult.success ? "Submission Successful" : "Submission Failed"}</DialogTitle>
              <DialogDescription>{submissionResult.message}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setSubmissionResult(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
