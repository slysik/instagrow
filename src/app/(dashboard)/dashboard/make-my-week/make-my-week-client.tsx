"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
	Wand2,
	Calendar,
	Sparkles,
	Clock,
	Target,
	ChevronRight,
	ChevronDown,
	ChevronUp,
	Loader2,
	CalendarPlus,
	ArrowLeft,
	RefreshCw,
	Check,
} from "lucide-react";
import type { PillarWithIdeaCount } from "@/lib/actions/pillars";
import type { CalendarEvent } from "@/lib/actions/calendar";
import type { StoredWeeklyPlan } from "@/lib/actions/make-my-week";
import {
	generateWeeklyPlan,
	applyWeeklyPlan,
	regenerateDay,
	type WeeklyPlanPreferences,
} from "@/lib/actions/make-my-week";
import type { WeeklyPlan, DailyContent } from "@/lib/ai/prompts/make-my-week";

interface Props {
	accountId: string;
	accountUsername: string;
	pillars: PillarWithIdeaCount[];
	existingEvents: CalendarEvent[];
	planHistory: StoredWeeklyPlan[];
}

const goalOptions = [
	{ value: "growth" as const, label: "Follower Growth", icon: "📈" },
	{ value: "engagement" as const, label: "Engagement", icon: "💬" },
	{ value: "sales" as const, label: "Sales & Conversions", icon: "💰" },
	{ value: "content-bank" as const, label: "Build Content Bank", icon: "📚" },
	{ value: "balanced" as const, label: "Balanced Approach", icon: "⚖️" },
];

const timeOptions = [
	{ value: "minimal" as const, label: "Minimal (2-3 hrs/week)", icon: "⏱️" },
	{ value: "moderate" as const, label: "Moderate (5-7 hrs/week)", icon: "⏰" },
	{
		value: "dedicated" as const,
		label: "Dedicated (10+ hrs/week)",
		icon: "🔥",
	},
];

export default function MakeMyWeekClient({
	accountId,
	accountUsername,
	pillars,
	planHistory,
}: Props) {
	const [currentStep, setCurrentStep] = useState(1);
	const [preferences, setPreferences] = useState<WeeklyPlanPreferences>({
		primaryGoal: "balanced",
		availableTime: "moderate",
		upcomingEvents: "",
		lastWeekPerformance: "",
	});
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedPlan, setGeneratedPlan] = useState<WeeklyPlan | null>(null);
	const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
	const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
	const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
	const [isApplying, setIsApplying] = useState(false);
	const [regeneratingDay, setRegeneratingDay] = useState<string | null>(null);

	const totalSteps = 3;

	const handleGenerate = async () => {
		setIsGenerating(true);
		try {
			const result = await generateWeeklyPlan(accountId, preferences);

			if (!result.success || !result.plan) {
				toast.error(result.error || "Failed to generate weekly plan");
				return;
			}

			setGeneratedPlan(result.plan);
			setCurrentPlanId(result.planId || null);

			// Select all days by default
			const allDays = new Set(result.plan.dailyContent.map((dc) => dc.day));
			setSelectedDays(allDays);

			toast.success("Your weekly plan is ready!");
		} catch (error) {
			console.error("Error generating plan:", error);
			toast.error("Failed to generate plan. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleApplyPlan = async () => {
		if (!generatedPlan) return;

		setIsApplying(true);
		try {
			const result = await applyWeeklyPlan(accountId, generatedPlan, {
				selectedDays: Array.from(selectedDays),
				generateContent: true,
			});

			if (!result.success) {
				toast.error(result.error || "Failed to apply plan");
				return;
			}

			toast.success(`${result.createdCount} items added to your calendar!`);
		} catch (error) {
			console.error("Error applying plan:", error);
			toast.error("Failed to apply plan. Please try again.");
		} finally {
			setIsApplying(false);
		}
	};

	const handleRegenerateDay = async (dayOfWeek: string) => {
		if (!currentPlanId) {
			toast.error("No active plan to regenerate");
			return;
		}

		setRegeneratingDay(dayOfWeek);
		try {
			const result = await regenerateDay(accountId, currentPlanId, dayOfWeek);

			if (!result.success || !result.updatedDay) {
				toast.error(result.error || "Failed to regenerate day");
				return;
			}

			// Update the plan with the new day
			if (generatedPlan) {
				const updatedPlan = { ...generatedPlan };
				const dayIndex = updatedPlan.dailyContent.findIndex(
					(dc) => dc.day.toLowerCase() === dayOfWeek.toLowerCase(),
				);
				if (dayIndex !== -1) {
					updatedPlan.dailyContent[dayIndex] = result.updatedDay;
					setGeneratedPlan(updatedPlan);
				}
			}

			toast.success(`${dayOfWeek} regenerated!`);
		} catch (error) {
			console.error("Error regenerating day:", error);
			toast.error("Failed to regenerate day. Please try again.");
		} finally {
			setRegeneratingDay(null);
		}
	};

	const toggleDay = (day: string) => {
		setExpandedDays((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(day)) {
				newSet.delete(day);
			} else {
				newSet.add(day);
			}
			return newSet;
		});
	};

	const toggleDaySelection = (day: string) => {
		setSelectedDays((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(day)) {
				newSet.delete(day);
			} else {
				newSet.add(day);
			}
			return newSet;
		});
	};

	const handleReset = () => {
		setCurrentStep(1);
		setGeneratedPlan(null);
		setCurrentPlanId(null);
		setExpandedDays(new Set());
		setSelectedDays(new Set());
	};

	const canProceed = () => {
		switch (currentStep) {
			case 1:
				return preferences.primaryGoal !== undefined;
			case 2:
				return preferences.availableTime !== undefined;
			case 3:
				return true;
			default:
				return false;
		}
	};

	// Render steps
	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<div className="space-y-4">
						<div className="text-center mb-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-2">
								What's your main goal this week?
							</h2>
							<p className="text-gray-600">
								We'll tailor your content strategy to match
							</p>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{goalOptions.map((goal) => (
								<button
									key={goal.value}
									onClick={() =>
										setPreferences({ ...preferences, primaryGoal: goal.value })
									}
									className={`p-4 rounded-xl border-2 text-left transition-all ${
										preferences.primaryGoal === goal.value
											? "border-pink-500 bg-pink-50"
											: "border-gray-200 hover:border-gray-300 bg-white"
									}`}
								>
									<div className="flex items-center gap-3">
										<span className="text-3xl">{goal.icon}</span>
										<span className="font-medium text-gray-900">
											{goal.label}
										</span>
										{preferences.primaryGoal === goal.value && (
											<Check className="w-5 h-5 text-pink-500 ml-auto" />
										)}
									</div>
								</button>
							))}
						</div>
					</div>
				);

			case 2:
				return (
					<div className="space-y-4">
						<div className="text-center mb-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-2">
								How much time can you dedicate?
							</h2>
							<p className="text-gray-600">
								We'll adjust the content volume accordingly
							</p>
						</div>
						<div className="space-y-3">
							{timeOptions.map((option) => (
								<button
									key={option.value}
									onClick={() =>
										setPreferences({
											...preferences,
											availableTime: option.value,
										})
									}
									className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
										preferences.availableTime === option.value
											? "border-pink-500 bg-pink-50"
											: "border-gray-200 hover:border-gray-300 bg-white"
									}`}
								>
									<div className="flex items-center gap-3">
										<span className="text-2xl">{option.icon}</span>
										<span className="font-medium text-gray-900">
											{option.label}
										</span>
										{preferences.availableTime === option.value && (
											<Check className="w-5 h-5 text-pink-500 ml-auto" />
										)}
									</div>
								</button>
							))}
						</div>
					</div>
				);

			case 3:
				return (
					<div className="space-y-4">
						<div className="text-center mb-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-2">
								Additional Context (Optional)
							</h2>
							<p className="text-gray-600">
								Help us create even better content for you
							</p>
						</div>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Upcoming Events or Launches
								</label>
								<input
									type="text"
									value={preferences.upcomingEvents || ""}
									onChange={(e) =>
										setPreferences({
											...preferences,
											upcomingEvents: e.target.value,
										})
									}
									placeholder="e.g., Product launch next Friday, Holiday sale..."
									className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Last Week's Performance Notes
								</label>
								<textarea
									value={preferences.lastWeekPerformance || ""}
									onChange={(e) =>
										setPreferences({
											...preferences,
											lastWeekPerformance: e.target.value,
										})
									}
									placeholder="e.g., Carousel posts got 2x more saves, Reels on Tuesday performed well..."
									rows={3}
									className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
								/>
							</div>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	// Loading state
	if (isGenerating) {
		return (
			<div className="max-w-4xl mx-auto">
				<div className="card text-center py-16">
					<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-6 animate-pulse">
						<Wand2 className="w-10 h-10 text-white" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Creating Your Week...
					</h2>
					<p className="text-gray-600 mb-8">
						Our AI is planning your perfect content week for @{accountUsername}
					</p>
					<div className="max-w-md mx-auto space-y-3">
						{[
							"Analyzing your content pillars...",
							"Planning optimal posting schedule...",
							"Generating content ideas...",
							"Balancing content types...",
							"Finalizing weekly strategy...",
						].map((message, i) => (
							<div
								key={i}
								className="flex items-center gap-3 text-left p-3 bg-gray-50 rounded-lg"
							>
								<Loader2 className="w-5 h-5 text-pink-500 animate-spin flex-shrink-0" />
								<span className="text-gray-700">{message}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	// Results view
	if (generatedPlan) {
		return (
			<div className="max-w-5xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<button
						onClick={handleReset}
						className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Start Over
					</button>

					<div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
						<div className="flex-1">
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								{generatedPlan.weekTheme}
							</h1>
							<div className="flex flex-wrap gap-2 mb-4">
								{generatedPlan.weekGoals.map((goal, i) => (
									<span
										key={i}
										className="inline-flex items-center gap-1 text-sm bg-pink-100 text-pink-700 px-3 py-1 rounded-full"
									>
										<Target className="w-3 h-3" />
										{goal}
									</span>
								))}
							</div>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
								<div className="bg-gray-50 rounded-lg p-3">
									<div className="text-gray-500">Total Posts</div>
									<div className="text-2xl font-bold text-gray-900">
										{generatedPlan.contentSummary.totalPosts}
									</div>
								</div>
								{Object.entries(generatedPlan.contentSummary.contentTypes).map(
									([type, count]) => (
										<div key={type} className="bg-gray-50 rounded-lg p-3">
											<div className="text-gray-500 capitalize">{type}s</div>
											<div className="text-2xl font-bold text-gray-900">
												{count}
											</div>
										</div>
									),
								)}
							</div>
						</div>

						<button
							onClick={handleApplyPlan}
							disabled={isApplying || selectedDays.size === 0}
							className="btn btn-gradient flex items-center gap-2 whitespace-nowrap"
						>
							{isApplying ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin" />
									Applying...
								</>
							) : (
								<>
									<CalendarPlus className="w-5 h-5" />
									Add {selectedDays.size} Days to Calendar
								</>
							)}
						</button>
					</div>
				</div>

				{/* Daily Content */}
				<div className="space-y-4">
					<h2 className="text-xl font-semibold text-gray-900">
						Daily Content Plan
					</h2>

					{generatedPlan.dailyContent.map((day) => (
						<DayCard
							key={day.day}
							day={day}
							isExpanded={expandedDays.has(day.day)}
							isSelected={selectedDays.has(day.day)}
							isRegenerating={regeneratingDay === day.day}
							onToggle={() => toggleDay(day.day)}
							onToggleSelection={() => toggleDaySelection(day.day)}
							onRegenerate={() => handleRegenerateDay(day.day)}
						/>
					))}
				</div>

				{/* Batching Schedule */}
				{generatedPlan.batchingSchedule.length > 0 && (
					<div className="mt-8 card">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Batching Schedule
						</h3>
						<div className="space-y-3">
							{generatedPlan.batchingSchedule.map((batch, i) => (
								<div
									key={i}
									className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
								>
									<div>
										<div className="font-medium text-gray-900">{batch.day}</div>
										<div className="text-sm text-gray-600">{batch.task}</div>
									</div>
									<div className="text-sm font-medium text-pink-600">
										{batch.duration}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		);
	}

	// Setup wizard
	return (
		<div className="max-w-3xl mx-auto">
			{/* Header */}
			<div className="text-center mb-8">
				<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
					<Wand2 className="w-8 h-8 text-white" />
				</div>
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Make My Week</h1>
				<p className="text-gray-600 text-lg">
					Generate a strategic content plan for @{accountUsername}
				</p>
				<div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
					<span className="text-sm text-gray-500">Using pillars:</span>
					{pillars.slice(0, 3).map((p) => (
						<span
							key={p.id}
							className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
						>
							{p.emoji} {p.name}
						</span>
					))}
					{pillars.length > 3 && (
						<span className="text-sm text-gray-500">
							+{pillars.length - 3} more
						</span>
					)}
				</div>
			</div>

			{/* Step indicator */}
			<div className="flex items-center justify-center gap-2 mb-8">
				{[1, 2, 3].map((step) => (
					<div key={step} className="flex items-center">
						<div
							className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
								step < currentStep
									? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
									: step === currentStep
										? "bg-gradient-to-r from-pink-500 to-purple-500 text-white scale-110"
										: "bg-gray-200 text-gray-500"
							}`}
						>
							{step < currentStep ? <Check className="w-5 h-5" /> : step}
						</div>
						{step < totalSteps && (
							<div
								className={`w-12 h-1 mx-1 rounded ${
									step < currentStep
										? "bg-gradient-to-r from-pink-500 to-purple-500"
										: "bg-gray-200"
								}`}
							/>
						)}
					</div>
				))}
			</div>

			{/* Step labels */}
			<div className="flex justify-between mb-8 px-4">
				{[
					{ icon: Target, label: "Goal" },
					{ icon: Clock, label: "Time" },
					{ icon: Sparkles, label: "Context" },
				].map((item, i) => (
					<div
						key={i}
						className={`text-center ${
							currentStep >= i + 1 ? "text-pink-600" : "text-gray-400"
						}`}
					>
						<item.icon className="w-5 h-5 mx-auto mb-1" />
						<span className="text-xs">{item.label}</span>
					</div>
				))}
			</div>

			{/* Card */}
			<div className="card mb-6">{renderStep()}</div>

			{/* Navigation */}
			<div className="flex justify-between">
				{currentStep > 1 ? (
					<button
						onClick={() => setCurrentStep((prev) => prev - 1)}
						className="btn btn-secondary flex items-center gap-2"
					>
						<ArrowLeft className="w-4 h-4" />
						Back
					</button>
				) : (
					<div />
				)}

				{currentStep < totalSteps ? (
					<button
						onClick={() => setCurrentStep((prev) => prev + 1)}
						disabled={!canProceed()}
						className={`btn flex items-center gap-2 ${
							canProceed()
								? "btn-gradient"
								: "bg-gray-200 text-gray-400 cursor-not-allowed"
						}`}
					>
						Continue
						<ChevronRight className="w-4 h-4" />
					</button>
				) : (
					<button
						onClick={handleGenerate}
						disabled={!canProceed()}
						className={`btn flex items-center gap-2 ${
							canProceed()
								? "btn-gradient"
								: "bg-gray-200 text-gray-400 cursor-not-allowed"
						}`}
					>
						<Wand2 className="w-4 h-4" />
						Generate My Week
					</button>
				)}
			</div>

			{/* Recent Plans */}
			{planHistory.length > 0 && (
				<div className="mt-12">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Recent Plans
					</h3>
					<div className="grid gap-3">
						{planHistory.map((plan) => (
							<div
								key={plan.id}
								className="card p-4 hover:shadow-md transition-shadow"
							>
								<div className="flex items-center justify-between">
									<div>
										<div className="font-medium text-gray-900">
											{plan.plan.weekTheme}
										</div>
										<div className="text-sm text-gray-500">
											{new Date(plan.createdAt).toLocaleDateString()} •{" "}
											{plan.plan.contentSummary.totalPosts} posts
										</div>
									</div>
									<span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
										{plan.preferences.primaryGoal}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

// Day Card Component
interface DayCardProps {
	day: DailyContent;
	isExpanded: boolean;
	isSelected: boolean;
	isRegenerating: boolean;
	onToggle: () => void;
	onToggleSelection: () => void;
	onRegenerate: () => void;
}

function DayCard({
	day,
	isExpanded,
	isSelected,
	isRegenerating,
	onToggle,
	onToggleSelection,
	onRegenerate,
}: DayCardProps) {
	return (
		<div className={`card ${isSelected ? "ring-2 ring-pink-500" : ""}`}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4 flex-1">
					<input
						type="checkbox"
						checked={isSelected}
						onChange={onToggleSelection}
						className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
					/>
					<button onClick={onToggle} className="flex-1 text-left">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									{day.day}
								</h3>
								{day.feedPost && (
									<p className="text-sm text-gray-600">
										{day.feedPost.type} • {day.feedPost.pillar} •{" "}
										{day.feedPost.bestTime}
									</p>
								)}
							</div>
							<div className="flex items-center gap-2">
								<button
									onClick={(e) => {
										e.stopPropagation();
										onRegenerate();
									}}
									disabled={isRegenerating}
									className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
									title="Regenerate this day"
								>
									{isRegenerating ? (
										<Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
									) : (
										<RefreshCw className="w-4 h-4 text-gray-400" />
									)}
								</button>
								{isExpanded ? (
									<ChevronUp className="w-5 h-5 text-gray-400" />
								) : (
									<ChevronDown className="w-5 h-5 text-gray-400" />
								)}
							</div>
						</div>
					</button>
				</div>
			</div>

			{isExpanded && day.feedPost && (
				<div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
					<div>
						<h4 className="text-sm font-medium text-gray-700 mb-2">Topic</h4>
						<p className="text-gray-900">{day.feedPost.topic}</p>
					</div>

					<div>
						<h4 className="text-sm font-medium text-gray-700 mb-2">Caption</h4>
						<p className="text-gray-800 text-sm whitespace-pre-wrap">
							{day.feedPost.caption}
						</p>
					</div>

					{day.feedPost.hashtags.length > 0 && (
						<div>
							<h4 className="text-sm font-medium text-gray-700 mb-2">
								Hashtags
							</h4>
							<div className="flex flex-wrap gap-2">
								{day.feedPost.hashtags.map((tag, i) => (
									<span
										key={i}
										className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
									>
										{tag}
									</span>
								))}
							</div>
						</div>
					)}

					{day.stories && (
						<div>
							<h4 className="text-sm font-medium text-gray-700 mb-2">
								Stories ({day.stories.count})
							</h4>
							<div className="flex flex-wrap gap-2">
								{day.stories.themes.map((theme, i) => (
									<span
										key={i}
										className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full"
									>
										{theme}
									</span>
								))}
							</div>
						</div>
					)}

					{day.engagement && (
						<div className="bg-gray-50 rounded-lg p-3">
							<h4 className="text-sm font-medium text-gray-700 mb-2">
								Engagement Plan
							</h4>
							<ul className="text-sm text-gray-600 space-y-1">
								<li>• Best time: {day.engagement.commentTime}</li>
								{day.engagement.engagementTasks.map((task, i) => (
									<li key={i}>• {task}</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
