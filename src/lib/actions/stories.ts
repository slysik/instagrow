"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generate } from "@/lib/ai";
import {
	buildStoryPromptsPrompt,
	STORY_PROMPTS_SYSTEM_PROMPT,
	STORY_PROMPTS_CONFIG,
	type StoryPromptsInput,
	type StorySequence,
	type StoryPromptsOutput,
} from "@/lib/ai/prompts/story-prompts";
import { parseJSONResponse } from "@/lib/ai";
import type { Idea } from "@prisma/client";

/**
 * Generate story prompts using AI
 */
export async function generateStoryPrompts(
	pillarId: string,
	goal: "engagement" | "dm" | "traffic" | "sales" | "community",
	storyType:
		| "daily"
		| "dm-day"
		| "engagement-boost"
		| "launch"
		| "behind-scenes" = "daily",
	count: number = 3,
): Promise<{
	success: boolean;
	sequences?: StorySequence[];
	error?: string;
}> {
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
			include: {
				account: true,
			},
		});

		if (!pillar) {
			return { success: false, error: "Pillar not found or unauthorized" };
		}

		// Ensure count is between 1 and 5
		const normalizedCount = Math.max(1, Math.min(count, 5));

		// Build the prompt
		const input: StoryPromptsInput = {
			niche: pillar.name,
			goal,
			storyType,
			count: normalizedCount,
		};

		const userPrompt = buildStoryPromptsPrompt(input);

		// Call the AI service
		const response = await generate({
			prompt: userPrompt,
			systemPrompt: STORY_PROMPTS_SYSTEM_PROMPT,
			maxTokens: STORY_PROMPTS_CONFIG.maxTokens,
			temperature: STORY_PROMPTS_CONFIG.temperature,
		});

		// Parse the JSON response
		const parsed = parseJSONResponse<StoryPromptsOutput>(response.content);

		if (!parsed || !parsed.sequences || parsed.sequences.length === 0) {
			console.error("Invalid story prompts response format:", response.content);
			return {
				success: false,
				error: "Failed to parse generated story prompts",
			};
		}

		// Log the prompt run for analytics
		await prisma.promptRun.create({
			data: {
				userId: session.user.id,
				toolName: "story_prompts",
				inputParams: input as any,
				outputData: parsed as any,
				model: response.model,
				promptTokens: response.promptTokens,
				completionTokens: response.completionTokens,
				latencyMs: 0,
				cost: 0,
				status: "SUCCESS",
			},
		});

		return { success: true, sequences: parsed.sequences };
	} catch (error) {
		console.error("Error generating story prompts:", error);

		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to generate story prompts";

		return { success: false, error: errorMessage };
	}
}

/**
 * Save a story sequence to the library as an Idea
 */
export async function saveStoryPromptToLibrary(
	pillarId: string,
	sequence: StorySequence,
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

		// Create the idea with story frames
		const idea = await prisma.idea.create({
			data: {
				pillarId,
				title: sequence.title.substring(0, 100),
				description: sequence.description,
				contentType: "STORY",
				status: "GENERATED",
				frames: sequence.frames as any,
				hashtags: [],
				keywords: [],
			},
		});

		return { success: true, idea };
	} catch (error) {
		console.error("Error saving story prompt to library:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to save story prompt";
		return { success: false, error: errorMessage };
	}
}

/**
 * Get recent story prompts generated for a user
 */
export async function getStoryHistory(
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

		// Get recent story ideas
		const ideas = await prisma.idea.findMany({
			where: {
				pillar: {
					accountId: account.id,
				},
				contentType: "STORY",
			},
			orderBy: { createdAt: "desc" },
			take: limit,
			include: {
				pillar: {
					select: {
						id: true,
						name: true,
						color: true,
						emoji: true,
					},
				},
			},
		});

		return { success: true, ideas };
	} catch (error) {
		console.error("Error fetching story history:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch story history";
		return { success: false, error: errorMessage };
	}
}

/**
 * Get stories for a specific pillar
 */
export async function getStoriesForPillar(
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

		// Get recent stories for this pillar
		const ideas = await prisma.idea.findMany({
			where: {
				pillarId,
				contentType: "STORY",
			},
			orderBy: { createdAt: "desc" },
			take: limit,
			include: {
				pillar: {
					select: {
						id: true,
						name: true,
						color: true,
						emoji: true,
					},
				},
			},
		});

		return { success: true, ideas };
	} catch (error) {
		console.error("Error fetching stories for pillar:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch stories";
		return { success: false, error: errorMessage };
	}
}
