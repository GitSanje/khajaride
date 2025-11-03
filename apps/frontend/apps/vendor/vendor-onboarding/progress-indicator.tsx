import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OnboardingStep } from "@/types/vendor-onboarding-types"

interface ProgressIndicatorProps {
  currentStep: OnboardingStep
  steps: { id: OnboardingStep; label: string }[]
  completedSteps: OnboardingStep[]
}

export function ProgressIndicator({ currentStep, steps, completedSteps }: ProgressIndicatorProps) {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = step.id === currentStep
          const isUpcoming = index > currentStepIndex

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent &&
                      "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
                    isUpcoming && "bg-muted text-muted-foreground",
                    !isCompleted && !isCurrent && !isUpcoming && "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <p
                  className={cn(
                    "text-xs md:text-sm font-medium mt-2 text-center",
                    isCurrent && "text-foreground",
                    !isCurrent && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-1 flex-1 mx-2 rounded-full transition-all",
                    index < currentStepIndex ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
