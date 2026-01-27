"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface OnboardingStepProps {
	children: React.ReactNode;
	title: string;
	subtitle?: string;
	currentStep: number;
	totalSteps: number;
	onBack?: () => void;
	onNext?: () => void;
	nextLabel?: string;
	backLabel?: string;
	canProceed?: boolean;
	showBackButton?: boolean;
	showNextButton?: boolean;
	isLoading?: boolean;
}

export function OnboardingStep({
	children,
	title,
	subtitle,
	currentStep,
	totalSteps,
	onBack,
	onNext,
	nextLabel = "Continue",
	backLabel = "Back",
	canProceed = true,
	showBackButton = true,
	showNextButton = true,
	isLoading = false,
}: OnboardingStepProps) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30">
			<div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
				{/* Step indicator */}
				<div className="flex items-center justify-center gap-2 mb-8">
					{Array.from({ length: totalSteps }).map((_, index) => (
						<div
							key={index}
							className={`h-2 rounded-full transition-all duration-300 ${
								index === currentStep
									? "w-8 bg-ig-gradient"
									: index < currentStep
										? "w-2 bg-pink-400"
										: "w-2 bg-gray-200"
							}`}
						/>
					))}
				</div>

				{/* Header */}
				<div className="text-center mb-8">
					<motion.h1
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
					>
						{title}
					</motion.h1>
					{subtitle && (
						<motion.p
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.1 }}
							className="text-gray-600"
						>
							{subtitle}
						</motion.p>
					)}
				</div>

				{/* Content */}
				<AnimatePresence mode="wait">
					<motion.div
						key={currentStep}
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.3 }}
						className="mb-8"
					>
						{children}
					</motion.div>
				</AnimatePresence>

				{/* Navigation */}
				<div className="flex items-center justify-between pt-4">
					{showBackButton && currentStep > 0 ? (
						<button
							onClick={onBack}
							className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
							disabled={isLoading}
						>
							<ChevronLeft className="w-4 h-4" />
							{backLabel}
						</button>
					) : (
						<div />
					)}

					{showNextButton && (
						<button
							onClick={onNext}
							disabled={!canProceed || isLoading}
							className={`flex items-center gap-2 btn ${
								canProceed
									? "btn-gradient"
									: "bg-gray-200 text-gray-400 cursor-not-allowed"
							}`}
						>
							{isLoading ? (
								<>
									<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									Processing...
								</>
							) : (
								<>
									{nextLabel}
									<ChevronRight className="w-4 h-4" />
								</>
							)}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
