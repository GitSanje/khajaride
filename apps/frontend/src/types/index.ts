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


// Utility functions to convert Foodmandu API data to our types
export function convertFoodmanduRestaurant(apiData: any): Vendor {
  // Parse delivery charge from "Rs. 20" format
  const deliveryFee =
    typeof apiData.DeliveryCharge === "object"
      ? Number.parseFloat(apiData.DeliveryCharge.charge?.replace("Rs. ", "") || "0")
      : Number.parseFloat(apiData.DeliveryCharge?.toString().replace("Rs. ", "") || "0")

  // Parse cuisine tags from "Multi Cuisine | Local Snacks" format
  const cuisineTags = apiData.CuisineTags
    ? apiData.CuisineTags.split("|")
        .map((tag: string) => tag.trim())
        .filter(Boolean)
    : [apiData.Cuisine || "Restaurant"]

  return {
    id: apiData.Id?.toString() || apiData.id?.toString(),
    name: apiData.Name || apiData.name,
    cuisine: apiData.Cuisine || "",
    rating: Number.parseFloat(apiData.VendorRating || apiData.rating || "0"),
    delivery_available: apiData.AcceptsDeliveryOrder !== false,
    pickup_available: apiData.AcceptsTakeoutOrder === true,
    delivery_fee: deliveryFee,
    min_order_amount: Number.parseFloat(apiData.MinimumOrderAmount || "0"),
    delivery_time_estimate: apiData.DeliveryDuration || apiData.OpeningHours || "",
    is_open: !apiData.IsVendorClosed,
    opening_hours: apiData.OpeningHours || apiData.VendorCloseLabel || "",
    vendor_listing_image_name: apiData.VendorListingWebImageName || apiData.image || "",
    vendor_logo_image_name:  apiData.VendorCoverImageName || "",
    vendor_type: apiData.VendorType || "Restaurant",
    is_featured: apiData.IsFeaturedVendor === true,
    cuisine_tags: cuisineTags,
    address: `${apiData.Address1 || ""} ${apiData.Address2 || ""}`.trim(),
    latitude: Number.parseFloat(apiData.LocationLat || "0"),
    longitude: Number.parseFloat(apiData.LocationLng || "0"),
    promo_text: apiData.PromoText || "",
    vendor_notice: apiData.VendorNotice || "",
  }
}


export function convertFoodmanduMenuCategory(apiData: any, vendorId: string, index: number): MenuCategory {
  return {
    id: apiData.categoryId?.toString() || `cat-${index}`,
    vendor_id: vendorId,
    name: apiData.category || "Menu Items",
    description: apiData.categoryDesc || "",
    position: index,
    total_items: apiData.totalItems || apiData.items?.length || 0,

  }
}

export function convertFoodmanduMenuItem(apiData: any, vendorId: string, categoryId: string): MenuItem {
  
  const tags = apiData.tags
    ? apiData.tags
        .split(",")
        .map((tag: string) => tag.trim())
        .filter(Boolean)
    : []

  return {
    id: apiData.productId?.toString() || apiData.id?.toString(),
    vendor_id: vendorId,
    category_id: categoryId,
    name: apiData.name || "Menu Item",
    description: apiData.productDesc || apiData.description || "",
    base_price: Number.parseFloat(apiData.price || "0"),
    old_price: Number.parseFloat(apiData.oldprice || "0"),
    image: apiData.ProductImage || apiData.ProductGridImage || "",
    is_available: true, 
    is_vegetarian: false, 
    is_vegan: false, 
    is_popular: apiData.IsFavouriteProduct === true,
    spicy_level: 0,
    tags: tags,
    keywords: apiData.Keyword || apiData.name || "",
    category_name: apiData.itemDisplayTag || "",
    product_type: apiData.type || "product",
  }
}
