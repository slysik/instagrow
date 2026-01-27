"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Sparkles, Check, Clock, Sun, Moon } from "lucide-react";
import { OnboardingStep } from "@/components/onboarding/OnboardingStep";
import {
	NicheSelector,
	NICHE_OPTIONS,
} from "@/components/onboarding/NicheSelector";
import { GoalsSelector } from "@/components/onboarding/GoalsSelector";
import { PillarSuggestions } from "@/components/onboarding/PillarSuggestions";
import {
	saveOnboardingData,
	completeOnboarding,
	getSuggestedPillars,
	type OnboardingPillar,
} from "@/lib/actions/onboarding";

const TOTAL_STEPS = 6;

const POSTING_TIMES = {
	morning: [
		{ value: "06:00", label: "6:00 AM - Early Bird" },
		{ value: "07:00", label: "7:00 AM - Morning Commute" },
		{ value: "08:00", label: "8:00 AM - Breakfast Time" },
		{ value: "09:00", label: "9:00 AM - Work Start" },
		{ value: "10:00", label: "10:00 AM - Mid-Morning" },
		{ value: "11:00", label: "11:00 AM - Pre-Lunch" },
		{ value: "12:00", label: "12:00 PM - Lunch Break" },
	],
	evening: [
		{ value: "17:00", label: "5:00 PM - After Work" },
		{ value: "18:00", label: "6:00 PM - Dinner Time" },
		{ value: "19:00", label: "7:00 PM - Evening Wind Down" },
		{ value: "20:00", label: "8:00 PM - Prime Time" },
		{ value: "21:00", label: "9:00 PM - Night Owl" },
		{ value: "22:00", label: "10:00 PM - Late Night" },
	],
};

export default function OnboardingPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [currentStep, setCurrentStep] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [isPillarLoading, setIsPillarLoading] = useState(false);

	// Form data
	const [niche, setNiche] = useState("");
	const [customNiche, setCustomNiche] = useState("");
	const [goals, setGoals] = useState<string[]>([]);
	const [pillars, setPillars] = useState<OnboardingPillar[]>([]);
	const [postingTimes, setPostingTimes] = useState({
		morning: "09:00",
		evening: "19:00",
	});

	// Load suggested pillars when niche changes
	const loadSuggestedPillars = useCallback(async (selectedNiche: string) => {
		setIsPillarLoading(true);
		try {
			const suggested = await getSuggestedPillars(selectedNiche);
			setPillars(suggested);
		} catch (error) {
			console.error("Failed to load pillar suggestions:", error);
		} finally {
			setIsPillarLoading(false);
		}
	}, []);

	// When entering step 3 (pillars), load suggestions if we have a niche
	useEffect(() => {
		if (currentStep === 3 && niche && pillars.length === 0) {
			loadSuggestedPillars(niche);
		}
	}, [currentStep, niche, pillars.length, loadSuggestedPillars]);

	const handleGoalToggle = (goalId: string) => {
		setGoals((prev) =>
			prev.includes(goalId)
				? prev.filter((g) => g !== goalId)
				: [...prev, goalId],
		);
	};

	const canProceed = (): boolean => {
		switch (currentStep) {
			case 0: // Welcome
				return true;
			case 1: // Niche
				return niche !== "" && (niche !== "other" || customNiche.trim() !== "");
			case 2: // Goals
				return goals.length > 0;
			case 3: // Pillars
				return pillars.length >= 2;
			case 4: // Posting times
				return Boolean(postingTimes.morning && postingTimes.evening);
			case 5: // Complete
				return true;
			default:
				return false;
		}
	};

	const handleNext = async () => {
		if (currentStep === 4) {
			// Save data before completing
			setIsLoading(true);
			try {
				const result = await saveOnboardingData({
					niche: niche === "other" ? customNiche : niche,
					goals,
					pillars,
					postingTimes,
				});

				if (!result.success) {
					console.error("Failed to save onboarding data:", result.error);
					return;
				}

				setCurrentStep(5);
			} catch (error) {
				console.error("Error saving onboarding data:", error);
			} finally {
				setIsLoading(false);
			}
		} else if (currentStep === 5) {
			// Complete onboarding and redirect
			setIsLoading(true);
			try {
				if (session?.user?.id) {
					await completeOnboarding(session.user.id);
				}
				router.push("/dashboard");
			} catch (error) {
				console.error("Error completing onboarding:", error);
			} finally {
				setIsLoading(false);
			}
		} else {
			setCurrentStep((prev) => prev + 1);
		}
	};

	const handleBack = () => {
		setCurrentStep((prev) => Math.max(0, prev - 1));
	};

	// Redirect if not authenticated
	if (status === "loading") {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
			</div>
		);
	}

	if (status === "unauthenticated") {
		router.push("/login");
		return null;
	}

	// Step 0: Welcome
	if (currentStep === 0) {
		return (
			<OnboardingStep
				title="Welcome to InstaGrow!"
				subtitle="Let's set up your account in just a few steps"
				currentStep={currentStep}
				totalSteps={TOTAL_STEPS}
				onNext={handleNext}
				showBackButton={false}
				nextLabel="Get Started"
			>
				<div className="card bg-gradient-to-br from-white to-pink-50/50 p-8 text-center">
					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.3 }}
						className="w-20 h-20 bg-ig-gradient rounded-2xl flex items-center justify-center mx-auto mb-6"
					>
						<Sparkles className="w-10 h-10 text-white" />
					</motion.div>

					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						Here&apos;s what we&apos;ll cover:
					</h2>

					<div className="space-y-4 text-left max-w-sm mx-auto">
						{[
							"Your content niche",
							"Your Instagram goals",
							"Content pillars for consistency",
							"Best posting times",
						].map((item, index) => (
							<motion.div
								key={item}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
								className="flex items-center gap-3"
							>
								<div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
									<span className="text-xs font-bold text-pink-600">
										{index + 1}
									</span>
								</div>
								<span className="text-gray-700">{item}</span>
							</motion.div>
						))}
					</div>

					<p className="text-sm text-gray-500 mt-6">
						This takes about 2 minutes
					</p>
				</div>
			</OnboardingStep>
		);
	}

	// Step 1: Niche Selection
	if (currentStep === 1) {
		return (
			<OnboardingStep
				title="What's your content niche?"
				subtitle="This helps us personalize your content suggestions"
				currentStep={currentStep}
				totalSteps={TOTAL_STEPS}
				onBack={handleBack}
				onNext={handleNext}
				canProceed={canProceed()}
			>
				<NicheSelector
					selectedNiche={niche}
					customNiche={customNiche}
					onNicheSelect={setNiche}
					onCustomNicheChange={setCustomNiche}
				/>
			</OnboardingStep>
		);
	}

	// Step 2: Goals Selection
	if (currentStep === 2) {
		return (
			<OnboardingStep
				title="What do you want to achieve?"
				subtitle="Select all goals that matter to you"
				currentStep={currentStep}
				totalSteps={TOTAL_STEPS}
				onBack={handleBack}
				onNext={handleNext}
				canProceed={canProceed()}
			>
				<GoalsSelector selectedGoals={goals} onGoalToggle={handleGoalToggle} />
			</OnboardingStep>
		);
	}

	// Step 3: Pillar Suggestions
	if (currentStep === 3) {
		const nicheLabel =
			niche === "other"
				? customNiche
				: NICHE_OPTIONS.find((n) => n.id === niche)?.label || "your niche";

		return (
			<OnboardingStep
				title="Your Content Pillars"
				subtitle={`Based on ${nicheLabel}, here are suggested pillars to get you started`}
				currentStep={currentStep}
				totalSteps={TOTAL_STEPS}
				onBack={handleBack}
				onNext={handleNext}
				canProceed={canProceed()}
			>
				<PillarSuggestions
					pillars={pillars}
					onPillarsChange={setPillars}
					isLoading={isPillarLoading}
				/>
			</OnboardingStep>
		);
	}

	// Step 4: Posting Times
	if (currentStep === 4) {
		return (
			<OnboardingStep
				title="When do you want to post?"
				subtitle="We'll suggest optimal times based on your audience"
				currentStep={currentStep}
				totalSteps={TOTAL_STEPS}
				onBack={handleBack}
				onNext={handleNext}
				canProceed={canProceed()}
				isLoading={isLoading}
				nextLabel="Complete Setup"
			>
				<div className="space-y-6">
					{/* Morning time */}
					<div className="card p-5">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
								<Sun className="w-5 h-5 text-orange-500" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Morning Post</h3>
								<p className="text-sm text-gray-500">Catch early scrollers</p>
							</div>
						</div>
						<select
							value={postingTimes.morning}
							onChange={(e) =>
								setPostingTimes({ ...postingTimes, morning: e.target.value })
							}
							className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white"
						>
							{POSTING_TIMES.morning.map((time) => (
								<option key={time.value} value={time.value}>
									{time.label}
								</option>
							))}
						</select>
					</div>

					{/* Evening time */}
					<div className="card p-5">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
								<Moon className="w-5 h-5 text-purple-500" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Evening Post</h3>
								<p className="text-sm text-gray-500">Prime engagement time</p>
							</div>
						</div>
						<select
							value={postingTimes.evening}
							onChange={(e) =>
								setPostingTimes({ ...postingTimes, evening: e.target.value })
							}
							className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white"
						>
							{POSTING_TIMES.evening.map((time) => (
								<option key={time.value} value={time.value}>
									{time.label}
								</option>
							))}
						</select>
					</div>

					{/* Tip */}
					<div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
						<Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
						<p className="text-sm text-blue-700">
							<strong>Pro tip:</strong> Posting consistently at the same times
							helps train your audience when to expect new content.
						</p>
					</div>
				</div>
			</OnboardingStep>
		);
	}

	// Step 5: Complete
	if (currentStep === 5) {
		return (
			<OnboardingStep
				title="You're all set!"
				subtitle="Your InstaGrow account is ready to go"
				currentStep={currentStep}
				totalSteps={TOTAL_STEPS}
				onNext={handleNext}
				showBackButton={false}
				nextLabel="Go to Dashboard"
				isLoading={isLoading}
			>
				<div className="text-center">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{
							type: "spring",
							stiffness: 260,
							damping: 20,
						}}
						className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
					>
						<Check className="w-12 h-12 text-green-600" />
					</motion.div>

					<div className="space-y-4 mb-8">
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="card p-4"
						>
							<div className="flex items-center justify-between">
								<span className="text-gray-600">Content Pillars</span>
								<span className="font-semibold text-gray-900">
									{pillars.length} created
								</span>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="card p-4"
						>
							<div className="flex items-center justify-between">
								<span className="text-gray-600">Goals Set</span>
								<span className="font-semibold text-gray-900">
									{goals.length} goals
								</span>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
							className="card p-4"
						>
							<div className="flex items-center justify-between">
								<span className="text-gray-600">Posting Schedule</span>
								<span className="font-semibold text-gray-900">2x daily</span>
							</div>
						</motion.div>
					</div>

					<p className="text-gray-600 mb-4">
						Ready to create your first week of content?
					</p>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
						className="flex items-center justify-center gap-2 text-sm text-gray-500"
					>
						<Sparkles className="w-4 h-4" />
						<span>You have 50 AI credits to start</span>
					</motion.div>
				</div>
			</OnboardingStep>
		);
	}

	return null;
}
