import z from "zod";
import { ZBase, ZMenuItem } from "../vendor/index.js";

import { ZUserAddress } from "../user/index.js";


// ---------------------- ORDER GROUP----------------------



export const ZOrderGroup = ZBase.extend({
  userId: z.string().min(1, "userId is required"), 
  total: z.number().nonnegative("total must be >= 0"),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/, "currency must be a 3-letter uppercase code")
    .default("NPR"),
  paymentStatus: z.enum(["unpaid", "paid", "failed"]).default("unpaid"),
});



// ---------------------- PAYMENT DETAILS----------------------



export const ZPaymentDetails = z.object({
  paymentMethod: z.string().min(1, "Payment method is required"),
  amount: z.number().min(0, "Amount must be greater than or equal to 0"),
  transactionID: z.string().optional(),
  method: z.string().min(1, "Method is required"),
  paymentGateway: z.string().optional(),
});


// ---------------------- CREATE ORDER PAYLOAD ----------------------



export const ZCreateOrderPayload = z.object({
  userID: z.string().nullable().optional(),
  cartVendorId: z.string().min(1, "Cart vendor ID is required"),
  DeliveryAddressId: z.string().min(1, "Delivery address is required"),
  deliveryInstructions: z.string().optional(),
  expectedDeliveryTime: z.string().optional(), // duration in min or hr
});


// Base schema (assuming your model.Base has ID and timestamps)
const BaseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Duration schema for time.Duration fields
const DurationSchema = z.string().refine((val) => {
  // Validate duration format like "30m", "1h", "2h30m"
  return /^(\d+(\.\d+)?(ns|us|µs|ms|s|m|h))+$/.test(val);
}, {
  message: "Invalid duration format"
});

// Order Status Enum
const OrderStatusSchema = z.enum([
  'pending',
  'accepted', 
  'preparing',
  'ready_for_pickup',
  'assigned',
  'picked_up',
  'delivered',
  'cancelled',
  'failed'
]);

// Payment Status Enum
const PaymentStatusSchema = z.enum([
  'unpaid',
  'paid',
  'refunded',
  'failed'
]);

// Fulfillment Type Enum
const FulfillmentTypeSchema = z.enum([
  'delivery',
  'pickup'
]);

export const ZOrderVendor = BaseSchema.extend({
  userId: z.string(),
  vendorCartId: z.string().optional().nullable(),
  vendorId: z.string(),
  
  status: OrderStatusSchema.default('pending'),
  
  // Numeric fields with precision validation
  subtotal: z.number().min(0).default(0),
  deliveryCharge: z.number().min(0).default(0),
  vendorServiceCharge: z.number().min(0).default(0),
  vat: z.number().min(0).default(0),
  vendorDiscount: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  
  currency: z.string().default('NPR'),
  paymentStatus: PaymentStatusSchema.default('unpaid'),
  fulfillmentType: FulfillmentTypeSchema.default('delivery'),
  
  deliveryAddressId: z.string().uuid().optional().nullable(),
  deliveryInstructions: z.string().optional().nullable(),
  
  // Time duration fields
  expectedDeliveryTime: DurationSchema.optional().nullable(),
  actualDeliveryTime: DurationSchema.optional().nullable(),
  
  // Timestamp fields
  scheduledFor: z.string().datetime().optional().nullable(),
  pickupReadyTime: z.string().datetime().optional().nullable(),
  
  // Event timestamps
  restaurantAcceptedAt: z.string().datetime().optional().nullable(),
  driverAssignedAt: z.string().datetime().optional().nullable(),
  deliveredAt: z.string().datetime().optional().nullable(),
});


export const ZOrderItem = z.object({
  // Base fields
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),

  // OrderItem specific fields
  orderVendorId: z.string().uuid(),
  cartItemId: z.string().uuid().optional().nullable(),
  menuItemId: z.string().uuid(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  discountAmount: z.number().min(0).default(0),
  specialInstructions: z.string().optional().nullable(),
  subtotal: z.number().min(0),
});

const ZOrderItems = z.object({
  orderItem: ZOrderItem,
  menuItem: ZMenuItem
   
})

export const ZVendorInfo = z.object({

  name: z.string(),
  cuisine: z.string(),
  image: z.string().optional(),
})

// Type for OrderItem
export type OrderItem = z.infer<typeof ZOrderItem>;

export const ZPopulatedUserOrder = ZOrderVendor.extend({
  orderItems: z.array(ZOrderItems),
  deliveryAddress: ZUserAddress,
  vendor: ZVendorInfo
 
});


// Type inference
export type OrderVendor = z.infer<typeof ZOrderVendor>;
export type PopulatedUserOrder = z.infer<typeof ZPopulatedUserOrder>;

export type CreateOrderPayload = z.infer<typeof ZCreateOrderPayload>;
export type PaymentDetails = z.infer<typeof ZPaymentDetails>;
