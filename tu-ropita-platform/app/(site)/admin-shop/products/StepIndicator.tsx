"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-center">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex items-center">
              {/* Step Circle */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                  isCompleted && "bg-green-500 text-white",
                  isCurrent && "bg-blue-600 text-white",
                  isPending && "border-2 border-gray-300 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>

              {/* Connector Line */}
              {stepNumber < totalSteps && (
                <div
                  className={cn(
                    "w-20 h-0.5 mx-2 transition-all",
                    stepNumber < currentStep ? "bg-green-500" : "bg-gray-300"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
