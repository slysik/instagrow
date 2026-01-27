import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPillars } from "@/lib/actions/pillars";
import { getFirstInstagramAccount } from "@/lib/actions/pillars";
import CarouselsClient from "./carousels-client";

export default async function CarouselPage() {
	// Check authentication
	const session = await auth();
	if (!session?.user) {
		redirect("/login");
	}

	// Get the user's first Instagram account
	const account = await getFirstInstagramAccount();
	if (!account) {
		redirect("/dashboard");
	}

	// Get pillars for the account
	const pillars = await getPillars(account.id);

	if (pillars.length === 0) {
		return (
			<div className="max-w-4xl mx-auto">
				<div className="card text-center py-12">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Create Your First Pillar
					</h1>
					<p className="text-gray-600 mb-6">
						You need to create at least one content pillar to use the Carousel
						Repurposer.
					</p>
					<a href="/dashboard/pillars" className="btn btn-gradient inline-flex">
						Go to Pillars
					</a>
				</div>
			</div>
		);
	}

	// Format pillars for client component
	const formattedPillars = pillars.map((pillar) => ({
		id: pillar.id,
		name: pillar.name,
		color: pillar.color,
		emoji: pillar.emoji,
	}));

	return <CarouselsClient accountId={account.id} pillars={formattedPillars} />;
}
