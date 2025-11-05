
import { id } from "date-fns/locale"
import { z } from "zod"

export const deliveryAddressSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  label: z.string().min(1, "Address title is required").max(50),
  firstName: z.string().min(1, "First name is required").max(30),
  lastName: z.string().min(1, "Last name is required").max(30),
  phoneNumber: z.string().regex(/^\d{9,10}$/, "Valid phone number is required"),
  detailAddressDirection: z.string().min(1, "Address details are required"),
  latitude: z.number().min(-90).max(90, "Invalid latitude"),
  longitude: z.number().min(-180).max(180, "Invalid longitude"),
  isDefault: z.boolean().default(false),
})

export type DeliveryAddressFormData = z.infer<typeof deliveryAddressSchema>
