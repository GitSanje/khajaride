import { ZBase, ZMenuItem, ZVendor, ZVendorAddress } from "../vendor/index.js";
import { z } from "zod";



// ---------------------- CartItemPayload ----------------------

export const ZAddCartItemPayload = z.object({
  vendorId: z.string().min(1, "Vendor ID is required"),
  menuItemId: z.string().min(1, "Menu Item ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  discountAmount: z.number().min(0, "Discount must be non-negative").optional(),
  specialInstructions: z.string().optional(),
});


// ---------------------- CartItem ----------------------

export const ZCartItem = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  cartVendorId: z.string(),
  menuItemId: z.string(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  discountAmount: z.number().min(0),
  specialInstructions: z.string().nullable().optional(),
  subtotal: z.number().min(0),
});

// ---------------------- CartVendor ----------------------
export const ZCartVendor = ZBase.extend({
  cartSessionId: z.string(),
  vendorId: z.string(),
  subtotal: z.number().nullable().optional(),
  deliveryCharge: z.number().nullable().optional(),
  vendorServiceCharge: z.number(),
  vat: z.number(),
  vendorDiscount: z.number(),
  total: z.number().nullable().optional(),
});

// ---------------------- CartSession ----------------------
export const ZCartSession = ZBase.extend({
  userId: z.string(),
  status: z.enum(["active", "checked_out", "abandoned"]),
  currency: z.string(),
  appliedCouponCode: z.string().nullable().optional(),
});


// ---------------------- CartMenuItem ----------------------
export const ZCartMenuItem = z.object({
  cartItem: ZCartItem,
  menuItem: ZMenuItem,
});

// ---------------------- CartItemPopulated ----------------------
export const ZCartItemPopulated = ZCartVendor.extend({
  vendor: ZVendor,
  vendorAddress: ZVendorAddress,
  cartItems: z.array(ZCartMenuItem),
});



// -------------------- Adjust Cart Item Quantity --------------------
export const ZAdjustCartItemQuantityPayload = z.object({
  cartVendorId: z.string().min(1, "cartVendorId is required"),
  menuItemId: z.string().min(1, "menuItemId is required"),
  delta: z.number().int()
});




export const ZGetCartTotalsQuery = z.object({
  userId: z.string().optional(), 
  cartVendorId: z.string().min(1, "Cart vendor ID is required"),
  vendorId: z.string().min(1, "Vendor ID is required"),
  couponCode: z.string().optional(),
  lat: z.number({ required_error: "Latitude is required" }),
  lng: z.number({ required_error: "Longitude is required" }),
  distanceKM: z.number().nonnegative("Distance must be non-negative"),
  subtotal: z.number().nonnegative("Subtotal must be non-negative"),
});

export const ZGetCartTotalsResponse = z.object({
  subtotal: z.number(),
  deliveryDistanceKm: z.number(),
  deliveryFee: z.number(),
  vendorServiceCharge: z.number(),
  vat: z.number(),
  vendorDiscount: z.number(),
  couponDiscount: z.number(),
  total: z.number(),
  estimatedDeliveryTime: z.string(),
  currency: z.string(),
  appliedCouponCode: z.string().nullable().optional(),
});

export const ZApplyCouponPayload = z.object({
  userId: z.string().optional(), 
  cartVendorId: z.string().min(1, "Cart vendor ID is required"),
  vendorId: z.string().min(1, "Vendor ID is required"),
  couponCode: z.string().optional(),
  subtotal: z.number().nonnegative("Subtotal must be non-negative"),
});




// ---------------------- Type Inference ----------------------

export type GetCartTotalsQuery = z.infer<typeof ZGetCartTotalsQuery>;
export type GetCartTotalsResponse = z.infer<typeof ZGetCartTotalsResponse>;
export type ApplyCouponPayload = z.infer<typeof ZApplyCouponPayload>;
export type TCartItem = z.infer<typeof ZCartItem>;
export type TAddCartItemPayload = z.infer<typeof ZAddCartItemPayload>;
export type TCartVendor = z.infer<typeof ZCartVendor>;
export type TCartSession = z.infer<typeof ZCartSession>;
export type TCartItemPopulated = z.infer<typeof ZCartItemPopulated>;
export type TAdjustCartItemQuantity= z.infer<typeof ZAdjustCartItemQuantityPayload>;



