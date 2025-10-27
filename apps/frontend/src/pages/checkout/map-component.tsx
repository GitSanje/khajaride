"use client"

import { use, useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapComponentProps {
  onLocationChange: (location: { lat: number; lng: number }) => void
  latitude?: number
  longitude?: number
   searchQuery?: string 
}

export default function MapComponent({
  onLocationChange,
  latitude = 27.7172,
  longitude = 85.324,
  searchQuery
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      mapRef.current = L.map("map").setView([latitude, longitude], 13)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)

      // Add draggable marker
      markerRef.current = L.marker([latitude, longitude], { draggable: true }).addTo(mapRef.current)

      markerRef.current.on("dragend", () => {
        if (markerRef.current) {
          const position = markerRef.current.getLatLng()
          onLocationChange({ lat: position.lat, lng: position.lng })
        }
      })

      // Handle map clicks
      mapRef.current.on("click", (e) => {
        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng)
          onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng })
        }
      })
    }

    return () => {
      // Cleanup
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])


   // Handle search query changes

   useEffect(() => {
    if (!searchQuery || !mapRef.current) return

    const fetchLocation = async () => {

        try {
            const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
        )
        const data = await response.json()
             if (data.length > 0) {
          const { lat, lon } = data[0]
          const newLat = parseFloat(lat)
          const newLng = parseFloat(lon)

          // Move map and marker
          mapRef.current!.setView([newLat, newLng], 15)
          markerRef.current!.setLatLng([newLat, newLng])
          onLocationChange({ lat: newLat, lng: newLng })
        } else {
          console.warn("No results found for:", searchQuery)
        }
        } catch (error) {
            console.error("Error fetching location:", error)
        }
    }
     fetchLocation()

   }, [searchQuery])

  return <div id="map" className="w-full h-full" />
}
