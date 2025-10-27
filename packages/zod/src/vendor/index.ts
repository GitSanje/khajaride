import { z } from "zod";

// ----------------- Base schema -----------------
export const ZBase = z.object({
  id: z.string(),
  createdAt: z.string(), 
  updatedAt: z.string(),
});

// ----------------- MenuItem schema -----------------
export const ZMenuItem = ZBase.extend({
  vendorId: z.string(),
  categoryId: z.string(),
  name: z.string(),
  description: z.string(),
  basePrice: z.number(),
  oldPrice: z.number(),
  image: z.string(),
  isAvailable: z.boolean(),
  isVegetarian: z.boolean(),
  isVegan: z.boolean(),
  isPopular: z.boolean(),
  isGlutenFree: z.boolean(),
  spicyLevel: z.number(),
  mostLikedRank: z.number(),
  additionalServiceCharge: z.number(),
  tags: z.array(z.string()).optional(),
  portionSize: z.string(),
  specialInstructions: z.string(),
  keywords: z.string(),
});



// ----------------- VendorAddress schema -----------------
export const ZVendorAddress = z.object({
  vendorId: z.string(),
  streetAddress: z.string(),
  city: z.string(),
  state: z.string(),
  zipcode: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

// ----------------- Category schema -----------------
export const ZCategory = z.object({
  categoryId: z.string(),
  name: z.string(),
  description: z.string(),
  items: z.array(ZMenuItem).optional(),
});

// ----------------- Vendor schema -----------------
export const ZVendor =  ZBase.extend({
  name: z.string(),
  about: z.string(),
  cuisine: z.string(),
  phone: z.string().nullable().optional(),
  rating: z.number(),
  reviewCount: z.number(),
  deliveryAvailable: z.boolean(),
  pickupAvailable: z.boolean(),
  groupOrderAvailable: z.boolean(),
  deliveryFee: z.number(),
  minOrderAmount: z.number(),
  deliveryTimeEstimate: z.string(),
  isOpen: z.boolean(),
  openingHours: z.string().nullable().optional(),
  vendorListingImage: z.string().nullable().optional(),
  vendorLogoImage: z.string().nullable().optional(),
  vendorType: z.string().nullable().optional(),
  favoriteCount: z.number(),
  isFeatured: z.boolean(),
  cuisineTags: z.array(z.string()).optional(),
  promoText: z.string(),
  vendorNotice: z.string(),
  vendorServiceCharge: z.number(),
  vat: z.number(),
  vendorDiscount: z.number(),

});

// ----------------- VendorPopulated schema -----------------
export const ZVendorPopulated = ZVendor.extend({
  address: ZVendorAddress.nullable().optional(),
  categories: z.array(ZCategory).optional(),
});


// ------------------- CREATE VENDOR BODY-------------------
export const ZCreateVendorPayload = z.object({
  name: z.string().min(3).max(150),
  about: z.string().optional(),
  cuisine: z.string().optional(),
  phone: z.string().optional(),
  deliveryAvailable: z.boolean().optional(),
  pickupAvailable: z.boolean().optional(),
  groupOrderAvailable: z.boolean().optional(),
  deliveryFee: z.number().min(0).optional(),
  minOrderAmount: z.number().min(0).optional(),
  deliveryTimeEstimate: z.string().optional(),
  isOpen: z.boolean().optional(),
  openingHours: z.record(z.string()).optional(),
  vendorListingImageName: z.string().optional(),
  vendorLogoImageName: z.string().optional(),
  vendorType: z.enum(["restaurant", "bakery", "alcohol", "cafe"]).optional(),
  isFeatured: z.boolean().optional(),
  cuisineTags: z.array(z.string()).optional(),
  promoText: z.string().optional(),
  vendorNotice: z.string().optional(),
  
});

export const ZUpdateVendorPayload = ZCreateVendorPayload.extend({
  id: z.string(),
});

export const ZGetVendorsQuery = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sort: z.enum(["created_at", "updated_at", "rating", "name"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  search: z.string().min(2).optional(),
  cuisine: z.string().optional(),
  isOpen: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
});

export const ZDeleteVendorPayload = z.object({
  id: z.string(),
});

export const ZGetVendorByIDPayload = z.object({
  id: z.string(),
});


export type TMenuItem = z.infer<typeof ZMenuItem>
export type TVendor = z.infer<typeof ZVendor>
export type TVendorPopulated = z.infer<typeof ZVendorPopulated>
export type TCategory = z.infer<typeof ZCategory>