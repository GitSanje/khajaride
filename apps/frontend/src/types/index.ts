export interface Vendor {

  id: string
  name: string
  cuisine: string
  phone?: string
  rating: number
  review_count?: number
  delivery_available: boolean
  pickup_available: boolean
  delivery_fee: number
  min_order_amount: number
  delivery_time_estimate: string
  is_open: boolean
  opening_hours: string
  vendor_listing_image_name: string
  vendor_logo_image_name: string
  vendor_type: string
  is_featured: boolean
  cuisine_tags: string[]

  address: string
  latitude: number
  longitude: number
  promo_text?: string
  vendor_notice?: string 
}

export interface MenuCategory {
    id: string
    vendor_id: string
    name: string
    description?: string
    position?: number 
    total_items: number

}

export interface MenuItem {

  id: string
  vendor_id: string
  category_id: string
  name: string
  description: string
  base_price: number
  old_price: number
  image: string
  is_available: boolean
  is_vegetarian: boolean
  is_vegan?: boolean
  is_popular?: boolean
  is_gluten_free?: boolean
  spicy_level?: number
  tags?: string[]
  keywords?: string
  category_name?: string
  product_type?: string
  most_liked_rank?: number
  additional_service_charge?: number
  special_instructions?: string

}

export type MenuData = MenuCategory & {
  items: MenuItem[]
}
