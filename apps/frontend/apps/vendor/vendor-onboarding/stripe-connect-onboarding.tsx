import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom"; 
import { useCreateOnboardingStripeSession } from "@/api/hooks/use-payment-query";
import { useUser } from "@clerk/clerk-react";
import OnboardingIncomplete from "./onboarding-incomplete";
import OnboardingVerified from "./verified";

function VendorOnboardingStripe({ vendorUserId }: { vendorUserId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const stripeConnectOnboarding = useCreateOnboardingStripeSession();

  const startOnboarding = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await stripeConnectOnboarding.mutateAsync({
        body: {
          vendorUserId
        }
      });
      setStatus(res.status);
      if (res.url) {
        // Redirect to Stripe-hosted onboarding
        window.location.href = res.url;
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

  // Status badge component with different colors
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      incomplete: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        text: "Onboarding Incomplete"
      },
      verified: {
        color: "bg-green-100 text-green-800 border-green-300",
        text: "Verified"
      },
      pending: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        text: "Pending Verification"
      },
      default: {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        text: status
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.default;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Stripe Onboarding
          </h2>
          <p className="text-gray-600">
            Set up your payout account to receive payments
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center ">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700 font-medium">Redirecting to Stripe onboarding...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we prepare your session</p>
          </div>
        )}

        {status && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Current Status:</span>
              <StatusBadge status={status} />
             
            </div>
          </div>
        )}
         { status === "verified" && (
            <div className="flex items-center justify-between">
           

                      <Link to="/dashboard" className="px-3 py-3 bg-primary text-white rounded-lg">Go to Dashboard</Link>
                         </div>
              )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error starting Stripe onboarding
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
            
            {error.includes("URL") && (
              <button
                onClick={startOnboarding}
                className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {!loading && !error && !status && (
          <div className="text-center py-4">
            <p className="text-gray-500">Preparing onboarding session...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPayout() {
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('status');

  if (paymentStatus === 'incomplete') {
    return <OnboardingIncomplete />;
  }
  
  if (paymentStatus === 'verified') {
    return <OnboardingVerified />;
  }

  return (
    <VendorOnboardingStripe
      vendorUserId={user?.id as string}
    />
  );
}