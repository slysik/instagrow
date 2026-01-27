"use server";

/**
 * Instagram Server Actions
 *
 * Server-side actions for managing Instagram account connections,
 * syncing metrics, and fetching analytics data.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
	InstagramClient,
	InstagramApiException,
	getInstagramAuthUrl,
	generateState,
	refreshLongLivedToken,
} from "@/lib/instagram";

/**
 * Initiate Instagram account connection
 * Redirects user to Instagram OAuth flow
 */
export async function initiateInstagramConnection(): Promise<void> {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login");
	}

	// Generate and store state for CSRF protection
	const state = generateState();
	const cookieStore = await cookies();

	// Set state cookie (httpOnly, secure in production)
	cookieStore.set("instagram_oauth_state", state, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 10, // 10 minutes
		path: "/",
	});

	// Get the callback URL
	const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
	const redirectUri = `${baseUrl}/api/instagram/callback`;

	// Generate auth URL and redirect
	const authUrl = getInstagramAuthUrl(redirectUri, state);
	redirect(authUrl);
}

/**
 * Connect Instagram account after OAuth callback
 * Called by the callback route handler
 *
 * Note: The actual connection logic is handled in the callback route.
 * This function is a placeholder for potential direct API usage.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function connectInstagramAccount(code: string): Promise<{
	success: boolean;
	error?: string;
	accountId?: string;
}> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	// The actual connection logic is handled in the callback route
	// This function is here for potential direct API usage
	return { success: false, error: "Use OAuth flow to connect" };
}

/**
 * Disconnect an Instagram account
 */
export async function disconnectInstagramAccount(accountId: string): Promise<{
	success: boolean;
	error?: string;
}> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		// Verify the account belongs to the current user
		const account = await prisma.instagramAccount.findFirst({
			where: {
				id: accountId,
				userId: session.user.id,
			},
		});

		if (!account) {
			return { success: false, error: "Account not found" };
		}

		// Delete the Instagram account and all related data
		await prisma.instagramAccount.delete({
			where: { id: accountId },
		});

		return { success: true };
	} catch (error) {
		console.error("Error disconnecting Instagram account:", error);
		return { success: false, error: "Failed to disconnect account" };
	}
}

/**
 * Sync account-level metrics from Instagram
 */
export async function syncAccountMetrics(accountId: string): Promise<{
	success: boolean;
	error?: string;
}> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		// Get the Instagram account
		const account = await prisma.instagramAccount.findFirst({
			where: {
				id: accountId,
				userId: session.user.id,
			},
		});

		if (!account) {
			return { success: false, error: "Account not found" };
		}

		// Check if token needs refresh
		const tokenValid = await ensureValidToken(account);
		if (!tokenValid) {
			return { success: false, error: "Token expired. Please reconnect." };
		}

		// Create Instagram client
		const client = new InstagramClient(account.accessToken);

		// Fetch account info
		const accountInfo = await client.getAccountInfo();

		// Update account info in database
		await prisma.instagramAccount.update({
			where: { id: accountId },
			data: {
				igFollowerCount: accountInfo.followers_count,
				igUsername: accountInfo.username,
				igName: accountInfo.name,
				igProfilePic: accountInfo.profile_picture_url,
			},
		});

		// Fetch account insights
		let reach = 0;
		let impressions = 0;

		try {
			const insights = await client.getAccountInsights("week");
			reach = insights.reach;
			impressions = insights.impressions;
		} catch (error) {
			// Insights may not be available for all account types
			console.warn("Could not fetch account insights:", error);
		}

		// Create metric snapshot
		await prisma.metricSnapshot.create({
			data: {
				accountId: accountId,
				followers: accountInfo.followers_count,
				mediaCount: accountInfo.media_count,
				reach: reach,
				impressions: impressions,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Error syncing account metrics:", error);

		if (error instanceof InstagramApiException) {
			if (error.isTokenExpired()) {
				return { success: false, error: "Token expired. Please reconnect." };
			}
			if (error.isRateLimited()) {
				return {
					success: false,
					error: "Rate limited. Please try again later.",
				};
			}
		}

		return { success: false, error: "Failed to sync metrics" };
	}
}

/**
 * Sync post-level metrics for all recent posts
 */
export async function syncPostMetrics(accountId: string): Promise<{
	success: boolean;
	error?: string;
	syncedCount?: number;
}> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		// Get the Instagram account
		const account = await prisma.instagramAccount.findFirst({
			where: {
				id: accountId,
				userId: session.user.id,
			},
		});

		if (!account) {
			return { success: false, error: "Account not found" };
		}

		// Check if token needs refresh
		const tokenValid = await ensureValidToken(account);
		if (!tokenValid) {
			return { success: false, error: "Token expired. Please reconnect." };
		}

		// Create Instagram client
		const client = new InstagramClient(account.accessToken);

		// Fetch recent media
		const media = await client.getRecentMedia(25);

		let syncedCount = 0;

		for (const post of media) {
			try {
				// Fetch insights for this post
				const insights = await client.getMediaInsights(post.id);

				// Find or create post in database
				const existingPost = await prisma.post.findUnique({
					where: { igMediaId: post.id },
				});

				if (existingPost) {
					// Create metric snapshot for existing post
					await prisma.metricSnapshot.create({
						data: {
							accountId: accountId,
							postId: existingPost.id,
							likes: post.like_count,
							comments: post.comments_count,
							reach: insights.reach,
							impressions: insights.impressions,
							saves: insights.saved,
							shares: insights.shares,
							engagement:
								insights.reach > 0
									? (post.like_count +
											post.comments_count +
											insights.saved +
											insights.shares) /
										insights.reach
									: 0,
						},
					});
				}

				syncedCount++;
			} catch (error) {
				// Continue with other posts even if one fails
				console.warn(`Failed to sync post ${post.id}:`, error);
			}
		}

		return { success: true, syncedCount };
	} catch (error) {
		console.error("Error syncing post metrics:", error);

		if (error instanceof InstagramApiException) {
			if (error.isTokenExpired()) {
				return { success: false, error: "Token expired. Please reconnect." };
			}
			if (error.isRateLimited()) {
				return {
					success: false,
					error: "Rate limited. Please try again later.",
				};
			}
		}

		return { success: false, error: "Failed to sync post metrics" };
	}
}

/**
 * Get analytics summary for an account
 */
export async function getAnalyticsSummary(
	accountId: string,
	period: "week" | "month",
): Promise<{
	success: boolean;
	error?: string;
	data?: {
		followers: {
			current: number;
			change: number;
			trend: "up" | "down" | "stable";
		};
		reach: { current: number; change: number; trend: "up" | "down" | "stable" };
		engagement: {
			current: number;
			change: number;
			trend: "up" | "down" | "stable";
		};
		impressions: {
			current: number;
			change: number;
			trend: "up" | "down" | "stable";
		};
	};
}> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		// Verify account ownership
		const account = await prisma.instagramAccount.findFirst({
			where: {
				id: accountId,
				userId: session.user.id,
			},
		});

		if (!account) {
			return { success: false, error: "Account not found" };
		}

		// Calculate date range
		const now = new Date();
		const periodDays = period === "week" ? 7 : 30;
		const periodStart = new Date(now);
		periodStart.setDate(periodStart.getDate() - periodDays);

		const previousPeriodStart = new Date(periodStart);
		previousPeriodStart.setDate(previousPeriodStart.getDate() - periodDays);

		// Get current period snapshots
		const currentSnapshots = await prisma.metricSnapshot.findMany({
			where: {
				accountId: accountId,
				postId: null, // Account-level snapshots only
				snapshotAt: {
					gte: periodStart,
				},
			},
			orderBy: { snapshotAt: "desc" },
		});

		// Get previous period snapshots for comparison
		const previousSnapshots = await prisma.metricSnapshot.findMany({
			where: {
				accountId: accountId,
				postId: null,
				snapshotAt: {
					gte: previousPeriodStart,
					lt: periodStart,
				},
			},
			orderBy: { snapshotAt: "desc" },
		});

		// Calculate averages for current period
		const current = calculateAverages(currentSnapshots);
		const previous = calculateAverages(previousSnapshots);

		// Calculate changes and trends
		const data = {
			followers: {
				current: account.igFollowerCount || 0,
				change: calculateChange(
					account.igFollowerCount || 0,
					previous.followers,
				),
				trend: getTrend(account.igFollowerCount || 0, previous.followers),
			},
			reach: {
				current: current.reach,
				change: calculateChange(current.reach, previous.reach),
				trend: getTrend(current.reach, previous.reach),
			},
			engagement: {
				current: current.engagement,
				change: calculateChange(current.engagement, previous.engagement),
				trend: getTrend(current.engagement, previous.engagement),
			},
			impressions: {
				current: current.impressions,
				change: calculateChange(current.impressions, previous.impressions),
				trend: getTrend(current.impressions, previous.impressions),
			},
		};

		return { success: true, data };
	} catch (error) {
		console.error("Error getting analytics summary:", error);
		return { success: false, error: "Failed to get analytics" };
	}
}

/**
 * Get best posting times based on audience activity
 */
export async function getBestPostingTimes(accountId: string): Promise<{
	success: boolean;
	error?: string;
	data?: Record<string, string[]>;
}> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		// Get the Instagram account
		const account = await prisma.instagramAccount.findFirst({
			where: {
				id: accountId,
				userId: session.user.id,
			},
		});

		if (!account) {
			return { success: false, error: "Account not found" };
		}

		// Return cached posting times if available
		if (account.bestPostingTimes) {
			return {
				success: true,
				data: account.bestPostingTimes as Record<string, string[]>,
			};
		}

		// Check if token needs refresh
		const tokenValid = await ensureValidToken(account);
		if (!tokenValid) {
			return { success: false, error: "Token expired. Please reconnect." };
		}

		// Create Instagram client
		const client = new InstagramClient(account.accessToken);

		// Fetch audience insights
		const audienceInsights = await client.getAudienceInsights();

		// Convert online_followers data to best posting times
		const bestTimes = processBestPostingTimes(
			audienceInsights.online_followers,
		);

		// Cache the results
		await prisma.instagramAccount.update({
			where: { id: accountId },
			data: { bestPostingTimes: bestTimes },
		});

		return { success: true, data: bestTimes };
	} catch (error) {
		console.error("Error getting best posting times:", error);

		if (error instanceof InstagramApiException) {
			if (error.isTokenExpired()) {
				return { success: false, error: "Token expired. Please reconnect." };
			}
		}

		return { success: false, error: "Failed to get posting times" };
	}
}

/**
 * Get top performing posts
 */
export async function getTopPosts(
	accountId: string,
	limit: number = 10,
): Promise<{
	success: boolean;
	error?: string;
	data?: Array<{
		id: string;
		igMediaId: string | null;
		caption: string;
		contentType: string;
		publishedAt: Date | null;
		likes: number;
		comments: number;
		reach: number;
		engagement: number;
	}>;
}> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		// Verify account ownership
		const account = await prisma.instagramAccount.findFirst({
			where: {
				id: accountId,
				userId: session.user.id,
			},
		});

		if (!account) {
			return { success: false, error: "Account not found" };
		}

		// Get posts with their latest metrics
		const posts = await prisma.post.findMany({
			where: {
				accountId: accountId,
				status: "PUBLISHED",
			},
			include: {
				metrics: {
					orderBy: { snapshotAt: "desc" },
					take: 1,
				},
			},
			orderBy: { publishedAt: "desc" },
			take: 50, // Get more than needed for sorting
		});

		// Sort by engagement and take top N
		const sortedPosts = posts
			.map((post) => {
				const latestMetric = post.metrics[0];
				return {
					id: post.id,
					igMediaId: post.igMediaId,
					caption: post.caption,
					contentType: post.contentType,
					publishedAt: post.publishedAt,
					likes: latestMetric?.likes || 0,
					comments: latestMetric?.comments || 0,
					reach: latestMetric?.reach || 0,
					engagement: latestMetric?.engagement || 0,
				};
			})
			.sort((a, b) => b.engagement - a.engagement)
			.slice(0, limit);

		return { success: true, data: sortedPosts };
	} catch (error) {
		console.error("Error getting top posts:", error);
		return { success: false, error: "Failed to get top posts" };
	}
}

/**
 * Get user's connected Instagram accounts
 */
export async function getConnectedAccounts(): Promise<{
	success: boolean;
	error?: string;
	data?: Array<{
		id: string;
		igUserId: string;
		igUsername: string;
		igName: string | null;
		igProfilePic: string | null;
		igFollowerCount: number | null;
		isActive: boolean;
		tokenExpiresAt: Date | null;
	}>;
}> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		const accounts = await prisma.instagramAccount.findMany({
			where: { userId: session.user.id },
			select: {
				id: true,
				igUserId: true,
				igUsername: true,
				igName: true,
				igProfilePic: true,
				igFollowerCount: true,
				isActive: true,
				tokenExpiresAt: true,
			},
		});

		return { success: true, data: accounts };
	} catch (error) {
		console.error("Error getting connected accounts:", error);
		return { success: false, error: "Failed to get accounts" };
	}
}

// Helper functions

async function ensureValidToken(account: {
	id: string;
	accessToken: string;
	tokenExpiresAt: Date | null;
}): Promise<boolean> {
	if (!account.tokenExpiresAt) {
		return true; // No expiration set, assume valid
	}

	const now = new Date();
	const expiresAt = new Date(account.tokenExpiresAt);
	const daysUntilExpiry =
		(expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

	// If token expires in less than 7 days, try to refresh
	if (daysUntilExpiry < 7 && daysUntilExpiry > 0) {
		try {
			const { access_token, expires_in } = await refreshLongLivedToken(
				account.accessToken,
			);

			const newExpiresAt = new Date();
			newExpiresAt.setSeconds(newExpiresAt.getSeconds() + expires_in);

			await prisma.instagramAccount.update({
				where: { id: account.id },
				data: {
					accessToken: access_token,
					tokenExpiresAt: newExpiresAt,
				},
			});

			return true;
		} catch (error) {
			console.error("Failed to refresh token:", error);
			return daysUntilExpiry > 0;
		}
	}

	// Token is expired
	if (daysUntilExpiry <= 0) {
		return false;
	}

	return true;
}

function calculateAverages(
	snapshots: Array<{
		followers: number | null;
		reach: number | null;
		impressions: number | null;
		engagement: number | null;
	}>,
): {
	followers: number;
	reach: number;
	impressions: number;
	engagement: number;
} {
	if (snapshots.length === 0) {
		return { followers: 0, reach: 0, impressions: 0, engagement: 0 };
	}

	let totalFollowers = 0;
	let totalReach = 0;
	let totalImpressions = 0;
	let totalEngagement = 0;

	for (const s of snapshots) {
		totalFollowers += s.followers || 0;
		totalReach += s.reach || 0;
		totalImpressions += s.impressions || 0;
		totalEngagement += s.engagement || 0;
	}

	return {
		followers: Math.round(totalFollowers / snapshots.length),
		reach: Math.round(totalReach / snapshots.length),
		impressions: Math.round(totalImpressions / snapshots.length),
		engagement: Number((totalEngagement / snapshots.length).toFixed(2)),
	};
}

function calculateChange(current: number, previous: number): number {
	if (previous === 0) return current > 0 ? 100 : 0;
	return Number((((current - previous) / previous) * 100).toFixed(1));
}

function getTrend(current: number, previous: number): "up" | "down" | "stable" {
	const threshold = 0.01; // 1% threshold for stable
	const change = previous === 0 ? 0 : (current - previous) / previous;

	if (change > threshold) return "up";
	if (change < -threshold) return "down";
	return "stable";
}

function processBestPostingTimes(
	onlineFollowers: Record<string, number[]>,
): Record<string, string[]> {
	const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	const result: Record<string, string[]> = {};

	for (const [dayIndex, dayName] of days.entries()) {
		const hourData = onlineFollowers[dayIndex.toString()] || [];

		// Find top 3 hours with most followers online
		const hoursWithCounts = hourData.map((count, hour) => ({ hour, count }));
		const topHours = hoursWithCounts
			.sort((a, b) => b.count - a.count)
			.slice(0, 3)
			.map(({ hour }) => {
				const ampm = hour >= 12 ? "PM" : "AM";
				const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
				return `${displayHour}:00 ${ampm}`;
			});

		result[dayName] = topHours;
	}

	return result;
}
