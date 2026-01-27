"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
	Sparkles,
	Copy,
	Check,
	Loader2,
	ArrowLeft,
	AlertCircle,
	RotateCcw,
	BookmarkIcon,
	Trash2,
	Clock,
	Video,
	Zap,
} from "lucide-react";
import type { Pillar } from "@prisma/client";
import {
	generateReelScript,
	saveScriptToLibrary,
	deleteReelScript,
} from "@/lib/actions/reels";
import type { ReelScript } from "@/lib/ai/prompts/reel-script";
import type {
	ReelDuration,
	ReelStyle,
	ReelEnergy,
} from "@/lib/ai/prompts/reel-script";

interface RecentScript {
	id: string;
	title: string;
	pillarName: string;
	createdAt: Date;
}

interface ReelsClientProps {
	accountId: string;
	igUsername: string;
	pillars: Pillar[];
	recentScripts: RecentScript[];
}

const durationOptions: {
	value: ReelDuration;
	label: string;
	description: string;
}[] = [
	{ value: "15", label: "15 seconds", description: "Quick tip or reaction" },
	{ value: "30", label: "30 seconds", description: "Mini-tutorial or story" },
	{ value: "60", label: "60 seconds", description: "Full tutorial or story" },
	{ value: "90", label: "90 seconds", description: "Detailed deep dive" },
];

const styleOptions: { value: ReelStyle; label: string; description: string }[] =
	[
		{
			value: "educational",
			label: "Educational",
			description: "Teach viewers something",
		},
		{
			value: "storytelling",
			label: "Storytelling",
			description: "Share a narrative",
		},
		{
			value: "trending",
			label: "Trending",
			description: "Follow trending formats",
		},
		{
			value: "behindTheScenes",
			label: "Behind the Scenes",
			description: "Show your process",
		},
	];

const energyOptions: {
	value: ReelEnergy;
	label: string;
	description: string;
}[] = [
	{
		value: "high",
		label: "High Energy",
		description: "Fast-paced and exciting",
	},
	{
		value: "medium",
		label: "Medium Energy",
		description: "Balanced and engaging",
	},
	{ value: "calm", label: "Calm", description: "Relaxed and peaceful" },
];

export default function ReelsClient({
	accountId,
	igUsername,
	pillars,
	recentScripts,
}: ReelsClientProps) {
	// Form state
	const [selectedPillar, setSelectedPillar] = useState<string>(
		pillars.length > 0 ? pillars[0].id : "",
	);
	const [topic, setTopic] = useState("");
	const [duration, setDuration] = useState<ReelDuration>("30");
	const [style, setStyle] = useState<ReelStyle>("educational");
	const [energy, setEnergy] = useState<ReelEnergy>("medium");

	// Generation state
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedScript, setGeneratedScript] = useState<ReelScript | null>(
		null,
	);
	const [ideaId, setIdeaId] = useState<string | null>(null);
	const [validationError, setValidationError] = useState<string | null>(null);
	const [generationError, setGenerationError] = useState<string | null>(null);
	const [copiedSection, setCopiedSection] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Validation
	const validateForm = (): string | null => {
		if (!selectedPillar) return "Please select a pillar";
		if (!topic.trim()) return "Topic is required";
		if (topic.trim().length < 10) return "Topic must be at least 10 characters";
		return null;
	};

	const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setTopic(value);
		if (validationError && value.trim().length >= 10) {
			setValidationError(null);
		}
	};

	const handleGenerate = async () => {
		const error = validateForm();
		if (error) {
			setValidationError(error);
			return;
		}

		setValidationError(null);
		setGenerationError(null);
		setIsGenerating(true);
		setGeneratedScript(null);
		setIdeaId(null);

		try {
			const result = await generateReelScript(selectedPillar, {
				topic: topic.trim(),
				duration,
				style,
				energy,
			});

			setGeneratedScript(result.script);
			setIdeaId(result.ideaId);
			toast.success("Reel script generated!", {
				description: "Your AI-powered script is ready to use",
			});
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to generate reel script";
			setGenerationError(errorMessage);
			toast.error("Generation failed", {
				description: errorMessage,
			});
		} finally {
			setIsGenerating(false);
		}
	};

	const copyToClipboard = async (text: string, section: string) => {
		await navigator.clipboard.writeText(text);
		setCopiedSection(section);
		toast.success(`${section} copied!`);
		setTimeout(() => setCopiedSection(null), 2000);
	};

	const handleSave = async () => {
		if (!ideaId) return;

		setIsSaving(true);
		try {
			await saveScriptToLibrary(ideaId);
			toast.success("Script saved!", {
				description: "Added to your content library",
			});
			// Reset form
			setTopic("");
			setGeneratedScript(null);
			setIdeaId(null);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to save script";
			toast.error("Save failed", {
				description: errorMessage,
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteScript = async (scriptId: string) => {
		if (!confirm("Are you sure? This action cannot be undone.")) return;

		setIsDeleting(true);
		try {
			await deleteReelScript(scriptId);
			toast.success("Script deleted");
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to delete script";
			toast.error("Delete failed", {
				description: errorMessage,
			});
		} finally {
			setIsDeleting(false);
		}
	};

	const isFormValid = validateForm() === null;

	return (
		<div className="py-8">
			{/* Header */}
			<div className="mb-8">
				<Link
					href="/dashboard"
					className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to Dashboard
				</Link>
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
						<Video className="w-6 h-6 text-white" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							Reel Script Generator
						</h1>
						<p className="text-gray-600">
							Create viral Instagram Reel scripts with AI-powered hooks and
							sequences
						</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* Configuration Card */}
					<div className="card">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							Generate Your Reel Script
						</h2>

						{/* Pillar Selection */}
						<div className="mb-6">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Content Pillar
							</label>
							<select
								value={selectedPillar}
								onChange={(e) => setSelectedPillar(e.target.value)}
								className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							>
								<option value="">Select a pillar</option>
								{pillars.map((pillar) => (
									<option key={pillar.id} value={pillar.id}>
										{pillar.name}
									</option>
								))}
							</select>
							{pillars.length === 0 && (
								<p className="mt-2 text-sm text-orange-600">
									You need to create content pillars first
								</p>
							)}
						</div>

						{/* Topic Input */}
						<div className="mb-6">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Reel Topic
							</label>
							<textarea
								value={topic}
								onChange={handleTopicChange}
								placeholder="e.g., How to create the perfect morning skincare routine in 30 seconds..."
								className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
									validationError
										? "border-red-300 focus:ring-red-500"
										: "border-gray-200 focus:ring-purple-500"
								}`}
								rows={3}
							/>
							<div className="mt-2 flex items-center justify-between">
								<p className="text-xs text-gray-500">
									{topic.length} characters · Minimum 10 required
								</p>
								{validationError && (
									<p className="text-xs text-red-600">{validationError}</p>
								)}
							</div>
						</div>

						{/* Duration Selection */}
						<div className="mb-6">
							<label className="block text-sm font-medium text-gray-700 mb-3">
								Reel Duration
							</label>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
								{durationOptions.map((option) => (
									<button
										key={option.value}
										onClick={() => setDuration(option.value)}
										className={`p-3 rounded-lg border-2 transition-all text-left ${
											duration === option.value
												? "border-purple-500 bg-purple-50"
												: "border-gray-200 hover:border-gray-300 bg-white"
										}`}
									>
										<div className="text-sm font-medium text-gray-900">
											{option.label}
										</div>
										<div className="text-xs text-gray-500">
											{option.description}
										</div>
									</button>
								))}
							</div>
						</div>

						{/* Style Selection */}
						<div className="mb-6">
							<label className="block text-sm font-medium text-gray-700 mb-3">
								Reel Style
							</label>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
								{styleOptions.map((option) => (
									<button
										key={option.value}
										onClick={() => setStyle(option.value)}
										className={`p-3 rounded-lg border-2 transition-all text-left ${
											style === option.value
												? "border-purple-500 bg-purple-50"
												: "border-gray-200 hover:border-gray-300 bg-white"
										}`}
									>
										<div className="text-sm font-medium text-gray-900">
											{option.label}
										</div>
										<div className="text-xs text-gray-500">
											{option.description}
										</div>
									</button>
								))}
							</div>
						</div>

						{/* Energy Selection */}
						<div className="mb-6">
							<label className="block text-sm font-medium text-gray-700 mb-3">
								Video Energy
							</label>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
								{energyOptions.map((option) => (
									<button
										key={option.value}
										onClick={() => setEnergy(option.value)}
										className={`p-3 rounded-lg border-2 transition-all text-left ${
											energy === option.value
												? "border-purple-500 bg-purple-50"
												: "border-gray-200 hover:border-gray-300 bg-white"
										}`}
									>
										<div className="text-sm font-medium text-gray-900">
											{option.label}
										</div>
										<div className="text-xs text-gray-500">
											{option.description}
										</div>
									</button>
								))}
							</div>
						</div>

						{/* Error Message */}
						{generationError && (
							<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
								<AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
								<div className="flex-1">
									<h4 className="font-semibold text-red-900 mb-1">
										Generation failed
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
							disabled={!isFormValid || isGenerating || pillars.length === 0}
							className="w-full btn btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
							aria-busy={isGenerating}
						>
							{isGenerating ? (
								<>
									<Loader2 className="w-5 h-5 mr-2 animate-spin" />
									Generating script...
								</>
							) : (
								<>
									<Sparkles className="w-5 h-5 mr-2" />
									Generate Reel Script
								</>
							)}
						</button>
					</div>

					{/* Generated Script */}
					{!isGenerating && generatedScript && (
						<div className="card">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-lg font-semibold text-gray-900">
									Your Reel Script
								</h2>
								<button
									onClick={handleSave}
									disabled={isSaving}
									className="btn btn-outline btn-sm"
								>
									{isSaving ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Saving...
										</>
									) : (
										<>
											<BookmarkIcon className="w-4 h-4 mr-2" />
											Save to Library
										</>
									)}
								</button>
							</div>

							<div className="space-y-6">
								{/* Hook */}
								<div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
									<div className="flex items-center justify-between mb-2">
										<span className="text-xs font-semibold uppercase tracking-wider text-purple-700">
											Hook
										</span>
										<button
											onClick={() =>
												copyToClipboard(generatedScript.hook, "Hook")
											}
											className="btn btn-outline btn-xs"
										>
											{copiedSection === "Hook" ? (
												<>
													<Check className="w-3 h-3" />
												</>
											) : (
												<>
													<Copy className="w-3 h-3" />
												</>
											)}
										</button>
									</div>
									<p className="text-gray-900 font-medium">
										{generatedScript.hook}
									</p>
									<p className="text-xs text-gray-600 mt-2">
										This is the crucial opening moment that stops the scroll
									</p>
								</div>

								{/* Key Points */}
								<div>
									<div className="flex items-center justify-between mb-3">
										<h3 className="text-sm font-semibold text-gray-900">
											Key Points
										</h3>
										<button
											onClick={() =>
												copyToClipboard(
													generatedScript.keyPoints.join("\n"),
													"Key Points",
												)
											}
											className="btn btn-outline btn-xs"
										>
											{copiedSection === "Key Points" ? (
												<>
													<Check className="w-3 h-3" />
												</>
											) : (
												<>
													<Copy className="w-3 h-3" />
												</>
											)}
										</button>
									</div>
									<ul className="space-y-2">
										{generatedScript.keyPoints.map((point, index) => (
											<li
												key={index}
												className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
											>
												<span className="inline-flex items-center justify-center w-6 h-6 bg-purple-600 text-white text-xs font-semibold rounded flex-shrink-0">
													{index + 1}
												</span>
												<p className="text-gray-700">{point}</p>
											</li>
										))}
									</ul>
								</div>

								{/* CTA */}
								<div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
									<div className="flex items-center justify-between mb-2">
										<span className="text-xs font-semibold uppercase tracking-wider text-pink-700">
											Call to Action
										</span>
										<button
											onClick={() =>
												copyToClipboard(generatedScript.cta, "CTA")
											}
											className="btn btn-outline btn-xs"
										>
											{copiedSection === "CTA" ? (
												<>
													<Check className="w-3 h-3" />
												</>
											) : (
												<>
													<Copy className="w-3 h-3" />
												</>
											)}
										</button>
									</div>
									<p className="text-gray-900 font-medium">
										{generatedScript.cta}
									</p>
								</div>

								{/* Caption */}
								<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
									<div className="flex items-center justify-between mb-2">
										<span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
											Caption
										</span>
										<button
											onClick={() =>
												copyToClipboard(generatedScript.caption, "Caption")
											}
											className="btn btn-outline btn-xs"
										>
											{copiedSection === "Caption" ? (
												<>
													<Check className="w-3 h-3" />
												</>
											) : (
												<>
													<Copy className="w-3 h-3" />
												</>
											)}
										</button>
									</div>
									<p className="text-gray-900 text-sm leading-relaxed">
										{generatedScript.caption}
									</p>
								</div>

								{/* Hashtags */}
								<div>
									<div className="flex items-center justify-between mb-3">
										<h3 className="text-sm font-semibold text-gray-900">
											Hashtags
										</h3>
										<button
											onClick={() =>
												copyToClipboard(
													generatedScript.hashtags.join(" "),
													"Hashtags",
												)
											}
											className="btn btn-outline btn-xs"
										>
											{copiedSection === "Hashtags" ? (
												<>
													<Check className="w-3 h-3" />
												</>
											) : (
												<>
													<Copy className="w-3 h-3" />
												</>
											)}
										</button>
									</div>
									<div className="flex flex-wrap gap-2">
										{generatedScript.hashtags.map((tag, index) => (
											<span
												key={index}
												className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
											>
												{tag}
											</span>
										))}
									</div>
								</div>

								{/* Shot List */}
								<div>
									<h3 className="text-sm font-semibold text-gray-900 mb-3">
										Shot-by-Shot Breakdown
									</h3>
									<div className="space-y-3">
										{generatedScript.shots.map((shot, index) => (
											<div
												key={index}
												className="p-4 border border-gray-200 rounded-lg bg-gray-50"
											>
												<div className="flex items-center gap-2 mb-2">
													<span className="inline-flex items-center justify-center w-6 h-6 bg-gray-300 text-gray-900 text-xs font-semibold rounded">
														{index + 1}
													</span>
													<span className="text-xs font-semibold text-gray-600">
														{shot.timestamp}
													</span>
												</div>
												<div className="space-y-2 text-sm">
													<div>
														<p className="text-gray-600 font-medium">Visual:</p>
														<p className="text-gray-700">{shot.visual}</p>
													</div>
													<div>
														<p className="text-gray-600 font-medium">Audio:</p>
														<p className="text-gray-700">{shot.audio}</p>
													</div>
													{shot.textOverlay && (
														<div>
															<p className="text-gray-600 font-medium">
																Text Overlay:
															</p>
															<p className="text-gray-700">
																{shot.textOverlay}
															</p>
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Loading State */}
					{isGenerating && (
						<div className="card text-center py-12">
							<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
								<Loader2 className="w-8 h-8 text-white animate-spin" />
							</div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Creating your reel script...
							</h3>
							<p className="text-gray-600">
								Our AI is crafting a viral script tailored to your
								specifications
							</p>
						</div>
					)}

					{/* Empty State */}
					{!isGenerating && !generatedScript && (
						<div className="card text-center py-12 bg-gray-50 border-dashed">
							<div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
								<Video className="w-8 h-8 text-gray-400" />
							</div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Ready to create a viral reel?
							</h3>
							<p className="text-gray-600 max-w-sm mx-auto">
								Configure your reel parameters above and describe your topic to
								generate an AI-powered script with hooks, key points, and shot
								suggestions
							</p>
						</div>
					)}
				</div>

				{/* Sidebar - Recent Scripts */}
				<div className="space-y-6">
					<div className="card">
						<div className="flex items-center gap-2 mb-4">
							<Clock className="w-5 h-5 text-purple-600" />
							<h3 className="font-semibold text-gray-900">Recent Scripts</h3>
						</div>

						{recentScripts.length > 0 ? (
							<div className="space-y-2">
								{recentScripts.map((script) => (
									<div
										key={script.id}
										className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
									>
										<p className="text-sm font-medium text-gray-900 truncate">
											{script.title}
										</p>
										<p className="text-xs text-gray-500">{script.pillarName}</p>
										<p className="text-xs text-gray-400 mt-1">
											{new Date(script.createdAt).toLocaleDateString()}
										</p>
										<button
											onClick={() => handleDeleteScript(script.id)}
											disabled={isDeleting}
											className="mt-2 inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
										>
											<Trash2 className="w-3 h-3" />
											Delete
										</button>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-gray-500 text-center py-4">
								No scripts generated yet
							</p>
						)}
					</div>

					{/* Tips Card */}
					<div className="card bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
						<div className="flex items-center gap-2 mb-3">
							<Zap className="w-5 h-5 text-purple-600" />
							<h3 className="font-semibold text-gray-900">Pro Tips</h3>
						</div>
						<ul className="space-y-2 text-xs text-gray-700">
							<li>• Hook viewers in the first second</li>
							<li>• Use trending sounds when possible</li>
							<li>• Keep captions short and punchy</li>
							<li>• End with a clear call-to-action</li>
							<li>• Test different styles for your niche</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
