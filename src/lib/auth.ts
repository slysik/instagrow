import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
	...authConfig,
	adapter: PrismaAdapter(prisma),
	callbacks: {
		...authConfig.callbacks,
		async jwt({ token, user, account }) {
			// Initial sign in
			if (account && user) {
				token.id = user.id;

				// Create trial subscription for new users
				if (account.provider === "google") {
					const existingUser = await prisma.user.findUnique({
						where: { email: user.email! },
						include: { subscription: true },
					});

					if (existingUser && !existingUser.subscription) {
						const trialEndsAt = new Date();
						trialEndsAt.setDate(trialEndsAt.getDate() + 7);

						await prisma.subscription.create({
							data: {
								userId: existingUser.id,
								status: "TRIALING",
								trialEndsAt,
								aiGenerationsLimit: 50,
								postsScheduledLimit: 20,
							},
						});
					}
				}
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user && token.id) {
				session.user.id = token.id as string;
			}
			return session;
		},
	},
	session: {
		strategy: "jwt",
	},
});

// Type augmentation for session
declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
		};
	}
}
