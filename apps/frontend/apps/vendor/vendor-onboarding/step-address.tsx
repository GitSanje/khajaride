"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin } from "lucide-react"
import type { AddressData } from "@/types/vendor-onboarding-types"
import { ZVendorAddress, type TVendorAddress } from "@khajaride/zod"
import { useUpdateVendorOnboardingTrack } from "@/api/hooks/use-user-query"
import { useCreateVendorAddress } from "@/api/hooks/use-vendor-query"
import { useUser } from "@clerk/clerk-react"

interface StepAddressProps {
  data: Partial<AddressData>
  onUpdate: (data: Partial<AddressData>) => void
  onNext: () => void
  setError: (error: string | null) => void
}

export function StepAddress({ 
  data, 
  onUpdate, 
  onNext, 
  setError 
}: StepAddressProps) {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user} = useUser()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<TVendorAddress>({
    resolver: zodResolver(ZVendorAddress as any),
    defaultValues: {
      vendorUserId: user?.id  ,
      streetAddress: data.streetAddress || "",
      city: data.city || "",
      state: data.state || "",
      zipcode: data.zipcode || "",
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      
    }
  })

  const formValues = watch()

  // Update parent component when form values change
  const handleFormChange = (field: keyof TVendorAddress, value: any) => {
    setValue(field, value)
    onUpdate({ ...data, [field]: value })
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude
          
          setValue("latitude", latitude)
          setValue("longitude", longitude)
          onUpdate({
            ...data,
            latitude: latitude,
            longitude: longitude,
          })
          setUseCurrentLocation(true)
          
          // Trigger validation for coordinates
          trigger(["latitude", "longitude"])
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Failed to get your current location. Please enter coordinates manually.")
        }
      )
    } else {
      setError("Geolocation is not supported by your browser. Please enter coordinates manually.")
    }
  }
    const updateVendorOnboardingTrack = useUpdateVendorOnboardingTrack()
  const createVendorAddress = useCreateVendorAddress()
  const handleFormSubmit = async (formData: TVendorAddress) => {
    try {
      setIsSubmitting(true)
      setError(null)

      console.log("Submitting vendor address:", formData)

      // Create vendor address
      await createVendorAddress.mutateAsync({
        body: formData
      })

      // Update onboarding track
      await updateVendorOnboardingTrack.mutateAsync({
        body: {
          completed: false,
          currentStep: "payout"
        }
      })

      // Move to next step
      onNext()
    } catch (err: any) {
      console.error("Vendor address creation error:", err)
      setError(err?.message || "Failed to save address. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isComplete = 
    formValues.streetAddress && 
    formValues.city && 
    formValues.state && 
    formValues.zipcode && 
    formValues.latitude !== undefined && 
    formValues.longitude !== undefined

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Location</CardTitle>
            <CardDescription>Tell us where your restaurant is located</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Street Address */}
            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                placeholder="e.g., 123 Main Street"
                {...register("streetAddress")}
                onChange={(e) => handleFormChange("streetAddress", e.target.value)}
              />
              {errors.streetAddress && (
                <p className="text-sm text-red-600">{errors.streetAddress.message}</p>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="e.g., Kathmandu"
                {...register("city")}
                onChange={(e) => handleFormChange("city", e.target.value)}
              />
              {errors.city && (
                <p className="text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">State/Province *</Label>
              <Input
                id="state"
                placeholder="e.g., Bagmati"
                {...register("state")}
                onChange={(e) => handleFormChange("state", e.target.value)}
              />
              {errors.state && (
                <p className="text-sm text-red-600">{errors.state.message}</p>
              )}
            </div>

            {/* Zipcode */}
            <div className="space-y-2">
              <Label htmlFor="zipcode">Zipcode *</Label>
              <Input
                id="zipcode"
                placeholder="e.g., 44600"
                {...register("zipcode")}
                onChange={(e) => handleFormChange("zipcode", e.target.value)}
              />
              {errors.zipcode && (
                <p className="text-sm text-red-600">{errors.zipcode.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Location Coordinates *</Label>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  onClick={handleGetLocation} 
                  className="gap-2 bg-transparent"
                >
                  <MapPin className="w-4 h-4" />
                  Use Current Location
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    placeholder="27.7172"
                    step="0.0001"
                    {...register("latitude", { valueAsNumber: true })}
                    onChange={(e) => 
                      handleFormChange("latitude", Number.parseFloat(e.target.value) || 0)
                    }
                  />
                  {errors.latitude && (
                    <p className="text-sm text-red-600">{errors.latitude.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    placeholder="85.3240"
                    step="0.0001"
                    {...register("longitude", { valueAsNumber: true })}
                    onChange={(e) => 
                      handleFormChange("longitude", Number.parseFloat(e.target.value) || 0)
                    }
                  />
                  {errors.longitude && (
                    <p className="text-sm text-red-600">{errors.longitude.message}</p>
                  )}
                </div>
              </div>
            </div>

            {useCurrentLocation && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-700">
                Location coordinates have been set from your current position
              </div>
            )}
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          disabled={!isComplete || isSubmitting} 
          className="w-full mt-6"
        >
          {isSubmitting ? "Saving Address..." : "Continue to Payout Setup"}
        </Button>
      </form>
    </div>
  )
}