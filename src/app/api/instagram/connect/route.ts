/**
 * Instagram Connect API Route
 *
 * Initiates the Instagram OAuth flow by redirecting to Facebook's OAuth dialog.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { getInstagramAuthUrl, generateState } from "@/lib/instagram/oauth";

export async function GET(request: NextRequest) {
	try {
		// Check authentication
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.redirect(new URL("/login", request.url));
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
		const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
		const redirectUri = `${baseUrl}/api/instagram/callback`;

		// Generate auth URL and redirect
		const authUrl = getInstagramAuthUrl(redirectUri, state);

		return NextResponse.redirect(authUrl);
	} catch (error) {
		console.error("Error initiating Instagram connection:", error);

		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";

		return NextResponse.redirect(
			new URL(
				`/dashboard/settings?error=connection_failed&message=${encodeURIComponent(errorMessage)}`,
				request.url,
			),
		);
	}
}
