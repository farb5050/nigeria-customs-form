import type React from "react"
import { Label } from "@/components/ui/label"

interface FormFieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({ label, required = false, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
    </div>
  )
}
