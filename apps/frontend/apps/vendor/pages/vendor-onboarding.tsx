import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"
import type { OnboardingStep, VendorOnboardingFormData } from "@/types/vendor-onboarding-types"
import { StepAddress } from "../vendor-onboarding/step-address"
import { StepProfile } from "../vendor-onboarding/step-profile"
import { StepReview } from "../vendor-onboarding/step-review"
import { ProgressIndicator } from "../vendor-onboarding/progress-indicator"
import { useGetVendorOnboardingTrack, useUpdateVendorOnboardingTrack, type TCreateAddressPayload } from "@/api/hooks/use-user-query"
import { useUser } from "@clerk/clerk-react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import VendorOnboardingStripe from "../vendor-onboarding/stripe-connect-onboarding"
import type { VendorProfileFormData } from "@/schemas"

const STEPS: { id: OnboardingStep; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "address", label: "Address" },
  { id: "payout", label: "Payout" },
  { id: "review", label: "Review" },
]

// Loading Skeleton Component
function VendorOnboardingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-muted rounded-md animate-pulse" />
            <div>
              <div className="w-48 h-6 bg-muted rounded animate-pulse mb-2" />
              <div className="w-32 h-4 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator Skeleton */}
          <div className="flex justify-between mb-8">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse mb-2" />
                <div className="w-16 h-4 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Step Content Skeleton */}
          <div className="mt-12">
            <Card className="p-6">
              <div className="space-y-4">
                {/* Form fields skeleton */}
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                    <div className="w-full h-10 bg-muted rounded animate-pulse" />
                  </div>
                ))}
                
                {/* Button skeleton */}
                <div className="flex gap-3 mt-6">
                  <div className="flex-1 h-10 bg-muted rounded animate-pulse" />
                  <div className="flex-1 h-10 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VendorOnboardingPage() {
  const { user } = useUser();

 const navigate = useNavigate();
  const { "*": currentStep } = useParams();
  const { data, isLoading } = useGetVendorOnboardingTrack({ enabled: true })
  //  const [currentStep, setCurrentStep] = useState<OnboardingStep>("profile" )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [formData, setFormData] = useState<VendorOnboardingFormData>({
    profile: {},
    address: {},
    payoutAccount: {},
  })
   const [error, setError] = useState<string | null>(null);
  // useEffect(() => {
  //   if (data?.currentStep) {
  //     setCurrentStep(data?.currentStep as OnboardingStep)
  //   }
  // }, [data?.currentStep])
console.log(currentStep,'currentStep',data,);

  useEffect(() => {
   if (data?.currentStep) {
      // No valid step in URL, but we have data, navigate to the correct step
      navigate(`/vendor-onboarding/${data.currentStep}`, { replace: true });
    } else {
      // Default to first step
      navigate('/vendor-onboarding/profile', { replace: true });
    }
  }, [currentStep, data?.currentStep, navigate]);

  if (isLoading || !data || !currentStep) {
    return <VendorOnboardingSkeleton />
  }
  
  if (data?.completed) {
    return <Navigate to="/dashboard" replace />;
  }

 


 
 
  const handleUpdateFormData = (data: Partial<VendorOnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNextStep = async () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    console.log(currentIndex, currentStep);
    if (currentIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentIndex + 1].id;
      //setCurrentStep(nextStep);
      navigate(`/vendor-onboarding/${nextStep}`);
    }
  };

  const handlePreviousStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep)
    if (currentIndex > 0) {
      const previousStep = STEPS[currentIndex - 1].id;
      //setCurrentStep(previousStep);
      navigate(`/vendor-onboarding/${previousStep}`);
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsComplete(true)
    } catch (error) {
      console.error("Submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for submitting your restaurant information. Our team will review your documents and verify your
            information within 24-48 hours. You'll receive an email notification once your account is verified.
          </p>
          <Button asChild className="w-full">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Restaurant Onboarding</h1>
              <p className="text-sm text-muted-foreground">
                Step {STEPS.findIndex((s) => s.id === currentStep) + 1} of {STEPS.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700"> {error}</p>
          </div>
        )}
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <ProgressIndicator
            currentStep={currentStep as OnboardingStep}
            steps={STEPS}
            completedSteps={STEPS.slice(
              0,
              STEPS.findIndex((s) => s.id === currentStep),
            ).map((s) => s.id)}
          />

          {/* Step Content */}
          <div className="mt-12">
            {currentStep === "profile" && (
              <StepProfile
                data={formData.profile}
                onUpdate={(data: Partial<VendorProfileFormData>) => handleUpdateFormData({ profile: data })}
                onNext={handleNextStep}
                setError={setError}
              />
            )}

            {currentStep === "address" && (
              <StepAddress
                data={formData.address}
                onUpdate={(data: Partial<TCreateAddressPayload>) => handleUpdateFormData({ address: data })}
                onNext={handleNextStep}
                setError={setError}
              />
            )}

            {currentStep === "payout" && (
              <VendorOnboardingStripe vendorUserId={user?.id!} /> 

            )}
            

            {currentStep === "review" && (
              <StepReview data={formData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            )}
          </div>

          {/* Navigation Buttons */}
          {currentStep !== "review" && (
            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={currentStep === "profile"}
                className="flex-1 bg-transparent"
              >
                Previous
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}