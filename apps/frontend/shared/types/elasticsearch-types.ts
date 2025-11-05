
export interface SearchFilters {
  offers?: boolean
  deliveryFee?: "free" | "low" | "any"
  deliveryTime?: number // in minutes
  rating?: number
  priceRange?: "budget" | "moderate" | "premium"
  dietary?: ("vegetarian" | "vegan" | "gluten_free")[]
  sortBy?: "relevance" | "rating" | "delivery_time" | "price"
}

