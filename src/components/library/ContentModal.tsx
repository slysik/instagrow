"use client";

import { useState, useEffect } from "react";
import {
	X,
	Video,
	Image,
	Layers,
	MessageSquare,
	FileText,
	Calendar,
	Trash2,
	Save,
	AlertTriangle,
	Clock,
	CheckCircle2,
	AlertCircle,
	Archive,
	Sparkles,
	Hash,
} from "lucide-react";
import type { ContentType, IdeaStatus } from "@prisma/client";
import type { IdeaWithPillar, UpdateIdeaInput } from "@/lib/actions/ideas";

interface ContentModalProps {
	idea: IdeaWithPillar | null;
	isOpen: boolean;
	onClose: () => void;
	onSave?: (id: string, data: UpdateIdeaInput) => Promise<void>;
	onDelete?: (id: string) => Promise<void>;
	onSchedule?: (id: string) => void;
}

const CONTENT_TYPES: {
	value: ContentType;
	label: string;
	icon: typeof Video;
}[] = [
	{ value: "REEL", label: "Reel", icon: Video },
	{ value: "CAROUSEL", label: "Carousel", icon: Layers },
	{ value: "SINGLE_IMAGE", label: "Post", icon: Image },
	{ value: "STORY", label: "Story", icon: MessageSquare },
	{ value: "TEXT_POST", label: "Text", icon: FileText },
];

const STATUSES: { value: IdeaStatus; label: string; icon: typeof Clock }[] = [
	{ value: "DRAFT", label: "Draft", icon: Clock },
	{ value: "GENERATED", label: "Generated", icon: Sparkles },
	{ value: "SCHEDULED", label: "Scheduled", icon: Calendar },
	{ value: "PUBLISHED", label: "Published", icon: CheckCircle2 },
	{ value: "FAILED", label: "Failed", icon: AlertCircle },
	{ value: "ARCHIVED", label: "Archived", icon: Archive },
];

export function ContentModal({
	idea,
	isOpen,
	onClose,
	onSave,
	onDelete,
	onSchedule,
}: ContentModalProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Form state
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [caption, setCaption] = useState("");
	const [contentType, setContentType] = useState<ContentType>("SINGLE_IMAGE");
	const [status, setStatus] = useState<IdeaStatus>("DRAFT");
	const [hashtags, setHashtags] = useState("");
	const [hooks, setHooks] = useState("");

	// Reset form when idea changes
	useEffect(() => {
		if (idea) {
			setTitle(idea.title);
			setDescription(idea.description || "");
			setCaption(idea.caption || "");
			setContentType(idea.contentType);
			setStatus(idea.status);
			setHashtags(idea.hashtags?.join(", ") || "");
			setHooks(idea.hooks?.join("\n") || "");
		}
	}, [idea]);

	// Reset editing state when modal closes
	useEffect(() => {
		if (!isOpen) {
			setIsEditing(false);
			setShowDeleteConfirm(false);
		}
	}, [isOpen]);

	if (!isOpen || !idea) return null;

	const handleSave = async () => {
		if (!onSave) return;

		setIsSaving(true);
		try {
			await onSave(idea.id, {
				title,
				description: description || undefined,
				caption: caption || undefined,
				contentType,
				status,
				hashtags: hashtags
					? hashtags.split(",").map((h) => h.trim().replace(/^#/, ""))
					: [],
				hooks: hooks ? hooks.split("\n").filter((h) => h.trim()) : [],
			});
			setIsEditing(false);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!onDelete) return;

		setIsDeleting(true);
		try {
			await onDelete(idea.id);
			onClose();
		} finally {
			setIsDeleting(false);
		}
	};

	const formatDate = (date: Date | null) => {
		if (!date) return "Not set";
		return new Date(date).toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
			<div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
					<div className="flex items-center gap-3">
						<div
							className={`w-3 h-3 rounded-full ${idea.pillar.color || "bg-gray-400"}`}
						/>
						<span className="text-sm font-medium text-gray-600">
							{idea.pillar.name}
						</span>
					</div>
					<button
						onClick={onClose}
						className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
					{/* Delete confirmation */}
					{showDeleteConfirm && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
							<div className="flex items-start gap-3">
								<AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
								<div className="flex-1">
									<h4 className="font-medium text-red-800">
										Delete this content idea?
									</h4>
									<p className="text-sm text-red-600 mt-1">
										This action cannot be undone. The idea will be permanently
										removed.
									</p>
									<div className="flex gap-2 mt-3">
										<button
											onClick={handleDelete}
											disabled={isDeleting}
											className="btn btn-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
										>
											{isDeleting ? "Deleting..." : "Yes, Delete"}
										</button>
										<button
											onClick={() => setShowDeleteConfirm(false)}
											className="btn btn-sm btn-secondary"
										>
											Cancel
										</button>
									</div>
								</div>
							</div>
						</div>
					)}

					{isEditing ? (
						/* Edit form */
						<>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Title
								</label>
								<input
									type="text"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent"
									placeholder="Enter a title..."
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Content Type
									</label>
									<select
										value={contentType}
										onChange={(e) =>
											setContentType(e.target.value as ContentType)
										}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent"
									>
										{CONTENT_TYPES.map((type) => (
											<option key={type.value} value={type.value}>
												{type.label}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Status
									</label>
									<select
										value={status}
										onChange={(e) => setStatus(e.target.value as IdeaStatus)}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent"
									>
										{STATUSES.map((s) => (
											<option key={s.value} value={s.value}>
												{s.label}
											</option>
										))}
									</select>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Description
								</label>
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={2}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent resize-none"
									placeholder="Brief description..."
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Caption
								</label>
								<textarea
									value={caption}
									onChange={(e) => setCaption(e.target.value)}
									rows={4}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent resize-none"
									placeholder="Your Instagram caption..."
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Hooks (one per line)
								</label>
								<textarea
									value={hooks}
									onChange={(e) => setHooks(e.target.value)}
									rows={3}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent resize-none"
									placeholder="Attention-grabbing opening lines..."
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Hashtags (comma separated)
								</label>
								<input
									type="text"
									value={hashtags}
									onChange={(e) => setHashtags(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent"
									placeholder="marketing, socialmedia, tips"
								/>
							</div>
						</>
					) : (
						/* View mode */
						<>
							<div>
								<h2 className="text-xl font-bold text-gray-900 mb-2">
									{idea.title}
								</h2>
								<div className="flex flex-wrap gap-2 mb-4">
									{CONTENT_TYPES.find((t) => t.value === idea.contentType) && (
										<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
											{(() => {
												const TypeIcon = CONTENT_TYPES.find(
													(t) => t.value === idea.contentType,
												)?.icon;
												return TypeIcon ? (
													<TypeIcon className="w-3 h-3" />
												) : null;
											})()}
											{
												CONTENT_TYPES.find((t) => t.value === idea.contentType)
													?.label
											}
										</span>
									)}
									{STATUSES.find((s) => s.value === idea.status) && (
										<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
											{(() => {
												const StatusIcon = STATUSES.find(
													(s) => s.value === idea.status,
												)?.icon;
												return StatusIcon ? (
													<StatusIcon className="w-3 h-3" />
												) : null;
											})()}
											{STATUSES.find((s) => s.value === idea.status)?.label}
										</span>
									)}
								</div>
							</div>

							{idea.description && (
								<div>
									<h3 className="text-sm font-medium text-gray-700 mb-1">
										Description
									</h3>
									<p className="text-gray-600">{idea.description}</p>
								</div>
							)}

							{idea.caption && (
								<div>
									<h3 className="text-sm font-medium text-gray-700 mb-1">
										Caption
									</h3>
									<div className="bg-gray-50 rounded-lg p-4">
										<p className="text-gray-800 whitespace-pre-wrap">
											{idea.caption}
										</p>
									</div>
								</div>
							)}

							{idea.hooks && idea.hooks.length > 0 && (
								<div>
									<h3 className="text-sm font-medium text-gray-700 mb-2">
										Hooks
									</h3>
									<div className="space-y-2">
										{idea.hooks.map((hook, index) => (
											<div
												key={index}
												className="flex items-start gap-2 bg-yellow-50 rounded-lg p-3"
											>
												<Sparkles className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
												<p className="text-sm text-gray-800">{hook}</p>
											</div>
										))}
									</div>
								</div>
							)}

							{idea.hashtags && idea.hashtags.length > 0 && (
								<div>
									<h3 className="text-sm font-medium text-gray-700 mb-2">
										Hashtags
									</h3>
									<div className="flex flex-wrap gap-2">
										{idea.hashtags.map((tag, index) => (
											<span
												key={index}
												className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
											>
												<Hash className="w-3 h-3" />
												{tag.replace(/^#/, "")}
											</span>
										))}
									</div>
								</div>
							)}

							<div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
								<div>
									<span className="text-xs text-gray-500">Created</span>
									<p className="text-sm text-gray-700">
										{formatDate(idea.createdAt)}
									</p>
								</div>
								<div>
									<span className="text-xs text-gray-500">Scheduled For</span>
									<p className="text-sm text-gray-700">
										{formatDate(idea.scheduledFor)}
									</p>
								</div>
							</div>
						</>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
					<div>
						{onDelete && !isEditing && (
							<button
								onClick={() => setShowDeleteConfirm(true)}
								className="btn btn-sm text-red-600 hover:bg-red-50"
							>
								<Trash2 className="w-4 h-4 mr-1" />
								Delete
							</button>
						)}
					</div>
					<div className="flex gap-2">
						{isEditing ? (
							<>
								<button
									onClick={() => setIsEditing(false)}
									className="btn btn-secondary"
								>
									Cancel
								</button>
								<button
									onClick={handleSave}
									disabled={isSaving || !title.trim()}
									className="btn btn-primary disabled:opacity-50"
								>
									<Save className="w-4 h-4 mr-1" />
									{isSaving ? "Saving..." : "Save Changes"}
								</button>
							</>
						) : (
							<>
								{onSchedule && (
									<button
										onClick={() => onSchedule(idea.id)}
										className="btn btn-secondary"
									>
										<Calendar className="w-4 h-4 mr-1" />
										Schedule
									</button>
								)}
								{onSave && (
									<button
										onClick={() => setIsEditing(true)}
										className="btn btn-primary"
									>
										Edit Content
									</button>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
