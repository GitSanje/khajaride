import z from "zod";



export const ZKhaltiPaymentPayload= z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  purchase_order_id: z.string().min(1, "Purchase order ID is required"),
  purchase_order_name: z.string().min(1, "Purchase order name is required"),
});

export const ZKhaltiVerifyPaymentPayload = z.object({
  pidx: z.string().min(1, "PIDX is required"),
});


export const ZKhaltiPaymentResponse = z.object({
  pidx: z.string(),
  payment_url: z.string().url(),
  expires_at: z.string(),
  expires_in: z.number(),
});

export const ZKhaltiVerifyPaymentResponse = z.object({
  pidx: z.string().min(1, "PIDX is required"),
  total_amount: z.number().nonnegative("Total amount must be positive"),
  status: z.string().min(1, "Status is required"),
  transaction_id: z.string().min(1, "Transaction ID is required"),
  fee: z.number().nonnegative("Fee cannot be negative"),
  refunded: z.boolean(),
});



// -------------------- Stripe: Initiate Payment --------------------
export const ZStripePaymentPayload = z.object({
  purchase_order_id: z.string(),
  purchase_order_name: z.string(),
  amount: z.number().positive(),
  currency: z.string().optional().nullable(),
});

export const ZStripePaymentResponse = z.object({
  url: z.string().url(), 
});

// -------------------- Stripe: Verify Payment --------------------
export const ZStripeVerifyPaymentPayload = z.object({
  session_id: z.string(),
  purchase_order_id: z.string(),
  purchase_order_name: z.string(),
  amount: z.number().positive(),
});

export const ZStripeVerifyPaymentResponse = z.object({
  status: z.string().optional(), 
});



export const ZStripeVendorOnboardingPayload= z.object({
  vendorUserId: z.string(), 
});

export const ZStripeVendorOnboardingResponse= z.object({
  url: z.string().optional(), 
  status: z.string()
});


export type KhaltiVerifyPaymentResponse = z.infer<typeof ZKhaltiVerifyPaymentResponse>;
export type KhaltiPaymentResponse = z.infer<typeof ZKhaltiPaymentResponse>;
export type KhaltiVerifyPaymentPayload = z.infer<typeof ZKhaltiVerifyPaymentPayload>;
export type KhaltiPaymentPayload = z.infer<typeof ZKhaltiPaymentPayload>;
