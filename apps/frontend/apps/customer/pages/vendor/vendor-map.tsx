"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Navigation } from "lucide-react"
import Link from "next/link"

import "leaflet/dist/leaflet.css"
import L from "leaflet"
import type { TVendorMenuSearchRes, TVendorSearchRes } from "@khajaride/zod"

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

// Custom marker icon for restaurants
const restaurantIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNFRjQ0NDQiLz4KPHBhdGggZD0iTTE2IDhWMjRNMTIgMTJIMjBNMTIgMTZIMjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

interface VendorMapProps {
  vendors: Array<{
    vendor: TVendorSearchRes
    items?: TVendorMenuSearchRes[]
  }>
  center?: [number, number]
  zoom?: number
  className?: string
}

// Component to update map view when vendors change
function MapUpdater({ vendors }: { vendors: VendorMapProps["vendors"] }) {
  const map = useMap()

  useEffect(() => {
    if (vendors.length > 0) {
      const bounds = L.latLngBounds(
        vendors
          .filter((v) => v.vendor.location.lat && v.vendor.location.lon)
          .map((v) => [v.vendor.location.lat, v.vendor.location.lon] as [number, number]),
      )
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
      }
    }
  }, [vendors, map])

  return null
}

export function VendorMap({ vendors, center = [27.7172, 85.324], zoom = 13, className }: VendorMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  // Filter vendors with valid coordinates
  const validVendors = vendors.filter(
    (v) => v.vendor.location.lat && v.vendor.location.lon && v.vendor.location.lat !== 0 && v.vendor.location.lon !== 0,
  )

  if (validVendors.length === 0) {
    return (
      <div className={`bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <Navigation className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No vendor locations available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater vendors={validVendors} />
        {validVendors.map(({ vendor, items }) => (
          <Marker key={vendor.id} position={[vendor.location.lat, vendor.location.lon]} icon={restaurantIcon}>
            <Popup maxWidth={300}  minWidth={250} className="vendor-popup">
              <Card className="border-0 shadow-none">
                <div className="p-2">
                  <div className="flex items-start gap-3">
                    {vendor.vendor_listing_image_name && (
                      <img
                        src={vendor.vendor_listing_image_name || "/placeholder.svg"}
                        alt={vendor.name}
                          className="w-16 h-16 flex-shrink-0 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm mb-1 ">{vendor.name}</h3>
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold">{vendor.rating.toFixed(1)}</span>
                      </div>
                      {/* <div className="flex flex-wrap gap-1 mb-2">
                        {vendor.cuisine_tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div> */}
                      <div className="text-xs text-muted-foreground mb-2">
                        <p>Rs. {vendor.delivery_fee} delivery</p>
                      </div>
                      <Link href={`/khajaride/vendor/${vendor.id}`}>
                        <Button size="sm" className="w-full text-xs">
                          View Menu
                        </Button>
                      </Link>
                    </div>

                  </div>
                </div>
              </Card>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
