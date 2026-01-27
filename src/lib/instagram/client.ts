/**
 * Instagram Graph API Client
 *
 * Provides methods for interacting with the Instagram Graph API
 * for Business and Creator accounts.
 *
 * @see https://developers.facebook.com/docs/instagram-api
 */

const INSTAGRAM_GRAPH_API_BASE = "https://graph.instagram.com";
const INSTAGRAM_GRAPH_API_VERSION = "v21.0";

export interface InstagramAccountInfo {
	id: string;
	username: string;
	name: string;
	profile_picture_url: string;
	followers_count: number;
	media_count: number;
}

export interface InstagramAccountInsights {
	reach: number;
	impressions: number;
	profile_views: number;
}

export interface InstagramMedia {
	id: string;
	caption: string;
	media_type: string;
	timestamp: string;
	like_count: number;
	comments_count: number;
	permalink?: string;
	thumbnail_url?: string;
	media_url?: string;
}

export interface InstagramMediaInsights {
	reach: number;
	impressions: number;
	engagement: number;
	saved: number;
	shares: number;
}

export interface InstagramAudienceInsights {
	online_followers: Record<string, number[]>;
}

export interface InstagramApiError {
	message: string;
	type: string;
	code: number;
	error_subcode?: number;
	fbtrace_id?: string;
}

class InstagramApiException extends Error {
	constructor(
		public readonly apiError: InstagramApiError,
		public readonly statusCode: number,
	) {
		super(apiError.message);
		this.name = "InstagramApiException";
	}

	isRateLimited(): boolean {
		// Error code 4 or 17 typically indicates rate limiting
		return this.apiError.code === 4 || this.apiError.code === 17;
	}

	isTokenExpired(): boolean {
		// Error code 190 indicates an expired/invalid token
		return this.apiError.code === 190;
	}

	isPermissionError(): boolean {
		// Error codes 10 or 200-299 typically indicate permission issues
		return (
			this.apiError.code === 10 ||
			(this.apiError.code >= 200 && this.apiError.code < 300)
		);
	}
}

export class InstagramClient {
	private accessToken: string;
	private baseUrl: string;

	constructor(accessToken: string) {
		this.accessToken = accessToken;
		this.baseUrl = `${INSTAGRAM_GRAPH_API_BASE}/${INSTAGRAM_GRAPH_API_VERSION}`;
	}

	/**
	 * Make a request to the Instagram Graph API
	 */
	private async request<T>(
		endpoint: string,
		params: Record<string, string> = {},
	): Promise<T> {
		const url = new URL(`${this.baseUrl}${endpoint}`);
		url.searchParams.set("access_token", this.accessToken);

		for (const [key, value] of Object.entries(params)) {
			url.searchParams.set(key, value);
		}

		const response = await fetch(url.toString(), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		const data = await response.json();

		if (!response.ok) {
			const error: InstagramApiError = data.error || {
				message: "Unknown error",
				type: "OAuthException",
				code: response.status,
			};
			throw new InstagramApiException(error, response.status);
		}

		return data as T;
	}

	/**
	 * Get basic account information
	 */
	async getAccountInfo(): Promise<InstagramAccountInfo> {
		const fields = [
			"id",
			"username",
			"name",
			"profile_picture_url",
			"followers_count",
			"media_count",
		].join(",");

		const data = await this.request<InstagramAccountInfo>("/me", { fields });
		return data;
	}

	/**
	 * Get account insights for a specific period
	 *
	 * @param period - The period for insights: 'day', 'week', or 'days_28'
	 */
	async getAccountInsights(
		period: "day" | "week" | "days_28",
	): Promise<InstagramAccountInsights> {
		const metrics = ["reach", "impressions", "profile_views"].join(",");

		interface InsightsResponse {
			data: Array<{
				name: string;
				period: string;
				values: Array<{ value: number }>;
			}>;
		}

		const data = await this.request<InsightsResponse>("/me/insights", {
			metric: metrics,
			period: period,
		});

		const result: InstagramAccountInsights = {
			reach: 0,
			impressions: 0,
			profile_views: 0,
		};

		for (const metric of data.data) {
			const value = metric.values[0]?.value ?? 0;
			switch (metric.name) {
				case "reach":
					result.reach = value;
					break;
				case "impressions":
					result.impressions = value;
					break;
				case "profile_views":
					result.profile_views = value;
					break;
			}
		}

		return result;
	}

	/**
	 * Get recent media posts
	 *
	 * @param limit - Maximum number of posts to retrieve (default: 25)
	 */
	async getRecentMedia(limit: number = 25): Promise<InstagramMedia[]> {
		const fields = [
			"id",
			"caption",
			"media_type",
			"timestamp",
			"like_count",
			"comments_count",
			"permalink",
			"thumbnail_url",
			"media_url",
		].join(",");

		interface MediaResponse {
			data: InstagramMedia[];
			paging?: {
				cursors: { after: string; before: string };
				next?: string;
			};
		}

		const data = await this.request<MediaResponse>("/me/media", {
			fields,
			limit: limit.toString(),
		});

		return data.data;
	}

	/**
	 * Get insights for a specific media item
	 *
	 * Note: This requires the Instagram account to be a Business or Creator account
	 *
	 * @param mediaId - The ID of the media item
	 */
	async getMediaInsights(mediaId: string): Promise<InstagramMediaInsights> {
		// Different metrics are available for different media types
		// We'll try the most common ones
		const metrics = [
			"reach",
			"impressions",
			"engagement",
			"saved",
			"shares",
		].join(",");

		interface MediaInsightsResponse {
			data: Array<{
				name: string;
				values: Array<{ value: number }>;
			}>;
		}

		const result: InstagramMediaInsights = {
			reach: 0,
			impressions: 0,
			engagement: 0,
			saved: 0,
			shares: 0,
		};

		try {
			const data = await this.request<MediaInsightsResponse>(
				`/${mediaId}/insights`,
				{
					metric: metrics,
				},
			);

			for (const metric of data.data) {
				const value = metric.values[0]?.value ?? 0;
				switch (metric.name) {
					case "reach":
						result.reach = value;
						break;
					case "impressions":
						result.impressions = value;
						break;
					case "engagement":
						result.engagement = value;
						break;
					case "saved":
						result.saved = value;
						break;
					case "shares":
						result.shares = value;
						break;
				}
			}
		} catch (error) {
			// Some metrics may not be available for certain media types
			// Log and return partial results
			if (error instanceof InstagramApiException) {
				console.warn(
					`Could not fetch all media insights for ${mediaId}:`,
					error.message,
				);
			} else {
				throw error;
			}
		}

		return result;
	}

	/**
	 * Get audience insights including best posting times
	 *
	 * Returns when followers are most active (UTC hours, by day of week)
	 */
	async getAudienceInsights(): Promise<InstagramAudienceInsights> {
		interface AudienceResponse {
			data: Array<{
				name: string;
				values: Array<{ value: Record<string, number[]> }>;
			}>;
		}

		try {
			const data = await this.request<AudienceResponse>("/me/insights", {
				metric: "online_followers",
				period: "lifetime",
			});

			const onlineFollowersMetric = data.data.find(
				(m) => m.name === "online_followers",
			);

			if (onlineFollowersMetric && onlineFollowersMetric.values[0]) {
				return {
					online_followers: onlineFollowersMetric.values[0].value,
				};
			}
		} catch (error) {
			if (error instanceof InstagramApiException) {
				console.warn("Could not fetch audience insights:", error.message);
			} else {
				throw error;
			}
		}

		// Return empty structure if not available
		return {
			online_followers: {},
		};
	}

	/**
	 * Verify the access token is valid and get basic user info
	 */
	async verifyToken(): Promise<boolean> {
		try {
			await this.getAccountInfo();
			return true;
		} catch {
			return false;
		}
	}
}

export { InstagramApiException };
