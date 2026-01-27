"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { Pillar } from "@prisma/client";

// Type for pillar with idea count
export type PillarWithIdeaCount = Pillar & {
	_count: {
		ideas: number;
	};
};

// Type for pillar with ideas
export type PillarWithIdeas = Pillar & {
	ideas: {
		id: string;
		title: string;
		description: string | null;
		contentType: string;
		status: string;
	}[];
};

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
 * Get all pillars for an Instagram account
 */
export async function getPillars(
	accountId: string,
): Promise<PillarWithIdeaCount[]> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	const ownsAccount = await verifyAccountOwnership(accountId, userId);
	if (!ownsAccount) {
		throw new Error("Unauthorized: You do not own this Instagram account");
	}

	const pillars = await prisma.pillar.findMany({
		where: { accountId },
		include: {
			_count: {
				select: { ideas: true },
			},
		},
		orderBy: { createdAt: "asc" },
	});

	return pillars;
}

/**
 * Get a single pillar with its ideas
 */
export async function getPillarWithIdeas(
	pillarId: string,
): Promise<PillarWithIdeas | null> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	const pillar = await prisma.pillar.findUnique({
		where: { id: pillarId },
		include: {
			ideas: {
				select: {
					id: true,
					title: true,
					description: true,
					contentType: true,
					status: true,
				},
				orderBy: { createdAt: "desc" },
			},
			account: {
				select: { userId: true },
			},
		},
	});

	if (!pillar) {
		return null;
	}

	// Verify ownership
	if (pillar.account.userId !== userId) {
		throw new Error("Unauthorized: You do not own this pillar");
	}

	// Remove account from return value (eslint-disable for destructuring unused variable)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { account, ...pillarWithoutAccount } = pillar;
	return pillarWithoutAccount;
}

/**
 * Create a new pillar
 */
export async function createPillar(
	accountId: string,
	data: {
		name: string;
		description?: string;
		color?: string;
		emoji?: string;
		weight?: number;
	},
): Promise<Pillar> {
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
		throw new Error("Pillar name is required");
	}

	if (data.name.length > 100) {
		throw new Error("Pillar name must be less than 100 characters");
	}

	// Validate weight if provided
	if (data.weight !== undefined && (data.weight < 1 || data.weight > 10)) {
		throw new Error("Weight must be between 1 and 10");
	}

	const pillar = await prisma.pillar.create({
		data: {
			accountId,
			name: data.name.trim(),
			description: data.description?.trim() || null,
			color: data.color || null,
			emoji: data.emoji || null,
			weight: data.weight ?? 1,
		},
	});

	revalidatePath("/dashboard/pillars");
	return pillar;
}

/**
 * Update an existing pillar
 */
export async function updatePillar(
	id: string,
	data: Partial<
		Pick<Pillar, "name" | "description" | "color" | "emoji" | "weight">
	>,
): Promise<Pillar> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	// Get pillar and verify ownership
	const existingPillar = await prisma.pillar.findUnique({
		where: { id },
		include: {
			account: {
				select: { userId: true },
			},
		},
	});

	if (!existingPillar) {
		throw new Error("Pillar not found");
	}

	if (existingPillar.account.userId !== userId) {
		throw new Error("Unauthorized: You do not own this pillar");
	}

	// Validate name if provided
	if (data.name !== undefined) {
		if (!data.name || data.name.trim().length === 0) {
			throw new Error("Pillar name is required");
		}
		if (data.name.length > 100) {
			throw new Error("Pillar name must be less than 100 characters");
		}
	}

	// Validate weight if provided
	if (data.weight !== undefined && (data.weight < 1 || data.weight > 10)) {
		throw new Error("Weight must be between 1 and 10");
	}

	const pillar = await prisma.pillar.update({
		where: { id },
		data: {
			...(data.name !== undefined && { name: data.name.trim() }),
			...(data.description !== undefined && {
				description: data.description?.trim() || null,
			}),
			...(data.color !== undefined && { color: data.color || null }),
			...(data.emoji !== undefined && { emoji: data.emoji || null }),
			...(data.weight !== undefined && { weight: data.weight }),
		},
	});

	revalidatePath("/dashboard/pillars");
	return pillar;
}

/**
 * Delete a pillar
 */
export async function deletePillar(id: string): Promise<void> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	// Get pillar and verify ownership
	const existingPillar = await prisma.pillar.findUnique({
		where: { id },
		include: {
			account: {
				select: { userId: true },
			},
		},
	});

	if (!existingPillar) {
		throw new Error("Pillar not found");
	}

	if (existingPillar.account.userId !== userId) {
		throw new Error("Unauthorized: You do not own this pillar");
	}

	await prisma.pillar.delete({
		where: { id },
	});

	revalidatePath("/dashboard/pillars");
}

/**
 * Reorder pillars by updating their weights based on position
 * The pillarIds array represents the desired order from highest to lowest weight
 */
export async function reorderPillars(
	accountId: string,
	pillarIds: string[],
): Promise<void> {
	const userId = await getCurrentUserId();
	if (!userId) {
		throw new Error("Unauthorized");
	}

	const ownsAccount = await verifyAccountOwnership(accountId, userId);
	if (!ownsAccount) {
		throw new Error("Unauthorized: You do not own this Instagram account");
	}

	// Verify all pillars belong to this account
	const existingPillars = await prisma.pillar.findMany({
		where: {
			accountId,
			id: { in: pillarIds },
		},
	});

	if (existingPillars.length !== pillarIds.length) {
		throw new Error("One or more pillars do not belong to this account");
	}

	// Update weights based on position (higher index = lower weight)
	// We use the array length to assign weights, so first item gets highest weight
	const updates = pillarIds.map((id, index) => {
		const weight = pillarIds.length - index; // First item gets highest weight
		return prisma.pillar.update({
			where: { id },
			data: { weight },
		});
	});

	await prisma.$transaction(updates);
	revalidatePath("/dashboard/pillars");
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
