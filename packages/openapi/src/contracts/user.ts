import { z } from "zod";
import { initContract } from "@ts-rest/core"; 
import {
  ZUser,
  ZUserAddress,
  ZLoyaltyPointsLedger,
  schemaWithPagination,
  ZGetUsersQuery
} from "@khajaride/zod";
import { getSecurityMetadata } from "@/utils.js";

const c = initContract();
const metadata = getSecurityMetadata();

// ----------- USERS CONTRACT -----------
export const userContract = c.router(
  {
    // Create User
    createUser: {
      summary: "Create a new user",
      path: "/users",
      method: "POST",
      description: "Create user after Clerk signup, sync to DB",
      body: z.object({
        email: z.string().email(),
        username: z.string().min(3).max(50),
        phoneNumber: z.string().optional(),
        password: z.string().min(6),
        role: z.enum(["user", "restaurant_manager", "delivery_partner", "admin"]).optional(),
        profilePicture: z.string().url().optional(),
      }),
      responses: {
        201: ZUser,
      },
    },

    // Get my profile
    getMyProfile: {
      summary: "Get my profile",
      path: "/users/me",
      method: "GET",
      description: "Get currently authenticated user's profile",
      responses: {
        200: ZUser,
      },
      metadata,
    },

    // Update my profile
    updateMyProfile: {
      summary: "Update my profile",
      path: "/users/me",
      method: "PATCH",
      description: "Update profile (name, phone, picture, etc.)",
      body: z.object({
        email: z.string().email().optional(),
        username: z.string().min(3).max(50).optional(),
        phoneNumber: z.string().optional(),
        password: z.string().min(6).optional(),
        role: z.enum(["user", "restaurant_manager", "delivery_partner", "admin"]).optional(),
        profilePicture: z.string().url().optional(),
      }),
      responses: {
        200: ZUser,
      },
      metadata,
    },

    // Delete my account
    deleteMyAccount: {
      summary: "Delete my account",
      path: "/users/me",
      method: "DELETE",
      description: "Soft delete account (set deleted_at)",
      responses: {
        204: z.void(),
      },
      metadata,
    },
     // List users (admin only)
    listUsers: {
      summary: "List users",
      path: "/users/list",
      method: "GET",
      description: "List users with pagination, filtering, sorting",
      query: ZGetUsersQuery,
      responses: {
        200: schemaWithPagination(ZUser), // paginated list of users
      },
      metadata,
    },

    // ------------------- ADDRESSES -------------------
    createAddress: {
      summary: "Add address",
      path: "/users/me/addresses",
      method: "POST",
      body: z.object({
        label: z.string().min(2).max(20),
        latitude: z.number(),
        longitude: z.number(),
        isDefault: z.boolean().optional(),
      }),
      responses: {
        201: ZUserAddress,
      },
      metadata,
    },

    listAddresses: {
      summary: "List my addresses",
      path: "/users/me/addresses",
      method: "GET",
      responses: {
        200: z.array(ZUserAddress),
      },
      metadata,
    },

    updateAddress: {
      summary: "Update address",
      path: "/users/me/addresses/:id",
      method: "PATCH",
      body: z.object({
        label: z.string().min(2).max(20).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        isDefault: z.boolean().optional(),
      }),
      responses: {
        200: ZUserAddress,
      },
      metadata,
    },

    deleteAddress: {
      summary: "Delete address",
      path: "/users/me/addresses/:id",
      method: "DELETE",
      responses: {
        204: z.void(),
      },
      metadata,
    },

   setDefaultAddress: {
        summary: "Set default address",
        path: "/users/me/addresses/:id/default",
        method: "PATCH",
        pathParams: z.object({
            id: z.string().uuid(),
        }),
        body:z.null(),
        responses: {
            200: ZUserAddress,
        },
        metadata,
        },


    // ------------------- LOYALTY POINTS -------------------
    getLoyaltyHistory: {
      summary: "Get user loyalty history",
      path: "/users/me/loyalty",
      method: "GET",
      query: z.object({
        page: z.number().min(1).optional(),
        limit: z.number().min(1).max(100).optional(),
        transactionType: z.enum(["EARN", "REDEEM", "ADJUST"]).optional(),
        fromDate: z.string().datetime().optional(),
        toDate: z.string().datetime().optional(),
      }),
      responses: {
        200: schemaWithPagination(ZLoyaltyPointsLedger),
      },
      metadata,
    },

    getCurrentBalance: {
      summary: "Get current balance",
      path: "/users/me/loyalty/balance",
      method: "GET",
      responses: {
        200: z.object({
          balance: z.number(),
        }),
      },
      metadata,
    },

    redeemPoints: {
      summary: "Redeem points",
      path: "/loyalty/redeem",
      method: "POST",
      body: z.object({
        points: z.number().positive(),
        reason: z.string().min(3).max(255),
      }),
      responses: {
        200: z.object({
          success: z.boolean(),
        }),
      },
      metadata,
    },

    adjustPoints: {
      summary: "Adjust points (admin/system)",
      path: "/loyalty/adjust",
      method: "POST",
      body: z.object({
        userId: z.string().uuid(),
        pointsChange: z.number(),
        transactionType: z.enum(["EARN", "REDEEM", "ADJUST"]),
        reason: z.string().min(3).max(255),
        performedBy: z.string(),
        referenceId: z.string().uuid().nullable().optional(),
        referenceType: z.string().nullable().optional(),
      }),
      responses: {
        200: z.object({
          success: z.boolean(),
        }),
      },
      metadata,
    },
  },
  {
    pathPrefix: "/v1",
  }
);
