import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { 
  ZAddCartItemPayload, 
  ZCartItem ,
  ZCartItemPopulated
} from "@khajaride/zod";
import { getSecurityMetadata } from "../utils.js";

const c = initContract();
const metadata = getSecurityMetadata();

// Define the Cart contract
export const cartContract = c.router({
  // Get active cart (for current user)
  getCart: {
    path: "/carts",
    method: "GET",
    responses: {
      200: z.array(ZCartItemPopulated)
    },
    summary: "Get current user's active cart",
    description: "Fetch the active cart session with all vendors and items for the authenticated user.",
    metadata,
  },

  // Add or update an item in the cart
  addCartItem: {
    path: "/carts/items",
    method: "POST",
    body: ZAddCartItemPayload,
    responses: {
      201: ZCartItem,
    },
    summary: "Add or update a cart item",
    description: "Upserts a cart item for the current user's active session. Creates vendor and session if not existing.",
    metadata,
  },
},
{
    pathPrefix: "/v1",
  }

);
