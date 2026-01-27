"use client";

import { useState } from "react";
import {
	Hash,
	Search,
	Copy,
	Check,
	Image,
	Video,
	Target,
	Loader2,
	ArrowLeft,
	Sparkles,
	Trash2,
	Save,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
	generateHashtags,
	saveHashtagSet,
	deleteHashtagSet,
} from "@/lib/actions/seo";
import type { SavedHashtagSet } from "@/lib/actions/seo";
import type { SEOSuiteOutput } from "@/lib/ai/prompts/seo-suite";

interface SEOClientProps {
	accountId: string;
	initialSavedSets: SavedHashtagSet[];
}

type Tab = "generate" | "saved";

export function SEOClient({ accountId, initialSavedSets }: SEOClientProps) {
	const [activeTab, setActiveTab] = useState<Tab>("generate");
	const [copiedSection, setCopiedSection] = useState<string | null>(null);

	// Generate tab state
	const [topic, setTopic] = useState("");
	const [contentType, setContentType] = useState<
		"post" | "reel" | "carousel" | "story"
	>("post");
	const [targetAudience, setTargetAudience] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedContent, setGeneratedContent] =
		useState<SEOSuiteOutput | null>(null);
	const [saveSetName, setSaveSetName] = useState("");
	const [saveSetDesc, setSaveSetDesc] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	// Saved sets state
	const [savedSets, setSavedSets] = useState(initialSavedSets);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const copyToClipboard = async (text: string, section: string) => {
		await navigator.clipboard.writeText(text);
		setCopiedSection(section);
		toast.success("Copied to clipboard!");
		setTimeout(() => setCopiedSection(null), 2000);
	};

	const handleGenerate = async () => {
		if (!topic.trim()) {
			toast.error("Please enter a topic");
			return;
		}

		setIsGenerating(true);
		try {
			const result = await generateHashtags(accountId, {
				topic: topic.trim(),
				contentType,
				targetAudience: targetAudience || undefined,
			});
			setGeneratedContent(result);
			setSaveSetName("");
			setSaveSetDesc("");
			toast.success("Hashtags generated successfully!");
		} catch (error) {
			const msg =
				error instanceof Error ? error.message : "Failed to generate hashtags";
			toast.error(msg);
			console.error("Error:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleSaveSet = async () => {
		if (!generatedContent) return;
		if (!saveSetName.trim()) {
			toast.error("Please enter a set name");
			return;
		}

		setIsSaving(true);
		try {
			const newSet = await saveHashtagSet(accountId, {
				name: saveSetName.trim(),
				description: saveSetDesc || undefined,
				topic,
				contentType,
				targetAudience: targetAudience || undefined,
				hashtags: {
					primary: generatedContent.hashtags.primary,
					secondary: generatedContent.hashtags.secondary,
					niche: generatedContent.hashtags.niche,
					banned: generatedContent.hashtags.banned,
				},
			});
			setSavedSets([newSet, ...savedSets]);
			setSaveSetName("");
			setSaveSetDesc("");
			toast.success("Hashtag set saved!");
		} catch (error) {
			const msg =
				error instanceof Error ? error.message : "Failed to save hashtag set";
			toast.error(msg);
			console.error("Error:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteSet = async (setId: string) => {
		if (!confirm("Are you sure you want to delete this hashtag set?")) return;

		setDeletingId(setId);
		try {
			await deleteHashtagSet(setId);
			setSavedSets(savedSets.filter((s) => s.id !== setId));
			toast.success("Hashtag set deleted!");
		} catch (error) {
			const msg =
				error instanceof Error ? error.message : "Failed to delete hashtag set";
			toast.error(msg);
			console.error("Error:", error);
		} finally {
			setDeletingId(null);
		}
	};

	const CopyButton = ({ text, section }: { text: string; section: string }) => (
		<button
			onClick={() => copyToClipboard(text, section)}
			className="flex items-center gap-1 text-sm text-gray-500 hover:text-[var(--gradient-mid)] transition-colors"
		>
			{copiedSection === section ? (
				<>
					<Check className="w-4 h-4 text-green-500" />
					<span className="text-green-500">Copied!</span>
				</>
			) : (
				<>
					<Copy className="w-4 h-4" />
					<span>Copy</span>
				</>
			)}
		</button>
	);

	return (
		<div className="max-w-4xl mx-auto">
			{/* Header */}
			<div className="mb-8">
				<Link
					href="/dashboard"
					className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[var(--gradient-mid)] mb-4 transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to Dashboard
				</Link>
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
						<Hash className="w-6 h-6 text-white" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">SEO Suite</h1>
						<p className="text-gray-600">
							Optimize your content for maximum discoverability
						</p>
					</div>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex gap-4 mb-6 border-b border-gray-200">
				<button
					onClick={() => setActiveTab("generate")}
					className={`px-4 py-3 font-medium transition-colors ${
						activeTab === "generate"
							? "text-[var(--gradient-mid)] border-b-2 border-[var(--gradient-mid)]"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Generate Hashtags
				</button>
				<button
					onClick={() => setActiveTab("saved")}
					className={`px-4 py-3 font-medium transition-colors ${
						activeTab === "saved"
							? "text-[var(--gradient-mid)] border-b-2 border-[var(--gradient-mid)]"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Saved Sets ({savedSets.length})
				</button>
			</div>

			{/* Generate Tab */}
			{activeTab === "generate" && (
				<div className="space-y-6">
					{/* Input Section */}
					<div className="card">
						<div className="mb-4">
							<label
								htmlFor="topic"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Post Topic or Niche
							</label>
							<input
								type="text"
								id="topic"
								value={topic}
								onChange={(e) => setTopic(e.target.value)}
								placeholder="e.g., fitness tips, travel photography, home cooking..."
								className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent transition-all"
								onKeyDown={(e) => {
									if (e.key === "Enter" && !isGenerating) {
										handleGenerate();
									}
								}}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4 mb-4">
							<div>
								<label
									htmlFor="contentType"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Content Type
								</label>
								<select
									id="contentType"
									value={contentType}
									onChange={(e) =>
										setContentType(
											e.target.value as "post" | "reel" | "carousel" | "story",
										)
									}
									className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent transition-all"
								>
									<option value="post">Static Post</option>
									<option value="reel">Reel</option>
									<option value="carousel">Carousel</option>
									<option value="story">Story</option>
								</select>
							</div>

							<div>
								<label
									htmlFor="audience"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Target Audience (Optional)
								</label>
								<input
									type="text"
									id="audience"
									value={targetAudience}
									onChange={(e) => setTargetAudience(e.target.value)}
									placeholder="e.g., fitness enthusiasts, 18-35"
									className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent transition-all"
								/>
							</div>
						</div>

						<button
							onClick={handleGenerate}
							disabled={!topic.trim() || isGenerating}
							className="w-full btn bg-ig-gradient text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isGenerating ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Generating...
								</>
							) : (
								<>
									<Sparkles className="w-4 h-4 mr-2" />
									Generate Hashtags & SEO
								</>
							)}
						</button>
					</div>

					{/* Loading State */}
					{isGenerating && (
						<div className="card">
							<div className="flex items-center justify-center py-12">
								<div className="text-center">
									<Loader2 className="w-8 h-8 animate-spin text-[var(--gradient-mid)] mx-auto mb-4" />
									<p className="text-gray-600">
										Analyzing your niche and generating optimized content...
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Generated Content */}
					{generatedContent && !isGenerating && (
						<div className="space-y-6">
							{/* Hashtags Section */}
							<div className="card">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
											<Hash className="w-5 h-5 text-white" />
										</div>
										<div>
											<h2 className="font-semibold text-gray-900">Hashtags</h2>
											<p className="text-sm text-gray-500">
												Optimized by reach and engagement
											</p>
										</div>
									</div>
									<CopyButton
										text={[
											...generatedContent.hashtags.primary,
											...generatedContent.hashtags.secondary,
											...generatedContent.hashtags.niche,
										].join(" ")}
										section="hashtags"
									/>
								</div>

								<div className="space-y-4">
									{/* Primary Hashtags */}
									<div>
										<p className="text-xs font-semibold text-gray-500 mb-2">
											PRIMARY (High Reach)
										</p>
										<div className="flex flex-wrap gap-2">
											{generatedContent.hashtags.primary.map((tag, i) => (
												<span
													key={i}
													className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
												>
													{tag}
												</span>
											))}
										</div>
									</div>

									{/* Secondary Hashtags */}
									<div>
										<p className="text-xs font-semibold text-gray-500 mb-2">
											SECONDARY (Medium Reach)
										</p>
										<div className="flex flex-wrap gap-2">
											{generatedContent.hashtags.secondary.map((tag, i) => (
												<span
													key={i}
													className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm"
												>
													{tag}
												</span>
											))}
										</div>
									</div>

									{/* Niche Hashtags */}
									<div>
										<p className="text-xs font-semibold text-gray-500 mb-2">
											NICHE (High Engagement)
										</p>
										<div className="flex flex-wrap gap-2">
											{generatedContent.hashtags.niche.map((tag, i) => (
												<span
													key={i}
													className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm"
												>
													{tag}
												</span>
											))}
										</div>
									</div>

									{/* Banned Hashtags */}
									{generatedContent.hashtags.banned &&
										generatedContent.hashtags.banned.length > 0 && (
											<div>
												<p className="text-xs font-semibold text-gray-500 mb-2">
													AVOID (Shadowban Risk)
												</p>
												<div className="flex flex-wrap gap-2">
													{generatedContent.hashtags.banned.map((tag, i) => (
														<span
															key={i}
															className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm line-through"
														>
															{tag}
														</span>
													))}
												</div>
											</div>
										)}
								</div>
							</div>

							{/* Alt Text Section */}
							<div className="card">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
											<Image className="w-5 h-5 text-white" />
										</div>
										<div>
											<h2 className="font-semibold text-gray-900">Alt Text</h2>
											<p className="text-sm text-gray-500">
												SEO-optimized image description
											</p>
										</div>
									</div>
									<CopyButton
										text={generatedContent.altText}
										section="altText"
									/>
								</div>
								<p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
									{generatedContent.altText}
								</p>
							</div>

							{/* Keywords Section */}
							<div className="card">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
											<Target className="w-5 h-5 text-white" />
										</div>
										<div>
											<h2 className="font-semibold text-gray-900">Keywords</h2>
											<p className="text-sm text-gray-500">
												For captions and descriptions
											</p>
										</div>
									</div>
								</div>

								<div className="space-y-3">
									<div>
										<p className="text-xs font-semibold text-gray-500 mb-2">
											PRIMARY
										</p>
										<div className="flex flex-wrap gap-2">
											{generatedContent.keywords.primary.map((kw, i) => (
												<span
													key={i}
													className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
												>
													{kw}
												</span>
											))}
										</div>
									</div>

									<div>
										<p className="text-xs font-semibold text-gray-500 mb-2">
											LSI (Related Terms)
										</p>
										<div className="flex flex-wrap gap-2">
											{generatedContent.keywords.lsi.map((kw, i) => (
												<span
													key={i}
													className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
												>
													{kw}
												</span>
											))}
										</div>
									</div>

									<div>
										<p className="text-xs font-semibold text-gray-500 mb-2">
											LONG-TAIL
										</p>
										<div className="flex flex-wrap gap-2">
											{generatedContent.keywords.longTail.map((kw, i) => (
												<span
													key={i}
													className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
												>
													{kw}
												</span>
											))}
										</div>
									</div>
								</div>
							</div>

							{/* Search Phrases Section */}
							<div className="card">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
											<Search className="w-5 h-5 text-white" />
										</div>
										<div>
											<h2 className="font-semibold text-gray-900">
												Search Phrases
											</h2>
											<p className="text-sm text-gray-500">
												How users find this content
											</p>
										</div>
									</div>
								</div>

								<div className="space-y-3">
									<div>
										<p className="text-xs font-semibold text-gray-500 mb-2">
											INSTAGRAM SEARCHES
										</p>
										<div className="space-y-2">
											{generatedContent.searchPhrases.instagram.map(
												(phrase, i) => (
													<div
														key={i}
														className="flex items-center gap-2 p-2 bg-gray-50 rounded"
													>
														<Search className="w-4 h-4 text-gray-400" />
														<span className="text-sm text-gray-700">
															{phrase}
														</span>
													</div>
												),
											)}
										</div>
									</div>

									<div>
										<p className="text-xs font-semibold text-gray-500 mb-2">
											GOOGLE SEARCHES
										</p>
										<div className="space-y-2">
											{generatedContent.searchPhrases.google.map(
												(phrase, i) => (
													<div
														key={i}
														className="flex items-center gap-2 p-2 bg-gray-50 rounded"
													>
														<Search className="w-4 h-4 text-gray-400" />
														<span className="text-sm text-gray-700">
															{phrase}
														</span>
													</div>
												),
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Save Set Section */}
							<div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
								<h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
									<Save className="w-5 h-5" />
									Save This Hashtag Set
								</h3>
								<div className="space-y-3">
									<input
										type="text"
										value={saveSetName}
										onChange={(e) => setSaveSetName(e.target.value)}
										placeholder="Set name (e.g., Fitness Tips - January)"
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
									<textarea
										value={saveSetDesc}
										onChange={(e) => setSaveSetDesc(e.target.value)}
										placeholder="Optional description..."
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
										rows={2}
									/>
									<button
										onClick={handleSaveSet}
										disabled={isSaving || !saveSetName.trim()}
										className="w-full btn bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isSaving ? (
											<>
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												Saving...
											</>
										) : (
											<>
												<Save className="w-4 h-4 mr-2" />
												Save Set
											</>
										)}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Empty State */}
					{!generatedContent && !isGenerating && (
						<div className="card">
							<div className="text-center py-12">
								<div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
									<Search className="w-8 h-8 text-gray-400" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									Enter a topic to get started
								</h3>
								<p className="text-gray-500 max-w-md mx-auto">
									Get AI-powered hashtags, keywords, alt text, and search
									phrases optimized for your niche and content type.
								</p>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Saved Sets Tab */}
			{activeTab === "saved" && (
				<div>
					{savedSets.length === 0 ? (
						<div className="card">
							<div className="text-center py-12">
								<div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
									<Hash className="w-8 h-8 text-gray-400" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									No saved hashtag sets yet
								</h3>
								<p className="text-gray-500 max-w-md mx-auto mb-6">
									Generate hashtags and save them to reuse later in similar
									content.
								</p>
								<button
									onClick={() => setActiveTab("generate")}
									className="btn bg-ig-gradient text-white"
								>
									Generate Hashtags
								</button>
							</div>
						</div>
					) : (
						<div className="grid gap-4">
							{savedSets.map((set) => (
								<div
									key={set.id}
									className="card hover:shadow-md transition-shadow"
								>
									<div className="flex items-start justify-between mb-3">
										<div className="flex-1">
											<h3 className="font-semibold text-gray-900">
												{set.name}
											</h3>
											{set.description && (
												<p className="text-sm text-gray-600 mt-1">
													{set.description}
												</p>
											)}
											<div className="flex gap-2 mt-2 flex-wrap">
												{set.topic && (
													<span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
														{set.topic}
													</span>
												)}
												{set.contentType && (
													<span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded capitalize">
														{set.contentType}
													</span>
												)}
												{set.targetAudience && (
													<span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
														{set.targetAudience}
													</span>
												)}
											</div>
										</div>
										<button
											onClick={() => handleDeleteSet(set.id)}
											disabled={deletingId === set.id}
											className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
										>
											<Trash2 className="w-5 h-5" />
										</button>
									</div>

									<div className="space-y-2 mb-4">
										{set.hashtags.primary &&
											set.hashtags.primary.length > 0 && (
												<div>
													<p className="text-xs font-semibold text-gray-500 mb-1">
														PRIMARY
													</p>
													<div className="flex flex-wrap gap-1">
														{set.hashtags.primary.slice(0, 5).map((tag, i) => (
															<span
																key={i}
																className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded"
															>
																{tag}
															</span>
														))}
														{set.hashtags.primary.length > 5 && (
															<span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
																+{set.hashtags.primary.length - 5} more
															</span>
														)}
													</div>
												</div>
											)}
									</div>

									<button
										onClick={() => {
											const allHashtags = [
												...set.hashtags.primary,
												...set.hashtags.secondary,
												...set.hashtags.niche,
											].join(" ");
											copyToClipboard(allHashtags, `copy-${set.id}`);
										}}
										className="btn btn-secondary w-full flex items-center justify-center gap-2"
									>
										<Copy className="w-4 h-4" />
										Copy All Hashtags
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
