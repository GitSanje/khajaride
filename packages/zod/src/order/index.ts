import z from "zod";
import { ZBase } from "../vendor/index.js";


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



export const ZPaymentDetails = z.object({
  paymentMethod: z.string().min(1, "Payment method is required"),
  amount: z.number().min(0, "Amount must be greater than or equal to 0"),
  transactionID: z.string().optional(),
  method: z.string().min(1, "Method is required"),
  paymentGateway: z.string().optional(),
});


export const ZCreateOrderPayload = z.object({
  userID: z.string().nullable().optional(),
  cartVendorId: z.string().min(1, "Cart vendor ID is required"),
  DeliveryAddressId: z.string().min(1, "Delivery address is required"),
  deliveryInstructions: z.string().optional(),
  expectedDeliveryTime: z.number().optional(), // duration in min or hr
});

export type CreateOrderPayload = z.infer<typeof ZCreateOrderPayload>;
export type PaymentDetails = z.infer<typeof ZPaymentDetails>;
