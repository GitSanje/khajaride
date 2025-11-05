

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"

import type { OnboardingStep, VendorOnboardingFormData } from "@/types/vendor-onboarding-types"
import { StepAddress } from "../vendor-onboarding/step-address"
import { StepProfile } from "../vendor-onboarding/step-profile"
import { StepReview } from "../vendor-onboarding/step-review"
import { ProgressIndicator } from "../vendor-onboarding/progress-indicator"


import {  useGetVendorOnboardingTrack, useUpdateVendorOnboardingTrack, type TCreateAddressPayload } from "@/api/hooks/use-user-query"
import { useCreateOnboardingStripeSession } from "@/api/hooks/use-payment-query"
import { useUser } from "@clerk/clerk-react"
import { Link, Navigate } from "react-router-dom"
import VendorOnboardingStripe from "../vendor-onboarding/stripe-connect-onboarding"
import type { VendorProfileFormData } from "@/schemas"

const STEPS: { id: OnboardingStep; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "address", label: "Address" },
  { id: "payout", label: "Payout" },
  { id: "review", label: "Review" },
]

export default function VendorOnboardingPage() {

  const { user } = useUser();

  const { data } = useGetVendorOnboardingTrack({ enabled: true })
  if (data?.completed) {
    return <Navigate to="/dashboard" replace />;
  }
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("profile")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [formData, setFormData] = useState<VendorOnboardingFormData>({
    profile: {},
    address: {},
    payoutAccount: {},
  })

  useEffect(() => {
    if (data?.currentProgress) {
      setCurrentStep(data?.currentProgress as OnboardingStep)
    }
  }, [data?.currentProgress])

  const [error, setError] = useState<string | null>(null);


  const stripeConnectOnboarding = useCreateOnboardingStripeSession()
  const updateVendorOnboardingTrack = useUpdateVendorOnboardingTrack()

  const handleUpdateFormData = (data: Partial<VendorOnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNextStep = async () => {

    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    console.log(currentIndex, currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }

  };


  const handlePreviousStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id)
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
            <Link to="/">Return to Home</Link>
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
            currentStep={currentStep}
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
              // <StepPayout
              //   data={formData.payoutAccount}
              //   onUpdate={(data) => handleUpdateFormData({ payoutAccount: data })}
              //   onNext={handleNextStep}
              // />
              <VendorOnboardingStripe vendorId={user?.id!} />
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
