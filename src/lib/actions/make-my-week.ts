"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generate } from "@/lib/ai";
import { parseJSONResponse } from "@/lib/ai";
import {
	buildMakeMyWeekPrompt,
	MAKE_MY_WEEK_SYSTEM_PROMPT,
	MAKE_MY_WEEK_CONFIG,
	type MakeMyWeekInput,
	type WeeklyPlan,
	type DailyContent,
	type WeekGoal,
	type AvailableTime,
} from "@/lib/ai/prompts/make-my-week";
import type { ContentType } from "@prisma/client";

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
	const session = await auth();
	return session?.user?.id ?? null;
}

// Helper to verify account ownership
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

// Types for preferences
export interface WeeklyPlanPreferences {
	postsPerDay?: number;
	includedContentTypes?: ContentType[];
	primaryGoal?: WeekGoal;
	availableTime?: AvailableTime;
	upcomingEvents?: string;
	lastWeekPerformance?: string;
	startDate?: Date;
}

// Type for stored plan
export interface StoredWeeklyPlan {
	id: string;
	accountId: string;
	plan: WeeklyPlan;
	preferences: WeeklyPlanPreferences;
	createdAt: Date;
}

/**
 * Generate a weekly content plan using AI
 */
export async function generateWeeklyPlan(
	accountId: string,
	preferences: WeeklyPlanPreferences = {},
): Promise<{
	success: boolean;
	plan?: WeeklyPlan;
	planId?: string;
	error?: string;
}> {
	try {
		const userId = await getCurrentUserId();
		if (!userId) {
			return { success: false, error: "Unauthorized" };
		}

		const ownsAccount = await verifyAccountOwnership(accountId, userId);
		if (!ownsAccount) {
			return {
				success: false,
				error: "Unauthorized: You do not own this Instagram account",
			};
		}

		// Get account details
		const account = await prisma.instagramAccount.findUnique({
			where: { id: accountId },
			select: { igUsername: true },
		});

		if (!account) {
			return { success: false, error: "Account not found" };
		}

		// Get user's pillars
		const pillars = await prisma.pillar.findMany({
			where: { accountId },
			orderBy: { weight: "desc" },
		});

		if (pillars.length === 0) {
			return {
				success: false,
				error:
					"No content pillars found. Please create pillars first in the Pillar Builder.",
			};
		}

		// Build AI input
		const aiInput: MakeMyWeekInput = {
			niche: `Instagram creator @${account.igUsername}`,
			pillars: pillars.map((p) => ({
				name: p.name,
				description: p.description || "",
			})),
			weekGoal: preferences.primaryGoal || "balanced",
			availableTime: preferences.availableTime || "moderate",
			upcomingEvents: preferences.upcomingEvents,
			lastWeekPerformance: preferences.lastWeekPerformance,
		};

		// Generate the plan
		const prompt = buildMakeMyWeekPrompt(aiInput);
		const response = await generate({
			prompt,
			systemPrompt: MAKE_MY_WEEK_SYSTEM_PROMPT,
			maxTokens: MAKE_MY_WEEK_CONFIG.maxTokens,
			temperature: MAKE_MY_WEEK_CONFIG.temperature,
		});

		// Parse the response
		const parsed = parseJSONResponse<{ plan: WeeklyPlan }>(response.content);

		if (!parsed || !parsed.plan) {
			console.error("Invalid weekly plan response format:", response.content);
			return { success: false, error: "Failed to parse weekly plan" };
		}

		// Store the plan in PromptRun for history
		const promptRun = await prisma.promptRun.create({
			data: {
				userId,
				toolName: "make_my_week",
				inputParams: JSON.parse(JSON.stringify(preferences)),
				outputData: JSON.parse(JSON.stringify(parsed.plan)),
				model: response.model,
				promptTokens: response.promptTokens,
				completionTokens: response.completionTokens,
				latencyMs: 0,
				cost: 0,
				status: "SUCCESS",
			},
		});

		revalidatePath("/dashboard/make-my-week");

		return {
			success: true,
			plan: parsed.plan,
			planId: promptRun.id,
		};
	} catch (error) {
		console.error("Error generating weekly plan:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to generate weekly plan";
		return { success: false, error: errorMessage };
	}
}

/**
 * Apply a weekly plan to the calendar
 * Creates Idea records for each planned piece of content
 */
export async function applyWeeklyPlan(
	accountId: string,
	plan: WeeklyPlan,
	options: {
		startDate?: Date;
		generateContent?: boolean;
		selectedDays?: string[];
	} = {},
): Promise<{
	success: boolean;
	createdCount?: number;
	error?: string;
}> {
	try {
		const userId = await getCurrentUserId();
		if (!userId) {
			return { success: false, error: "Unauthorized" };
		}

		const ownsAccount = await verifyAccountOwnership(accountId, userId);
		if (!ownsAccount) {
			return {
				success: false,
				error: "Unauthorized: You do not own this Instagram account",
			};
		}

		// Get pillars to map names to IDs
		const pillars = await prisma.pillar.findMany({
			where: { accountId },
		});

		const pillarMap = new Map(pillars.map((p) => [p.name.toLowerCase(), p.id]));

		// Determine start date (default: next Monday)
		const startDate = options.startDate || getNextMonday();

		// Filter days if specified
		const daysToApply = options.selectedDays
			? plan.dailyContent.filter((dc) => options.selectedDays?.includes(dc.day))
			: plan.dailyContent;

		// Track created ideas
		let createdCount = 0;

		// Create Ideas for each day's feed post
		for (let i = 0; i < daysToApply.length; i++) {
			const dayContent = daysToApply[i];

			if (!dayContent.feedPost) continue;

			// Calculate scheduled date
			const scheduledDate = new Date(startDate);
			scheduledDate.setDate(startDate.getDate() + i);

			// Set the time based on bestTime
			const bestTime = dayContent.feedPost.bestTime || "9:00 AM";
			const [time, period] = bestTime.split(" ");
			const [hours, minutes] = time.split(":");
			let hour = parseInt(hours);
			if (period === "PM" && hour !== 12) hour += 12;
			if (period === "AM" && hour === 12) hour = 0;
			scheduledDate.setHours(hour, parseInt(minutes || "0"), 0, 0);

			// Find pillar ID
			const pillarId = pillarMap.get(dayContent.feedPost.pillar.toLowerCase());
			if (!pillarId) {
				console.warn(
					`Pillar not found for "${dayContent.feedPost.pillar}", skipping`,
				);
				continue;
			}

			// Map content type
			const contentType = mapContentType(dayContent.feedPost.type);

			// Create the idea
			await prisma.idea.create({
				data: {
					pillarId,
					title: dayContent.feedPost.topic,
					description: `${dayContent.day} - ${plan.weekTheme}`,
					contentType,
					status: "SCHEDULED",
					caption: options.generateContent ? dayContent.feedPost.caption : null,
					hashtags: dayContent.feedPost.hashtags || [],
					scheduledFor: scheduledDate,
				},
			});

			createdCount++;
		}

		revalidatePath("/dashboard/calendar");
		revalidatePath("/dashboard/make-my-week");

		return { success: true, createdCount };
	} catch (error) {
		console.error("Error applying weekly plan:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to apply weekly plan";
		return { success: false, error: errorMessage };
	}
}

/**
 * Get weekly plan history for an account
 */
export async function getWeeklyPlanHistory(
	accountId: string,
	limit: number = 10,
): Promise<{
	success: boolean;
	plans?: StoredWeeklyPlan[];
	error?: string;
}> {
	try {
		const userId = await getCurrentUserId();
		if (!userId) {
			return { success: false, error: "Unauthorized" };
		}

		const ownsAccount = await verifyAccountOwnership(accountId, userId);
		if (!ownsAccount) {
			return {
				success: false,
				error: "Unauthorized: You do not own this Instagram account",
			};
		}

		// Get recent plan generations
		const promptRuns = await prisma.promptRun.findMany({
			where: {
				userId,
				toolName: "make_my_week",
				status: "SUCCESS",
			},
			orderBy: { createdAt: "desc" },
			take: limit,
		});

		const plans: StoredWeeklyPlan[] = promptRuns.map((run) => ({
			id: run.id,
			accountId,
			plan: run.outputData as unknown as WeeklyPlan,
			preferences: run.inputParams as unknown as WeeklyPlanPreferences,
			createdAt: run.createdAt,
		}));

		return { success: true, plans };
	} catch (error) {
		console.error("Error fetching weekly plan history:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to fetch weekly plan history";
		return { success: false, error: errorMessage };
	}
}

/**
 * Regenerate content for a specific day in the plan
 */
export async function regenerateDay(
	accountId: string,
	planId: string,
	dayOfWeek: string,
): Promise<{
	success: boolean;
	updatedDay?: DailyContent;
	error?: string;
}> {
	try {
		const userId = await getCurrentUserId();
		if (!userId) {
			return { success: false, error: "Unauthorized" };
		}

		const ownsAccount = await verifyAccountOwnership(accountId, userId);
		if (!ownsAccount) {
			return {
				success: false,
				error: "Unauthorized: You do not own this Instagram account",
			};
		}

		// Get the original plan
		const promptRun = await prisma.promptRun.findUnique({
			where: { id: planId, userId, toolName: "make_my_week" },
		});

		if (!promptRun) {
			return { success: false, error: "Plan not found" };
		}

		const originalPlan = promptRun.outputData as unknown as WeeklyPlan;
		const originalPrefs =
			promptRun.inputParams as unknown as WeeklyPlanPreferences;

		// Get account details
		const account = await prisma.instagramAccount.findUnique({
			where: { id: accountId },
			select: { igUsername: true },
		});

		if (!account) {
			return { success: false, error: "Account not found" };
		}

		// Get user's pillars
		const pillars = await prisma.pillar.findMany({
			where: { accountId },
			orderBy: { weight: "desc" },
		});

		// Build AI input with focus on the specific day
		const aiInput: MakeMyWeekInput = {
			niche: `Instagram creator @${account.igUsername}`,
			pillars: pillars.map((p) => ({
				name: p.name,
				description: p.description || "",
			})),
			weekGoal: originalPrefs.primaryGoal || "balanced",
			availableTime: originalPrefs.availableTime || "moderate",
			upcomingEvents: originalPrefs.upcomingEvents,
			lastWeekPerformance: originalPrefs.lastWeekPerformance,
		};

		// Add context about regenerating a specific day
		const customPrompt = `${buildMakeMyWeekPrompt(aiInput)}

SPECIAL REQUEST: Focus on regenerating content for ${dayOfWeek} only. Provide a fresh, different take while staying aligned with the week theme "${originalPlan.weekTheme}".`;

		const response = await generate({
			prompt: customPrompt,
			systemPrompt: MAKE_MY_WEEK_SYSTEM_PROMPT,
			maxTokens: MAKE_MY_WEEK_CONFIG.maxTokens,
			temperature: MAKE_MY_WEEK_CONFIG.temperature + 0.2, // Slightly higher temperature for variety
		});

		const parsed = parseJSONResponse<{ plan: WeeklyPlan }>(response.content);

		if (!parsed || !parsed.plan || !parsed.plan.dailyContent) {
			return { success: false, error: "Failed to parse regenerated content" };
		}

		// Find the matching day
		const regeneratedDay = parsed.plan.dailyContent.find(
			(dc) => dc.day.toLowerCase() === dayOfWeek.toLowerCase(),
		);

		if (!regeneratedDay) {
			return { success: false, error: "Day not found in regenerated plan" };
		}

		// Update the original plan with the new day
		const updatedPlan = { ...originalPlan };
		const dayIndex = updatedPlan.dailyContent.findIndex(
			(dc) => dc.day.toLowerCase() === dayOfWeek.toLowerCase(),
		);

		if (dayIndex !== -1) {
			updatedPlan.dailyContent[dayIndex] = regeneratedDay;
		}

		// Save the updated plan
		await prisma.promptRun.update({
			where: { id: planId },
			data: {
				outputData: JSON.parse(JSON.stringify(updatedPlan)),
			},
		});

		revalidatePath("/dashboard/make-my-week");

		return { success: true, updatedDay: regeneratedDay };
	} catch (error) {
		console.error("Error regenerating day:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to regenerate day";
		return { success: false, error: errorMessage };
	}
}

/**
 * Get a specific weekly plan by ID
 */
export async function getWeeklyPlanById(planId: string): Promise<{
	success: boolean;
	plan?: StoredWeeklyPlan;
	error?: string;
}> {
	try {
		const userId = await getCurrentUserId();
		if (!userId) {
			return { success: false, error: "Unauthorized" };
		}

		const promptRun = await prisma.promptRun.findUnique({
			where: { id: planId, userId, toolName: "make_my_week" },
		});

		if (!promptRun) {
			return { success: false, error: "Plan not found" };
		}

		const plan: StoredWeeklyPlan = {
			id: promptRun.id,
			accountId: "", // We don't store accountId in PromptRun, but it's not critical
			plan: promptRun.outputData as unknown as WeeklyPlan,
			preferences: promptRun.inputParams as unknown as WeeklyPlanPreferences,
			createdAt: promptRun.createdAt,
		};

		return { success: true, plan };
	} catch (error) {
		console.error("Error fetching weekly plan:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch weekly plan";
		return { success: false, error: errorMessage };
	}
}

// Helper functions

function getNextMonday(): Date {
	const today = new Date();
	const dayOfWeek = today.getDay();
	const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
	const nextMonday = new Date(today);
	nextMonday.setDate(today.getDate() + daysUntilMonday);
	nextMonday.setHours(9, 0, 0, 0);
	return nextMonday;
}

function mapContentType(type: string): ContentType {
	const typeLower = type.toLowerCase();
	if (typeLower.includes("reel") || typeLower.includes("video")) {
		return "REEL";
	}
	if (typeLower.includes("carousel") || typeLower.includes("swipe")) {
		return "CAROUSEL";
	}
	if (typeLower.includes("story") || typeLower.includes("stories")) {
		return "STORY";
	}
	return "SINGLE_IMAGE";
}
