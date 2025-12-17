import React, {
  useState,
  Children,
  useRef,
  useLayoutEffect,
  HTMLAttributes,
  ReactNode,
} from "react";
import { motion, AnimatePresence, Variants } from "motion/react";

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => boolean | void;
  onValidate?: (step: number) => boolean;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (clicked: number) => void;
  }) => ReactNode;
}

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onValidate = () => true,
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = "",
  stepContainerClassName = "",
  contentClassName = "",
  footerClassName = "",
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = "Back",
  nextButtonText = "Next",
  disableStepIndicators = false,
  renderStepIndicator,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [direction, setDirection] = useState<number>(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      // Validate current step before proceeding
      if (!onValidate(currentStep)) {
        return; // Prevent navigation if validation fails
      }
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    // Validate current step before completing
    if (!onValidate(currentStep)) {
      return; // Prevent completion if validation fails
    }
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  const handleStepClick = (clicked: number) => {
    // Don't allow clicking on current step
    if (clicked === currentStep) return;

    // If moving forward, validate ALL intermediate steps
    if (clicked > currentStep) {
      // Validate each step from current to target (exclusive)
      for (let step = currentStep; step < clicked; step++) {
        if (!onValidate(step)) {
          return; // Prevent navigation if any intermediate step validation fails
        }
      }
    }

    // Allow navigation
    setDirection(clicked > currentStep ? 1 : -1);
    updateStep(clicked);
  };

  return (
    <div className="flex flex-col w-full h-full max-w-3xl mx-auto" {...rest}>
      <div
        className={`${stepCircleContainerClassName} flex-shrink-0 flex w-full items-center justify-center gap-0.5 px-2 pt-10 md:px-4 md:py-1`}
      >
        {stepsArray.map((_, index) => {
          const stepNumber = index + 1;
          const isNotLastStep = index < totalSteps - 1;
          return (
            <React.Fragment key={stepNumber}>
              {renderStepIndicator ? (
                renderStepIndicator({
                  step: stepNumber,
                  currentStep,
                  onStepClick: handleStepClick,
                })
              ) : (
                <StepIndicator
                  step={stepNumber}
                  disableStepIndicators={disableStepIndicators}
                  currentStep={currentStep}
                  onClickStep={handleStepClick}
                />
              )}
              {isNotLastStep && (
                <StepConnector isComplete={currentStep > stepNumber} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <StepContentWrapper
        isCompleted={isCompleted}
        currentStep={currentStep}
        direction={direction}
        className={`flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-3 ${contentClassName}`}
      >
        {stepsArray[currentStep - 1]}
      </StepContentWrapper>

      {!isCompleted && (
        <div
          className={`flex-shrink-0 px-4 md:px-8 py-4 border-t border-gray-200 dark:border-gray-700 ${footerClassName}`}
        >
          <div
            className={`flex gap-3 ${
              currentStep !== 1 ? "justify-between" : "justify-end"
            }`}
          >
            {currentStep !== 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md active:scale-95"
                {...backButtonProps}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                {backButtonText}
              </button>
            )}
            <button
              onClick={isLastStep ? handleComplete : handleNext}
              className="relative flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-slate-600 text-white font-bold shadow-lg shadow-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/60 hover:scale-105 active:scale-95 overflow-hidden group"
              {...nextButtonProps}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-slate-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative">
                {isLastStep ? "Complete" : nextButtonText}
              </span>
              <svg
                className="relative w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isLastStep ? "M5 13l4 4L19 7" : "M9 5l7 7-7 7"}
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface StepContentWrapperProps {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: ReactNode;
  className?: string;
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className = "",
}: StepContentWrapperProps) {
  const [parentHeight, setParentHeight] = useState<number>(0);

  return (
    <motion.div
      style={{ position: "relative", overflow: "hidden" }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: "spring", duration: 0.4 }}
      className={className}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition
            key={currentStep}
            direction={direction}
            onHeightReady={(h) => setParentHeight(h)}
          >
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface SlideTransitionProps {
  children: ReactNode;
  direction: number;
  onHeightReady: (height: number) => void;
}

function SlideTransition({
  children,
  direction,
  onHeightReady,
}: SlideTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      onHeightReady(containerRef.current.offsetHeight);
    }
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      style={{ position: "absolute", left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? "-100%" : "100%",
    opacity: 0,
  }),
  center: {
    x: "0%",
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? "50%" : "-50%",
    opacity: 0,
  }),
};

interface StepProps {
  children: ReactNode;
}

export function Step({ children }: StepProps) {
  return <div className="px-2 h-full flex flex-col">{children}</div>;
}

interface StepIndicatorProps {
  step: number;
  currentStep: number;
  onClickStep: (clicked: number) => void;
  disableStepIndicators?: boolean;
}

function StepIndicator({
  step,
  currentStep,
  onClickStep,
  disableStepIndicators = false,
}: StepIndicatorProps) {
  const status =
    currentStep === step
      ? "active"
      : currentStep < step
      ? "inactive"
      : "complete";

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) {
      onClickStep(step);
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className="relative cursor-pointer outline-none focus:outline-none group"
      animate={status}
      initial={false}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow effect for active step */}
      {status === "active" && (
        <motion.div
          className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-slate-500 rounded-full blur-lg opacity-50"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <motion.div
        variants={{
          inactive: {
            scale: 0.8,
            backgroundColor: "#e5e7eb",
            color: "#9ca3af",
            boxShadow: "0 0 0 0 rgba(99, 102, 241, 0)",
          },
          active: {
            scale: 1,
            backgroundColor: "#6366f1",
            color: "#ffffff",
            boxShadow: "0 0 0 4px rgba(99, 102, 241, 0.2)",
          },
          complete: {
            scale: 0.9,
            backgroundColor: "#10b981",
            color: "#ffffff",
            boxShadow: "0 0 0 0 rgba(16, 185, 129, 0)",
          },
        }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        className="relative flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs shadow-lg ring-2 ring-white dark:ring-gray-800"
      >
        {status === "complete" ? (
          <CheckIcon className="h-5 w-5 text-white" />
        ) : status === "active" ? (
          <motion.div className="text-base font-bold">{step}</motion.div>
        ) : (
          <span className="text-sm font-semibold">{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

interface StepConnectorProps {
  isComplete: boolean;
}

function StepConnector({ isComplete }: StepConnectorProps) {
  const lineVariants: Variants = {
    incomplete: { width: 0 },
    complete: { width: "100%" },
  };

  return (
    <div className="relative mx-1.5 h-1 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
      <motion.div
        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-slate-500 rounded-full"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? "complete" : "incomplete"}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      {isComplete && (
        <motion.div
          className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
}

interface CheckIconProps extends React.SVGProps<SVGSVGElement> {}

function CheckIcon(props: CheckIconProps) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.1,
          type: "tween",
          ease: "easeOut",
          duration: 0.3,
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
