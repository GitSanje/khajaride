"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { VendorProfileData } from "@/types/vendor-onboarding-types"

interface StepProfileProps {
  data: Partial<VendorProfileData>
  onUpdate: (data: Partial<VendorProfileData>) => void
  onNext: () => void
}

const VENDOR_TYPES = ["restaurant", "bakery", "cafe", "alcohol", "grocery", "other"] as const
const CUISINE_OPTIONS = [
  "Italian",
  "Indian",
  "Chinese",
  "Nepali",
  "Mexican",
  "Thai",
  "Japanese",
  "Fusion",
  "Fast Food",
  "Desserts",
]

export function StepProfile({ data, onUpdate, onNext }: StepProfileProps) {
  const [cuisineTags, setCuisineTags] = useState<string[]>(data.cuisineTags || [])
  const [selectedCuisine, setSelectedCuisine] = useState("")

  const handleAddCuisine = () => {
    if (selectedCuisine && !cuisineTags.includes(selectedCuisine)) {
      const newTags = [...cuisineTags, selectedCuisine]
      setCuisineTags(newTags)
      onUpdate({ ...data, cuisineTags: newTags })
      setSelectedCuisine("")
    }
  }

  const handleRemoveCuisine = (tag: string) => {
    const newTags = cuisineTags.filter((t) => t !== tag)
    setCuisineTags(newTags)
    onUpdate({ ...data, cuisineTags: newTags })
  }

  const isComplete = data.name && data.about && data.cuisine && data.vendorType && data.phone

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Profile</CardTitle>
          <CardDescription>Tell us about your restaurant and what you offer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Restaurant Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Authentic Italian Kitchen"
              value={data.name || ""}
              onChange={(e) => onUpdate({ ...data, name: e.target.value })}
            />
          </div>

          {/* About */}
          <div className="space-y-2">
            <Label htmlFor="about">About Your Restaurant *</Label>
            <Textarea
              id="about"
              placeholder="Describe your restaurant, specialties, and what makes you unique..."
              rows={4}
              value={data.about || ""}
              onChange={(e) => onUpdate({ ...data, about: e.target.value })}
            />
          </div>

          {/* Vendor Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Restaurant Type *</Label>
            <Select
              value={data.vendorType || ""}
              onValueChange={(value) => onUpdate({ ...data, vendorType: value as any })}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select restaurant type" />
              </SelectTrigger>
              <SelectContent>
                {VENDOR_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Primary Cuisine */}
          <div className="space-y-2">
            <Label htmlFor="cuisine">Primary Cuisine *</Label>
            <Input
              id="cuisine"
              placeholder="e.g., Italian, Indian, Nepali"
              value={data.cuisine || ""}
              onChange={(e) => onUpdate({ ...data, cuisine: e.target.value })}
            />
          </div>

          {/* Cuisine Tags */}
          <div className="space-y-2">
            <Label>Cuisine Tags</Label>
            <div className="flex gap-2">
              <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add cuisine tags" />
                </SelectTrigger>
                <SelectContent>
                  {CUISINE_OPTIONS.filter((c) => !cuisineTags.includes(c)).map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddCuisine} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {cuisineTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => handleRemoveCuisine(tag)} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+977 9800000000"
              value={data.phone || ""}
              onChange={(e) => onUpdate({ ...data, phone: e.target.value })}
            />
          </div>

          {/* Service Options */}
          <div className="space-y-3">
            <Label>Service Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delivery"
                  checked={data.deliveryAvailable ?? true}
                  onCheckedChange={(checked) => onUpdate({ ...data, deliveryAvailable: checked as boolean })}
                />
                <Label htmlFor="delivery" className="font-normal cursor-pointer">
                  Delivery Available
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pickup"
                  checked={data.pickupAvailable ?? true}
                  onCheckedChange={(checked) => onUpdate({ ...data, pickupAvailable: checked as boolean })}
                />
                <Label htmlFor="pickup" className="font-normal cursor-pointer">
                  Pickup Available
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="group"
                  checked={data.groupOrderAvailable ?? false}
                  onCheckedChange={(checked) => onUpdate({ ...data, groupOrderAvailable: checked as boolean })}
                />
                <Label htmlFor="group" className="font-normal cursor-pointer">
                  Group Orders Available
                </Label>
              </div>
            </div>
          </div>

          {/* Delivery Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryFee">Delivery Fee (Rs.)</Label>
              <Input
                id="deliveryFee"
                type="number"
                placeholder="0"
                value={data.deliveryFee || ""}
                onChange={(e) => onUpdate({ ...data, deliveryFee: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minOrder">Min Order Amount (Rs.)</Label>
              <Input
                id="minOrder"
                type="number"
                placeholder="0"
                value={data.minOrderAmount || ""}
                onChange={(e) => onUpdate({ ...data, minOrderAmount: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Delivery Time */}
          <div className="space-y-2">
            <Label htmlFor="deliveryTime">Estimated Delivery Time</Label>
            <Input
              id="deliveryTime"
              placeholder="e.g., 20-30 min"
              value={data.deliveryTimeEstimate || ""}
              onChange={(e) => onUpdate({ ...data, deliveryTimeEstimate: e.target.value })}
            />
          </div>

          {/* Promo Text */}
          <div className="space-y-2">
            <Label htmlFor="promo">Promotional Text (Optional)</Label>
            <Input
              id="promo"
              placeholder="e.g., Free delivery on orders over Rs. 500"
              value={data.promoText || ""}
              onChange={(e) => onUpdate({ ...data, promoText: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={onNext} disabled={!isComplete} className="w-full">
        Continue to Documents
      </Button>
    </div>
  )
}
