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
