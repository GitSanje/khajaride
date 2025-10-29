import z from "zod";



export const ZKhaltiPaymentPayload= z.object({
  return_url: z.string().url("Invalid return URL"),
  website_url: z.string().url("Invalid website URL"),
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

export type KhaltiVerifyPaymentResponse = z.infer<typeof ZKhaltiVerifyPaymentResponse>;
export type KhaltiPaymentResponse = z.infer<typeof ZKhaltiPaymentResponse>;
export type KhaltiVerifyPaymentPayload = z.infer<typeof ZKhaltiVerifyPaymentPayload>;
export type KhaltiPaymentPayload = z.infer<typeof ZKhaltiPaymentPayload>;
