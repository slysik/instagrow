/**
 * Instagram OAuth Callback Handler
 *
 * Handles the OAuth callback after user authorizes the Instagram connection.
 * Exchanges the code for an access token and stores the Instagram account.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
	exchangeCodeForToken,
	getLongLivedToken,
	getInstagramAccountToken,
} from "@/lib/instagram/oauth";
import { InstagramClient } from "@/lib/instagram/client";

export async function GET(request: NextRequest) {
	try {
		// Get the current user session
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.redirect(
				new URL("/login?error=unauthorized", request.url),
			);
		}

		// Get query parameters
		const searchParams = request.nextUrl.searchParams;
		const code = searchParams.get("code");
		const state = searchParams.get("state");
		const error = searchParams.get("error");
		const errorDescription = searchParams.get("error_description");

		// Handle OAuth errors
		if (error) {
			console.error("Instagram OAuth error:", error, errorDescription);
			return NextResponse.redirect(
				new URL(
					`/dashboard/settings?error=instagram_oauth_error&message=${encodeURIComponent(errorDescription || error)}`,
					request.url,
				),
			);
		}

		// Validate required parameters
		if (!code || !state) {
			return NextResponse.redirect(
				new URL("/dashboard/settings?error=missing_params", request.url),
			);
		}

		// Verify state matches (CSRF protection)
		const cookieStore = await cookies();
		const storedState = cookieStore.get("instagram_oauth_state")?.value;

		if (!storedState || storedState !== state) {
			return NextResponse.redirect(
				new URL("/dashboard/settings?error=invalid_state", request.url),
			);
		}

		// Clear the state cookie
		cookieStore.delete("instagram_oauth_state");

		// Build redirect URI (must match exactly what was used in the auth request)
		const redirectUri = `${request.nextUrl.origin}/api/instagram/callback`;

		// Exchange code for short-lived token
		const { access_token: shortLivedToken } = await exchangeCodeForToken(
			code,
			redirectUri,
		);

		// Exchange short-lived token for long-lived token
		const { access_token: longLivedToken, expires_in } =
			await getLongLivedToken(shortLivedToken);

		// Get the Instagram Business Account linked to user's Facebook Page
		const igAccountInfo = await getInstagramAccountToken(longLivedToken);

		if (!igAccountInfo) {
			return NextResponse.redirect(
				new URL(
					"/dashboard/settings?error=no_instagram_account&message=" +
						encodeURIComponent(
							"No Instagram Business or Creator account found. Please make sure your Instagram account is connected to a Facebook Page.",
						),
					request.url,
				),
			);
		}

		// Create Instagram client to fetch account details
		const client = new InstagramClient(igAccountInfo.accessToken);
		const accountInfo = await client.getAccountInfo();

		// Calculate token expiration date
		const tokenExpiresAt = new Date();
		tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + expires_in);

		// Check if this Instagram account is already connected to another user
		const existingAccount = await prisma.instagramAccount.findUnique({
			where: { igUserId: igAccountInfo.igUserId },
		});

		if (existingAccount && existingAccount.userId !== session.user.id) {
			return NextResponse.redirect(
				new URL(
					"/dashboard/settings?error=account_linked_to_other_user&message=" +
						encodeURIComponent(
							"This Instagram account is already connected to another InstaGrow account.",
						),
					request.url,
				),
			);
		}

		// Create or update the Instagram account in the database
		await prisma.instagramAccount.upsert({
			where: { igUserId: igAccountInfo.igUserId },
			create: {
				userId: session.user.id,
				igUserId: igAccountInfo.igUserId,
				igUsername: accountInfo.username,
				igName: accountInfo.name || accountInfo.username,
				igProfilePic: accountInfo.profile_picture_url,
				igFollowerCount: accountInfo.followers_count,
				igAccountType: "BUSINESS", // Could also be CREATOR
				accessToken: igAccountInfo.accessToken,
				tokenExpiresAt: tokenExpiresAt,
				isActive: true,
			},
			update: {
				igUsername: accountInfo.username,
				igName: accountInfo.name || accountInfo.username,
				igProfilePic: accountInfo.profile_picture_url,
				igFollowerCount: accountInfo.followers_count,
				accessToken: igAccountInfo.accessToken,
				tokenExpiresAt: tokenExpiresAt,
				isActive: true,
			},
		});

		// Redirect back to settings with success
		return NextResponse.redirect(
			new URL(
				"/dashboard/settings?success=instagram_connected&account=" +
					encodeURIComponent(accountInfo.username),
				request.url,
			),
		);
	} catch (error) {
		console.error("Instagram callback error:", error);

		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";

		return NextResponse.redirect(
			new URL(
				`/dashboard/settings?error=connection_failed&message=${encodeURIComponent(errorMessage)}`,
				request.url,
			),
		);
	}
}
