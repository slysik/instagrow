"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { Idea, ContentType } from "@prisma/client";

// Types for calendar events
export interface CalendarEvent {
	id: string;
	ideaId: string;
	scheduledFor: Date;
	platform: string;
	notes?: string;
	idea: {
		id: string;
		title: string;
		contentType: ContentType;
		pillarId: string;
		pillar: {
			id: string;
			name: string;
			color: string | null;
			emoji: string | null;
		};
	};
}

export interface CalendarEventInput {
	ideaId: string;
	scheduledFor: Date;
	platform: string;
	notes?: string;
}

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
	const session = await auth();
	return session?.user?.id ?? null;
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

// Helper to verify user has access to an idea
async function verifyIdeaAccess(
	ideaId: string,
	userId: string,
): Promise<boolean> {
	const idea = await prisma.idea.findFirst({
		where: {
			id: ideaId,
			pillar: {
				account: {
					userId: userId,
				},
			},
		},
	});
	return !!idea;
}

/**
 * Get calendar events for a date range
 */
export async function getCalendarEvents(
	accountId: string,
	startDate: Date,
	endDate: Date,
): Promise<CalendarEvent[]> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	const ownsAccount = await verifyAccountOwnership(accountId, userId);
	if (!ownsAccount) {
		throw new Error("Unauthorized: You do not own this Instagram account");
	}

	// Fetch ideas that are scheduled within the date range
	const ideas = await prisma.idea.findMany({
		where: {
			pillar: {
				accountId,
			},
			scheduledFor: {
				gte: startDate,
				lte: endDate,
			},
		},
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
		orderBy: { scheduledFor: "asc" },
	});

	// Transform ideas to calendar events
	const events: CalendarEvent[] = ideas.map((idea) => ({
		id: idea.id,
		ideaId: idea.id,
		scheduledFor: idea.scheduledFor || new Date(),
		platform: "instagram",
		idea: {
			id: idea.id,
			title: idea.title,
			contentType: idea.contentType,
			pillarId: idea.pillarId,
			pillar: {
				id: idea.pillar.id,
				name: idea.pillar.name,
				color: idea.pillar.color,
				emoji: idea.pillar.emoji,
			},
		},
	}));

	return events;
}

/**
 * Create a calendar event by scheduling an idea
 */
export async function createCalendarEvent(
	ideaId: string,
	scheduledAt: Date,
	platform: string = "instagram",
): Promise<Idea> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	const hasAccess = await verifyIdeaAccess(ideaId, userId);
	if (!hasAccess) {
		throw new Error("Unauthorized: You do not have access to this idea");
	}

	// Validate scheduledAt is in the future
	if (scheduledAt < new Date()) {
		throw new Error("Cannot schedule content in the past");
	}

	// Update the idea with scheduled date and SCHEDULED status
	const idea = await prisma.idea.update({
		where: { id: ideaId },
		data: {
			scheduledFor: scheduledAt,
			status: "SCHEDULED",
		},
	});

	revalidatePath("/dashboard/calendar");
	return idea;
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(
	eventId: string,
	data: Partial<{
		scheduledFor?: Date;
		notes?: string;
	}>,
): Promise<Idea> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	// Verify access to the idea
	const hasAccess = await verifyIdeaAccess(eventId, userId);
	if (!hasAccess) {
		throw new Error("Unauthorized: You do not have access to this event");
	}

	// Validate scheduledFor if provided
	if (data.scheduledFor && data.scheduledFor < new Date()) {
		throw new Error("Cannot schedule content in the past");
	}

	const idea = await prisma.idea.update({
		where: { id: eventId },
		data: {
			...(data.scheduledFor !== undefined && {
				scheduledFor: data.scheduledFor,
			}),
		},
	});

	revalidatePath("/dashboard/calendar");
	return idea;
}

/**
 * Delete a calendar event (unschedule the idea)
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	// Verify access to the idea
	const hasAccess = await verifyIdeaAccess(eventId, userId);
	if (!hasAccess) {
		throw new Error("Unauthorized: You do not have access to this event");
	}

	// Clear the scheduled date and revert to DRAFT status
	await prisma.idea.update({
		where: { id: eventId },
		data: {
			scheduledFor: null,
			status: "DRAFT",
		},
	});

	revalidatePath("/dashboard/calendar");
}

/**
 * Move a calendar event to a new date
 */
export async function moveCalendarEvent(
	eventId: string,
	newDate: Date,
): Promise<Idea> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	// Verify access to the idea
	const hasAccess = await verifyIdeaAccess(eventId, userId);
	if (!hasAccess) {
		throw new Error("Unauthorized: You do not have access to this event");
	}

	// Validate newDate is in the future
	if (newDate < new Date()) {
		throw new Error("Cannot schedule content in the past");
	}

	const idea = await prisma.idea.update({
		where: { id: eventId },
		data: {
			scheduledFor: newDate,
		},
	});

	revalidatePath("/dashboard/calendar");
	return idea;
}

/**
 * Get scheduled content for a specific date
 */
export async function getScheduledContentForDate(
	accountId: string,
	date: Date,
): Promise<CalendarEvent[]> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	const ownsAccount = await verifyAccountOwnership(accountId, userId);
	if (!ownsAccount) {
		throw new Error("Unauthorized: You do not own this Instagram account");
	}

	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);

	const endOfDay = new Date(date);
	endOfDay.setHours(23, 59, 59, 999);

	return getCalendarEvents(accountId, startOfDay, endOfDay);
}

/**
 * Get content gaps (days without scheduled posts)
 */
export async function getContentGaps(
	accountId: string,
	daysToCheck: number = 30,
): Promise<Date[]> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	const ownsAccount = await verifyAccountOwnership(accountId, userId);
	if (!ownsAccount) {
		throw new Error("Unauthorized: You do not own this Instagram account");
	}

	const today = new Date();
	const startDate = new Date();
	const endDate = new Date(today);
	endDate.setDate(endDate.getDate() + daysToCheck);

	const scheduledIdeas = await prisma.idea.findMany({
		where: {
			pillar: {
				accountId,
			},
			scheduledFor: {
				gte: startDate,
				lte: endDate,
			},
		},
		select: {
			scheduledFor: true,
		},
	});

	// Create a set of scheduled dates
	const scheduledDates = new Set(
		scheduledIdeas
			.filter((idea) => idea.scheduledFor)
			.map((idea) => idea.scheduledFor!.toDateString()),
	);

	// Find gaps
	const gaps: Date[] = [];
	const currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		if (!scheduledDates.has(currentDate.toDateString())) {
			gaps.push(new Date(currentDate));
		}
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return gaps;
}

/**
 * Get scheduled posts count by content type for a date range
 */
export async function getScheduledPostsStats(
	accountId: string,
	startDate: Date,
	endDate: Date,
): Promise<Record<string, number>> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	const ownsAccount = await verifyAccountOwnership(accountId, userId);
	if (!ownsAccount) {
		throw new Error("Unauthorized: You do not own this Instagram account");
	}

	const ideas = await prisma.idea.findMany({
		where: {
			pillar: {
				accountId,
			},
			scheduledFor: {
				gte: startDate,
				lte: endDate,
			},
		},
		select: {
			contentType: true,
		},
	});

	const stats: Record<string, number> = {};
	ideas.forEach((idea) => {
		stats[idea.contentType] = (stats[idea.contentType] || 0) + 1;
	});

	return stats;
}

/**
 * Get the first Instagram account for the current user
 * Used as a fallback when no specific account is selected
 */
export async function getFirstInstagramAccount(): Promise<{
	id: string;
	igUsername: string;
} | null> {
	const userId = await getCurrentUserId();
	if (!userId) {
		return null;
	}

	const account = await prisma.instagramAccount.findFirst({
		where: { userId, isActive: true },
		select: { id: true, igUsername: true },
		orderBy: { createdAt: "asc" },
	});

	return account;
}
