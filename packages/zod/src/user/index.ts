import { z } from "zod";

// ------------------- USER ADDRESS -------------------
export const ZUserAddress = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),

  userId: z.string(),
  label: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  phoneNumber:z.string(),
  firstName:z.string(),
  lastName:z.string(),
  detailAddressDirection:z.string(),
  isDefault: z.boolean(),
});

// ------------------- CREATE USER ADDRESS PAYLOAD -------------------
export const ZUserAddressPayload = z.object({
  userId: z.string().optional(),
  label: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  phoneNumber:z.string(),
  firstName:z.string(),
  lastName:z.string(),
  detailAddressDirection:z.string(),
  isDefault: z.boolean(),
});

// ------------------- LOYALTY POINTS LEDGER -------------------
export const ZLoyaltyPointsLedger = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),

  userId: z.string(),
  transactionType: z.enum(["EARN", "REDEEM", "ADJUST"]),
  pointsChange: z.number(),
  balanceAfter: z.number(),
  reason: z.string(),
  referenceId: z.string().nullable(),
  referenceType: z.string().nullable(),
  performedBy: z.string(),
  performedAt: z.string(),
});

// ------------------- USER -------------------
export const ZUser = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),

  email: z.string().email(),
  username: z.string(),
  password: z.string(),
  phoneNumber: z.string().nullable(),
  role: z.string(),
  isVerified: z.boolean(),
  isActive: z.boolean(),
  loyaltyPoints: z.number(),
  profilePicture: z.string().nullable(),
  twoFactorEnabled: z.boolean(),
  currentOnboardingStep:z.string(),
  isVendorOnboardingCompleted:z.boolean()


});


// ------------------- GET USERS-------------------
export const ZGetUsersQuery = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sort: z.enum(["created_at", "updated_at", "email", "username", "role"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  search: z.string().min(1).optional(),
  role: z.enum(["user", "restaurant_manager", "delivery_partner", "admin"]).optional(),
  active: z.boolean().optional(),
  verified: z.boolean().optional(),
});


export const ZVendorOnboardingTrack = z.object({
  completed: z.boolean(),
  currentStep: z.string()
})