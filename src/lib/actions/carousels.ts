"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generate } from "@/lib/ai";
import {
	buildCarouselRepurposePrompt,
	type CarouselRepurposeInput,
	type CarouselRepurposeOutput,
	type SourceContentType,
	CAROUSEL_REPURPOSE_SYSTEM_PROMPT,
	CAROUSEL_REPURPOSE_CONFIG,
} from "@/lib/ai/prompts/carousel-repurpose";
import { parseJSONResponse } from "@/lib/ai";

// Type for carousel generation input
export interface RepurposeContentInput {
	sourceContent: string;
	sourceType: SourceContentType;
	slideCount: number;
	pillarId: string;
}

// Helper to verify user owns the pillar
async function verifyPillarOwnership(
	pillarId: string,
	userId: string,
): Promise<boolean> {
	const pillar = await prisma.pillar.findFirst({
		where: {
			id: pillarId,
			account: {
				userId: userId,
			},
		},
	});
	return !!pillar;
}

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
	const session = await auth();
	return session?.user?.id ?? null;
}

/**
 * Repurpose content into a carousel using AI
 */
export async function repurposeContent(input: RepurposeContentInput): Promise<{
	success: boolean;
	carousel?: CarouselRepurposeOutput;
	error?: string;
}> {
	const userId = await getCurrentUserId();
	if (!userId) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		// Verify ownership of pillar
		const ownsPllar = await verifyPillarOwnership(input.pillarId, userId);
		if (!ownsPllar) {
			return {
				success: false,
				error: "Unauthorized: You do not own this pillar",
			};
		}

		// Validate input
		if (!input.sourceContent?.trim()) {
			return { success: false, error: "Source content is required" };
		}

		if (input.slideCount < 5 || input.slideCount > 10) {
			return { success: false, error: "Slide count must be between 5 and 10" };
		}

		// Get pillar info for context
		const pillar = await prisma.pillar.findUnique({
			where: { id: input.pillarId },
			select: { name: true, description: true },
		});

		if (!pillar) {
			return { success: false, error: "Pillar not found" };
		}

		// Build the prompt
		const carouselPrompt: CarouselRepurposeInput = {
			content: input.sourceContent,
			sourceType: input.sourceType,
			outputFormat: "carousel",
			niche: pillar.description || undefined,
			slideCount: input.slideCount,
		};

		const prompt = buildCarouselRepurposePrompt(carouselPrompt);

		// Call AI service
		const aiResponse = await generate({
			prompt,
			systemPrompt: CAROUSEL_REPURPOSE_SYSTEM_PROMPT,
			maxTokens: CAROUSEL_REPURPOSE_CONFIG.maxTokens,
			temperature: CAROUSEL_REPURPOSE_CONFIG.temperature,
		});

		// Parse the response
		const parsedResponse = parseJSONResponse<CarouselRepurposeOutput>(
			aiResponse.content,
		);

		if (!parsedResponse || !parsedResponse.carousel) {
			return {
				success: false,
				error: "Failed to parse AI response. Please try again.",
			};
		}

		// Log the prompt run
		await prisma.promptRun.create({
			data: {
				userId,
				toolName: "carousel_repurposer",
				inputParams: {
					sourceType: input.sourceType,
					slideCount: input.slideCount,
					contentLength: input.sourceContent.length,
				},
				outputData: {
					slideCount: parsedResponse.carousel.slides.length,
				},
				model: aiResponse.model,
				promptTokens: aiResponse.promptTokens,
				completionTokens: aiResponse.completionTokens,
				latencyMs: 0, // Would be calculated in a real scenario
				cost: 0, // Would be calculated based on token usage
				status: "SUCCESS",
			},
		});

		return { success: true, carousel: parsedResponse };
	} catch (error) {
		console.error("Error repurposing content:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to repurpose content";
		return { success: false, error: errorMessage };
	}
}

/**
 * Save a carousel to the library as an Idea
 */
export async function saveCarouselToLibrary(
	carousel: CarouselRepurposeOutput,
	pillarId: string,
	title: string,
): Promise<{
	success: boolean;
	ideaId?: string;
	error?: string;
}> {
	const userId = await getCurrentUserId();
	if (!userId) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		// Verify ownership
		const ownsPllar = await verifyPillarOwnership(pillarId, userId);
		if (!ownsPllar) {
			return {
				success: false,
				error: "Unauthorized: You do not own this pillar",
			};
		}

		// Validate carousel
		if (!carousel.carousel || carousel.carousel.slides.length === 0) {
			return { success: false, error: "Invalid carousel data" };
		}

		// Create idea with carousel data
		const idea = await prisma.idea.create({
			data: {
				pillarId,
				title: title || `Carousel - ${new Date().toLocaleDateString()}`,
				contentType: "CAROUSEL",
				status: "GENERATED",
				caption: carousel.carousel.caption,
				slides: carousel.carousel.slides as any,
				hashtags: [],
				hooks: [],
				keywords: [],
			},
		});

		revalidatePath("/dashboard/library");
		return { success: true, ideaId: idea.id };
	} catch (error) {
		console.error("Error saving carousel:", error);
		return { success: false, error: "Failed to save carousel" };
	}
}

/**
 * Get recent carousel history for the user
 */
export async function getCarouselHistory(
	accountId: string,
	limit: number = 10,
): Promise<{
	success: boolean;
	carousels?: {
		id: string;
		title: string;
		pillarName: string;
		slideCount: number;
		createdAt: Date;
	}[];
	error?: string;
}> {
	const userId = await getCurrentUserId();
	if (!userId) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		// Verify account ownership
		const account = await prisma.instagramAccount.findFirst({
			where: {
				id: accountId,
				userId,
			},
		});

		if (!account) {
			return {
				success: false,
				error: "Unauthorized: You do not own this account",
			};
		}

		// Get carousel ideas for this account's pillars
		const carousels = await prisma.idea.findMany({
			where: {
				contentType: "CAROUSEL",
				pillar: {
					accountId,
				},
			},
			include: {
				pillar: {
					select: {
						name: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
			take: limit,
		});

		const formattedCarousels = carousels.map((carousel) => ({
			id: carousel.id,
			title: carousel.title,
			pillarName: carousel.pillar.name,
			slideCount: carousel.slides
				? (carousel.slides as { slideNumber: number }[]).length
				: 0,
			createdAt: carousel.createdAt,
		}));

		return { success: true, carousels: formattedCarousels };
	} catch (error) {
		console.error("Error fetching carousel history:", error);
		return { success: false, error: "Failed to fetch carousel history" };
	}
}
