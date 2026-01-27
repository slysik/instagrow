import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ReelsClient from "./reels-client";

export const metadata = {
	title: "Reel Script Generator",
	description: "Generate viral Instagram Reel scripts with AI",
};

interface PageProps {
	searchParams: {
		accountId?: string;
	};
}

export default async function ReelsPage({ searchParams }: PageProps) {
	// Check authentication
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login");
	}

	const userId = session.user.id;
	let selectedAccountId = searchParams.accountId;

	// Get first account if not specified
	if (!selectedAccountId) {
		const firstAccount = await prisma.instagramAccount.findFirst({
			where: { userId, isActive: true },
			select: { id: true },
		});

		if (!firstAccount) {
			redirect("/dashboard/settings?tab=accounts");
		}

		selectedAccountId = firstAccount.id;
	}

	// Verify user owns the selected account
	const account = await prisma.instagramAccount.findFirst({
		where: {
			id: selectedAccountId,
			userId,
		},
		select: {
			id: true,
			igUsername: true,
			igName: true,
		},
	});

	if (!account) {
		redirect("/dashboard/settings?tab=accounts");
	}

	// Get pillars for this account
	const pillars = await prisma.pillar.findMany({
		where: { accountId: account.id },
		orderBy: { weight: "desc" },
	});

	// Get recent scripts for history
	const recentScripts = await prisma.idea.findMany({
		where: {
			contentType: "REEL",
			pillar: {
				accountId: account.id,
			},
		},
		include: {
			pillar: {
				select: {
					name: true,
				},
			},
		},
		orderBy: { createdAt: "desc" },
		take: 5,
	});

	return (
		<div className="max-w-6xl mx-auto">
			<ReelsClient
				accountId={account.id}
				igUsername={account.igUsername}
				pillars={pillars}
				recentScripts={recentScripts.map((idea) => ({
					id: idea.id,
					title: idea.title,
					pillarName: idea.pillar.name,
					createdAt: idea.createdAt,
				}))}
			/>
		</div>
	);
}
