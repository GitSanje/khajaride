"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Image as ImageIcon } from "lucide-react"
import { useCreateVendor, useUploadImages, type TCreateVendorPayload } from "@/api/hooks/use-vendor-query"
import { VENDOR_TYPES, vendorProfileSchema, type VendorProfileFormData } from "@/schemas"
import { useUpdateVendorOnboardingTrack } from "@/api/hooks/use-user-query"
import { useUser } from "@clerk/clerk-react"

interface StepProfileProps {
  data: Partial<VendorProfileFormData>
  onUpdate: (data: Partial<VendorProfileFormData>) => void
  onNext: () => void
  setError: (error: string | null) => void
}

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

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
]

export function StepProfile({ 
  data, 
  onUpdate, 
  onNext, 
  setError 
}: StepProfileProps) {
  const [cuisineTags, setCuisineTags] = useState<string[]>(data.cuisineTags || [])
  const [selectedCuisine, setSelectedCuisine] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openingHours, setOpeningHours] = useState<Record<string, { open: string; close: string }>>(
    data.openingHours ? parseOpeningHours(data.openingHours) : {}
  )

  const { user} = useUser()
  const [vendorListingImage, setVendorListingImage] = useState<File | null>(null)
  const [vendorLogoImage, setVendorLogoImage] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<VendorProfileFormData>({
    resolver: zodResolver(vendorProfileSchema as any),
    defaultValues: {
      name: data.name || "",
      about: data.about || "",
      cuisine: data.cuisine || "",
      phone: data.phone || "",
      vendorType: data.vendorType as any || "",
      deliveryAvailable: data.deliveryAvailable ?? true,
      pickupAvailable: data.pickupAvailable ?? true,
      groupOrderAvailable: data.groupOrderAvailable ?? false,
      deliveryFee: data.deliveryFee || 0,
      minOrderAmount: data.minOrderAmount || 0,
      deliveryTimeEstimate: data.deliveryTimeEstimate || "",
      promoText: data.promoText || "",
      cuisineTags: data.cuisineTags || [],
      openingHours: data.openingHours || "",
    }
  })

  const formValues = watch()

  // Helper function to parse opening hours string
  function parseOpeningHours(hoursString: string): Record<string, { open: string; close: string }> {
    const hours: Record<string, { open: string; close: string }> = {}
    const days = hoursString.split(';')
    
    days.forEach(dayHours => {
      const [day, timeRange] = dayHours.split(': ')
      if (timeRange) {
        const [open, close] = timeRange.split(' - ')
        if (open && close) {
          hours[day] = { open, close }
        }
      }
    })
    
    return hours
  }

  // Helper function to format opening hours for submission
  function formatOpeningHours(hours: Record<string, { open: string; close: string }>): string {
    return Object.entries(hours)
      .map(([day, times]) => `${day}: ${times.open} - ${times.close}`)
      .join('; ')
  }

  // Update parent component when form values change
  const handleFormChange = (field: keyof VendorProfileFormData, value: any) => {
    setValue(field, value)
    onUpdate({ ...data, [field]: value })
  }

  const handleAddCuisine = () => {
    if (selectedCuisine && !cuisineTags.includes(selectedCuisine)) {
      const newTags = [...cuisineTags, selectedCuisine]
      setCuisineTags(newTags)
      setValue("cuisineTags", newTags)
      onUpdate({ ...data, cuisineTags: newTags })
      setSelectedCuisine("")
    }
  }

  const handleRemoveCuisine = (tag: string) => {
    const newTags = cuisineTags.filter((t) => t !== tag)
    setCuisineTags(newTags)
    setValue("cuisineTags", newTags)
    onUpdate({ ...data, cuisineTags: newTags })
  }

  const handleOpeningHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    const updatedHours = {
      ...openingHours,
      [day]: {
        ...openingHours[day],
        [field]: value
      }
    }
    setOpeningHours(updatedHours)
    
    const formattedHours = formatOpeningHours(updatedHours)
    setValue("openingHours", formattedHours)
    onUpdate({ ...data, openingHours: formattedHours })
  }

  const handleImageUpload = (type: 'listing' | 'logo', file: File) => {
    if (type === 'listing') {
      setVendorListingImage(file)
      // You might want to upload the image here and get the image name
      // For now, we'll just store the file object
    } else {
      setVendorLogoImage(file)
    }
  }

  const createVendor = useCreateVendor()
  const updateVendorOnboardingTrack = useUpdateVendorOnboardingTrack()
  const uploadImages = useUploadImages()

  const handleFormSubmit = async (formData: VendorProfileFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

     

        const filesToUpload: File[] = [];
          if (vendorListingImage) filesToUpload.push(vendorListingImage);
          if (vendorLogoImage) filesToUpload.push(vendorLogoImage);

          let uploadedURLs: string[]=[];
          if (filesToUpload.length > 0) {
             const  res = await uploadImages.mutateAsync({ files: filesToUpload });
             uploadedURLs = res.uploadedURLs
          }
     
        const vendorListingUrl = vendorListingImage ? uploadedURLs.shift() : undefined
        const vendorLogoUrl = vendorLogoImage ? uploadedURLs.shift() : undefined

      // Prepare form data with images
      const submitData = {
        ...formData,
        vendorListingImage: vendorListingUrl,
        vendorLogoImage:vendorLogoUrl,
        vendorUserId: user?.id
      }
      console.log("Submitting vendor profile:", submitData)
      // Create vendor
      await createVendor.mutateAsync({
        body: submitData as TCreateVendorPayload,
      })

      // Update onboarding track
      await updateVendorOnboardingTrack.mutateAsync({
        body: {
          completed: false,
          currentProgress: "address"
        }
      })

      // Move to next step
      onNext()
    } catch (err: any) {
      console.error("Vendor creation error:", err)
      setError(err?.message || "Failed to create vendor. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isComplete = 
    formValues.name && 
    formValues.about && 
    formValues.cuisine && 
    formValues.vendorType && 
    formValues.phone

  
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)}>
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
                {...register("name")}
                onChange={(e) => handleFormChange("name", e.target.value)}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* About */}
            <div className="space-y-2">
              <Label htmlFor="about">About Your Restaurant *</Label>
              <Textarea
                id="about"
                placeholder="Describe your restaurant, specialties, and what makes you unique..."
                rows={4}
                {...register("about")}
                onChange={(e) => handleFormChange("about", e.target.value)}
              />
              {errors.about && (
                <p className="text-sm text-red-600">{errors.about.message}</p>
              )}
            </div>

            {/* Vendor Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Restaurant Type *</Label>
              <Select
                value={formValues.vendorType}
                onValueChange={(value) => handleFormChange("vendorType", value)}
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
              {errors.vendorType && (
                <p className="text-sm text-red-600">{errors.vendorType.message}</p>
              )}
            </div>

            {/* Primary Cuisine */}
            <div className="space-y-2">
              <Label htmlFor="cuisine">Primary Cuisine *</Label>
              <Input
                id="cuisine"
                placeholder="e.g., Italian, Indian, Nepali"
                {...register("cuisine")}
                onChange={(e) => handleFormChange("cuisine", e.target.value)}
              />
              {errors.cuisine && (
                <p className="text-sm text-red-600">{errors.cuisine.message}</p>
              )}
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
                <Button 
                  type="button" 
                  onClick={handleAddCuisine} 
                  variant="outline"
                  disabled={!selectedCuisine}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {cuisineTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button 
                      type="button"
                      onClick={() => handleRemoveCuisine(tag)} 
                      className="ml-1"
                    >
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
                {...register("phone")}
                onChange={(e) => handleFormChange("phone", e.target.value)}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Opening Hours */}
            <div className="space-y-4">
              <Label>Opening Hours</Label>
              <div className="space-y-3">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="flex items-center gap-4">
                    <Label className="w-24 text-sm font-medium">{day}</Label>
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={openingHours[day]?.open || ""}
                        onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-500">to</span>
                      <Input
                        type="time"
                        value={openingHours[day]?.close || ""}
                        onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vendor Listing Image */}
              <div className="space-y-3">
                <Label htmlFor="listingImage">Restaurant Banner Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    id="listingImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload('listing', file)
                    }}
                  />
                  <label htmlFor="listingImage" className="cursor-pointer">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {vendorListingImage ? vendorListingImage.name : "Upload banner image"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 1200x400px
                    </p>
                    <Button type="button" variant="outline" size="sm" className="mt-2">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </label>
                </div>
              </div>

              {/* Vendor Logo Image */}
              <div className="space-y-3">
                <Label htmlFor="logoImage">Restaurant Logo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    id="logoImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload('logo', file)
                    }}
                  />
                  <label htmlFor="logoImage" className="cursor-pointer">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {vendorLogoImage ? vendorLogoImage.name : "Upload logo"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 200x200px
                    </p>
                    <Button type="button" variant="outline" size="sm" className="mt-2">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            {/* Service Options */}
            <div className="space-y-3">
              <Label>Service Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="delivery"
                    checked={formValues.deliveryAvailable}
                    onCheckedChange={(checked) => 
                      handleFormChange("deliveryAvailable", checked as boolean)
                    }
                  />
                  <Label htmlFor="delivery" className="font-normal cursor-pointer">
                    Delivery Available
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pickup"
                    checked={formValues.pickupAvailable}
                    onCheckedChange={(checked) => 
                      handleFormChange("pickupAvailable", checked as boolean)
                    }
                  />
                  <Label htmlFor="pickup" className="font-normal cursor-pointer">
                    Pickup Available
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="group"
                    checked={formValues.groupOrderAvailable}
                    onCheckedChange={(checked) => 
                      handleFormChange("groupOrderAvailable", checked as boolean)
                    }
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
                  {...register("deliveryFee", { valueAsNumber: true })}
                  onChange={(e) => 
                    handleFormChange("deliveryFee", Number.parseFloat(e.target.value) || 0)
                  }
                />
                {errors.deliveryFee && (
                  <p className="text-sm text-red-600">{errors.deliveryFee.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrder">Min Order Amount (Rs.)</Label>
                <Input
                  id="minOrder"
                  type="number"
                  placeholder="0"
                  {...register("minOrderAmount", { valueAsNumber: true })}
                  onChange={(e) => 
                    handleFormChange("minOrderAmount", Number.parseFloat(e.target.value) || 0)
                  }
                />
                {errors.minOrderAmount && (
                  <p className="text-sm text-red-600">{errors.minOrderAmount.message}</p>
                )}
              </div>
            </div>

            {/* Delivery Time */}
            <div className="space-y-2">
              <Label htmlFor="deliveryTime">Estimated Delivery Time</Label>
              <Input
                id="deliveryTime"
                placeholder="e.g., 20-30 min"
                {...register("deliveryTimeEstimate")}
                onChange={(e) => handleFormChange("deliveryTimeEstimate", e.target.value)}
              />
            </div>

            {/* Promo Text */}
            <div className="space-y-2">
              <Label htmlFor="promo">Promotional Text (Optional)</Label>
              <Input
                id="promo"
                placeholder="e.g., Free delivery on orders over Rs. 500"
                {...register("promoText")}
                onChange={(e) => handleFormChange("promoText", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full mt-6"
        >
          {isSubmitting ? "Creating Vendor..." : "Continue to Address"}
        </Button>
      </form>
    </div>
  )
}