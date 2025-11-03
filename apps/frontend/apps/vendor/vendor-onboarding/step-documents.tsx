"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, X, CheckCircle2, AlertCircle } from "lucide-react"
import type { DocumentData } from "@/types/vendor-onboarding-types"

interface StepDocumentsProps {
  data: DocumentData[]
  onUpdate: (data: DocumentData[]) => void
  onNext: () => void
}

const REQUIRED_DOCUMENTS = [
  { type: "business_license", label: "Business License", description: "Business Registration Certificate" },
  { type: "pan_vat_registration", label: "PAN/VAT Registration", description: "PAN or VAT Certificate" },
  { type: "identity_proof", label: "Identity Proof", description: "Citizenship or Passport" },
] as const

const OPTIONAL_DOCUMENTS = [
  { type: "bank_account_proof", label: "Bank Account Proof", description: "Bank Statement" },
  { type: "hygiene_certificate", label: "Hygiene Certificate", description: "Food Safety Certificate" },
  { type: "menu_safety_certificate", label: "Menu Safety Certificate", description: "Optional" },
] as const

export function StepDocuments({ data, onUpdate, onNext }: StepDocumentsProps) {
  const [uploadingType, setUploadingType] = useState<string | null>(null)

  const handleFileUpload = (documentType: string, file: File) => {
    // Simulate file upload - in real app, upload to S3/MinIO
    const reader = new FileReader()
    reader.onload = (e) => {
      const newDoc: DocumentData = {
        documentType: documentType as any,
        documentUrl: e.target?.result as string,
        status: "pending",
      }
      const updated = data.filter((d) => d.documentType !== documentType)
      onUpdate([...updated, newDoc])
      setUploadingType(null)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveDocument = (documentType: string) => {
    onUpdate(data.filter((d) => d.documentType !== documentType))
  }

  const getDocumentStatus = (documentType: string) => {
    return data.find((d) => d.documentType === documentType)
  }

  const requiredUploaded = REQUIRED_DOCUMENTS.every((doc) => data.some((d) => d.documentType === doc.type))

  return (
    <div className="space-y-6">
      {/* Required Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>Please upload all required documents for verification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {REQUIRED_DOCUMENTS.map((doc) => {
            const uploaded = getDocumentStatus(doc.type)
            return (
              <div key={doc.type} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      {doc.label}
                      {uploaded && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </p>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                  </div>
                </div>

                {uploaded ? (
                  <div className="flex items-center justify-between bg-muted/50 p-3 rounded">
                    <span className="text-sm text-muted-foreground">Document uploaded</span>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveDocument(doc.type)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors block">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(doc.type, e.target.files[0])
                        }
                      }}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
                    </div>
                  </label>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Optional Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Optional Documents</CardTitle>
          <CardDescription>These documents help us verify your business better</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {OPTIONAL_DOCUMENTS.map((doc) => {
            const uploaded = getDocumentStatus(doc.type)
            return (
              <div key={doc.type} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      {doc.label}
                      <Badge variant="outline" className="text-xs">
                        Optional
                      </Badge>
                      {uploaded && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </p>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                  </div>
                </div>

                {uploaded ? (
                  <div className="flex items-center justify-between bg-muted/50 p-3 rounded">
                    <span className="text-sm text-muted-foreground">Document uploaded</span>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveDocument(doc.type)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors block">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(doc.type, e.target.files[0])
                        }
                      }}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
                    </div>
                  </label>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {!requiredUploaded && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">Please upload all required documents to continue</p>
        </div>
      )}

      <Button onClick={onNext} disabled={!requiredUploaded} className="w-full">
        Continue to Address
      </Button>
    </div>
  )
}
