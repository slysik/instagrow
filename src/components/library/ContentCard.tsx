"use client";

import { useState } from "react";
import {
	Video,
	Image,
	Layers,
	MessageSquare,
	FileText,
	Edit3,
	Calendar,
	Trash2,
	Copy,
	MoreVertical,
	Clock,
	CheckCircle2,
	AlertCircle,
	Archive,
	Sparkles,
} from "lucide-react";
import type { ContentType, IdeaStatus } from "@prisma/client";

interface ContentCardProps {
	id: string;
	title: string;
	description?: string | null;
	caption?: string | null;
	contentType: ContentType;
	status: IdeaStatus;
	pillar: {
		name: string;
		color: string | null;
	};
	scheduledFor?: Date | null;
	createdAt: Date;
	isSelected?: boolean;
	onSelect?: (id: string) => void;
	onEdit?: (id: string) => void;
	onSchedule?: (id: string) => void;
	onDelete?: (id: string) => void;
	onDuplicate?: (id: string) => void;
}

const CONTENT_TYPE_CONFIG: Record<
	ContentType,
	{
		label: string;
		icon: typeof Video;
		bgColor: string;
		textColor: string;
	}
> = {
	REEL: {
		label: "Reel",
		icon: Video,
		bgColor: "bg-purple-100",
		textColor: "text-purple-700",
	},
	CAROUSEL: {
		label: "Carousel",
		icon: Layers,
		bgColor: "bg-blue-100",
		textColor: "text-blue-700",
	},
	SINGLE_IMAGE: {
		label: "Post",
		icon: Image,
		bgColor: "bg-green-100",
		textColor: "text-green-700",
	},
	STORY: {
		label: "Story",
		icon: MessageSquare,
		bgColor: "bg-orange-100",
		textColor: "text-orange-700",
	},
	TEXT_POST: {
		label: "Text",
		icon: FileText,
		bgColor: "bg-gray-100",
		textColor: "text-gray-700",
	},
};

const STATUS_CONFIG: Record<
	IdeaStatus,
	{
		label: string;
		icon: typeof Clock;
		bgColor: string;
		textColor: string;
	}
> = {
	DRAFT: {
		label: "Draft",
		icon: Clock,
		bgColor: "bg-gray-100",
		textColor: "text-gray-600",
	},
	GENERATED: {
		label: "Generated",
		icon: Sparkles,
		bgColor: "bg-yellow-100",
		textColor: "text-yellow-700",
	},
	SCHEDULED: {
		label: "Scheduled",
		icon: Calendar,
		bgColor: "bg-blue-100",
		textColor: "text-blue-700",
	},
	PUBLISHED: {
		label: "Published",
		icon: CheckCircle2,
		bgColor: "bg-green-100",
		textColor: "text-green-700",
	},
	FAILED: {
		label: "Failed",
		icon: AlertCircle,
		bgColor: "bg-red-100",
		textColor: "text-red-700",
	},
	ARCHIVED: {
		label: "Archived",
		icon: Archive,
		bgColor: "bg-gray-100",
		textColor: "text-gray-500",
	},
};

// Pillar color mapping
const PILLAR_COLORS: Record<string, { bg: string; text: string; dot: string }> =
	{
		"bg-orange-500": {
			bg: "bg-orange-100",
			text: "text-orange-700",
			dot: "bg-orange-500",
		},
		"bg-pink-500": {
			bg: "bg-pink-100",
			text: "text-pink-700",
			dot: "bg-pink-500",
		},
		"bg-purple-500": {
			bg: "bg-purple-100",
			text: "text-purple-700",
			dot: "bg-purple-500",
		},
		"bg-blue-500": {
			bg: "bg-blue-100",
			text: "text-blue-700",
			dot: "bg-blue-500",
		},
		"bg-teal-500": {
			bg: "bg-teal-100",
			text: "text-teal-700",
			dot: "bg-teal-500",
		},
		"bg-green-500": {
			bg: "bg-green-100",
			text: "text-green-700",
			dot: "bg-green-500",
		},
	};

function getPillarColors(color: string | null) {
	if (color && PILLAR_COLORS[color]) {
		return PILLAR_COLORS[color];
	}
	return { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" };
}

export function ContentCard({
	id,
	title,
	description,
	caption,
	contentType,
	status,
	pillar,
	scheduledFor,
	createdAt,
	isSelected = false,
	onSelect,
	onEdit,
	onSchedule,
	onDelete,
	onDuplicate,
}: ContentCardProps) {
	const [showActions, setShowActions] = useState(false);

	const typeConfig = CONTENT_TYPE_CONFIG[contentType];
	const statusConfig = STATUS_CONFIG[status];
	const pillarColors = getPillarColors(pillar.color);
	const TypeIcon = typeConfig.icon;
	const StatusIcon = statusConfig.icon;

	const previewText = caption || description || "No content yet...";
	const truncatedPreview =
		previewText.length > 120
			? previewText.substring(0, 120) + "..."
			: previewText;

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div
			className={`card relative group transition-all hover:shadow-lg ${
				isSelected
					? "ring-2 ring-[var(--gradient-mid)] bg-purple-50/50"
					: "hover:border-gray-200"
			}`}
		>
			{/* Selection checkbox */}
			{onSelect && (
				<button
					onClick={() => onSelect(id)}
					className={`absolute top-3 left-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
						isSelected
							? "bg-[var(--gradient-mid)] border-[var(--gradient-mid)]"
							: "border-gray-300 bg-white opacity-0 group-hover:opacity-100"
					}`}
				>
					{isSelected && (
						<svg
							className="w-3 h-3 text-white"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={3}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					)}
				</button>
			)}

			{/* Actions menu */}
			<div className="absolute top-3 right-3">
				<button
					onClick={() => setShowActions(!showActions)}
					className="p-1.5 rounded-lg bg-white/80 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
				>
					<MoreVertical className="w-4 h-4 text-gray-500" />
				</button>

				{showActions && (
					<>
						<div
							className="fixed inset-0 z-10"
							onClick={() => setShowActions(false)}
						/>
						<div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
							{onEdit && (
								<button
									onClick={() => {
										onEdit(id);
										setShowActions(false);
									}}
									className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
								>
									<Edit3 className="w-4 h-4" />
									Edit
								</button>
							)}
							{onSchedule && (
								<button
									onClick={() => {
										onSchedule(id);
										setShowActions(false);
									}}
									className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
								>
									<Calendar className="w-4 h-4" />
									Schedule
								</button>
							)}
							{onDuplicate && (
								<button
									onClick={() => {
										onDuplicate(id);
										setShowActions(false);
									}}
									className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
								>
									<Copy className="w-4 h-4" />
									Duplicate
								</button>
							)}
							{onDelete && (
								<button
									onClick={() => {
										onDelete(id);
										setShowActions(false);
									}}
									className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
								>
									<Trash2 className="w-4 h-4" />
									Delete
								</button>
							)}
						</div>
					</>
				)}
			</div>

			{/* Content type badge */}
			<div className="flex items-center gap-2 mb-3">
				<span
					className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeConfig.bgColor} ${typeConfig.textColor}`}
				>
					<TypeIcon className="w-3 h-3" />
					{typeConfig.label}
				</span>
				<span
					className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
				>
					<StatusIcon className="w-3 h-3" />
					{statusConfig.label}
				</span>
			</div>

			{/* Title */}
			<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 pr-8">
				{title}
			</h3>

			{/* Preview text */}
			<p className="text-sm text-gray-600 mb-3 line-clamp-3">
				{truncatedPreview}
			</p>

			{/* Pillar indicator */}
			<div className="flex items-center justify-between pt-3 border-t border-gray-100">
				<div className="flex items-center gap-2">
					<span
						className={`w-2 h-2 rounded-full ${pillarColors.dot}`}
						aria-hidden="true"
					/>
					<span className={`text-xs font-medium ${pillarColors.text}`}>
						{pillar.name}
					</span>
				</div>
				<div className="flex items-center gap-2 text-xs text-gray-500">
					{scheduledFor ? (
						<span className="flex items-center gap-1">
							<Calendar className="w-3 h-3" />
							{formatDate(scheduledFor)}
						</span>
					) : (
						<span>{formatDate(createdAt)}</span>
					)}
				</div>
			</div>
		</div>
	);
}
