import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { 
  ZAddCartItemPayload, 
  ZCartItem ,
  ZCartItemPopulated,
  ZAdjustCartItemQuantityPayload
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
  },
  {
    pathPrefix: "/v1",
  }
);