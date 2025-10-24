import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { getSecurityMetadata } from "../utils.js";
import { ZOrderGroup} from "@khajaride/zod"; 

const c = initContract();
const metadata = getSecurityMetadata();

/**
 * Order contract — Create order from active cart
 */
export const orderContract = c.router(
  {
    // -------------------- Create Order from Cart --------------------
    createOrderFromCart: {
      path: "/orders/create-from-cart",
      method: "POST",
      body: z
        .object({
          userId: z.string().optional()
        })
        .optional(),
      responses: {
        201: ZOrderGroup, 
      },
      summary: "Create order from user's active cart",
      description:
        "Creates an order group and corresponding vendor orders from the authenticated user's active cart session.",
      metadata,
    },
  },
  {
    pathPrefix: "/v1",
  }
);
