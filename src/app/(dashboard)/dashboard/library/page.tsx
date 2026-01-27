"use client";

import { useState, useEffect, useCallback } from "react";
import {
	FileText,
	Search,
	Filter,
	X,
	Trash2,
	Video,
	Image,
	Layers,
	MessageSquare,
	ChevronDown,
	Plus,
	Sparkles,
} from "lucide-react";
import type { ContentType, IdeaStatus } from "@prisma/client";
import { ContentCard } from "@/components/library/ContentCard";
import { ContentModal } from "@/components/library/ContentModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import {
	getIdeas,
	getIdea,
	updateIdea,
	deleteIdea,
	deleteIdeas,
	duplicateIdea,
	getPillarsForAccount,
	getCurrentInstagramAccount,
	type IdeaWithPillar,
	type UpdateIdeaInput,
	type IdeaFilters,
} from "@/lib/actions/ideas";

const CONTENT_TYPES: {
	value: ContentType | "ALL";
	label: string;
	icon: typeof Video;
}[] = [
	{ value: "ALL", label: "All Types", icon: FileText },
	{ value: "REEL", label: "Reels", icon: Video },
	{ value: "CAROUSEL", label: "Carousels", icon: Layers },
	{ value: "SINGLE_IMAGE", label: "Posts", icon: Image },
	{ value: "STORY", label: "Stories", icon: MessageSquare },
	{ value: "TEXT_POST", label: "Text Posts", icon: FileText },
];

const STATUSES: { value: IdeaStatus | "ALL"; label: string }[] = [
	{ value: "ALL", label: "All Statuses" },
	{ value: "DRAFT", label: "Drafts" },
	{ value: "GENERATED", label: "Generated" },
	{ value: "SCHEDULED", label: "Scheduled" },
	{ value: "PUBLISHED", label: "Published" },
	{ value: "ARCHIVED", label: "Archived" },
];

export default function LibraryPage() {
	// Data state
	const [ideas, setIdeas] = useState<IdeaWithPillar[]>([]);
	const [pillars, setPillars] = useState<
		{ id: string; name: string; color: string | null }[]
	>([]);
	const [accountId, setAccountId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Filter state
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedType, setSelectedType] = useState<ContentType | "ALL">("ALL");
	const [selectedStatus, setSelectedStatus] = useState<IdeaStatus | "ALL">(
		"ALL",
	);
	const [selectedPillar, setSelectedPillar] = useState<string | "ALL">("ALL");
	const [showFilters, setShowFilters] = useState(false);

	// Selection state
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	// Modal state
	const [selectedIdea, setSelectedIdea] = useState<IdeaWithPillar | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Load initial data
	useEffect(() => {
		async function loadData() {
			try {
				setIsLoading(true);
				const account = await getCurrentInstagramAccount();

				if (!account) {
					setError("No Instagram account connected");
					setIsLoading(false);
					return;
				}

				setAccountId(account.id);

				const [ideasResult, pillarsResult] = await Promise.all([
					getIdeas(account.id),
					getPillarsForAccount(account.id),
				]);

				setIdeas(ideasResult.ideas);
				setPillars(pillarsResult);
			} catch (err) {
				console.error("Error loading library:", err);
				setError("Failed to load content library");
			} finally {
				setIsLoading(false);
			}
		}

		loadData();
	}, []);

	// Fetch ideas with filters
	const fetchIdeas = useCallback(async () => {
		if (!accountId) return;

		try {
			const filters: IdeaFilters = {};

			if (selectedType !== "ALL") {
				filters.contentType = selectedType;
			}
			if (selectedStatus !== "ALL") {
				filters.status = selectedStatus;
			}
			if (selectedPillar !== "ALL") {
				filters.pillarId = selectedPillar;
			}
			if (searchQuery.trim()) {
				filters.search = searchQuery.trim();
			}

			const result = await getIdeas(accountId, filters);
			setIdeas(result.ideas);
		} catch (err) {
			console.error("Error fetching ideas:", err);
		}
	}, [accountId, selectedType, selectedStatus, selectedPillar, searchQuery]);

	// Refetch when filters change
	useEffect(() => {
		if (accountId) {
			fetchIdeas();
		}
	}, [accountId, fetchIdeas]);

	// Handle card selection
	const handleSelect = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	// Handle select all
	const handleSelectAll = () => {
		if (selectedIds.size === ideas.length) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(ideas.map((idea) => idea.id)));
		}
	};

	// Handle bulk delete
	const handleBulkDelete = async () => {
		if (selectedIds.size === 0) return;

		const confirmed = window.confirm(
			`Are you sure you want to delete ${selectedIds.size} item(s)? This cannot be undone.`,
		);

		if (!confirmed) return;

		try {
			await deleteIdeas(Array.from(selectedIds));
			setSelectedIds(new Set());
			fetchIdeas();
		} catch (err) {
			console.error("Error deleting ideas:", err);
		}
	};

	// Handle card actions
	const handleEdit = async (id: string) => {
		const idea = await getIdea(id);
		if (idea) {
			setSelectedIdea(idea);
			setIsModalOpen(true);
		}
	};

	const handleDelete = async (id: string) => {
		const confirmed = window.confirm(
			"Are you sure you want to delete this idea? This cannot be undone.",
		);

		if (!confirmed) return;

		try {
			await deleteIdea(id);
			fetchIdeas();
		} catch (err) {
			console.error("Error deleting idea:", err);
		}
	};

	const handleDuplicate = async (id: string) => {
		try {
			await duplicateIdea(id);
			fetchIdeas();
		} catch (err) {
			console.error("Error duplicating idea:", err);
		}
	};

	const handleSchedule = (id: string) => {
		// Navigate to calendar with this idea selected
		window.location.href = `/dashboard/calendar?ideaId=${id}`;
	};

	// Modal handlers
	const handleModalSave = async (id: string, data: UpdateIdeaInput) => {
		await updateIdea(id, data);
		fetchIdeas();
		// Refresh the selected idea
		const updated = await getIdea(id);
		if (updated) {
			setSelectedIdea(updated);
		}
	};

	const handleModalDelete = async (id: string) => {
		await deleteIdea(id);
		setIsModalOpen(false);
		setSelectedIdea(null);
		fetchIdeas();
	};

	// Clear all filters
	const clearFilters = () => {
		setSearchQuery("");
		setSelectedType("ALL");
		setSelectedStatus("ALL");
		setSelectedPillar("ALL");
	};

	const hasActiveFilters =
		searchQuery ||
		selectedType !== "ALL" ||
		selectedStatus !== "ALL" ||
		selectedPillar !== "ALL";

	if (isLoading) {
		return (
			<div className="max-w-7xl mx-auto">
				<LoadingState
					variant="spinner"
					text="Loading your content library..."
				/>
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-7xl mx-auto">
				<EmptyState
					icon={<FileText className="w-8 h-8 text-gray-400" />}
					title="Content Library"
					description={error}
					actionLabel="Connect Instagram"
					actionHref="/dashboard/settings"
				/>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 mb-1">
						Content Library
					</h1>
					<p className="text-gray-600">
						{ideas.length} content idea{ideas.length !== 1 ? "s" : ""} saved
					</p>
				</div>
				<div className="flex gap-3">
					<a href="/dashboard/pillars" className="btn btn-primary">
						<Plus className="w-4 h-4 mr-2" />
						New Idea
					</a>
				</div>
			</div>

			{/* Search and filters bar */}
			<div className="card mb-6">
				<div className="flex flex-col lg:flex-row gap-4">
					{/* Search */}
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search ideas..."
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent"
						/>
					</div>

					{/* Filter toggles */}
					<div className="flex gap-2">
						<button
							onClick={() => setShowFilters(!showFilters)}
							className={`btn ${showFilters ? "btn-primary" : "btn-secondary"} whitespace-nowrap`}
						>
							<Filter className="w-4 h-4 mr-2" />
							Filters
							{hasActiveFilters && (
								<span className="ml-2 w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
									{(selectedType !== "ALL" ? 1 : 0) +
										(selectedStatus !== "ALL" ? 1 : 0) +
										(selectedPillar !== "ALL" ? 1 : 0)}
								</span>
							)}
						</button>
						{hasActiveFilters && (
							<button
								onClick={clearFilters}
								className="btn btn-secondary text-red-600"
							>
								<X className="w-4 h-4" />
							</button>
						)}
					</div>
				</div>

				{/* Expanded filters */}
				{showFilters && (
					<div className="mt-4 pt-4 border-t border-gray-100 grid sm:grid-cols-3 gap-4">
						{/* Content Type */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Content Type
							</label>
							<div className="relative">
								<select
									value={selectedType}
									onChange={(e) =>
										setSelectedType(e.target.value as ContentType | "ALL")
									}
									className="w-full appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent bg-white"
								>
									{CONTENT_TYPES.map((type) => (
										<option key={type.value} value={type.value}>
											{type.label}
										</option>
									))}
								</select>
								<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
							</div>
						</div>

						{/* Status */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Status
							</label>
							<div className="relative">
								<select
									value={selectedStatus}
									onChange={(e) =>
										setSelectedStatus(e.target.value as IdeaStatus | "ALL")
									}
									className="w-full appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent bg-white"
								>
									{STATUSES.map((status) => (
										<option key={status.value} value={status.value}>
											{status.label}
										</option>
									))}
								</select>
								<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
							</div>
						</div>

						{/* Pillar */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Content Pillar
							</label>
							<div className="relative">
								<select
									value={selectedPillar}
									onChange={(e) => setSelectedPillar(e.target.value)}
									className="w-full appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent bg-white"
								>
									<option value="ALL">All Pillars</option>
									{pillars.map((pillar) => (
										<option key={pillar.id} value={pillar.id}>
											{pillar.name}
										</option>
									))}
								</select>
								<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Bulk actions bar */}
			{selectedIds.size > 0 && (
				<div className="bg-[var(--gradient-mid)] text-white rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<button
							onClick={handleSelectAll}
							className="text-sm font-medium hover:underline"
						>
							{selectedIds.size === ideas.length
								? "Deselect all"
								: "Select all"}
						</button>
						<span className="text-white/80">|</span>
						<span className="text-sm">
							{selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""}{" "}
							selected
						</span>
					</div>
					<button
						onClick={handleBulkDelete}
						className="btn btn-sm bg-white/20 hover:bg-white/30 text-white"
					>
						<Trash2 className="w-4 h-4 mr-1" />
						Delete
					</button>
				</div>
			)}

			{/* Content grid */}
			{ideas.length === 0 ? (
				<EmptyState
					icon={<Sparkles className="w-8 h-8 text-gray-400" />}
					title={
						hasActiveFilters ? "No matching content" : "Your library is empty"
					}
					description={
						hasActiveFilters
							? "Try adjusting your filters or search query."
							: "Start creating content ideas from your pillars to build your library."
					}
					actionLabel={
						hasActiveFilters ? "Clear Filters" : "Create Content Pillar"
					}
					onAction={hasActiveFilters ? clearFilters : undefined}
					actionHref={hasActiveFilters ? undefined : "/dashboard/pillars"}
				/>
			) : (
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{ideas.map((idea) => (
						<ContentCard
							key={idea.id}
							id={idea.id}
							title={idea.title}
							description={idea.description}
							caption={idea.caption}
							contentType={idea.contentType}
							status={idea.status}
							pillar={{
								name: idea.pillar.name,
								color: idea.pillar.color,
							}}
							scheduledFor={idea.scheduledFor}
							createdAt={idea.createdAt}
							isSelected={selectedIds.has(idea.id)}
							onSelect={handleSelect}
							onEdit={handleEdit}
							onSchedule={handleSchedule}
							onDelete={handleDelete}
							onDuplicate={handleDuplicate}
						/>
					))}
				</div>
			)}

			{/* Content Modal */}
			<ContentModal
				idea={selectedIdea}
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setSelectedIdea(null);
				}}
				onSave={handleModalSave}
				onDelete={handleModalDelete}
				onSchedule={handleSchedule}
			/>
		</div>
	);
}
