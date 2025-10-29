import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { getSecurityMetadata } from "../utils.js";
import { ZCreateOrderPayload, ZOrderGroup} from "@khajaride/zod"; 

const c = initContract();
const metadata = getSecurityMetadata();

/**
 * Order contract — Create order from active cart
 */
export const orderContract = c.router(
  {
    // -------------------- Create Order from Cart --------------------
    createOrder: {
      path: "/orders/create-order",
      method: "POST",
      body:ZCreateOrderPayload ,
      responses: {
        201: z.object({
          message: z.string(),
          orderId : z.string()
        }), 
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
