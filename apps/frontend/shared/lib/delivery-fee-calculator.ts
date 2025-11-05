// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    if (lat1 === lat2 && lon1 === lon2 || (!lat1 && !lon1 && !lat2 && !lon2)) {
    return 0
  }
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate delivery fee based on distance
export function calculateDeliveryFee(distanceKm: number): number {
    if (distanceKm === 0) {
        return 0
    }
  const baseFee = 50 // Base delivery fee in rupees
  const perKmFee = 10 // Fee per kilometer

  if (distanceKm <= 1) {
    return baseFee
  }

  return baseFee + (distanceKm - 1) * perKmFee
}

// Get estimated delivery time based on distance
export function getEstimatedDeliveryTime(distanceKm: number): string {
  const baseTime = 15 // Base time in minutes
  const timePerKm = 2 // Minutes per kilometer

  const totalMinutes = Math.ceil(baseTime + distanceKm * timePerKm)
  const minTime = totalMinutes
  const maxTime = totalMinutes + 10

  return `${minTime}-${maxTime} min`
}
