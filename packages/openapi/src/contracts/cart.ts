import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { 
  ZAddCartItemPayload, 
  ZCartItem ,
  ZCartItemPopulated,
  ZAdjustCartItemQuantityPayload,
  ZGetCartTotalsQuery,
  ZGetCartTotalsResponse,
  ZApplyCouponPayload


} from "@khajaride/zod";
import { getSecurityMetadata } from "../utils.js";

const c = initContract();
const metadata = getSecurityMetadata();

export const cartContract = c.router(
  {
    // -------------------- Get Active Cart --------------------
    getCart: {
      path: "/carts",
      method: "GET",
      responses: {
        200: z.array(ZCartItemPopulated),
      },
      summary: "Get current user's active cart",
      description:
        "Fetch the active cart session with all vendors and items for the authenticated user.",
      metadata,
    },

    // -------------------- Add or Update Cart Item --------------------
    addCartItem: {
      path: "/carts/items",
      method: "POST",
      body: ZAddCartItemPayload,
      responses: {
        201: ZCartItem,
      },
      summary: "Add or update a cart item",
      description:
        "Upserts a cart item for the current user's active session. Creates vendor and session if not existing.",
      metadata,
    },

    // -------------------- Adjust Cart Item Quantity --------------------
    adjustCartItemQuantity: {
      path: "/carts/items/adjust-quantity",
      method: "POST",
      body: ZAdjustCartItemQuantityPayload,
      responses: {
        200: ZCartItem,
      },
      summary: "Adjust quantity of an existing cart item",
      description:
        "Increments or decrements the quantity of an existing cart item. Inserts if missing and delta > 0.",
      metadata,
    },

    // -------------------- Delete Cart Item --------------------
    deleteCartItem: {
      path: "/carts/items/:id",
      method: "DELETE",
      pathParams: z.object({
        id: z.string().min(1),
      }),
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
      },
      summary: "Delete a cart item by ID",
      description:
        "Deletes a cart item and updates the vendor subtotal if applicable.",
      metadata,
    },
    // -------------------- Get Cart Totals --------------------
     getCartTotals: {
      path: "/carts/totals",
      method: "GET",
      query: ZGetCartTotalsQuery,
      responses: {
        200: ZGetCartTotalsResponse,
      },
      summary: "Get calculated cart totals for vendor",
      description: "Computes delivery fee, VAT, discounts, and total for the user's cart",
    },

    applyCoupon: {
      path: "/carts/apply-coupon",
      method: "POST",
      body: ZApplyCouponPayload,
      responses: {
        201: z.object({
          discountAmount: z.number(),
        }),
      },
      summary: "Apply a coupon to the cart",
    },

  },
  {
    pathPrefix: "/v1",
  }
);