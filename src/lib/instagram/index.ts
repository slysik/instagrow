/**
 * Instagram Integration Module
 *
 * Re-exports all Instagram-related functionality
 */

export { InstagramClient, InstagramApiException } from "./client";
export type {
	InstagramAccountInfo,
	InstagramAccountInsights,
	InstagramMedia,
	InstagramMediaInsights,
	InstagramAudienceInsights,
	InstagramApiError,
} from "./client";

export {
	getInstagramAuthUrl,
	exchangeCodeForToken,
	getLongLivedToken,
	getInstagramAccountToken,
	getUserPages,
	getInstagramBusinessAccountId,
	refreshLongLivedToken,
	generateState,
	INSTAGRAM_SCOPES,
} from "./oauth";
