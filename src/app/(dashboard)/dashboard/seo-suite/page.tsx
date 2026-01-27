import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFirstInstagramAccount } from "@/lib/actions/pillars";
import { getSavedHashtagSets } from "@/lib/actions/seo";
import { SEOClient } from "./seo-client";
import { LoadingState } from "@/components/ui/LoadingState";

export default async function SEOSuitePage() {
	const session = await auth();
	if (!session?.user) {
		redirect("/login");
	}

	return (
		<Suspense
			fallback={<LoadingState variant="spinner" text="Loading SEO Suite..." />}
		>
			<SEOSuitePageContent />
		</Suspense>
	);
}

async function SEOSuitePageContent() {
	// Get the user's first Instagram account
	const account = await getFirstInstagramAccount();

	// If no account, show setup state
	if (!account) {
		return (
			<div className="max-w-4xl mx-auto">
				<div className="text-center py-16">
					<div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
						<svg
							className="w-10 h-10 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
							/>
						</svg>
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-3">
						Connect Your Instagram
					</h1>
					<p className="text-gray-600 mb-8 max-w-md mx-auto">
						To start optimizing your content SEO, please connect your Instagram
						account first.
					</p>
					<a href="/dashboard/settings" className="btn btn-primary">
						Go to Settings
					</a>
				</div>
			</div>
		);
	}

	// Fetch saved hashtag sets for this account
	const savedSets = await getSavedHashtagSets(account.id);

	return <SEOClient accountId={account.id} initialSavedSets={savedSets} />;
}
