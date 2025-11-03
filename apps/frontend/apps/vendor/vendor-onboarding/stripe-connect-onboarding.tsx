import { loadConnectAndInitialize } from "@stripe/connect-js";
import { env } from "@/config/env";
import {
  ConnectPayments,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
import { useCreateOnboardingStripeSession } from "@/api/hooks/use-payment-query";
import { useState } from "react";

export default function VendorOnboardingStripe({ vendorId }: { vendorId: string }) {
  const [errorMessage, setErrorMessage] = useState("");
  const createVendorStripeOnboarding = useCreateOnboardingStripeSession();

  const [stripeConnectInstance] = useState(() => {
    const fetchClientSecret = async () => {
      try {
        const res = await createVendorStripeOnboarding.mutateAsync({
          body: { vendorId },
        });
        return res.client_secret;
      } catch (err: any) {
        console.error("Stripe onboarding error:", err);
        setErrorMessage(err?.message || "Failed to create onboarding session");
        throw err; 
      }
    };

    return loadConnectAndInitialize({
      publishableKey: env.VITE_STRIPE_PUBLISHABLE_KEY!,
      fetchClientSecret,
    });
  });

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-2xl font-semibold mb-4">Vendor Stripe Onboarding</h2>

      {errorMessage && (
        <div className="bg-red-100 text-red-600 p-3 mb-4 rounded-lg">
          {errorMessage}
        </div>
      )}

      <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
        <ConnectPayments />
      </ConnectComponentsProvider>

      <div id="stripe-connect-container" />
    </div>
  );
}
