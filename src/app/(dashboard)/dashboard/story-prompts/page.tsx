import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StoriesClient } from "./stories-client";

export const metadata = {
	title: "Story Prompts - InstaGrow",
	description: "Generate AI-powered story ideas for your Instagram account",
};

export default async function StoryPromptsPage() {
	// Check authentication
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/auth/signin");
	}

	// Get user's active Instagram account
	const account = await prisma.instagramAccount.findFirst({
		where: {
			userId: session.user.id,
			isActive: true,
		},
	});

	if (!account) {
		redirect("/dashboard/settings");
	}

	// Get pillars for the account
	const pillars = await prisma.pillar.findMany({
		where: {
			accountId: account.id,
		},
		select: {
			id: true,
			name: true,
			color: true,
			emoji: true,
		},
		orderBy: {
			weight: "desc",
		},
	});

	return <StoriesClient pillars={pillars} accountId={account.id} />;
}
