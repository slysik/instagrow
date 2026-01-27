import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
	getCalendarEvents,
	getFirstInstagramAccount,
} from "@/lib/actions/calendar";
import { CalendarClient } from "./calendar-client";
import { LoadingState } from "@/components/ui/LoadingState";

export default async function CalendarPage() {
	const session = await auth();
	if (!session?.user) {
		redirect("/login");
	}

	return (
		<Suspense
			fallback={<LoadingState variant="spinner" text="Loading calendar..." />}
		>
			<CalendarPageContent />
		</Suspense>
	);
}

async function CalendarPageContent() {
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
						To start planning your content calendar, please connect your
						Instagram account first.
					</p>
					<a href="/dashboard/settings" className="btn btn-primary">
						Go to Settings
					</a>
				</div>
			</div>
		);
	}

	// Fetch events for the current month
	const today = new Date();
	const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
	const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
	endOfMonth.setHours(23, 59, 59, 999);

	const events = await getCalendarEvents(account.id, startOfMonth, endOfMonth);

	return <CalendarClient accountId={account.id} initialEvents={events} />;
}
