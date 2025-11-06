"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Upload, ImageIcon } from "lucide-react"

interface ImageUploadFieldProps {
  label: string
  description?: string
  onImageSelect: (file: File) => void
  onImageRemove?: () => void
  recommendedSize?: string
  selectedFile?: File | null
  previewUrl?: string
}

export function ImageUploadField({
  label,
  description,
  onImageSelect,
  onImageRemove,
  recommendedSize,
  selectedFile,
  previewUrl,
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)

      onImageSelect(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageRemove?.()
    // Reset file input
    const fileInput = document.querySelector(`input[data-upload-id="${label}"]`) as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">{label}</label>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>

      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30 group">
          <div className="relative w-full h-48">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
          {recommendedSize && (
            <div className="p-2 bg-muted text-xs text-muted-foreground">
              Selected: {selectedFile?.name} ({recommendedSize})
            </div>
          )}
        </div>
      ) : (
        <label className="border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors block">
          <input type="file" accept="image/*" className="hidden" data-upload-id={label} onChange={handleFileChange} />
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-muted rounded-full">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
            </div>
            <Button type="button" variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
            {recommendedSize && <p className="text-xs text-muted-foreground mt-2">Recommended: {recommendedSize}</p>}
          </div>
        </label>
      )}
    </div>
  )
}
