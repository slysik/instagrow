/**
 * Instagram OAuth Helpers
 *
 * Handles the OAuth 2.0 flow for Instagram Graph API authentication.
 * Instagram uses Facebook Login, so we need to go through the Facebook OAuth flow.
 *
 * @see https://developers.facebook.com/docs/instagram-api/getting-started
 */

const FACEBOOK_AUTH_URL = "https://www.facebook.com/v21.0/dialog/oauth";
const FACEBOOK_GRAPH_API = "https://graph.facebook.com/v21.0";

/**
 * Instagram OAuth scopes required for the app
 */
export const INSTAGRAM_SCOPES = [
	"instagram_basic",
	"instagram_content_publish",
	"instagram_manage_comments",
	"instagram_manage_insights",
	"pages_show_list",
	"pages_read_engagement",
	"business_management",
];

/**
 * Get the Instagram App ID from environment
 */
function getAppId(): string {
	const appId = process.env.INSTAGRAM_APP_ID;
	if (!appId) {
		throw new Error("INSTAGRAM_APP_ID environment variable is not set");
	}
	return appId;
}

/**
 * Get the Instagram App Secret from environment
 */
function getAppSecret(): string {
	const appSecret = process.env.INSTAGRAM_APP_SECRET;
	if (!appSecret) {
		throw new Error("INSTAGRAM_APP_SECRET environment variable is not set");
	}
	return appSecret;
}

/**
 * Generate the Instagram authorization URL
 *
 * @param redirectUri - The callback URL after authorization
 * @param state - A random string for CSRF protection
 * @returns The authorization URL to redirect the user to
 */
export function getInstagramAuthUrl(
	redirectUri: string,
	state: string,
): string {
	const params = new URLSearchParams({
		client_id: getAppId(),
		redirect_uri: redirectUri,
		scope: INSTAGRAM_SCOPES.join(","),
		response_type: "code",
		state: state,
	});

	return `${FACEBOOK_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for an access token
 *
 * @param code - The authorization code from the callback
 * @param redirectUri - The same redirect URI used in the authorization request
 * @returns The short-lived access token and user ID
 */
export async function exchangeCodeForToken(
	code: string,
	redirectUri: string,
): Promise<{ access_token: string; user_id: string }> {
	const params = new URLSearchParams({
		client_id: getAppId(),
		client_secret: getAppSecret(),
		redirect_uri: redirectUri,
		code: code,
	});

	const response = await fetch(
		`${FACEBOOK_GRAPH_API}/oauth/access_token?${params.toString()}`,
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`Failed to exchange code for token: ${error.error?.message || "Unknown error"}`,
		);
	}

	const data = await response.json();

	// Get the user's Facebook ID
	const userResponse = await fetch(
		`${FACEBOOK_GRAPH_API}/me?access_token=${data.access_token}`,
	);

	if (!userResponse.ok) {
		throw new Error("Failed to get user information");
	}

	const userData = await userResponse.json();

	return {
		access_token: data.access_token,
		user_id: userData.id,
	};
}

/**
 * Exchange a short-lived token for a long-lived token
 *
 * Long-lived tokens are valid for about 60 days.
 *
 * @param shortLivedToken - The short-lived access token
 * @returns The long-lived access token and expiration time
 */
export async function getLongLivedToken(
	shortLivedToken: string,
): Promise<{ access_token: string; expires_in: number }> {
	const params = new URLSearchParams({
		grant_type: "fb_exchange_token",
		client_id: getAppId(),
		client_secret: getAppSecret(),
		fb_exchange_token: shortLivedToken,
	});

	const response = await fetch(
		`${FACEBOOK_GRAPH_API}/oauth/access_token?${params.toString()}`,
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`Failed to get long-lived token: ${error.error?.message || "Unknown error"}`,
		);
	}

	const data = await response.json();

	return {
		access_token: data.access_token,
		expires_in: data.expires_in || 5184000, // Default to 60 days if not provided
	};
}

/**
 * Get the Instagram Business Account ID linked to a Facebook Page
 *
 * @param pageAccessToken - The page access token
 * @param pageId - The Facebook Page ID
 * @returns The Instagram Business Account ID
 */
export async function getInstagramBusinessAccountId(
	pageAccessToken: string,
	pageId: string,
): Promise<string | null> {
	const response = await fetch(
		`${FACEBOOK_GRAPH_API}/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`,
	);

	if (!response.ok) {
		return null;
	}

	const data = await response.json();
	return data.instagram_business_account?.id || null;
}

/**
 * Get all Facebook Pages the user manages
 *
 * @param userAccessToken - The user's access token
 * @returns List of pages with their access tokens
 */
export async function getUserPages(userAccessToken: string): Promise<
	Array<{
		id: string;
		name: string;
		access_token: string;
	}>
> {
	const response = await fetch(
		`${FACEBOOK_GRAPH_API}/me/accounts?access_token=${userAccessToken}`,
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`Failed to get user pages: ${error.error?.message || "Unknown error"}`,
		);
	}

	const data = await response.json();
	return data.data || [];
}

/**
 * Get the Instagram Business Account access token
 *
 * This finds the Facebook Page linked to the Instagram Business Account
 * and returns the appropriate access token.
 *
 * @param userAccessToken - The user's Facebook access token
 * @returns The Instagram account info or null if not found
 */
export async function getInstagramAccountToken(
	userAccessToken: string,
): Promise<{
	igUserId: string;
	pageId: string;
	accessToken: string;
	pageName: string;
} | null> {
	// Get all pages the user manages
	const pages = await getUserPages(userAccessToken);

	// Find a page with an Instagram Business Account
	for (const page of pages) {
		const igAccountId = await getInstagramBusinessAccountId(
			page.access_token,
			page.id,
		);

		if (igAccountId) {
			return {
				igUserId: igAccountId,
				pageId: page.id,
				accessToken: page.access_token,
				pageName: page.name,
			};
		}
	}

	return null;
}

/**
 * Refresh a long-lived token before it expires
 *
 * Note: Tokens can only be refreshed when at least 24 hours have passed
 * but before 60 days have elapsed.
 *
 * @param currentToken - The current long-lived token
 * @returns New long-lived token and expiration
 */
export async function refreshLongLivedToken(
	currentToken: string,
): Promise<{ access_token: string; expires_in: number }> {
	const params = new URLSearchParams({
		grant_type: "fb_exchange_token",
		client_id: getAppId(),
		client_secret: getAppSecret(),
		fb_exchange_token: currentToken,
	});

	const response = await fetch(
		`${FACEBOOK_GRAPH_API}/oauth/access_token?${params.toString()}`,
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`Failed to refresh token: ${error.error?.message || "Unknown error"}`,
		);
	}

	const data = await response.json();

	return {
		access_token: data.access_token,
		expires_in: data.expires_in || 5184000,
	};
}

/**
 * Generate a random state string for CSRF protection
 */
export function generateState(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
		"",
	);
}
