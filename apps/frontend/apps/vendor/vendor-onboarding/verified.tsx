import { Link } from "react-router-dom";

export default function OnboardingVerified() {
  return (
    <div className="max-w-2xl mx-auto py-10 text-center">
      <h1 className="text-3xl font-bold mb-4">Stripe Account Verified</h1>
      <p className="mb-6">Your Stripe account is fully onboarded. You can now receive payouts!</p>
      <Link to="/dashboard" className="px-6 py-3 bg-green-600 text-white rounded-lg">Go to Dashboard</Link>
    </div>
  );
}