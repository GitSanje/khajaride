import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { getSecurityMetadata } from "../utils.js";
import {
  ZKhaltiPaymentPayload,
  ZKhaltiPaymentResponse,
  ZKhaltiVerifyPaymentResponse,
  ZKhaltiVerifyPaymentPayload,
} from "@khajaride/zod";
const c = initContract();
const metadata = getSecurityMetadata();

/**
 * Payment contract — Khalti payment creation and verification
 */
export const paymentContract = c.router(
  {
    // -------------------- Initiate Khalti Payment --------------------
    initiateKhaltiPayment: {
      path: "/payments/khalti/initiate",
      method: "POST",
      body: ZKhaltiPaymentPayload,
      responses: {
        201: ZKhaltiPaymentResponse,
      },
      summary: "Initiate Khalti payment session",
      description:
        "Creates a new Khalti payment session and returns a payment URL for the user to complete payment.",
      metadata,
    },

    // -------------------- Verify Khalti Payment --------------------
    verifyKhaltiPayment: {
      path: "/payments/khalti/verify",
      method: "POST",
      body: ZKhaltiVerifyPaymentPayload,
      responses: {
        200: ZKhaltiVerifyPaymentResponse
      },
      summary: "Verify Khalti payment status",
      description:
        "Verifies the payment with Khalti using the PIDX and confirms whether it succeeded or failed.",
      metadata,
    },
  },
  {
    pathPrefix: "/v1",
  }
);
