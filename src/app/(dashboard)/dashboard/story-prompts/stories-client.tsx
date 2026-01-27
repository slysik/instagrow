"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
	Sparkles,
	Copy,
	Check,
	Loader2,
	Heart,
	MessageCircle,
	BarChart2,
	HelpCircle,
	Bookmark,
	ArrowRight,
	AlertCircle,
} from "lucide-react";
import type { Pillar } from "@prisma/client";
import type { StorySequence } from "@/lib/ai/prompts/story-prompts";
import {
	generateStoryPrompts,
	saveStoryPromptToLibrary,
	getStoryHistory,
} from "@/lib/actions/stories";

interface StoriesClientProps {
	pillars: Array<{
		id: string;
		name: string;
		color: string | null;
		emoji: string | null;
	}>;
	accountId: string;
}

type StoryGoal = "engagement" | "dm" | "traffic" | "sales" | "community";
type StoryType =
	| "daily"
	| "dm-day"
	| "engagement-boost"
	| "launch"
	| "behind-scenes";

const goalOptions: { value: StoryGoal; label: string; description: string }[] =
	[
		{
			value: "engagement",
			label: "Boost Engagement",
			description: "Maximize views, taps, and interactions",
		},
		{
			value: "dm",
			label: "Drive DMs",
			description: "Start conversations in DMs",
		},
		{
			value: "traffic",
			label: "Drive Traffic",
			description: "Get clicks to your link",
		},
		{
			value: "sales",
			label: "Drive Sales",
			description: "Convert followers to customers",
		},
		{
			value: "community",
			label: "Build Community",
			description: "Create deeper connections",
		},
	];

const storyTypeOptions: { value: StoryType; label: string }[] = [
	{ value: "daily", label: "Daily Stories" },
	{ value: "dm-day", label: "DM Day" },
	{ value: "engagement-boost", label: "Engagement Boost" },
	{ value: "launch", label: "Launch Day" },
	{ value: "behind-scenes", label: "Behind the Scenes" },
];

const engagementTypeColors: Record<string, string> = {
	poll: "bg-blue-100 text-blue-700",
	quiz: "bg-purple-100 text-purple-700",
	question: "bg-pink-100 text-pink-700",
	slider: "bg-orange-100 text-orange-700",
	countdown: "bg-red-100 text-red-700",
	link: "bg-green-100 text-green-700",
	text: "bg-gray-100 text-gray-700",
};

export function StoriesClient({ pillars, accountId }: StoriesClientProps) {
	const [selectedPillar, setSelectedPillar] = useState(
		pillars[0]?.id || ""
	);
	const [goal, setGoal] = useState<StoryGoal>("engagement");
	const [storyType, setStoryType] = useState<StoryType>("daily");
	const [count, setCount] = useState<3 | 5 | 7>(3);
	const [isGenerating, setIsGenerating] = useState(false);
	const [sequences, setSequences] = useState<StorySequence[]>([]);
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
	const [history, setHistory] = useState<any[]>([]);
	const [showHistory, setShowHistory] = useState(false);
	const [isFetchingHistory, setIsFetchingHistory] = useState(false);

	const handleGenerate = async () => {
		if (!selectedPillar) {
			toast.error("Please select a pillar");
			return;
		}

		setIsGenerating(true);
		try {
			const result = await generateStoryPrompts(
				selectedPillar,
				goal,
				storyType,
				count
			);

			if (result.success && result.sequences) {
				setSequences(result.sequences);
				toast.success(
					`Generated ${result.sequences.length} story sequence${result.sequences.length !== 1 ? "s" : ""}`
				);
			} else {
				toast.error(result.error || "Failed to generate story prompts");
			}
		} catch (error) {
			console.error("Error:", error);
			toast.error("Failed to generate story prompts");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleSave = async (sequence: StorySequence) => {
		try {
			const result = await saveStoryPromptToLibrary(
				selectedPillar,
				sequence
			);

			if (result.success) {
				setSavedIds((prev) => new Set([...prev, sequence.id]));
				toast.success("Story prompt saved to library");
			} else {
				toast.error(result.error || "Failed to save story prompt");
			}
		} catch (error) {
			console.error("Error:", error);
			toast.error("Failed to save story prompt");
		}
	};

	const handleCopy = async (text: string, id: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedId(id);
			toast.success("Copied to clipboard");
			setTimeout(() => setCopiedId(null), 2000);
		} catch {
			toast.error("Failed to copy");
		}
	};

	const handleFetchHistory = async () => {
		setIsFetchingHistory(true);
		try {
			const result = await getStoryHistory(5);
			if (result.success && result.ideas) {
				setHistory(result.ideas);
				setShowHistory(true);
				toast.success("Loaded recent story prompts");
			} else {
				toast.error(result.error || "Failed to load history");
			}
		} catch (error) {
			console.error("Error:", error);
			toast.error("Failed to load history");
		} finally {
			setIsFetchingHistory(false);
		}
	};

	const getFrameTypeColor = (type: string) => {
		return engagementTypeColors[type] || engagementTypeColors.text;
	};

	return (
		<div className="max-w-4xl mx-auto">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-3">
					<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
						<Sparkles className="w-6 h-6 text-white" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Story Prompts</h1>
						<p className="text-gray-600">
							Generate AI-powered story ideas for your niche
						</p>
					</div>
				</div>
			</div>

			{/* Form Card */}
			<div className="card mb-8">
				<div className="space-y-6">
					{/* Pillar Selection */}
					<div>
						<label className="block text-sm font-semibold text-gray-900 mb-2">
							Select Content Pillar
						</label>
						{pillars.length > 0 ? (
							<select
								value={selectedPillar}
								onChange={(e) => setSelectedPillar(e.target.value)}
								className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								{pillars.map((pillar) => (
									<option key={pillar.id} value={pillar.id}>
										{pillar.emoji} {pillar.name}
									</option>
								))}
							</select>
						) : (
							<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
								<p className="text-sm">
									No content pillars found. Please create a pillar first.
								</p>
							</div>
						)}
					</div>

					{/* Goal Selection */}
					<div>
						<label className="block text-sm font-semibold text-gray-900 mb-3">
							Story Goal
						</label>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{goalOptions.map((option) => (
								<button
									key={option.value}
									onClick={() => setGoal(option.value)}
									className={`p-4 rounded-lg text-left transition-all border-2 ${
										goal === option.value
											? "border-blue-500 bg-blue-50"
											: "border-gray-200 hover:border-gray-300"
									}`}
								>
									<div className="font-semibold text-gray-900">
										{option.label}
									</div>
									<div className="text-sm text-gray-600">
										{option.description}
									</div>
								</button>
							))}
						</div>
					</div>

					{/* Story Type Selection */}
					<div>
						<label className="block text-sm font-semibold text-gray-900 mb-2">
							Story Type
						</label>
						<select
							value={storyType}
							onChange={(e) => setStoryType(e.target.value as StoryType)}
							className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							{storyTypeOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>

					{/* Count Selection */}
					<div>
						<label className="block text-sm font-semibold text-gray-900 mb-3">
							Number of Story Sequences
						</label>
						<div className="flex gap-3">
							{[3, 5, 7].map((num) => (
								<button
									key={num}
									onClick={() => setCount(num as 3 | 5 | 7)}
									className={`flex-1 py-3 rounded-lg font-medium transition-all ${
										count === num
											? "bg-blue-500 text-white"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
								>
									{num}
								</button>
							))}
						</div>
					</div>

					{/* Generate Button */}
					<button
						onClick={handleGenerate}
						disabled={isGenerating || pillars.length === 0}
						className="w-full btn btn-gradient btn-lg gap-2 disabled:opacity-70"
					>
						{isGenerating ? (
							<>
								<Loader2 className="w-5 h-5 animate-spin" />
								Generating...
							</>
						) : (
							<>
								<Sparkles className="w-5 h-5" />
								Generate Story Sequences
							</>
						)}
					</button>

					{/* View History Button */}
					<button
						onClick={handleFetchHistory}
						disabled={isFetchingHistory}
						className="w-full py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-gray-700 flex items-center justify-center gap-2"
					>
						{isFetchingHistory ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								Loading...
							</>
						) : (
							<>
								<Bookmark className="w-4 h-4" />
								View Recent Stories
							</>
						)}
					</button>
				</div>
			</div>

			{/* Generated Sequences */}
			{sequences.length > 0 && (
				<div className="space-y-6 mb-8">
					<h2 className="text-xl font-bold text-gray-900">Generated Sequences</h2>

					{sequences.map((sequence) => (
						<div key={sequence.id} className="card">
							{/* Sequence Header */}
							<div className="mb-4">
								<h3 className="text-lg font-bold text-gray-900 mb-1">
									{sequence.title}
								</h3>
								<p className="text-gray-600 text-sm mb-3">
									{sequence.description}
								</p>
								<div className="flex flex-wrap gap-2 text-xs">
									<span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
										{sequence.totalFrames} frames
									</span>
									<span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
										{sequence.estimatedWatchTime}
									</span>
									<span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
										Best: {sequence.bestTimeToPost}
									</span>
								</div>
							</div>

							{/* Frames */}
							<div className="space-y-4 mb-4">
								{sequence.frames.map((frame) => (
									<div key={frame.id} className="p-4 bg-gray-50 rounded-lg">
										{/* Frame Header */}
										<div className="flex items-start justify-between mb-3">
											<div className="flex items-center gap-2">
												<span
													className={`px-3 py-1 rounded-full text-xs font-medium ${getFrameTypeColor(frame.type)}`}
												>
													{frame.type}
												</span>
												<span className="text-xs text-gray-500">
													Frame {frame.frameNumber}
												</span>
											</div>
											<button
												onClick={() => handleCopy(frame.content, frame.id)}
												className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
												title="Copy frame content"
											>
												{copiedId === frame.id ? (
													<Check className="w-4 h-4 text-green-500" />
												) : (
													<Copy className="w-4 h-4" />
												)}
											</button>
										</div>

										{/* Content */}
										<p className="text-gray-900 font-medium mb-3">
											{frame.content}
										</p>

										{/* Visual and Sticker Info */}
										<div className="space-y-2 text-sm">
											<div>
												<span className="text-gray-600">📸 Visual: </span>
												<span className="text-gray-700">
													{frame.visualSuggestion}
												</span>
											</div>
											{frame.stickerUsage && (
												<div>
													<span className="text-gray-600">🎨 Sticker: </span>
													<span className="text-gray-700">
														{frame.stickerUsage}
													</span>
												</div>
											)}
											{frame.captionOverlay && (
												<div>
													<span className="text-gray-600">✍️ Overlay: </span>
													<span className="text-gray-700">
														{frame.captionOverlay}
													</span>
												</div>
											)}
											<div>
												<span className="text-gray-600">💡 Tip: </span>
												<span className="text-gray-700">
													{frame.engagementTip}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Save Button */}
							<button
								onClick={() => handleSave(sequence)}
								disabled={savedIds.has(sequence.id)}
								className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
									savedIds.has(sequence.id)
										? "bg-green-100 text-green-700"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								{savedIds.has(sequence.id) ? (
									<>
										<Check className="w-4 h-4" />
										Saved to Library
									</>
								) : (
									<>
										<Bookmark className="w-4 h-4" />
										Save to Library
									</>
								)}
							</button>
						</div>
					))}
				</div>
			)}

			{/* History Section */}
			{showHistory && history.length > 0 && (
				<div className="space-y-6">
					<h2 className="text-xl font-bold text-gray-900">Recent Stories</h2>

					{history.map((idea) => (
						<div key={idea.id} className="card">
							<div className="flex items-start justify-between mb-3">
								<div>
									<h3 className="text-lg font-bold text-gray-900">
										{idea.title}
									</h3>
									<p className="text-sm text-gray-600 mt-1">
										{idea.description}
									</p>
								</div>
								<div className="text-right">
									<div className="text-xs text-gray-500">
										{new Date(idea.createdAt).toLocaleDateString()}
									</div>
									<div className="text-xs text-gray-400 mt-1">
										{idea.pillar?.emoji} {idea.pillar?.name}
									</div>
								</div>
							</div>

							{idea.frames && Array.isArray(idea.frames) && (
								<div className="flex flex-wrap gap-2">
									{idea.frames.map((frame: any, idx: number) => (
										<span
											key={idx}
											className={`px-2 py-1 rounded text-xs font-medium ${getFrameTypeColor(frame.type)}`}
										>
											{frame.type}
										</span>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{/* Empty State */}
			{sequences.length === 0 && !showHistory && (
				<div className="text-center py-12">
					<Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
					<p className="text-gray-600 mb-2">
						No story sequences generated yet
					</p>
					<p className="text-sm text-gray-500">
						Select your content pillar, goal, and story type, then click
						generate to create engaging story sequences
					</p>
				</div>
			)}
		</div>
	);
}
