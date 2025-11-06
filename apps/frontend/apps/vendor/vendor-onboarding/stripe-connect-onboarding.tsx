import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import { useCreateOnboardingStripeSession } from "@/api/hooks/use-payment-query";



export default function ConnectWithStripe({vendorUserId}:{ vendorUserId:string}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
const   stripeConnectOnboarding = useCreateOnboardingStripeSession()
  const startOnboarding = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await stripeConnectOnboarding.mutateAsync({body:{
        vendorUserId
      }})

      if (res.url) {
        // Redirect to Stripe-hosted onboarding
        window.location.href = res.url;
      } else {
        setError("Failed to get Stripe onboarding URL");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startOnboarding();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {loading && <p>Redirecting to Stripe onboarding...</p>}
      {error && (
        <p className="text-red-500">
          Error starting Stripe onboarding: {error}
        </p>
      )}
    </div>
  );
}
