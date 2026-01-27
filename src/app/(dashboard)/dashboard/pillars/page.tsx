import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPillars, getFirstInstagramAccount } from "@/lib/actions/pillars";
import { PillarsClient } from "./pillars-client";
import { LoadingState } from "@/components/ui/LoadingState";

export default async function PillarsPage() {
	const session = await auth();
	if (!session?.user) {
		redirect("/login");
	}

	return (
		<Suspense
			fallback={<LoadingState variant="spinner" text="Loading pillars..." />}
		>
			<PillarsPageContent />
		</Suspense>
	);
}

async function PillarsPageContent() {
	// Get the user's first Instagram account
	const account = await getFirstInstagramAccount();

	// If no account, show setup state
	if (!account) {
		return (
			<div className="max-w-4xl mx-auto">
				<div className="text-center py-16">
					<div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
						<svg
							className="w-10 h-10 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-3">
						Connect Your Instagram
					</h1>
					<p className="text-gray-600 mb-8 max-w-md mx-auto">
						To start building your content pillars, please connect your
						Instagram account first.
					</p>
					<a href="/dashboard/settings" className="btn btn-primary">
						Go to Settings
					</a>
				</div>
			</div>
		);
	}

	// Fetch pillars for this account
	const pillars = await getPillars(account.id);

	return <PillarsClient accountId={account.id} initialPillars={pillars} />;
}
