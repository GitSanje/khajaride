import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Check, CheckCircle2 } from "lucide-react"
import type { OnboardingStep } from "@/types/vendor-onboarding-types"
import { ProgressIndicator } from "../vendor-onboarding/progress-indicator"
import { useGetVendorOnboardingTrack } from "@/api/hooks/use-user-query"
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useVendorOnboarding } from "../hooks/useVendorOnboarding"
import { cn } from "@/lib/utils"

const STEPS: { id: OnboardingStep; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "address", label: "Address" },
  { id: "payout", label: "Payout" },
]

export interface OutletContext {
  handleNextStep: () => void
  handlePreviousStep: () => void
  canProceed: boolean
}

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

// Vertical Progress Indicator Component
function VerticalProgressIndicator({ 
  currentStep, 
  steps, 
  completedSteps,
  onStepClick 
}: { 
  currentStep: OnboardingStep
  steps: typeof STEPS
  completedSteps: OnboardingStep[]
  onStepClick: (step: OnboardingStep) => void
}) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <div className="w-64 p-6 h-fit sticky top-24">
      <h3 className="font-semibold mb-6 text-lg">Onboarding Progress</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-muted">
          {/* Progress fill */}
          <div 
            className="bg-primary transition-all duration-300"
            style={{ 
              height: `${(completedSteps.length / (steps.length - 1)) * 100}%` 
            }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = step.id === currentStep
            const canNavigate = isCompleted || index < currentStepIndex

            return (
              <div key={step.id} className="flex items-start gap-4 relative">
                {/* Step circle */}
                <button
                  onClick={() => canNavigate && onStepClick(step.id)}
                  disabled={!canNavigate}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm relative z-10 transition-all flex-shrink-0",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                    canNavigate && "cursor-pointer hover:scale-105",
                    !canNavigate && "cursor-not-allowed "
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                </button>

                {/* Step label */}
                <div className="flex-1 pt-2">
                  <button
                    onClick={() => canNavigate && onStepClick(step.id)}
                    disabled={!canNavigate}
                    className={cn(
                      "text-left transition-all",
                      canNavigate && "cursor-pointer hover:text-primary",
                      !canNavigate && "cursor-not-allowed "
                    )}
                  >
                    <p className={cn(
                      "text-sm font-medium mb-1",
                      isCurrent && "text-primary",
                      isCompleted && "text-foreground",
                      !isCurrent && !isCompleted && "text-muted-foreground"
                    )}>
                      {step.label}
                    </p>
                    <p className={cn(
                      "text-xs",
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    )}>
                      {isCompleted ? "Completed" : isCurrent ? "In Progress" : "Pending"}
                    </p>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function VendorOnboardingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentStep = location.pathname.split('/').pop() as OnboardingStep
  const isValidStep = STEPS.some(step => step.id === currentStep)

  const { data, isLoading } = useGetVendorOnboardingTrack({ enabled: true })
  const { error } = useVendorOnboarding()

  const [isInitialized, setIsInitialized] = useState(false)
  const [canProceedToNext, setCanProceedToNext] = useState(false)

  // Redirect if onboarding is already completed



  // Initialize navigation only once when data is loaded
  useEffect(() => {
    if (isLoading || isInitialized) return
     if (data?.completed) {
      navigate(`/dashboard`, { replace: true })
    } 
    else{
      if (data?.currentStep && !currentStep) {
      // Initial load - navigate to saved step
      navigate(`/vendor-onboarding/${data.currentStep}`, { replace: true })
    } else if (!isValidStep && data?.currentStep) {
      // Invalid step - redirect to saved step
      navigate(`/vendor-onboarding/${data.currentStep}`, { replace: true })
    } else if (!isValidStep) {
      // Fallback to first step
      navigate('/vendor-onboarding/profile', { replace: true })
    }

    }
    

    setIsInitialized(true)
  }, [data, isLoading, currentStep, isValidStep, navigate, isInitialized])

  // Update canProceedToNext based on current step data
  useEffect(() => {
    // This should be implemented based on your form validation logic
    // For now, we'll assume user can proceed if they're on a valid step
    setCanProceedToNext(isValidStep)
  }, [currentStep, isValidStep])

  if (isLoading || !isInitialized || !currentStep || !isValidStep) {
    return <VendorOnboardingSkeleton />
  }
   

  const handleNextStep = () => {
    if (!canProceedToNext) return
    
    const currentIndex = STEPS.findIndex(step => step.id === currentStep)
    if (currentIndex < STEPS.length - 1) {
      navigate(`/vendor-onboarding/${STEPS[currentIndex + 1].id}`)
    }
  }

  const handlePreviousStep = () => {
    const currentIndex = STEPS.findIndex(step => step.id === currentStep)
    if (currentIndex > 0) {
      navigate(`/vendor-onboarding/${STEPS[currentIndex - 1].id}`)
    }
  }

  const handleStepClick = (step: OnboardingStep) => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep)
    const targetIndex = STEPS.findIndex(s => s.id === step)
    
    // Allow navigation to completed steps or previous steps
    if (targetIndex <= currentIndex) {
      navigate(`/vendor-onboarding/${step}`)
    }
  }

  // Calculate completed steps (all steps before current step)
  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep)
  const completedSteps = STEPS.slice(0, currentStepIndex).map(step => step.id)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Restaurant Onboarding</h1>
              <p className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {STEPS.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Vertical Progress Indicator - Hidden on mobile, shown on desktop */}
          <div className="lg:block hidden">
            <VerticalProgressIndicator
              currentStep={currentStep}
              steps={STEPS}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 max-w-4xl">
            {/* Horizontal Progress Indicator - Shown on mobile, hidden on desktop */}
            <div className="lg:hidden mb-8">
              <ProgressIndicator
                currentStep={currentStep}
                steps={STEPS}
                completedSteps={completedSteps}
              />
            </div>

            {/* Step Content */}
            <div className="mt-4 lg:mt-8 p-4">
              <Outlet context={{ 
                handleNextStep, 
                handlePreviousStep, 
                canProceed: canProceedToNext 
              }} />
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
             
              
              {currentStep === STEPS[STEPS.length - 1].id && (
                <Button
                  onClick={handleNextStep}
                  disabled={!canProceedToNext}
                  className="flex-1 lg:flex-none lg:w-32"
                >
                  Complete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}