"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generate, parseJSONResponse } from "@/lib/ai";
import {
	buildSEOSuitePrompt,
	SEO_SUITE_SYSTEM_PROMPT,
	SEO_SUITE_CONFIG,
	type SEOSuiteInput,
	type SEOSuiteOutput,
} from "@/lib/ai/prompts/seo-suite";

// Type for saved hashtag set
export interface SavedHashtagSet {
	id: string;
	name: string;
	description?: string | null;
	topic?: string | null;
	contentType?: string | null;
	targetAudience?: string | null;
	hashtags: {
		primary: string[];
		secondary: string[];
		niche: string[];
		banned: string[];
	};
	createdAt: Date;
	updatedAt: Date;
}

// Helper to verify user owns the Instagram account
async function verifyAccountOwnership(
	accountId: string,
	userId: string,
): Promise<boolean> {
	const account = await prisma.instagramAccount.findFirst({
		where: {
			id: accountId,
			userId: userId,
		},
	});
	return !!account;
}

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
	const session = await auth();
	return session?.user?.id ?? null;
}

/**
 * Generate hashtags and SEO optimization for content
 */
export async function generateHashtags(
	accountId: string,
	input: SEOSuiteInput,
): Promise<SEOSuiteOutput> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	const ownsAccount = await verifyAccountOwnership(accountId, userId);
	if (!ownsAccount) {
		throw new Error("Unauthorized: You do not own this Instagram account");
	}

	// Validate input
	if (!input.topic || input.topic.trim().length === 0) {
		throw new Error("Topic is required");
	}

	try {
		// Build the prompt
		const prompt = buildSEOSuitePrompt(input);

		// Call AI service
		const response = await generate({
			prompt,
			systemPrompt: SEO_SUITE_SYSTEM_PROMPT,
			maxTokens: SEO_SUITE_CONFIG.maxTokens,
			temperature: SEO_SUITE_CONFIG.temperature,
		});

		// Parse the JSON response
		const parsed = parseJSONResponse<SEOSuiteOutput>(response.content);
		if (!parsed) {
			throw new Error("Failed to parse AI response");
		}

		// Validate the parsed response has required fields
		if (
			!parsed.hashtags ||
			!parsed.hashtags.primary ||
			!Array.isArray(parsed.hashtags.primary)
		) {
			throw new Error("Invalid response format from AI");
		}

		return parsed;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error("Error generating hashtags:", errorMessage);
		throw new Error(`Failed to generate hashtags: ${errorMessage}`);
	}
}

/**
 * Analyze caption for SEO optimization
 */
export async function analyzeCaption(
	accountId: string,
	caption: string,
): Promise<{
	score: number;
	suggestions: string[];
	analysis: {
		hasKeywords: boolean;
		hashtag_count: number;
		word_count: number;
		readability: string;
	};
}> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	const ownsAccount = await verifyAccountOwnership(accountId, userId);
	if (!ownsAccount) {
		throw new Error("Unauthorized: You do not own this Instagram account");
	}

	if (!caption || caption.trim().length === 0) {
		throw new Error("Caption is required");
	}

	try {
		// Count hashtags in caption
		const hashtagMatches = caption.match(/#[\w]+/g) || [];
		const hashtagCount = hashtagMatches.length;

		// Count words
		const wordCount = caption.trim().split(/\s+/).length;

		// Simple readability analysis (check for line breaks and punctuation variety)
		const hasLineBreaks = caption.includes("\n");
		const punctuationVariety = new Set(caption.match(/[.!?;,]/g) || []).size;
		const readability =
			wordCount > 150 && hasLineBreaks && punctuationVariety >= 2
				? "good"
				: "needs-improvement";

		// Basic scoring logic
		let score = 50; // Base score

		// Hashtag score (ideal: 10-30 hashtags)
		if (hashtagCount >= 10 && hashtagCount <= 30) {
			score += 20;
		} else if (hashtagCount > 0) {
			score += 10;
		}

		// Word count (longer captions perform better)
		if (wordCount > 150) {
			score += 15;
		} else if (wordCount > 50) {
			score += 10;
		}

		// Formatting
		if (hasLineBreaks) {
			score += 10;
		}

		// Punctuation variety
		if (punctuationVariety >= 2) {
			score += 5;
		}

		// Generate suggestions
		const suggestions: string[] = [];
		if (hashtagCount < 10) {
			suggestions.push("Add more hashtags (aim for 10-30)");
		}
		if (hashtagCount > 30) {
			suggestions.push("Consider reducing hashtags to avoid appearing spammy");
		}
		if (wordCount < 50) {
			suggestions.push("Add more descriptive text to engage your audience");
		}
		if (!hasLineBreaks) {
			suggestions.push(
				"Add line breaks to improve readability and visual appeal",
			);
		}
		if (!caption.includes("?")) {
			suggestions.push("Consider adding a question to encourage engagement");
		}

		return {
			score: Math.min(100, score),
			suggestions,
			analysis: {
				hasKeywords: true,
				hashtag_count: hashtagCount,
				word_count: wordCount,
				readability,
			},
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error("Error analyzing caption:", errorMessage);
		throw new Error(`Failed to analyze caption: ${errorMessage}`);
	}
}

/**
 * Save a hashtag set for reuse
 */
export async function saveHashtagSet(
	accountId: string,
	data: {
		name: string;
		description?: string;
		topic?: string;
		contentType?: string;
		targetAudience?: string;
		hashtags: {
			primary: string[];
			secondary: string[];
			niche: string[];
			banned: string[];
		};
	},
): Promise<SavedHashtagSet> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	const ownsAccount = await verifyAccountOwnership(accountId, userId);
	if (!ownsAccount) {
		throw new Error("Unauthorized: You do not own this Instagram account");
	}

	// Validate name
	if (!data.name || data.name.trim().length === 0) {
		throw new Error("Hashtag set name is required");
	}

	if (data.name.length > 100) {
		throw new Error("Name must be less than 100 characters");
	}

	// Validate hashtags object has required fields
	if (!data.hashtags || typeof data.hashtags !== "object") {
		throw new Error("Hashtags object is required");
	}

	try {
		const hashtagSet = await prisma.hashtagSet.create({
			data: {
				accountId,
				name: data.name.trim(),
				description: data.description?.trim() || null,
				topic: data.topic || null,
				contentType: data.contentType || null,
				targetAudience: data.targetAudience || null,
				hashtags: data.hashtags,
			},
		});

		revalidatePath("/dashboard/seo-suite");

		return {
			id: hashtagSet.id,
			name: hashtagSet.name,
			description: hashtagSet.description,
			topic: hashtagSet.topic,
			contentType: hashtagSet.contentType,
			targetAudience: hashtagSet.targetAudience,
			hashtags: hashtagSet.hashtags as SavedHashtagSet["hashtags"],
			createdAt: hashtagSet.createdAt,
			updatedAt: hashtagSet.updatedAt,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error("Error saving hashtag set:", errorMessage);
		throw new Error(`Failed to save hashtag set: ${errorMessage}`);
	}
}

/**
 * Get all saved hashtag sets for an account
 */
export async function getSavedHashtagSets(
	accountId: string,
): Promise<SavedHashtagSet[]> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	const ownsAccount = await verifyAccountOwnership(accountId, userId);
	if (!ownsAccount) {
		throw new Error("Unauthorized: You do not own this Instagram account");
	}

	const hashtagSets = await prisma.hashtagSet.findMany({
		where: { accountId },
		orderBy: { createdAt: "desc" },
	});

	return hashtagSets.map((set) => ({
		id: set.id,
		name: set.name,
		description: set.description,
		topic: set.topic,
		contentType: set.contentType,
		targetAudience: set.targetAudience,
		hashtags: set.hashtags as SavedHashtagSet["hashtags"],
		createdAt: set.createdAt,
		updatedAt: set.updatedAt,
	}));
}

/**
 * Delete a saved hashtag set
 */
export async function deleteHashtagSet(setId: string): Promise<void> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	// Get the hashtag set and verify ownership
	const hashtagSet = await prisma.hashtagSet.findUnique({
		where: { id: setId },
		include: {
			account: {
				select: { userId: true },
			},
		},
	});

	if (!hashtagSet) {
		throw new Error("Hashtag set not found");
	}

	if (hashtagSet.account.userId !== userId) {
		throw new Error("Unauthorized: You do not own this hashtag set");
	}

	await prisma.hashtagSet.delete({
		where: { id: setId },
	});

	revalidatePath("/dashboard/seo-suite");
}
