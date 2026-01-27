"use client";

import { useState } from "react";
import { X, Trash2, Calendar, Clock } from "lucide-react";
import type { CalendarEvent } from "@/lib/actions/calendar";

interface EventModalProps {
	event: CalendarEvent;
	onClose: () => void;
	onDelete: (eventId: string) => Promise<void>;
	onMove: (eventId: string, newDate: Date) => Promise<void>;
}

export function EventModal({
	event,
	onClose,
	onDelete,
	onMove,
}: EventModalProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const [isMoving, setIsMoving] = useState(false);
	const [selectedDate, setSelectedDate] = useState<string>(
		event.scheduledFor
			? new Date(event.scheduledFor).toISOString().split("T")[0]
			: new Date().toISOString().split("T")[0],
	);
	const [showDatePicker, setShowDatePicker] = useState(false);

	const contentTypeLabel = {
		REEL: "Reel",
		CAROUSEL: "Carousel",
		SINGLE_IMAGE: "Post",
		STORY: "Story",
		TEXT_POST: "Text Post",
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await onDelete(event.id);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleMove = async () => {
		if (!selectedDate) return;
		setIsMoving(true);
		try {
			const newDate = new Date(selectedDate);
			newDate.setHours(12, 0, 0, 0); // Set to noon
			await onMove(event.id, newDate);
			setShowDatePicker(false);
		} finally {
			setIsMoving(false);
		}
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatTime = (date: Date) => {
		return new Date(date).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-gray-900">
						Scheduled Content
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-4">
					{/* Title */}
					<div>
						<p className="text-xs font-medium text-gray-500 mb-1">TITLE</p>
						<p className="text-lg font-semibold text-gray-900">
							{event.idea.title}
						</p>
					</div>

					{/* Content Type & Pillar */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-xs font-medium text-gray-500 mb-2">
								CONTENT TYPE
							</p>
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full bg-purple-500" />
								<span className="text-sm font-medium text-gray-900">
									{
										contentTypeLabel[
											event.idea.contentType as keyof typeof contentTypeLabel
										]
									}
								</span>
							</div>
						</div>
						<div>
							<p className="text-xs font-medium text-gray-500 mb-2">PILLAR</p>
							{event.idea.pillar && (
								<div className="text-sm font-medium text-gray-900">
									{event.idea.pillar.emoji} {event.idea.pillar.name}
								</div>
							)}
						</div>
					</div>

					{/* Scheduled Date & Time */}
					<div className="bg-gray-50 rounded-lg p-4">
						<p className="text-xs font-medium text-gray-500 mb-3">
							SCHEDULED FOR
						</p>
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-gray-400" />
								<span className="text-sm font-medium text-gray-900">
									{formatDate(event.scheduledFor)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="w-4 h-4 text-gray-400" />
								<span className="text-sm font-medium text-gray-900">
									{formatTime(event.scheduledFor)}
								</span>
							</div>
						</div>
					</div>

					{/* Date Picker for Rescheduling */}
					{showDatePicker && (
						<div className="space-y-2">
							<label className="text-xs font-medium text-gray-500">
								RESCHEDULE TO
							</label>
							<input
								type="date"
								value={selectedDate}
								onChange={(e) => setSelectedDate(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
								min={new Date().toISOString().split("T")[0]}
							/>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200">
					{!showDatePicker ? (
						<>
							<button
								onClick={() => setShowDatePicker(true)}
								className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
							>
								Reschedule
							</button>
							<button
								onClick={handleDelete}
								disabled={isDeleting}
								className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
								title="Delete event"
							>
								<Trash2 className="w-5 h-5" />
							</button>
						</>
					) : (
						<>
							<button
								onClick={() => setShowDatePicker(false)}
								className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleMove}
								disabled={isMoving}
								className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
							>
								{isMoving ? "Saving..." : "Save"}
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
