"use client";

import { useState } from "react";
import {
	Calendar,
	Plus,
	Clock,
	ChevronLeft,
	ChevronRight,
	Video,
	Layers,
	Image as ImageIcon,
	Wand2,
	Sun,
	Moon,
	CalendarDays,
	Grid3X3,
} from "lucide-react";
import { toast } from "sonner";
import {
	getCalendarEvents,
	moveCalendarEvent,
	deleteCalendarEvent,
} from "@/lib/actions/calendar";
import type { CalendarEvent } from "@/lib/actions/calendar";
import { EventModal } from "./event-modal";

interface CalendarClientProps {
	accountId: string;
	initialEvents: CalendarEvent[];
}

const postTypeConfig = {
	REEL: {
		color: "bg-purple-100 text-purple-700 border-purple-200",
		icon: Video,
		label: "Reel",
		bgColor: "bg-purple-500",
	},
	CAROUSEL: {
		color: "bg-blue-100 text-blue-700 border-blue-200",
		icon: Layers,
		label: "Carousel",
		bgColor: "bg-blue-500",
	},
	SINGLE_IMAGE: {
		color: "bg-orange-100 text-orange-700 border-orange-200",
		icon: ImageIcon,
		label: "Post",
		bgColor: "bg-orange-500",
	},
	STORY: {
		color: "bg-pink-100 text-pink-700 border-pink-200",
		icon: ImageIcon,
		label: "Story",
		bgColor: "bg-pink-500",
	},
	TEXT_POST: {
		color: "bg-yellow-100 text-yellow-700 border-yellow-200",
		icon: ImageIcon,
		label: "Text",
		bgColor: "bg-yellow-500",
	},
};

const feedMixRules = [
	{
		type: "REEL",
		recommended: 2,
		label: "Reels",
		color: "bg-purple-500",
	},
	{
		type: "CAROUSEL",
		recommended: 1,
		label: "Carousels",
		color: "bg-blue-500",
	},
	{
		type: "STORY",
		recommended: 2,
		label: "Stories",
		color: "bg-pink-500",
	},
];

const bestPostingTimes = {
	morning: { time: "8:00 AM", label: "Morning", icon: Sun },
	evening: { time: "7:00 PM", label: "Evening", icon: Moon },
};

// Get start of week (Monday)
const getWeekStart = (date: Date): Date => {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	return new Date(d.setDate(diff));
};

// Get start of month
const getMonthStart = (date: Date): Date => {
	return new Date(date.getFullYear(), date.getMonth(), 1);
};

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthNames = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export function CalendarClient({
	accountId,
	initialEvents,
}: CalendarClientProps) {
	const [viewMode, setViewMode] = useState<"weekly" | "monthly">("monthly");
	const [currentDate, setCurrentDate] = useState(new Date());
	const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
	const [showModal, setShowModal] = useState(false);

	const weekStart = getWeekStart(currentDate);
	const monthStart = getMonthStart(currentDate);

	const navigatePrev = () => {
		const newDate = new Date(currentDate);
		if (viewMode === "weekly") {
			newDate.setDate(newDate.getDate() - 7);
		} else {
			newDate.setMonth(newDate.getMonth() - 1);
		}
		setCurrentDate(newDate);
	};

	const navigateNext = () => {
		const newDate = new Date(currentDate);
		if (viewMode === "weekly") {
			newDate.setDate(newDate.getDate() + 7);
		} else {
			newDate.setMonth(newDate.getMonth() + 1);
		}
		setCurrentDate(newDate);
	};

	const getPostsForDate = (date: Date): CalendarEvent[] => {
		return events.filter(
			(event) =>
				event.scheduledFor &&
				new Date(event.scheduledFor).toDateString() === date.toDateString(),
		);
	};

	const handleDeleteEvent = async (eventId: string) => {
		try {
			await deleteCalendarEvent(eventId);
			setEvents(events.filter((e) => e.id !== eventId));
			setShowModal(false);
			toast.success("Event removed from calendar");
		} catch (error) {
			toast.error("Failed to remove event");
			console.error(error);
		}
	};

	const handleMoveEvent = async (eventId: string, newDate: Date) => {
		try {
			await moveCalendarEvent(eventId, newDate);
			// Refetch events for the current view
			const startDate = viewMode === "weekly" ? weekStart : monthStart;
			const endDate = new Date(
				viewMode === "weekly" ? weekStart : monthStart,
			);
			if (viewMode === "weekly") {
				endDate.setDate(endDate.getDate() + 7);
			} else {
				endDate.setMonth(endDate.getMonth() + 1);
			}
			const newEvents = await getCalendarEvents(accountId, startDate, endDate);
			setEvents(newEvents);
			toast.success("Event rescheduled");
		} catch (error) {
			toast.error("Failed to reschedule event");
			console.error(error);
		}
	};

	const generateWeekDays = (): Date[] => {
		const days: Date[] = [];
		for (let i = 0; i < 7; i++) {
			const day = new Date(weekStart);
			day.setDate(weekStart.getDate() + i);
			days.push(day);
		}
		return days;
	};

	const generateMonthDays = (): (Date | null)[] => {
		const days: (Date | null)[] = [];
		const firstDay = new Date(monthStart);
		const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

		let startDayOfWeek = firstDay.getDay() - 1;
		if (startDayOfWeek < 0) startDayOfWeek = 6;

		for (let i = 0; i < startDayOfWeek; i++) {
			days.push(null);
		}

		for (let d = 1; d <= lastDay.getDate(); d++) {
			days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), d));
		}

		return days;
	};

	const weekDays = generateWeekDays();
	const monthDays = generateMonthDays();

	const isToday = (date: Date): boolean => {
		const today = new Date();
		return date.toDateString() === today.toDateString();
	};

	const isEmpty = events.length === 0;

	// Calculate stats for the current view
	const getStatsForRange = (start: Date, end: Date) => {
		const rangeEvents = events.filter(
			(event) =>
				event.scheduledFor &&
				new Date(event.scheduledFor) >= start &&
				new Date(event.scheduledFor) <= end,
		);

		const stats: Record<string, number> = {};
		feedMixRules.forEach((rule) => {
			stats[rule.type] = rangeEvents.filter(
				(e) => e.idea.contentType === rule.type,
			).length;
		});
		return stats;
	};

	const weekEnd = new Date(weekStart);
	weekEnd.setDate(weekEnd.getDate() + 6);
	weekEnd.setHours(23, 59, 59, 999);
	const weekStats = getStatsForRange(weekStart, weekEnd);

	return (
		<div className="max-w-7xl mx-auto">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 mb-1">
						Content Calendar
					</h1>
					<p className="text-gray-600">
						Plan and visualize your Instagram content schedule
					</p>
				</div>
			</div>

			<div className="flex flex-col lg:flex-row gap-6">
				{/* Main Calendar Area */}
				<div className="flex-1">
					{/* Calendar Controls */}
					<div className="card mb-4">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							{/* Navigation */}
							<div className="flex items-center gap-2">
								<button
									onClick={navigatePrev}
									className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
								>
									<ChevronLeft className="w-5 h-5 text-gray-600" />
								</button>
								<h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
									{viewMode === "weekly"
										? `Week of ${weekStart.toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											})}`
										: `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
								</h2>
								<button
									onClick={navigateNext}
									className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
								>
									<ChevronRight className="w-5 h-5 text-gray-600" />
								</button>
							</div>

							{/* View Toggle */}
							<div className="flex items-center bg-gray-100 rounded-lg p-1">
								<button
									onClick={() => setViewMode("weekly")}
									className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
										viewMode === "weekly"
											? "bg-white text-gray-900 shadow-sm"
											: "text-gray-600 hover:text-gray-900"
									}`}
								>
									<CalendarDays className="w-4 h-4" />
									Weekly
								</button>
								<button
									onClick={() => setViewMode("monthly")}
									className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
										viewMode === "monthly"
											? "bg-white text-gray-900 shadow-sm"
											: "text-gray-600 hover:text-gray-900"
									}`}
								>
									<Grid3X3 className="w-4 h-4" />
									Monthly
								</button>
							</div>
						</div>
					</div>

					{/* Empty State */}
					{isEmpty && (
						<div className="card text-center py-12">
							<div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Calendar className="w-8 h-8 text-purple-600" />
							</div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Your calendar is empty
							</h3>
							<p className="text-gray-600 mb-6 max-w-md mx-auto">
								Start planning your content by scheduling ideas from your content
								library. Go to the content library to create and schedule posts.
							</p>
							<a
								href="/dashboard/library"
								className="btn bg-ig-gradient text-white hover:opacity-90"
							>
								<Plus className="w-4 h-4 mr-2" />
								Go to Content Library
							</a>
						</div>
					)}

					{/* Weekly View */}
					{!isEmpty && viewMode === "weekly" && (
						<div className="grid grid-cols-7 gap-2">
							{/* Day Headers */}
							{dayNames.map((day) => (
								<div
									key={day}
									className="text-center text-sm font-medium text-gray-500 pb-2"
								>
									{day}
								</div>
							))}

							{/* Day Cells */}
							{weekDays.map((date) => {
								const dayEvents = getPostsForDate(date);
								const dateIsToday = isToday(date);

								return (
									<div
										key={date.toISOString()}
										className={`card min-h-[200px] p-3 ${
											dateIsToday ? "ring-2 ring-purple-500 ring-offset-2" : ""
										}`}
									>
										{/* Date Header */}
										<div className="flex items-center justify-between mb-3">
											<span
												className={`text-sm font-semibold ${
													dateIsToday ? "text-purple-600" : "text-gray-900"
												}`}
											>
												{date.getDate()}
											</span>
										</div>

										{/* Events */}
										<div className="space-y-2">
											{dayEvents.map((event) => {
												const config =
													postTypeConfig[
														event.idea.contentType as keyof typeof postTypeConfig
													];
												const Icon = config?.icon || ImageIcon;

												return (
													<button
														key={event.id}
														onClick={() => {
															setSelectedEvent(event);
															setShowModal(true);
														}}
														className={`w-full text-left p-2 rounded-lg border text-xs ${
															config?.color ||
															"bg-gray-100 text-gray-700 border-gray-200"
														} cursor-pointer hover:opacity-80 transition-opacity`}
													>
														<div className="flex items-center gap-1.5 mb-1">
															<Icon className="w-3 h-3" />
															<span className="font-medium truncate">
																{config?.label || "Content"}
															</span>
														</div>
														<p className="text-gray-700 line-clamp-2">
															{event.idea.title}
														</p>
														{event.idea.pillar && (
															<div
																className="mt-1 text-xs px-1.5 py-0.5 rounded inline-block"
																style={{
																	backgroundColor:
																		event.idea.pillar.color || "#e5e7eb",
																	color:
																		event.idea.pillar.color &&
																		isColorLight(event.idea.pillar.color)
																			? "#000"
																			: "#fff",
																}}
															>
																{event.idea.pillar.emoji}{" "}
																{event.idea.pillar.name}
															</div>
														)}
													</button>
												);
											})}
										</div>
									</div>
								);
							})}
						</div>
					)}

					{/* Monthly View */}
					{!isEmpty && viewMode === "monthly" && (
						<div className="grid grid-cols-7 gap-1">
							{/* Day Headers */}
							{dayNames.map((day) => (
								<div
									key={day}
									className="text-center text-sm font-medium text-gray-500 py-2"
								>
									{day}
								</div>
							))}

							{/* Day Cells */}
							{monthDays.map((date, index) => {
								if (!date) {
									return (
										<div
											key={`empty-${index}`}
											className="min-h-[100px] bg-gray-50 rounded-lg"
										/>
									);
								}

								const dayEvents = getPostsForDate(date);
								const dateIsToday = isToday(date);

								return (
									<div
										key={date.toISOString()}
										className={`min-h-[100px] bg-white border border-gray-100 rounded-lg p-2 ${
											dateIsToday ? "ring-2 ring-purple-500" : ""
										}`}
									>
										<div className="flex items-center justify-between mb-2">
											<span
												className={`text-xs font-medium ${
													dateIsToday ? "text-purple-600" : "text-gray-700"
												}`}
											>
												{date.getDate()}
											</span>
										</div>

										{/* Event Indicators */}
										<div className="space-y-1">
											{dayEvents.slice(0, 2).map((event) => {
												const config =
													postTypeConfig[
														event.idea.contentType as keyof typeof postTypeConfig
													];

												return (
													<button
														key={event.id}
														onClick={() => {
															setSelectedEvent(event);
															setShowModal(true);
														}}
														className="w-full text-left text-xs px-1.5 py-1 rounded bg-gray-50 hover:bg-gray-100 truncate"
														title={event.idea.title}
													>
														{config?.label || "Content"}: {event.idea.title}
													</button>
												);
											})}
											{dayEvents.length > 2 && (
												<span className="text-xs text-gray-400">
													+{dayEvents.length - 2} more
												</span>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Sidebar */}
				<div className="lg:w-80 space-y-4">
					{/* Feed Mix Rules */}
					<div className="card">
						<h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<Layers className="w-5 h-5 text-purple-500" />
							Daily Feed Mix
						</h3>
						<p className="text-sm text-gray-600 mb-4">
							Recommended content mix for optimal engagement
						</p>
						<div className="space-y-3">
							{feedMixRules.map((rule) => {
								const config =
									postTypeConfig[rule.type as keyof typeof postTypeConfig];
								const Icon = config?.icon || ImageIcon;
								return (
									<div key={rule.type} className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className={`w-8 h-8 ${rule.color} rounded-lg flex items-center justify-center`}>
												<Icon className="w-4 h-4 text-white" />
											</div>
											<span className="text-sm font-medium text-gray-700">
												{rule.label}
											</span>
										</div>
										<span className="text-sm text-gray-500">
											{rule.recommended}/day
										</span>
									</div>
								);
							})}
						</div>
					</div>

					{/* Best Posting Times */}
					<div className="card">
						<h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<Clock className="w-5 h-5 text-orange-500" />
							Best Posting Times
						</h3>
						<p className="text-sm text-gray-600 mb-4">
							Based on when your audience is most active
						</p>
						<div className="space-y-3">
							{Object.entries(bestPostingTimes).map(([key, value]) => {
								const Icon = value.icon;
								return (
									<div
										key={key}
										className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
									>
										<div
											className={`w-10 h-10 ${
												key === "morning" ? "bg-orange-100" : "bg-indigo-100"
											} rounded-lg flex items-center justify-center`}
										>
											<Icon
												className={`w-5 h-5 ${
													key === "morning" ? "text-orange-500" : "text-indigo-500"
												}`}
											/>
										</div>
										<div>
											<p className="text-sm font-medium text-gray-900">
												{value.label}
											</p>
											<p className="text-sm text-gray-500">{value.time}</p>
										</div>
										<span
											className={`ml-auto px-2 py-1 text-xs font-medium rounded-full ${
												key === "morning"
													? "bg-orange-100 text-orange-700"
													: "bg-indigo-100 text-indigo-700"
											}`}
										>
											Peak
										</span>
									</div>
								);
							})}
						</div>
					</div>

					{/* Week Stats */}
					{!isEmpty && (
						<div className="card">
							<h3 className="font-semibold text-gray-900 mb-4">
								This Week's Stats
							</h3>
							<div className="space-y-3">
								{feedMixRules.map((rule) => {
									const total = weekStats[rule.type] || 0;
									const recommended = rule.recommended * 7;
									const percentage = Math.min(100, (total / recommended) * 100);

									return (
										<div key={rule.type}>
											<div className="flex items-center justify-between text-sm mb-1">
												<span className="text-gray-600">{rule.label}</span>
												<span className="font-medium text-gray-900">
													{total}/{recommended}
												</span>
											</div>
											<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
												<div
													className={`h-full ${rule.color} rounded-full transition-all duration-500`}
													style={{ width: `${percentage}%` }}
												/>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Event Modal */}
			{showModal && selectedEvent && (
				<EventModal
					event={selectedEvent}
					onClose={() => setShowModal(false)}
					onDelete={handleDeleteEvent}
					onMove={handleMoveEvent}
				/>
			)}
		</div>
	);
}

// Helper to determine if a color is light
function isColorLight(color: string): boolean {
	const hex = color.replace("#", "");
	const r = parseInt(hex.substr(0, 2), 16);
	const g = parseInt(hex.substr(2, 2), 16);
	const b = parseInt(hex.substr(4, 2), 16);
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;
	return brightness > 155;
}
