"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, MapPin, FileText, CreditCard } from "lucide-react"
import type { VendorOnboardingFormData } from "@/types/vendor-onboarding-types"

interface StepReviewProps {
  data: VendorOnboardingFormData
  onSubmit: () => void
  isSubmitting?: boolean
}

export function StepReview({ data, onSubmit, isSubmitting }: StepReviewProps) {
  return (
    <div className="space-y-6">
      {/* Profile Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Restaurant Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Restaurant Name</p>
              <p className="font-semibold">{data.profile.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-semibold capitalize">{data.profile.vendorType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Primary Cuisine</p>
              <p className="font-semibold">{data.profile.cuisine}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-semibold">{data.profile.phone}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">About</p>
            <p className="text-sm">{data.profile.about}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.profile.cuisineTags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.documents.map((doc) => (
              <div key={doc.documentType} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm capitalize">{doc.documentType.replace(/_/g, " ")}</span>
                <Badge variant="outline" className="text-xs">
                  Uploaded
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Address Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">City</p>
              <p className="font-semibold">{data.address.city}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">State</p>
              <p className="font-semibold">{data.address.state}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="font-semibold">{data.address.streetAddress}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Latitude</p>
              <p className="font-semibold text-sm">{data.address.latitude?.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Longitude</p>
              <p className="font-semibold text-sm">{data.address.longitude?.toFixed(4)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payout Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Method</p>
              <p className="font-semibold capitalize">{data.payoutAccount.method?.replace(/_/g, " ")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Holder</p>
              <p className="font-semibold">{data.payoutAccount.accountName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Info */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-700">
          By submitting this form, you agree to our terms and conditions. Our team will review your documents and verify
          your information within 24-48 hours.
        </p>
      </div>

      <Button onClick={onSubmit} disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? "Submitting..." : "Submit for Verification"}
      </Button>
    </div>
  )
}
