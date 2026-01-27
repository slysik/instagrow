"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generate } from "@/lib/ai";
import {
	buildReelScriptPrompt,
	parseReelScriptResponse,
	REEL_SCRIPT_SYSTEM_PROMPT,
	REEL_SCRIPT_CONFIG,
	type ReelScriptInput,
	type ReelScript,
} from "@/lib/ai/prompts/reel-script";
import { revalidatePath } from "next/cache";

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
	const session = await auth();
	return session?.user?.id ?? null;
}

// Helper to verify pillar ownership
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

/**
 * Generate a reel script using AI
 * Creates an Idea record with the generated script
 */
export async function generateReelScript(
	pillarId: string,
	input: ReelScriptInput,
): Promise<{
	script: ReelScript;
	ideaId: string;
}> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	// Verify pillar ownership
	const ownsPillar = await verifyPillarOwnership(pillarId, userId);
	if (!ownsPillar) {
		throw new Error("Unauthorized: You do not own this pillar");
	}

	// Build the prompt
	const userPrompt = buildReelScriptPrompt(input);

	// Generate content using AI
	const response = await generate({
		prompt: userPrompt,
		systemPrompt: REEL_SCRIPT_SYSTEM_PROMPT,
		maxTokens: REEL_SCRIPT_CONFIG.maxTokens,
		temperature: REEL_SCRIPT_CONFIG.temperature,
	});

	// Parse the response
	const script = parseReelScriptResponse(response.content);
	if (!script) {
		throw new Error(
			"Failed to parse AI response. Please try again with different parameters.",
		);
	}

	// Create an Idea record in the database
	const idea = await prisma.idea.create({
		data: {
			pillarId,
			title: input.topic,
			description: `${input.style} ${input.duration}s reel`,
			contentType: "REEL",
			status: "GENERATED",
			script: script as unknown as object, // Store the full script as JSON
			caption: script.caption,
			hashtags: script.hashtags,
		},
	});

	revalidatePath("/dashboard/reels");

	return {
		script,
		ideaId: idea.id,
	};
}

/**
 * Save a reel script to the library
 * Updates the Idea record with DRAFT status
 */
export async function saveScriptToLibrary(ideaId: string): Promise<void> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	// Get the idea and verify ownership
	const idea = await prisma.idea.findUnique({
		where: { id: ideaId },
		include: {
			pillar: {
				include: {
					account: {
						select: { userId: true },
					},
				},
			},
		},
	});

	if (!idea) {
		throw new Error("Idea not found");
	}

	if (idea.pillar.account.userId !== userId) {
		throw new Error("Unauthorized: You do not own this idea");
	}

	// Update the status to DRAFT
	await prisma.idea.update({
		where: { id: ideaId },
		data: {
			status: "DRAFT",
		},
	});

	revalidatePath("/dashboard/reels");
	revalidatePath("/dashboard/library");
}

/**
 * Get recent generated reel scripts for a user
 */
export async function getScriptHistory(
	accountId: string,
	limit: number = 10,
): Promise<
	Array<{
		id: string;
		title: string;
		pillarName: string;
		script: ReelScript;
		createdAt: Date;
	}>
> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	// Verify account ownership
	const account = await prisma.instagramAccount.findFirst({
		where: {
			id: accountId,
			userId: userId,
		},
	});

	if (!account) {
		throw new Error("Unauthorized: You do not own this Instagram account");
	}

	// Get recent ideas from all pillars in this account
	const ideas = await prisma.idea.findMany({
		where: {
			contentType: "REEL",
			pillar: {
				accountId: accountId,
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

	return ideas
		.filter((idea) => idea.script !== null)
		.map((idea) => ({
			id: idea.id,
			title: idea.title,
			pillarName: idea.pillar.name,
			script: idea.script as unknown as ReelScript,
			createdAt: idea.createdAt,
		}));
}

/**
 * Delete a reel script from history
 */
export async function deleteReelScript(ideaId: string): Promise<void> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	// Get the idea and verify ownership
	const idea = await prisma.idea.findUnique({
		where: { id: ideaId },
		include: {
			pillar: {
				include: {
					account: {
						select: { userId: true },
					},
				},
			},
		},
	});

	if (!idea) {
		throw new Error("Idea not found");
	}

	if (idea.pillar.account.userId !== userId) {
		throw new Error("Unauthorized: You do not own this idea");
	}

	// Delete the idea
	await prisma.idea.delete({
		where: { id: ideaId },
	});

	revalidatePath("/dashboard/reels");
	revalidatePath("/dashboard/library");
}
