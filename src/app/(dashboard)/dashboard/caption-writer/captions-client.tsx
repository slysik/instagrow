"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
	Sparkles,
	Copy,
	Check,
	Loader2,
	AlertCircle,
	RotateCcw,
	BookMarkedIcon,
} from "lucide-react";
import {
	generateCaption,
	saveCaptionToLibrary,
	getCaptionHistory,
} from "@/lib/actions/captions";
import type {
	CaptionWriterInput,
	GeneratedCaption,
} from "@/lib/ai/prompts/caption-writer";

interface Pillar {
	id: string;
	name: string;
	emoji: string | null;
	color: string | null;
}

interface CaptionWriterClientProps {
	pillars: Pillar[];
	selectedPillarId?: string;
	accountId: string;
}

type Goal = "comments" | "dms" | "clicks" | "sales";
type Audience = "cold" | "warm";
type Tone = "fun" | "luxury" | "expert";

const goalOptions: { value: Goal; label: string }[] = [
	{ value: "comments", label: "Get Comments" },
	{ value: "dms", label: "Get DMs" },
	{ value: "clicks", label: "Get Clicks" },
	{ value: "sales", label: "Get Sales" },
];

const audienceOptions: {
	value: Audience;
	label: string;
	description: string;
}[] = [
	{
		value: "cold",
		label: "Cold Audience",
		description: "New followers who don't know you yet",
	},
	{
		value: "warm",
		label: "Warm Audience",
		description: "Engaged followers who trust you",
	},
];

const toneOptions: { value: Tone; label: string }[] = [
	{ value: "fun", label: "Fun & Playful" },
	{ value: "luxury", label: "Luxury & Premium" },
	{ value: "expert", label: "Expert & Authority" },
];

export default function CaptionWriterClient({
	pillars,
	selectedPillarId,
	accountId,
}: CaptionWriterClientProps) {
	// Form state
	const [selectedPillar, setSelectedPillar] = useState(
		selectedPillarId || (pillars.length > 0 ? pillars[0].id : ""),
	);
	const [topic, setTopic] = useState("");
	const [goal, setGoal] = useState<Goal>("comments");
	const [audience, setAudience] = useState<Audience>("cold");
	const [tone, setTone] = useState<Tone>("fun");
	const [niche, setNiche] = useState("");

	// UI state
	const [isGenerating, setIsGenerating] = useState(false);
	const [validationError, setValidationError] = useState<string | null>(null);
	const [generationError, setGenerationError] = useState<string | null>(null);
	const [generatedCaptions, setGeneratedCaptions] = useState<
		GeneratedCaption[]
	>([]);
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [savingId, setSavingId] = useState<string | null>(null);
	const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
	const [recentHistory, setRecentHistory] = useState<GeneratedCaption[]>([]);
	const [showHistory, setShowHistory] = useState(false);

	// Validation
	const validateForm = (): boolean => {
		if (!selectedPillar) {
			setValidationError("Please select a pillar");
			return false;
		}
		if (!topic.trim()) {
			setValidationError("Topic is required");
			return false;
		}
		if (topic.trim().length < 10) {
			setValidationError("Topic must be at least 10 characters");
			return false;
		}
		return true;
	};

	const isFormValid = (): boolean => {
		return selectedPillar !== "" && topic.trim().length >= 10 && !isGenerating;
	};

	// Generate captions
	const handleGenerate = async () => {
		setValidationError(null);
		setGenerationError(null);

		if (!validateForm()) {
			return;
		}

		setIsGenerating(true);
		setGeneratedCaptions([]);

		try {
			const input: CaptionWriterInput = {
				topic,
				goal,
				audience,
				tone,
				niche: niche || undefined,
				count: 3,
			};

			const result = await generateCaption(input);

			if (!result.success || !result.captions) {
				setGenerationError(result.error || "Failed to generate captions");
				return;
			}

			setGeneratedCaptions(result.captions);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to generate captions";
			setGenerationError(errorMessage);
		} finally {
			setIsGenerating(false);
		}
	};

	// Copy caption to clipboard
	const copyToClipboard = async (caption: GeneratedCaption) => {
		const fullCaption = `${caption.hook}\n\n${caption.body}\n\n${caption.cta}`;
		await navigator.clipboard.writeText(fullCaption);
		setCopiedId(caption.id);
		toast.success("Caption copied!", {
			description: "Your caption is ready to paste on Instagram",
		});
		setTimeout(() => setCopiedId(null), 2000);
	};

	// Save caption to library
	const handleSaveCaption = async (caption: GeneratedCaption) => {
		setSavingId(caption.id);

		try {
			const result = await saveCaptionToLibrary(selectedPillar, caption, topic);

			if (!result.success) {
				toast.error("Failed to save caption", {
					description: result.error || "Please try again",
				});
				return;
			}

			setSavedIds((prev) => new Set(prev).add(caption.id));
			toast.success("Caption saved!", {
				description: "Added to your content library",
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to save caption";
			toast.error("Error", {
				description: errorMessage,
			});
		} finally {
			setSavingId(null);
		}
	};

	// Load caption history
	const loadHistory = async () => {
		if (showHistory) {
			setShowHistory(false);
			return;
		}

		try {
			const result = await getCaptionHistory(5);
			if (result.success && result.ideas) {
				// Convert ideas to captions for display
				const captions: GeneratedCaption[] = result.ideas
					.filter((idea) => idea.caption)
					.map((idea, index) => ({
						id: idea.id,
						hook: idea.hooks?.[0] || "Untitled",
						body: idea.caption || "",
						cta: "",
					}));
				setRecentHistory(captions);
			}
			setShowHistory(true);
		} catch (error) {
			toast.error("Failed to load history");
		}
	};

	const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setTopic(value);
		if (validationError && value.trim().length >= 10) {
			setValidationError(null);
		}
	};

	return (
		<div className="max-w-4xl mx-auto">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
						<Sparkles className="w-6 h-6 text-white" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Caption Writer</h1>
						<p className="text-gray-600">
							Generate scroll-stopping captions with AI-powered hooks
						</p>
					</div>
				</div>
			</div>

			{/* Configuration Card */}
			<div className="card mb-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">
					Generate Your Caption
				</h2>

				{/* Pillar Selection */}
				{pillars.length > 0 && (
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-3">
							Select a Pillar
						</label>
						<select
							value={selectedPillar}
							onChange={(e) => setSelectedPillar(e.target.value)}
							className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
						>
							{pillars.map((pillar) => (
								<option key={pillar.id} value={pillar.id}>
									{pillar.emoji} {pillar.name}
								</option>
							))}
						</select>
						<p className="mt-2 text-xs text-gray-500">
							Captions will be saved to the selected pillar
						</p>
					</div>
				)}

				{/* Goal Selection */}
				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-3">
						What's your goal?
					</label>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
						{goalOptions.map((option) => (
							<button
								key={option.value}
								onClick={() => setGoal(option.value)}
								className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all min-h-[80px] touch-manipulation ${
									goal === option.value
										? "border-pink-500 bg-pink-50"
										: "border-gray-200 hover:border-gray-300 bg-white active:bg-gray-50"
								}`}
							>
								<span
									className={`text-xs sm:text-sm font-medium text-center leading-tight ${
										goal === option.value ? "text-pink-600" : "text-gray-700"
									}`}
								>
									{option.label}
								</span>
							</button>
						))}
					</div>
				</div>

				{/* Audience Selection */}
				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-3">
						Who are you talking to?
					</label>
					<div className="grid md:grid-cols-2 gap-3">
						{audienceOptions.map((option) => (
							<button
								key={option.value}
								onClick={() => setAudience(option.value)}
								className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
									audience === option.value
										? "border-pink-500 bg-pink-50"
										: "border-gray-200 hover:border-gray-300 bg-white"
								}`}
							>
								<div
									className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
										audience === option.value
											? "bg-pink-500 text-white"
											: "bg-gray-100 text-gray-500"
									}`}
								>
									{option.value === "cold" ? "❄️" : "🔥"}
								</div>
								<div>
									<span
										className={`block text-sm font-semibold ${
											audience === option.value
												? "text-pink-600"
												: "text-gray-700"
										}`}
									>
										{option.label}
									</span>
									<span className="text-xs text-gray-500">
										{option.description}
									</span>
								</div>
							</button>
						))}
					</div>
				</div>

				{/* Tone Selection */}
				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-3">
						What tone fits your brand?
					</label>
					<div className="grid grid-cols-3 gap-2 sm:gap-3">
						{toneOptions.map((option) => (
							<button
								key={option.value}
								onClick={() => setTone(option.value)}
								className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all min-h-[80px] touch-manipulation ${
									tone === option.value
										? "border-pink-500 bg-pink-50"
										: "border-gray-200 hover:border-gray-300 bg-white active:bg-gray-50"
								}`}
							>
								<span
									className={`text-xs sm:text-sm font-medium text-center leading-tight ${
										tone === option.value ? "text-pink-600" : "text-gray-700"
									}`}
								>
									{option.label}
								</span>
							</button>
						))}
					</div>
				</div>

				{/* Topic Input */}
				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-3">
						What's your post about?
					</label>
					<textarea
						value={topic}
						onChange={handleTopicChange}
						placeholder="e.g., I'm launching a new skincare product line that uses natural ingredients..."
						className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent resize-none transition-colors ${
							validationError
								? "border-red-300 focus:ring-red-500"
								: "border-gray-200 focus:ring-pink-500"
						}`}
						rows={3}
						aria-invalid={!!validationError}
					/>
					{validationError && (
						<div className="mt-2 flex items-center gap-2 text-sm text-red-600">
							<AlertCircle className="w-4 h-4 flex-shrink-0" />
							<span>{validationError}</span>
						</div>
					)}
					<p className="mt-2 text-xs text-gray-500">
						{topic.length} characters · Minimum 10 required
					</p>
				</div>

				{/* Optional Niche Input */}
				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-3">
						Niche / Industry (Optional)
					</label>
					<input
						type="text"
						value={niche}
						onChange={(e) => setNiche(e.target.value)}
						placeholder="e.g., Beauty, Tech, Fitness"
						className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
					/>
				</div>

				{/* Error Message */}
				{generationError && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
						<AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
						<div className="flex-1">
							<h4 className="font-semibold text-red-900 mb-1">
								Oops! Something went wrong
							</h4>
							<p className="text-sm text-red-700 mb-3">{generationError}</p>
							<button
								onClick={handleGenerate}
								className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
							>
								<RotateCcw className="w-4 h-4" />
								Retry
							</button>
						</div>
					</div>
				)}

				{/* Generate Button */}
				<button
					onClick={handleGenerate}
					disabled={!isFormValid()}
					className="btn btn-gradient w-full disabled:opacity-50 disabled:cursor-not-allowed mb-3"
					aria-busy={isGenerating}
				>
					{isGenerating ? (
						<>
							<Loader2 className="w-5 h-5 mr-2 animate-spin" />
							Generating captions...
						</>
					) : (
						<>
							<Sparkles className="w-5 h-5 mr-2" />
							Generate Captions
						</>
					)}
				</button>

				{/* History Button */}
				<button onClick={loadHistory} className="btn btn-outline w-full">
					{showHistory ? "Hide" : "Show"} Recent Captions
				</button>
			</div>

			{/* Loading State */}
			{isGenerating && (
				<div className="card text-center py-12">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full mb-4">
						<Loader2 className="w-8 h-8 text-white animate-spin" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						Crafting your captions...
					</h3>
					<p className="text-gray-600">
						Our AI is writing scroll-stopping hooks just for you
					</p>
				</div>
			)}

			{/* Generated Captions */}
			{!isGenerating && generatedCaptions.length > 0 && (
				<div className="space-y-4">
					<h2 className="text-lg font-semibold text-gray-900">
						Your Generated Captions
					</h2>
					{generatedCaptions.map((caption, index) => (
						<div key={caption.id} className="card">
							<div className="flex items-start justify-between gap-4 mb-4">
								<span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full text-white text-sm font-semibold">
									{index + 1}
								</span>
								<div className="flex gap-2">
									<button
										onClick={() => copyToClipboard(caption)}
										className="btn btn-outline btn-sm"
									>
										{copiedId === caption.id ? (
											<>
												<Check className="w-4 h-4 mr-2 text-green-600" />
												Copied!
											</>
										) : (
											<>
												<Copy className="w-4 h-4 mr-2" />
												Copy
											</>
										)}
									</button>
									{!savedIds.has(caption.id) && (
										<button
											onClick={() => handleSaveCaption(caption)}
											disabled={savingId === caption.id}
											className="btn btn-outline btn-sm"
										>
											{savingId === caption.id ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Saving...
												</>
											) : (
												<>
													<BookMarkedIcon className="w-4 h-4 mr-2" />
													Save
												</>
											)}
										</button>
									)}
									{savedIds.has(caption.id) && (
										<button
											disabled
											className="btn btn-outline btn-sm opacity-50"
										>
											<Check className="w-4 h-4 mr-2 text-green-600" />
											Saved!
										</button>
									)}
								</div>
							</div>

							<div className="space-y-3">
								<div>
									<span className="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1 block">
										Hook
									</span>
									<p className="text-gray-900 font-medium">{caption.hook}</p>
								</div>
								<div>
									<span className="text-xs font-semibold uppercase tracking-wider text-pink-600 mb-1 block">
										Body
									</span>
									<p className="text-gray-700 whitespace-pre-wrap">
										{caption.body}
									</p>
								</div>
								<div>
									<span className="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1 block">
										Call to Action
									</span>
									<p className="text-gray-700">{caption.cta}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Recent History */}
			{showHistory && recentHistory.length > 0 && (
				<div className="space-y-4 mt-8">
					<h2 className="text-lg font-semibold text-gray-900">
						Recent Captions from Library
					</h2>
					{recentHistory.map((caption, index) => (
						<div key={caption.id} className="card bg-gray-50">
							<div className="flex items-start justify-between gap-4 mb-4">
								<span className="inline-flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full text-gray-600 text-sm font-semibold">
									{index + 1}
								</span>
								<button
									onClick={() => copyToClipboard(caption)}
									className="btn btn-outline btn-sm"
								>
									{copiedId === caption.id ? (
										<>
											<Check className="w-4 h-4 mr-2 text-green-600" />
											Copied!
										</>
									) : (
										<>
											<Copy className="w-4 h-4 mr-2" />
											Copy
										</>
									)}
								</button>
							</div>
							<p className="text-sm text-gray-700">{caption.hook}</p>
						</div>
					))}
				</div>
			)}

			{/* Empty State */}
			{!isGenerating && generatedCaptions.length === 0 && !showHistory && (
				<div className="card text-center py-12 bg-gray-50 border-dashed">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
						<Sparkles className="w-8 h-8 text-gray-400" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						Ready to create magic?
					</h3>
					<p className="text-gray-600 max-w-sm mx-auto">
						Configure your preferences above and describe your post topic to
						generate AI-powered captions
					</p>
				</div>
			)}
		</div>
	);
}
