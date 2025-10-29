"use client"

import { useState, useEffect, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MapPin, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { deliveryAddressSchema, type DeliveryAddressFormData } from "@/schemas/delivery-address-validation"
import dynamic from "next/dynamic"
import { useCreateAddress, type TCreateAddressPayload } from "@/api/hooks/use-user-query"

const MapComponent = dynamic(() => import("./map-component"), { ssr: false })

interface DeliveryAddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DeliveryAddressFormData) => void
  initialData?: Partial<DeliveryAddressFormData>
}

export function DeliveryAddressModal({ isOpen, onClose, onSubmit, initialData }: DeliveryAddressModalProps) {
  const [step, setStep] = useState<"location" | "details">("location")
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialData ? { lat: initialData.latitude || 0, lng: initialData.longitude || 0 } : null,
  )
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null)

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      setSubmittedQuery(searchQuery)
    }
  }
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DeliveryAddressFormData>({
    resolver: zodResolver(deliveryAddressSchema as any),
    defaultValues: initialData,
  })

  const latitude = watch("latitude")
  const longitude = watch("longitude")

  useEffect(() => {
    if (selectedLocation) {
      setValue("latitude", selectedLocation.lat)
      setValue("longitude", selectedLocation.lng)
    }
  }, [selectedLocation, setValue])

  const handleLocationConfirm = () => {
    if (selectedLocation) {
      setStep("details")
    }
  }
  const handleFormError = (errors: any) => {
  console.error("❌ Validation errors:", errors)
}
      const createAddress = useCreateAddress();

  const handleFormSubmit = (data: DeliveryAddressFormData) => {
    startTransition(async () => {
      try {
      
        
  
        const res = await createAddress.mutateAsync({
          body: data as Omit<DeliveryAddressFormData, "id">,
        });
        if (res) {
             onSubmit(data); 
             onClose();
        }

     
      } catch (err) {
        console.error("Failed to create address:", err);
      }
    });
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {step === "location" ? "Set Delivery Location" : "Delivery Address Details"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === "location" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Drag the map to pin point your delivery location.</p>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search your location here..."
                  className="pl-10"
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onKeyDown={handleSearch}
                />
              </div>

              {/* Map Component */}
              <div className="h-96 rounded-lg overflow-hidden border border-border">
                <MapComponent
                  onLocationChange={setSelectedLocation}
                  latitude={latitude}
                  longitude={longitude}
                  searchQuery={submittedQuery!}
                />
              </div>

              {/* Location Display */}
              {selectedLocation && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Selected Location</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}

              {/* Confirm Button */}
              <Button
                onClick={handleLocationConfirm}
                disabled={!selectedLocation}
                className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold"
              >
                Confirm this Location
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleFormSubmit,handleFormError)} className="space-y-4">
              {/* Address Title */}
              <div>
                <Label htmlFor="addressTitle">Address Title *</Label>
                <Input
                  id="addressTitle"
                  placeholder="e.g. Home, Office"
                  {...register("label")}
                  className={errors.label ? "border-destructive" : ""}
                />
                {errors.label && <p className="text-xs text-destructive mt-1">{errors.label.message}</p>}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Sanjay"
                    {...register("firstName")}
                    className={errors.firstName ? "border-destructive" : ""}
                  />
                  {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Clarke"
                    {...register("lastName")}
                    className={errors.lastName ? "border-destructive" : ""}
                  />
                  {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

            
             

              {/* Phone Numbers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mobileNumber">Mobile Number *</Label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-muted rounded-l border border-r-0 border-border">
                      +977
                    </span>
                    <Input
                      id="phoneNumber"
                      placeholder="9800000000"
                      {...register("phoneNumber")}
                      className={`rounded-l-none ${errors.phoneNumber ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-xs text-destructive mt-1">{errors.phoneNumber.message}</p>
                  )}
                </div>
                
              </div>

              {/* Detailed Direction */}
              <div className="grid grid-cols-2 gap-4">

             
              <div>
                <Label htmlFor="detailedDirection">Detail Address Direction *</Label>
                <Textarea
                  id="detailAddressDirection"
                  placeholder="Enter Detail Address Direction"
                  {...register("detailAddressDirection")}
                  rows={3}
                />
              </div>
               {errors.detailAddressDirection && (
                    <p className="text-xs text-destructive mt-1">{errors.detailAddressDirection.message}</p>
                  )}
               </div>

              {/* Set as Default */}
              <Controller
              name="isDefault"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isDefault"
                    checked={!!field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer">
                    Set As Default Address
                  </Label>
                </div>
              )}
            />


              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setStep("location")} className="flex-1">
                  Change Location
                </Button>
                <Button type="submit" className="flex-1 bg-green-400 hover:bg-green-500 text-black font-semibold">
                  {isPending ? "Saving..." : "Save Address"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
