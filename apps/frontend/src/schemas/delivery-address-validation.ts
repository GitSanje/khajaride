import { z } from "zod"

export const deliveryAddressSchema = z.object({
  addressTitle: z.string().min(1, "Address title is required").max(50),
  streetAddress: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  zipCode: z.string().min(3, "ZIP code is required"),
  mobileNumber: z.string().regex(/^\d{9,10}$/, "Valid phone number is required"),
  detailedDirection: z.string().optional(),
  latitude: z.number().min(-90).max(90, "Invalid latitude"),
  longitude: z.number().min(-180).max(180, "Invalid longitude"),
  setAsDefault: z.boolean().default(false),
})

export type DeliveryAddressFormData = z.infer<typeof deliveryAddressSchema>
