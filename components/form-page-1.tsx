"use client"

import { useFormData } from "./form-provider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "./form-field"

export default function FormPage1() {
  const { formData, updateFormData } = useFormData()

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-[#1a5276]">EXPORTER DETAILS</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Company Name" required>
              <Input value={formData.companyName} onChange={(e) => updateFormData({ companyName: e.target.value })} />
            </FormField>

            <FormField label="Physical Address" required>
              <Input
                value={formData.physicalAddress}
                onChange={(e) => updateFormData({ physicalAddress: e.target.value })}
              />
            </FormField>

            <FormField label="City/State" required>
              <Input value={formData.cityState} onChange={(e) => updateFormData({ cityState: e.target.value })} />
            </FormField>

            <FormField label="Postal Code">
              <Input value={formData.postalCode} onChange={(e) => updateFormData({ postalCode: e.target.value })} />
            </FormField>

            <FormField label="TIN Number" required>
              <Input value={formData.tinNumber} onChange={(e) => updateFormData({ tinNumber: e.target.value })} />
            </FormField>

            <FormField label="Contact Person" required>
              <Input
                value={formData.contactPerson}
                onChange={(e) => updateFormData({ contactPerson: e.target.value })}
              />
            </FormField>

            <FormField label="Phone Number" required>
              <Input value={formData.phoneNumber} onChange={(e) => updateFormData({ phoneNumber: e.target.value })} />
            </FormField>

            <FormField label="Email Address" required>
              <Input
                type="email"
                value={formData.emailAddress}
                onChange={(e) => updateFormData({ emailAddress: e.target.value })}
              />
            </FormField>

            <FormField label="Application Date" required>
              <Input
                type="date"
                value={formData.applicationDate}
                onChange={(e) => updateFormData({ applicationDate: e.target.value })}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-[#1a5276]">SELF-ASSESSMENT OF ORIGIN CRITERIA</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="italic mb-4">Select ONE that applies to your product:</p>

          <RadioGroup
            value={formData.originCriteria}
            onValueChange={(value) =>
              updateFormData({
                originCriteria: value as FormData["originCriteria"],
                procedureDescription: value !== "specific-procedure" ? "" : formData.procedureDescription,
              })
            }
            className="space-y-3"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="wholly-obtained" id="wholly-obtained" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="wholly-obtained" className="font-bold">
                  Wholly Obtained
                </Label>
                <p className="text-sm text-muted-foreground">
                  Product entirely obtained or produced in territory using only originating materials
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <RadioGroupItem value="tariff-heading" id="tariff-heading" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="tariff-heading" className="font-bold">
                  Change in Tariff Heading
                </Label>
                <p className="text-sm text-muted-foreground">
                  Non-originating materials processed to result in different HS classification
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <RadioGroupItem value="value-addition" id="value-addition" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="value-addition" className="font-bold">
                  Value Addition
                </Label>
                <p className="text-sm text-muted-foreground">
                  Minimum percentage of ex-works price represents local content
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <RadioGroupItem value="specific-procedure" id="specific-procedure" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="specific-procedure" className="font-bold">
                  Specific Procedure
                </Label>
                <p className="text-sm text-muted-foreground">
                  Special manufacturing or processing operations performed
                </p>
              </div>
            </div>
          </RadioGroup>

          <div className="mt-4">
            <Label
              htmlFor="procedure-description"
              className={formData.originCriteria !== "specific-procedure" ? "text-gray-400" : ""}
            >
              If "Specific Procedure" selected, please describe:
            </Label>
            <Textarea
              id="procedure-description"
              value={formData.procedureDescription}
              onChange={(e) => updateFormData({ procedureDescription: e.target.value })}
              disabled={formData.originCriteria !== "specific-procedure"}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-[#1a5276]">FINAL PRODUCT DETAILS</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Product Description" required>
              <Input
                value={formData.productDescription}
                onChange={(e) => updateFormData({ productDescription: e.target.value })}
              />
            </FormField>

            <FormField label="Brand Name (if applicable)">
              <Input value={formData.brandName} onChange={(e) => updateFormData({ brandName: e.target.value })} />
            </FormField>

            <FormField label="HS Code (10-digit)" required>
              <Input
                value={formData.hsCode}
                onChange={(e) => updateFormData({ hsCode: e.target.value })}
                maxLength={10}
                pattern="[0-9]{10}"
                placeholder="10-digit code"
              />
            </FormField>

            <FormField label="Country of Export" required>
              <Input
                value={formData.countryOfExport}
                onChange={(e) => updateFormData({ countryOfExport: e.target.value })}
              />
            </FormField>

            <FormField label="Destination Country" required>
              <Input
                value={formData.destinationCountry}
                onChange={(e) => updateFormData({ destinationCountry: e.target.value })}
              />
            </FormField>

            <FormField label="Commercial Invoice No." required>
              <Input
                value={formData.commercialInvoiceNo}
                onChange={(e) => updateFormData({ commercialInvoiceNo: e.target.value })}
              />
            </FormField>

            <FormField label="Invoice Date" required>
              <Input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => updateFormData({ invoiceDate: e.target.value })}
              />
            </FormField>

            <FormField label="Ex-Factory Price (USD)" required>
              <Input
                type="number"
                step="0.01"
                value={formData.exFactoryPrice}
                onChange={(e) => updateFormData({ exFactoryPrice: e.target.value })}
              />
            </FormField>

            <FormField label="FOB Value (USD)">
              <Input
                type="number"
                step="0.01"
                value={formData.fobValue}
                onChange={(e) => updateFormData({ fobValue: e.target.value })}
              />
            </FormField>

            <FormField label="Quantity & Unit" required>
              <Input value={formData.quantityUnit} onChange={(e) => updateFormData({ quantityUnit: e.target.value })} />
            </FormField>

            <FormField label="Packaging Type">
              <Input
                value={formData.packagingType}
                onChange={(e) => updateFormData({ packagingType: e.target.value })}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-gray-500 italic">
        <p>Page 1 of 2</p>
      </div>
    </div>
  )
}
