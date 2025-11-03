"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin } from "lucide-react"
import type { AddressData } from "@/types/vendor-onboarding-types"

interface StepAddressProps {
  data: Partial<AddressData>
  onUpdate: (data: Partial<AddressData>) => void
  onNext: () => void
}

export function StepAddress({ data, onUpdate, onNext }: StepAddressProps) {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        onUpdate({
          ...data,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setUseCurrentLocation(true)
      })
    }
  }

  const isComplete = data.streetAddress && data.city && data.state && data.zipcode && data.latitude && data.longitude

  return (
    <div className="space-y-6">
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
              value={data.streetAddress || ""}
              onChange={(e) => onUpdate({ ...data, streetAddress: e.target.value })}
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="e.g., Kathmandu"
              value={data.city || ""}
              onChange={(e) => onUpdate({ ...data, city: e.target.value })}
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state">State/Province *</Label>
            <Input
              id="state"
              placeholder="e.g., Bagmati"
              value={data.state || ""}
              onChange={(e) => onUpdate({ ...data, state: e.target.value })}
            />
          </div>

          {/* Zipcode */}
          <div className="space-y-2">
            <Label htmlFor="zipcode">Zipcode *</Label>
            <Input
              id="zipcode"
              placeholder="e.g., 44600"
              value={data.zipcode || ""}
              onChange={(e) => onUpdate({ ...data, zipcode: e.target.value })}
            />
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Location Coordinates</Label>
              <Button variant="outline" size="sm" onClick={handleGetLocation} className="gap-2 bg-transparent">
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
                  value={data.latitude || ""}
                  onChange={(e) => onUpdate({ ...data, latitude: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  placeholder="85.3240"
                  step="0.0001"
                  value={data.longitude || ""}
                  onChange={(e) => onUpdate({ ...data, longitude: Number.parseFloat(e.target.value) || 0 })}
                />
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

      <Button onClick={onNext} disabled={!isComplete} className="w-full">
        Continue to Payout Setup
      </Button>
    </div>
  )
}
