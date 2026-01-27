"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generate } from "@/lib/ai";
import {
	buildCaptionWriterPrompt,
	CAPTION_WRITER_SYSTEM_PROMPT,
	CAPTION_WRITER_CONFIG,
	type CaptionWriterInput,
	type GeneratedCaption,
	type CaptionWriterOutput,
} from "@/lib/ai/prompts/caption-writer";
import { parseJSONResponse } from "@/lib/ai";
import type { Idea } from "@prisma/client";

/**
 * Generate captions using AI
 */
export async function generateCaption(input: CaptionWriterInput): Promise<{
	success: boolean;
	captions?: GeneratedCaption[];
	error?: string;
}> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		// Build the prompt
		const userPrompt = buildCaptionWriterPrompt(input);

		// Call the AI service
		const response = await generate({
			prompt: userPrompt,
			systemPrompt: CAPTION_WRITER_SYSTEM_PROMPT,
			maxTokens: CAPTION_WRITER_CONFIG.maxTokens,
			temperature: CAPTION_WRITER_CONFIG.temperature,
		});

		// Parse the JSON response
		const parsed = parseJSONResponse<CaptionWriterOutput>(response.content);

		if (!parsed || !parsed.captions || parsed.captions.length === 0) {
			console.error("Invalid caption response format:", response.content);
			return { success: false, error: "Failed to parse generated captions" };
		}

		// Log the prompt run for analytics
		await prisma.promptRun.create({
			data: {
				userId: session.user.id,
				toolName: "caption_writer",
				inputParams: JSON.parse(JSON.stringify(input)),
				outputData: JSON.parse(JSON.stringify(parsed)),
				model: response.model,
				promptTokens: response.promptTokens,
				completionTokens: response.completionTokens,
				latencyMs: 0, // Would need to track timing separately
				cost: 0, // Would need to calculate based on token counts
				status: "SUCCESS",
			},
		});

		return { success: true, captions: parsed.captions };
	} catch (error) {
		console.error("Error generating captions:", error);

		const errorMessage =
			error instanceof Error ? error.message : "Failed to generate captions";

		return { success: false, error: errorMessage };
	}
}

/**
 * Save a caption to the library as an Idea
 */
export async function saveCaptionToLibrary(
	pillarId: string,
	caption: GeneratedCaption,
	topic: string,
): Promise<{ success: boolean; idea?: Idea; error?: string }> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		// Verify the pillar belongs to the user
		const pillar = await prisma.pillar.findFirst({
			where: {
				id: pillarId,
				account: {
					userId: session.user.id,
				},
			},
		});

		if (!pillar) {
			return { success: false, error: "Pillar not found or unauthorized" };
		}

		// Combine caption parts into full caption
		const fullCaption = `${caption.hook}\n\n${caption.body}\n\n${caption.cta}`;

		// Create the idea
		const idea = await prisma.idea.create({
			data: {
				pillarId,
				title: topic.substring(0, 100),
				description: topic,
				contentType: "SINGLE_IMAGE",
				status: "GENERATED",
				caption: fullCaption,
				hooks: [caption.hook],
				hashtags: [],
				keywords: [],
			},
		});

		return { success: true, idea };
	} catch (error) {
		console.error("Error saving caption to library:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to save caption";
		return { success: false, error: errorMessage };
	}
}

/**
 * Get recent captions generated for a user
 */
export async function getCaptionHistory(
	limit: number = 10,
): Promise<{ success: boolean; ideas?: Idea[]; error?: string }> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		// Get the user's account
		const account = await prisma.instagramAccount.findFirst({
			where: { userId: session.user.id, isActive: true },
		});

		if (!account) {
			return { success: false, error: "No active Instagram account" };
		}

		// Get recent ideas with captions
		const ideas = await prisma.idea.findMany({
			where: {
				pillar: {
					accountId: account.id,
				},
				caption: {
					not: null,
				},
				contentType: "SINGLE_IMAGE",
			},
			orderBy: { createdAt: "desc" },
			take: limit,
		});

		return { success: true, ideas };
	} catch (error) {
		console.error("Error fetching caption history:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to fetch caption history";
		return { success: false, error: errorMessage };
	}
}

/**
 * Get captions for a specific pillar (for the dashboard)
 */
export async function getCaptionsForPillar(
	pillarId: string,
	limit: number = 5,
): Promise<{ success: boolean; ideas?: Idea[]; error?: string }> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		// Verify access to pillar
		const pillar = await prisma.pillar.findFirst({
			where: {
				id: pillarId,
				account: {
					userId: session.user.id,
				},
			},
		});

		if (!pillar) {
			return { success: false, error: "Pillar not found or unauthorized" };
		}

		// Get recent captions for this pillar
		const ideas = await prisma.idea.findMany({
			where: {
				pillarId,
				caption: {
					not: null,
				},
				contentType: "SINGLE_IMAGE",
			},
			orderBy: { createdAt: "desc" },
			take: limit,
		});

		return { success: true, ideas };
	} catch (error) {
		console.error("Error fetching captions for pillar:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch captions";
		return { success: false, error: errorMessage };
	}
}
