import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { getSecurityMetadata } from "../utils.js";
import {
  ZKhaltiPaymentPayload,
  ZKhaltiPaymentResponse,
  ZKhaltiVerifyPaymentResponse,
  ZKhaltiVerifyPaymentPayload,
  ZStripePaymentPayload,
  ZStripePaymentResponse,
  ZStripeVendorOnboardingPayload,
  ZStripeVendorOnboardingResponse


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
    // -------------------- Initiate Stripe Payment --------------------
    initiateStripePayment: {
      path: "/payments/stripe/initiate",
      method: "POST",
      body: ZStripePaymentPayload,
      responses: {
        201: ZStripePaymentResponse,
      },
      summary: "Initiate stripe payment session",
      description:
        "Creates a new stripe payment session and returns a payment URL for the user to complete payment.",
      metadata,
    },
    // -------------------- Create session Connect vendor onboard  --------------------
    CreateOnboardingStripeSession: {
      path: "/payments/stripe/connect-onboard",
      method: "POST",
      body: ZStripeVendorOnboardingPayload,
      responses: {
        201: ZStripeVendorOnboardingResponse,
      },
      summary: "Create session Connect vendor onboard ",
      description:
        "Create session Connect vendor onboard ",
      metadata,
    },

  },

  
  {
    pathPrefix: "/v1",
  }
);
