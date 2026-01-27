import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import CaptionWriterClient from "./captions-client";

interface PageProps {
	searchParams: {
		pillarId?: string;
	};
}

export default async function CaptionWriterPage({ searchParams }: PageProps) {
	const session = await auth();

	// Redirect to login if not authenticated
	if (!session?.user?.id) {
		redirect("/login");
	}

	// Get the user's active Instagram account
	const account = await prisma.instagramAccount.findFirst({
		where: { userId: session.user.id, isActive: true },
	});

	if (!account) {
		return (
			<div className="max-w-4xl mx-auto">
				<div className="card text-center py-12">
					<h2 className="text-lg font-semibold text-gray-900 mb-2">
						No Instagram Account Found
					</h2>
					<p className="text-gray-600">
						Please connect your Instagram account to use the Caption Writer.
					</p>
				</div>
			</div>
		);
	}

	// Get pillars for the form
	const pillars = await prisma.pillar.findMany({
		where: { accountId: account.id },
		select: {
			id: true,
			name: true,
			emoji: true,
			color: true,
		},
		orderBy: { weight: "desc" },
	});

	// Get selected pillar if provided
	const selectedPillarId = searchParams.pillarId;
	const selectedPillar = selectedPillarId
		? pillars.find((p) => p.id === selectedPillarId)
		: undefined;

	return (
		<CaptionWriterClient
			pillars={pillars}
			selectedPillarId={selectedPillar?.id}
			accountId={account.id}
		/>
	);
}
