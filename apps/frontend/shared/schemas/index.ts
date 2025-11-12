import { z } from "zod"

export const LoginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})


export const SignupSchema = z
  .object({
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    username: z.string().min(3, "Username name is required"),
    agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to terms and conditions"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
export const VENDOR_TYPES = ["restaurant", "bakery", "alcohol", "cafe"] as const
  // Zod schema based on your vendor schema
  export const vendorProfileSchema = z.object({
    name: z.string().min(1, "Restaurant name is required"),
    about: z.string().optional(),
    cuisine: z.string().min(1, "Primary cuisine is required"),
    phone: z.string().min(1, "Phone number is required"),
    vendorType: z.enum(VENDOR_TYPES, {
      message: "Please select a restaurant type"
    }),
    deliveryAvailable: z.boolean().default(true),
    pickupAvailable: z.boolean().default(true),
    deliveryFee: z.number().min(0, "Delivery fee cannot be negative").default(0),
    minOrderAmount: z.number().min(0, "Minimum order amount cannot be negative").default(0),
    deliveryTimeEstimate: z
  .string()
  .regex(/^\d{1,3}\s*-\s*\d{1,3}\s*(min|mins)?$/i, "Invalid format. Example: 20-30 min")
  .optional(),
    promoText: z.string().optional(),
    cuisineTags: z.array(z.string()).default([]),
    openingHours: z
  .string()
  .regex(
    /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM)\s?-\s?(0?[1-9]|1[0-2]):[0-5][0-9]\s?(PM)$/i,
    "Invalid time range. Example: 11:00 AM - 08:00 PM"
  ).min(2, "Opening Hours is required"),

    vendorListingImage: z.string().optional(),
    vendorLogoImage: z.string().optional(),
    vendorServiceCharge: z.number().optional(),
    vat: z.number().optional(),
    vendorDiscount: z.number().optional()
  })
  
export type VendorProfileFormData = z.infer<typeof vendorProfileSchema>
  


export type LoginFormData = z.infer<typeof LoginSchema>
export type SignupFormData = z.infer<typeof SignupSchema>