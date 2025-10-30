import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { getSecurityMetadata } from "../utils.js";
import { ZCreateOrderPayload, ZPopulatedUserOrder} from "@khajaride/zod"; 

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
        "Creates an order vendor and corresponding order items from the authenticated user's active cart session.",
      metadata,
    },
     getOrdersByUserId: {
      path: "/orders/me/get-order",
    
      method: "GET",
      responses: {
        200: z.array(ZPopulatedUserOrder), 
      },
      summary: "Get orders of current user ",
      description:
        "Get orders of current user",
      metadata,
    },
    getOrderById: {
      path: "/orders/get-order/:id",
      pathParams: z.object({
            id: z.string(),
        }),
      method: "GET",
      responses: {
        200: ZPopulatedUserOrder, 
      },
      summary: "Get order by Id",
      description:
        "Get order by Id",
      metadata,
    },
  },
  {
    pathPrefix: "/v1",
  }
);
