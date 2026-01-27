"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
	RefreshCw,
	Layers,
	Copy,
	Check,
	ChevronLeft,
	ChevronRight,
	FileText,
	Sparkles,
	Loader2,
	AlertCircle,
	Save,
	History,
} from "lucide-react";
import type {
	SourceContentType,
	CarouselRepurposeOutput,
	CarouselSlide,
} from "@/lib/ai/prompts/carousel-repurpose";
import {
	repurposeContent,
	saveCarouselToLibrary,
	getCarouselHistory,
} from "@/lib/actions/carousels";

interface Pillar {
	id: string;
	name: string;
	color: string | null;
	emoji: string | null;
}

interface CarouselHistory {
	id: string;
	title: string;
	pillarName: string;
	slideCount: number;
	createdAt: Date;
}

const SOURCE_TYPE_OPTIONS: { value: SourceContentType; label: string }[] = [
	{ value: "blogPost", label: "Blog Post" },
	{ value: "thread", label: "Twitter/X Thread" },
	{ value: "video", label: "Video Transcript" },
	{ value: "newsletter", label: "Newsletter" },
	{ value: "podcast", label: "Podcast" },
	{ value: "other", label: "Other Content" },
];

interface CarouselsClientProps {
	accountId: string;
	pillars: Pillar[];
}

export default function CarouselsClient({
	accountId,
	pillars,
}: CarouselsClientProps) {
	// Form state
	const [sourceContent, setSourceContent] = useState("");
	const [sourceType, setSourceType] = useState<SourceContentType>("blogPost");
	const [slideCount, setSlideCount] = useState(7);
	const [selectedPillarId, setSelectedPillarId] = useState(
		pillars[0]?.id || "",
	);

	// UI state
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationError, setGenerationError] = useState<string | null>(null);
	const [carousel, setCarousel] = useState<CarouselRepurposeOutput | null>(
		null,
	);
	const [currentSlide, setCurrentSlide] = useState(0);
	const [copiedItem, setCopiedItem] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [history, setHistory] = useState<CarouselHistory[]>([]);
	const [isLoadingHistory, setIsLoadingHistory] = useState(false);
	const [showHistory, setShowHistory] = useState(false);

	// Load history on mount
	useEffect(() => {
		loadHistory();
	}, []);

	const loadHistory = async () => {
		setIsLoadingHistory(true);
		const result = await getCarouselHistory(accountId, 5);
		if (result.success && result.carousels) {
			setHistory(result.carousels);
		}
		setIsLoadingHistory(false);
	};

	const handleGenerate = async () => {
		if (!sourceContent.trim()) {
			toast.error("Please enter content to repurpose");
			return;
		}

		if (!selectedPillarId) {
			toast.error("Please select a pillar");
			return;
		}

		setIsGenerating(true);
		setGenerationError(null);
		setCarousel(null);

		try {
			const result = await repurposeContent({
				sourceContent,
				sourceType,
				slideCount,
				pillarId: selectedPillarId,
			});

			if (!result.success) {
				setGenerationError(result.error || "Failed to generate carousel");
				toast.error(result.error || "Failed to generate carousel");
			} else if (result.carousel) {
				setCarousel(result.carousel);
				setCurrentSlide(0);
				toast.success("Carousel generated successfully!");
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to generate carousel";
			setGenerationError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleSaveToLibrary = async () => {
		if (!carousel || !carousel.carousel) {
			toast.error("No carousel to save");
			return;
		}

		setIsSaving(true);
		try {
			const result = await saveCarouselToLibrary(
				carousel,
				selectedPillarId,
				`Carousel - ${new Date().toLocaleDateString()}`,
			);

			if (!result.success) {
				toast.error(result.error || "Failed to save carousel");
			} else {
				toast.success("Carousel saved to library!");
				await loadHistory();
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to save carousel";
			toast.error(errorMessage);
		} finally {
			setIsSaving(false);
		}
	};

	const copyToClipboard = async (text: string, itemId: string) => {
		await navigator.clipboard.writeText(text);
		setCopiedItem(itemId);
		toast.success("Copied to clipboard!");
		setTimeout(() => setCopiedItem(null), 2000);
	};

	const copyAllSlides = () => {
		if (!carousel?.carousel) return;
		const allText = carousel.carousel.slides
			.map(
				(slide: CarouselSlide) =>
					`Slide ${slide.slideNumber}: ${slide.headline}\n${slide.body}${slide.visualSuggestion ? `\nVisual: ${slide.visualSuggestion}` : ""}`,
			)
			.join("\n\n");
		copyToClipboard(allText, "all-slides");
	};

	const copyCaption = () => {
		if (!carousel?.carousel?.caption) return;
		copyToClipboard(carousel.carousel.caption, "caption");
	};

	return (
		<div className="max-w-6xl mx-auto">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-2">
					<div className="w-10 h-10 bg-gradient-to-br from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
						<RefreshCw className="w-5 h-5 text-white" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900">
						Carousel Repurposer
					</h1>
				</div>
				<p className="text-gray-600">
					Transform your content into engaging carousel slides with AI.
				</p>
			</div>

			<div className="grid lg:grid-cols-2 gap-6">
				{/* Input Section */}
				<div className="card">
					<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<FileText className="w-5 h-5 text-gray-500" />
						Your Content
					</h2>

					{/* Source Type */}
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Source Type
						</label>
						<select
							value={sourceType}
							onChange={(e) =>
								setSourceType(e.target.value as SourceContentType)
							}
							className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent"
						>
							{SOURCE_TYPE_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>

					{/* Content Textarea */}
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Content to Repurpose
						</label>
						<textarea
							value={sourceContent}
							onChange={(e) => setSourceContent(e.target.value)}
							placeholder="Paste your blog post, tweet thread, article, or any content here..."
							className="w-full h-64 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent text-gray-900 placeholder:text-gray-400"
						/>
						<p className="mt-2 text-xs text-gray-500">
							{sourceContent.length} characters
						</p>
					</div>

					{/* Pillar Selection */}
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Content Pillar
						</label>
						<select
							value={selectedPillarId}
							onChange={(e) => setSelectedPillarId(e.target.value)}
							className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent"
						>
							{pillars.map((pillar) => (
								<option key={pillar.id} value={pillar.id}>
									{pillar.emoji} {pillar.name}
								</option>
							))}
						</select>
					</div>

					{/* Slide Count */}
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Number of Slides: {slideCount}
						</label>
						<input
							type="range"
							min="5"
							max="10"
							value={slideCount}
							onChange={(e) => setSlideCount(parseInt(e.target.value))}
							className="w-full"
						/>
						<p className="mt-1 text-xs text-gray-500">
							Recommended: 7-9 slides for best engagement
						</p>
					</div>

					{/* Error Message */}
					{generationError && (
						<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
							<AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
							<div className="flex-1">
								<p className="text-sm text-red-700">{generationError}</p>
							</div>
						</div>
					)}

					{/* Generate Button */}
					<button
						onClick={handleGenerate}
						disabled={
							!sourceContent.trim() || !selectedPillarId || isGenerating
						}
						className="btn btn-gradient w-full disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isGenerating ? (
							<>
								<Loader2 className="w-5 h-5 mr-2 animate-spin" />
								Generating...
							</>
						) : (
							<>
								<Sparkles className="w-5 h-5 mr-2" />
								Generate Carousel
							</>
						)}
					</button>
				</div>

				{/* Output Section */}
				<div className="card">
					{!carousel ? (
						<div className="h-full flex flex-col items-center justify-center text-center py-12">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
								<Layers className="w-8 h-8 text-gray-400" />
							</div>
							<h3 className="text-lg font-semibold text-gray-700 mb-2">
								No Carousel Yet
							</h3>
							<p className="text-gray-500 max-w-sm">
								Generate a carousel by filling in your content details on the
								left and clicking "Generate Carousel".
							</p>
						</div>
					) : (
						carousel.carousel && (
							<>
								{/* Copy All Buttons */}
								<div className="flex gap-2 mb-6">
									<button
										onClick={copyAllSlides}
										className="btn btn-secondary btn-sm flex items-center gap-2"
									>
										{copiedItem === "all-slides" ? (
											<>
												<Check className="w-4 h-4 text-green-600" />
												Copied!
											</>
										) : (
											<>
												<Copy className="w-4 h-4" />
												Copy All Slides
											</>
										)}
									</button>
									<button
										onClick={copyCaption}
										className="btn btn-secondary btn-sm flex items-center gap-2"
									>
										{copiedItem === "caption" ? (
											<>
												<Check className="w-4 h-4 text-green-600" />
												Copied!
											</>
										) : (
											<>
												<Copy className="w-4 h-4" />
												Copy Caption
											</>
										)}
									</button>
									<button
										onClick={handleSaveToLibrary}
										disabled={isSaving}
										className="btn btn-secondary btn-sm flex items-center gap-2 disabled:opacity-50"
									>
										{isSaving ? (
											<>
												<Loader2 className="w-4 h-4 animate-spin" />
												Saving...
											</>
										) : (
											<>
												<Save className="w-4 h-4" />
												Save to Library
											</>
										)}
									</button>
								</div>

								{/* Slide Preview */}
								<div className="relative">
									{/* Slide Card - 1:1 ratio */}
									<div className="aspect-square bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-2xl p-6 flex flex-col justify-center text-white relative overflow-hidden">
										{/* Decorative elements */}
										<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
										<div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

										{/* Slide number badge */}
										<div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
											{currentSlide + 1} /{carousel.carousel.slides.length}
										</div>

										{/* Content */}
										<div className="relative z-10">
											<h3 className="text-xl md:text-2xl font-bold mb-4 leading-tight">
												{carousel.carousel.slides[currentSlide].headline}
											</h3>
											<p className="text-sm md:text-base mb-4">
												{carousel.carousel.slides[currentSlide].body}
											</p>
											{carousel.carousel.slides[currentSlide]
												.visualSuggestion && (
												<div className="pt-4 border-t border-white/20">
													<p className="text-xs opacity-90">
														Visual:
														{
															carousel.carousel.slides[currentSlide]
																.visualSuggestion
														}
													</p>
												</div>
											)}
										</div>
									</div>

									{/* Navigation */}
									<div className="flex items-center justify-between mt-4">
										<button
											onClick={() =>
												setCurrentSlide((prev) => Math.max(0, prev - 1))
											}
											disabled={currentSlide === 0}
											className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										>
											<ChevronLeft className="w-5 h-5 text-gray-700" />
										</button>

										{/* Slide dots */}
										<div className="flex gap-1.5">
											{carousel.carousel.slides.map((_, i) => (
												<button
													key={i}
													onClick={() => setCurrentSlide(i)}
													className={`w-2 h-2 rounded-full transition-colors ${
														i === currentSlide
															? "bg-ig-gradient"
															: "bg-gray-300"
													}`}
												/>
											))}
										</div>

										<button
											onClick={() =>
												setCurrentSlide((prev) =>
													Math.min(
														carousel.carousel!.slides.length - 1,
														prev + 1,
													),
												)
											}
											disabled={
												currentSlide === carousel.carousel!.slides.length - 1
											}
											className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										>
											<ChevronRight className="w-5 h-5 text-gray-700" />
										</button>
									</div>

									{/* Copy individual slide */}
									<button
										onClick={() => {
											const slide = carousel.carousel!.slides[currentSlide];
											const text = `${slide.headline}\n\n${slide.body}${slide.visualSuggestion ? `\n\nVisual: ${slide.visualSuggestion}` : ""}`;
											copyToClipboard(text, `slide-${currentSlide}`);
										}}
										className="btn btn-outline btn-sm w-full mt-4 flex items-center justify-center gap-2"
									>
										{copiedItem === `slide-${currentSlide}` ? (
											<>
												<Check className="w-4 h-4 text-green-600" />
												Slide Copied!
											</>
										) : (
											<>
												<Copy className="w-4 h-4" />
												Copy This Slide
											</>
										)}
									</button>
								</div>

								{/* Caption Section */}
								<div className="mt-6 pt-6 border-t border-gray-200">
									<h4 className="font-semibold text-gray-900 mb-3">
										Post Caption
									</h4>
									<p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
										{carousel.carousel.caption}
									</p>
								</div>
							</>
						)
					)}
				</div>
			</div>

			{/* History Section */}
			<div className="mt-8">
				<button
					onClick={() => setShowHistory(!showHistory)}
					className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4"
				>
					<History className="w-5 h-5" />
					Recent Carousels {showHistory && "▼"}
				</button>

				{showHistory && (
					<div className="card">
						{isLoadingHistory ? (
							<div className="text-center py-8">
								<Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400 mb-2" />
								<p className="text-gray-500">Loading history...</p>
							</div>
						) : history.length === 0 ? (
							<div className="text-center py-8 text-gray-500">
								<p>No carousels generated yet</p>
							</div>
						) : (
							<div className="space-y-3">
								{history.map((item) => (
									<div
										key={item.id}
										className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
									>
										<div className="flex-1">
											<h4 className="font-medium text-gray-900">
												{item.title}
											</h4>
											<p className="text-sm text-gray-600">
												{item.pillarName} • {item.slideCount} slides •{" "}
												{new Date(item.createdAt).toLocaleDateString()}
											</p>
										</div>
										<a
											href={`/dashboard/library?idea=${item.id}`}
											className="text-sm text-[var(--gradient-mid)] hover:underline"
										>
											View
										</a>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Tips Section */}
			<div className="card mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
				<h3 className="font-semibold text-gray-900 mb-3">
					Pro Tips for Better Results
				</h3>
				<ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
					<li className="flex items-start gap-2">
						<span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
						Use clear, well-structured content with main points
					</li>
					<li className="flex items-start gap-2">
						<span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
						7-9 slides work best for engagement
					</li>
					<li className="flex items-start gap-2">
						<span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
						Include your pillar description for context
					</li>
					<li className="flex items-start gap-2">
						<span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
						Longer content (500+ words) produces better carousels
					</li>
				</ul>
			</div>
		</div>
	);
}
