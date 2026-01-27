"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ContentType, IdeaStatus, Prisma } from "@prisma/client";

// Types for input validation
export interface CreateIdeaInput {
	pillarId: string;
	title: string;
	description?: string;
	contentType: ContentType;
	caption?: string;
	hooks?: string[];
	hashtags?: string[];
	keywords?: string[];
	altText?: string;
	script?: Prisma.InputJsonValue;
	shotList?: Prisma.InputJsonValue;
	slides?: Prisma.InputJsonValue;
	frames?: Prisma.InputJsonValue;
	scheduledFor?: Date;
}

export interface UpdateIdeaInput {
	title?: string;
	description?: string;
	contentType?: ContentType;
	status?: IdeaStatus;
	caption?: string;
	hooks?: string[];
	hashtags?: string[];
	keywords?: string[];
	altText?: string;
	script?: Prisma.InputJsonValue;
	shotList?: Prisma.InputJsonValue;
	slides?: Prisma.InputJsonValue;
	frames?: Prisma.InputJsonValue;
	scheduledFor?: Date | null;
	publishedAt?: Date | null;
}

export interface IdeaFilters {
	contentType?: ContentType;
	pillarId?: string;
	status?: IdeaStatus;
	search?: string;
	dateFrom?: Date;
	dateTo?: Date;
}

// Type for returned ideas with pillar info
export interface IdeaWithPillar {
	id: string;
	pillarId: string;
	title: string;
	description: string | null;
	contentType: ContentType;
	status: IdeaStatus;
	caption: string | null;
	hooks: string[];
	hashtags: string[];
	keywords: string[];
	altText: string | null;
	script: Prisma.JsonValue;
	shotList: Prisma.JsonValue;
	slides: Prisma.JsonValue;
	frames: Prisma.JsonValue;
	scheduledFor: Date | null;
	publishedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	pillar: {
		id: string;
		name: string;
		color: string | null;
		emoji: string | null;
	};
}

/**
 * Verify user has access to an idea
 */
async function verifyIdeaAccess(ideaId: string): Promise<boolean> {
	const session = await auth();
	if (!session?.user?.id) return false;

	const idea = await prisma.idea.findFirst({
		where: {
			id: ideaId,
			pillar: {
				account: {
					userId: session.user.id,
				},
			},
		},
	});

	return !!idea;
}

/**
 * Verify user has access to a pillar
 */
async function verifyPillarAccess(pillarId: string): Promise<boolean> {
	const session = await auth();
	if (!session?.user?.id) return false;

	const pillar = await prisma.pillar.findFirst({
		where: {
			id: pillarId,
			account: {
				userId: session.user.id,
			},
		},
	});

	return !!pillar;
}

/**
 * Get all ideas for the current user's account with optional filters
 */
export async function getIdeas(
	accountId: string,
	filters?: IdeaFilters,
): Promise<{ ideas: IdeaWithPillar[]; total: number }> {
	const session = await auth();
	if (!session?.user?.id) {
		return { ideas: [], total: 0 };
	}

	// Verify account belongs to user
	const account = await prisma.instagramAccount.findFirst({
		where: { id: accountId, userId: session.user.id },
	});

	if (!account) {
		return { ideas: [], total: 0 };
	}

	// Build where clause
	const where: Prisma.IdeaWhereInput = {
		pillar: {
			accountId: accountId,
		},
	};

	if (filters?.contentType) {
		where.contentType = filters.contentType;
	}

	if (filters?.pillarId) {
		where.pillarId = filters.pillarId;
	}

	if (filters?.status) {
		where.status = filters.status;
	}

	if (filters?.search) {
		where.OR = [
			{ title: { contains: filters.search, mode: "insensitive" } },
			{ description: { contains: filters.search, mode: "insensitive" } },
			{ caption: { contains: filters.search, mode: "insensitive" } },
		];
	}

	if (filters?.dateFrom || filters?.dateTo) {
		where.createdAt = {};
		if (filters.dateFrom) {
			where.createdAt.gte = filters.dateFrom;
		}
		if (filters.dateTo) {
			where.createdAt.lte = filters.dateTo;
		}
	}

	const [ideas, total] = await Promise.all([
		prisma.idea.findMany({
			where,
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
			orderBy: { createdAt: "desc" },
		}),
		prisma.idea.count({ where }),
	]);

	return { ideas, total };
}

/**
 * Get a single idea by ID
 */
export async function getIdea(id: string): Promise<IdeaWithPillar | null> {
	const hasAccess = await verifyIdeaAccess(id);
	if (!hasAccess) {
		return null;
	}

	const idea = await prisma.idea.findUnique({
		where: { id },
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

	return idea;
}

/**
 * Create a new idea
 */
export async function createIdea(
	data: CreateIdeaInput,
): Promise<{ success: boolean; idea?: IdeaWithPillar; error?: string }> {
	const hasAccess = await verifyPillarAccess(data.pillarId);
	if (!hasAccess) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const idea = await prisma.idea.create({
			data: {
				pillarId: data.pillarId,
				title: data.title,
				description: data.description,
				contentType: data.contentType,
				status: "DRAFT",
				caption: data.caption,
				hooks: data.hooks ?? [],
				hashtags: data.hashtags ?? [],
				keywords: data.keywords ?? [],
				altText: data.altText,
				script: data.script ?? undefined,
				shotList: data.shotList ?? undefined,
				slides: data.slides ?? undefined,
				frames: data.frames ?? undefined,
				scheduledFor: data.scheduledFor,
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
		});

		revalidatePath("/dashboard/library");
		return { success: true, idea };
	} catch (error) {
		console.error("Error creating idea:", error);
		return { success: false, error: "Failed to create idea" };
	}
}

/**
 * Update an existing idea
 */
export async function updateIdea(
	id: string,
	data: UpdateIdeaInput,
): Promise<{ success: boolean; idea?: IdeaWithPillar; error?: string }> {
	const hasAccess = await verifyIdeaAccess(id);
	if (!hasAccess) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const idea = await prisma.idea.update({
			where: { id },
			data: {
				title: data.title,
				description: data.description,
				contentType: data.contentType,
				status: data.status,
				caption: data.caption,
				hooks: data.hooks,
				hashtags: data.hashtags,
				keywords: data.keywords,
				altText: data.altText,
				script: data.script ?? undefined,
				shotList: data.shotList ?? undefined,
				slides: data.slides ?? undefined,
				frames: data.frames ?? undefined,
				scheduledFor: data.scheduledFor,
				publishedAt: data.publishedAt,
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
		});

		revalidatePath("/dashboard/library");
		return { success: true, idea };
	} catch (error) {
		console.error("Error updating idea:", error);
		return { success: false, error: "Failed to update idea" };
	}
}

/**
 * Delete a single idea
 */
export async function deleteIdea(
	id: string,
): Promise<{ success: boolean; error?: string }> {
	const hasAccess = await verifyIdeaAccess(id);
	if (!hasAccess) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		await prisma.idea.delete({ where: { id } });
		revalidatePath("/dashboard/library");
		return { success: true };
	} catch (error) {
		console.error("Error deleting idea:", error);
		return { success: false, error: "Failed to delete idea" };
	}
}

/**
 * Bulk delete multiple ideas
 */
export async function deleteIdeas(
	ids: string[],
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, deletedCount: 0, error: "Unauthorized" };
	}

	try {
		// Only delete ideas that belong to the user
		const result = await prisma.idea.deleteMany({
			where: {
				id: { in: ids },
				pillar: {
					account: {
						userId: session.user.id,
					},
				},
			},
		});

		revalidatePath("/dashboard/library");
		return { success: true, deletedCount: result.count };
	} catch (error) {
		console.error("Error deleting ideas:", error);
		return { success: false, deletedCount: 0, error: "Failed to delete ideas" };
	}
}

/**
 * Duplicate an existing idea
 */
export async function duplicateIdea(
	id: string,
): Promise<{ success: boolean; idea?: IdeaWithPillar; error?: string }> {
	const hasAccess = await verifyIdeaAccess(id);
	if (!hasAccess) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const original = await prisma.idea.findUnique({
			where: { id },
		});

		if (!original) {
			return { success: false, error: "Idea not found" };
		}

		const idea = await prisma.idea.create({
			data: {
				pillarId: original.pillarId,
				title: `${original.title} (Copy)`,
				description: original.description,
				contentType: original.contentType,
				status: "DRAFT",
				caption: original.caption,
				hooks: original.hooks,
				hashtags: original.hashtags,
				keywords: original.keywords,
				altText: original.altText,
				script: original.script ?? undefined,
				shotList: original.shotList ?? undefined,
				slides: original.slides ?? undefined,
				frames: original.frames ?? undefined,
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
		});

		revalidatePath("/dashboard/library");
		return { success: true, idea };
	} catch (error) {
		console.error("Error duplicating idea:", error);
		return { success: false, error: "Failed to duplicate idea" };
	}
}

/**
 * Get pillars for the current user's account (for filters)
 */
export async function getPillarsForAccount(accountId: string): Promise<
	{
		id: string;
		name: string;
		color: string | null;
		emoji: string | null;
	}[]
> {
	const session = await auth();
	if (!session?.user?.id) {
		return [];
	}

	// Verify account belongs to user
	const account = await prisma.instagramAccount.findFirst({
		where: { id: accountId, userId: session.user.id },
	});

	if (!account) {
		return [];
	}

	const pillars = await prisma.pillar.findMany({
		where: { accountId },
		select: {
			id: true,
			name: true,
			color: true,
			emoji: true,
		},
		orderBy: { name: "asc" },
	});

	return pillars;
}

/**
 * Get the current user's active Instagram account
 */
export async function getCurrentInstagramAccount(): Promise<{
	id: string;
	igUsername: string;
} | null> {
	const session = await auth();
	if (!session?.user?.id) {
		return null;
	}

	const account = await prisma.instagramAccount.findFirst({
		where: { userId: session.user.id, isActive: true },
		select: { id: true, igUsername: true },
	});

	return account;
}
