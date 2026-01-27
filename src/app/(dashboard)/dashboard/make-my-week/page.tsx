import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFirstInstagramAccount } from "@/lib/actions/calendar";
import { getPillars } from "@/lib/actions/pillars";
import { getWeeklyPlanHistory } from "@/lib/actions/make-my-week";
import { getCalendarEvents } from "@/lib/actions/calendar";
import MakeMyWeekClient from "./make-my-week-client";

export default async function MakeMyWeekPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	// Get the user's Instagram account
	const account = await getFirstInstagramAccount();

	if (!account) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold">No Instagram Account</h1>
					<p className="mt-2 text-gray-600">
						Please connect your Instagram account first.
					</p>
				</div>
			</div>
		);
	}

	// Get pillars
	const pillars = await getPillars(account.id);

	if (pillars.length === 0) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold">No Content Pillars</h1>
					<p className="mt-2 text-gray-600">
						Please create content pillars in the Pillar Builder first.
					</p>
					<a
						href="/dashboard/pillars"
						className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Go to Pillar Builder
					</a>
				</div>
			</div>
		);
	}

	// Get existing calendar events for context (next 7 days)
	const today = new Date();
	const nextWeek = new Date(today);
	nextWeek.setDate(today.getDate() + 7);
	const existingEvents = await getCalendarEvents(account.id, today, nextWeek);

	// Get plan history
	const historyResult = await getWeeklyPlanHistory(account.id, 5);
	const planHistory = historyResult.success ? historyResult.plans || [] : [];

	return (
		<MakeMyWeekClient
			accountId={account.id}
			accountUsername={account.igUsername}
			pillars={pillars}
			existingEvents={existingEvents}
			planHistory={planHistory}
		/>
	);
}
