import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-compatible auth config (no Prisma imports)
export const authConfig: NextAuthConfig = {
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
	],
	pages: {
		signIn: "/login",
	},
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user;
			const isAuthPage = nextUrl.pathname.startsWith("/login");
			const isDashboard = nextUrl.pathname.startsWith("/dashboard");

			// Redirect logged-in users away from auth pages
			if (isLoggedIn && isAuthPage) {
				return Response.redirect(new URL("/dashboard", nextUrl));
			}

			// Protect dashboard routes
			if (!isLoggedIn && isDashboard) {
				return false; // Redirect to login
			}

			return true;
		},
	},
};
