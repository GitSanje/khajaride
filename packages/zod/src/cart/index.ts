import { ZBase, ZMenuItem } from "../vendor/index.js";
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


// ---------------------- ShortVendorInfo ----------------------
export const ZShortVendorInfo = z.object({
  vendorId: z.string(),
  name: z.string(),
  about: z.string().nullable().optional(),
});

// ---------------------- CartMenuItem ----------------------
export const ZCartMenuItem = z.object({
  cartItem: ZCartItem,
  menuItem: ZMenuItem,
});

// ---------------------- CartItemPopulated ----------------------
export const ZCartItemPopulated = ZCartVendor.extend({
  vendor: ZShortVendorInfo,
  cartItems: z.array(ZCartMenuItem),
});


// ---------------------- Type Inference ----------------------


export type TCartItem = z.infer<typeof ZCartItem>;
export type TAddCartItemPayload = z.infer<typeof ZAddCartItemPayload>;
export type TCartVendor = z.infer<typeof ZCartVendor>;
export type TCartSession = z.infer<typeof ZCartSession>;
export type TCartItemPopulated = z.infer<typeof ZCartItemPopulated>;



