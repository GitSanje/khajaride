
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useState } from "react";
interface OnboardingResponse {
  url: string;
}

export default function OnboardingIncomplete() {
   const params = new URLSearchParams(window.location.search);
    const account_id = params.get("account_id");

   const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  const handlestartOnboarding = async () => {
    setLoading(true);
    setError(null);

    try {
     const res = await axios.post<OnboardingResponse>(
        "/api/v1/payments/stripe/create-account-link",{
          accountId:account_id
        }
      );

      if (res.data.url) {
        // Redirect to Stripe-hosted onboarding
        window.location.href = res.data.url;
      } else {
        setError("Failed to get Stripe onboarding URL");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };
  if (loading){
        return <p>Redirecting to Stripe onboarding...</p>
  }

  return (
    <div className="max-w-2xl mx-auto py-10 text-center">
      <h1 className="text-3xl font-bold mb-4">Stripe Onboarding Incomplete</h1>
      <p className="mb-6">You haven’t completed your Stripe onboarding yet. Please continue to provide the required information.</p>
      <Button  onClick= {handlestartOnboarding} className="px-6 py-3 bg-blue-600 text-white rounded-lg">Continue Onboarding</Button>
      {error && (
        <p className="text-red-500">
          Error starting Stripe onboarding: {error}
        </p>
      )}
      
    </div>
  );
}