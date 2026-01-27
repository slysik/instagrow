"use client";

import { useState, useTransition } from "react";
import {
	Layers,
	Plus,
	Sparkles,
	GraduationCap,
	Star,
	ShoppingBag,
	Users,
	Camera,
	Trash2,
	Wand2,
	Shuffle,
	Lightbulb,
	X,
	Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
	createPillar,
	updatePillar,
	deletePillar as deletePillarAction,
	type PillarWithIdeaCount,
} from "@/lib/actions/pillars";

// Available colors for pillars (now using hex for database storage)
const PILLAR_COLORS = [
	{
		name: "Orange",
		value: "#f97316",
		bgClass: "bg-orange-500",
		text: "text-orange-500",
		light: "bg-orange-100",
	},
	{
		name: "Pink",
		value: "#ec4899",
		bgClass: "bg-pink-500",
		text: "text-pink-500",
		light: "bg-pink-100",
	},
	{
		name: "Purple",
		value: "#a855f7",
		bgClass: "bg-purple-500",
		text: "text-purple-500",
		light: "bg-purple-100",
	},
	{
		name: "Blue",
		value: "#3b82f6",
		bgClass: "bg-blue-500",
		text: "text-blue-500",
		light: "bg-blue-100",
	},
	{
		name: "Teal",
		value: "#14b8a6",
		bgClass: "bg-teal-500",
		text: "text-teal-500",
		light: "bg-teal-100",
	},
	{
		name: "Green",
		value: "#22c55e",
		bgClass: "bg-green-500",
		text: "text-green-500",
		light: "bg-green-100",
	},
];

// Available icons for pillars (stored as emoji)
const PILLAR_ICONS: { name: string; emoji: string; icon: LucideIcon }[] = [
	{ name: "education", emoji: "graduation_cap", icon: GraduationCap },
	{ name: "star", emoji: "star", icon: Star },
	{ name: "shopping", emoji: "shopping_bag", icon: ShoppingBag },
	{ name: "users", emoji: "users", icon: Users },
	{ name: "camera", emoji: "camera", icon: Camera },
	{ name: "lightbulb", emoji: "lightbulb", icon: Lightbulb },
	{ name: "layers", emoji: "layers", icon: Layers },
	{ name: "sparkles", emoji: "sparkles", icon: Sparkles },
];

// Preset pillar suggestions
const PRESET_PILLARS = [
	{
		name: "Education",
		description: "Tips, tutorials, and valuable knowledge for your audience",
		color: "#3b82f6",
		emoji: "graduation_cap",
	},
	{
		name: "Proof/Testimonials",
		description: "Customer success stories and social proof",
		color: "#22c55e",
		emoji: "star",
	},
	{
		name: "Product/Service",
		description: "Showcase your offerings and their benefits",
		color: "#a855f7",
		emoji: "shopping_bag",
	},
	{
		name: "Behind-the-Scenes",
		description: "Authentic glimpses into your process and team",
		color: "#f97316",
		emoji: "camera",
	},
	{
		name: "Community",
		description: "Engagement, conversations, and user-generated content",
		color: "#ec4899",
		emoji: "users",
	},
];

function getIconComponent(emoji: string | null): LucideIcon {
	const found = PILLAR_ICONS.find((i) => i.emoji === emoji);
	return found ? found.icon : Layers;
}

function getColorClasses(hexColor: string | null) {
	const found = PILLAR_COLORS.find((c) => c.value === hexColor);
	return found || PILLAR_COLORS[0];
}

function getColorStyle(hexColor: string | null): React.CSSProperties {
	if (hexColor) {
		return { backgroundColor: hexColor };
	}
	return { backgroundColor: PILLAR_COLORS[0].value };
}

interface PillarsClientProps {
	accountId: string;
	initialPillars: PillarWithIdeaCount[];
}

export function PillarsClient({
	accountId,
	initialPillars,
}: PillarsClientProps) {
	const [pillars, setPillars] = useState<PillarWithIdeaCount[]>(initialPillars);
	const [showAddForm, setShowAddForm] = useState(false);
	const [showPresets, setShowPresets] = useState(false);
	const [randomSuggestion, setRandomSuggestion] = useState<{
		pillar: PillarWithIdeaCount;
		message: string;
	} | null>(null);
	const [isPending, startTransition] = useTransition();

	// Form state
	const [newPillarName, setNewPillarName] = useState("");
	const [newPillarDescription, setNewPillarDescription] = useState("");
	const [newPillarColor, setNewPillarColor] = useState(PILLAR_COLORS[0].value);
	const [newPillarEmoji, setNewPillarEmoji] = useState("layers");

	const resetForm = () => {
		setNewPillarName("");
		setNewPillarDescription("");
		setNewPillarColor(PILLAR_COLORS[0].value);
		setNewPillarEmoji("layers");
		setShowAddForm(false);
	};

	const handleAddCustomPillar = async () => {
		if (!newPillarName.trim()) return;

		startTransition(async () => {
			try {
				const newPillar = await createPillar(accountId, {
					name: newPillarName,
					description: newPillarDescription || undefined,
					color: newPillarColor,
					emoji: newPillarEmoji,
					weight: 1,
				});
				setPillars([...pillars, { ...newPillar, _count: { ideas: 0 } }]);
				resetForm();
			} catch (error) {
				console.error("Failed to create pillar:", error);
				alert("Failed to create pillar. Please try again.");
			}
		});
	};

	const handleAddPreset = async (preset: (typeof PRESET_PILLARS)[number]) => {
		startTransition(async () => {
			try {
				const newPillar = await createPillar(accountId, {
					name: preset.name,
					description: preset.description,
					color: preset.color,
					emoji: preset.emoji,
					weight: 1,
				});
				setPillars([...pillars, { ...newPillar, _count: { ideas: 0 } }]);
				setShowPresets(false);
			} catch (error) {
				console.error("Failed to create preset pillar:", error);
				alert("Failed to create pillar. Please try again.");
			}
		});
	};

	const handleDeletePillar = async (id: string) => {
		if (
			!confirm(
				"Are you sure you want to delete this pillar? All associated ideas will also be deleted.",
			)
		) {
			return;
		}

		startTransition(async () => {
			try {
				await deletePillarAction(id);
				setPillars(pillars.filter((p) => p.id !== id));
			} catch (error) {
				console.error("Failed to delete pillar:", error);
				alert("Failed to delete pillar. Please try again.");
			}
		});
	};

	const handleUpdateWeight = async (id: string, weight: number) => {
		startTransition(async () => {
			try {
				const updated = await updatePillar(id, { weight });
				setPillars(
					pillars.map((p) =>
						p.id === id ? { ...p, weight: updated.weight } : p,
					),
				);
			} catch (error) {
				console.error("Failed to update weight:", error);
			}
		});
	};

	const handleWhatShouldIPost = () => {
		if (pillars.length === 0) return;

		// Weighted random selection based on pillar weights
		const totalWeight = pillars.reduce((sum, p) => sum + (p.weight || 1), 0);
		let random = Math.random() * totalWeight;

		let selectedPillar = pillars[0];
		for (const pillar of pillars) {
			random -= pillar.weight || 1;
			if (random <= 0) {
				selectedPillar = pillar;
				break;
			}
		}

		const ideaCount = selectedPillar._count.ideas;
		const message =
			ideaCount > 0
				? `Create content for "${selectedPillar.name}" - you have ${ideaCount} idea${ideaCount !== 1 ? "s" : ""} ready!`
				: `Create content for "${selectedPillar.name}" - add some ideas to get started!`;

		setRandomSuggestion({ pillar: selectedPillar, message });
	};

	// Empty state
	if (pillars.length === 0 && !showAddForm && !showPresets) {
		return (
			<div className="max-w-4xl mx-auto">
				<div className="text-center py-16">
					<div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
						<Layers className="w-10 h-10 text-white" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-3">
						Build Your Content Pillars
					</h1>
					<p className="text-gray-600 mb-8 max-w-md mx-auto">
						Content pillars are the core themes of your Instagram. They help you
						stay consistent and make content planning a breeze.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button
							onClick={() => setShowPresets(true)}
							className="btn btn-primary"
							disabled={isPending}
						>
							<Wand2 className="w-4 h-4 mr-2" />
							Use Preset Pillars
						</button>
						<button
							onClick={() => setShowAddForm(true)}
							className="btn btn-secondary"
							disabled={isPending}
						>
							<Plus className="w-4 h-4 mr-2" />
							Create Custom Pillar
						</button>
					</div>
				</div>

				{/* Quick tips */}
				<div className="card mt-8">
					<h3 className="font-semibold text-gray-900 mb-4">
						What makes a good content pillar?
					</h3>
					<div className="grid md:grid-cols-3 gap-4">
						<div className="p-4 bg-gray-50 rounded-lg">
							<div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
								<GraduationCap className="w-4 h-4 text-blue-600" />
							</div>
							<h4 className="font-medium text-gray-900 mb-1">Be Specific</h4>
							<p className="text-sm text-gray-600">
								Instead of &ldquo;Tips&rdquo;, try &ldquo;Weekly Marketing
								Tips&rdquo;
							</p>
						</div>
						<div className="p-4 bg-gray-50 rounded-lg">
							<div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
								<Users className="w-4 h-4 text-green-600" />
							</div>
							<h4 className="font-medium text-gray-900 mb-1">
								Know Your Audience
							</h4>
							<p className="text-sm text-gray-600">
								Choose themes your followers care about
							</p>
						</div>
						<div className="p-4 bg-gray-50 rounded-lg">
							<div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
								<Layers className="w-4 h-4 text-purple-600" />
							</div>
							<h4 className="font-medium text-gray-900 mb-1">Aim for 3-5</h4>
							<p className="text-sm text-gray-600">
								Enough variety without overwhelm
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 mb-1">
						Content Pillars
					</h1>
					<p className="text-gray-600">
						Organize your content themes and generate ideas
					</p>
				</div>
				<div className="flex gap-3">
					{pillars.length > 0 && (
						<button
							onClick={handleWhatShouldIPost}
							className="btn btn-gradient"
							disabled={isPending}
						>
							<Shuffle className="w-4 h-4 mr-2" />
							What Should I Post?
						</button>
					)}
					<button
						onClick={() => setShowPresets(true)}
						className="btn btn-secondary"
						disabled={isPending}
					>
						<Wand2 className="w-4 h-4 mr-2" />
						Presets
					</button>
					<button
						onClick={() => setShowAddForm(true)}
						className="btn btn-primary"
						disabled={isPending}
					>
						<Plus className="w-4 h-4 mr-2" />
						Add Pillar
					</button>
				</div>
			</div>

			{/* Random suggestion modal */}
			{randomSuggestion && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
					<div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-900">
								Post This!
							</h3>
							<button
								onClick={() => setRandomSuggestion(null)}
								className="p-1 text-gray-400 hover:text-gray-600"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						<div
							className={`p-4 rounded-xl ${getColorClasses(randomSuggestion.pillar.color).light} mb-4`}
						>
							<div className="flex items-center gap-2 mb-2">
								{(() => {
									const IconComponent = getIconComponent(
										randomSuggestion.pillar.emoji,
									);
									return (
										<IconComponent
											className={`w-4 h-4 ${getColorClasses(randomSuggestion.pillar.color).text}`}
										/>
									);
								})()}
								<span
									className={`text-sm font-medium ${getColorClasses(randomSuggestion.pillar.color).text}`}
								>
									{randomSuggestion.pillar.name}
								</span>
							</div>
							<p className="text-sm text-gray-600">
								{randomSuggestion.message}
							</p>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => {
									setRandomSuggestion(null);
									handleWhatShouldIPost();
								}}
								className="btn btn-secondary flex-1"
							>
								<Shuffle className="w-4 h-4 mr-2" />
								Try Another
							</button>
							<button
								onClick={() => setRandomSuggestion(null)}
								className="btn btn-primary flex-1"
							>
								Let&apos;s Do It!
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Preset pillars modal */}
			{showPresets && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
					<div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-900">
								Preset Content Pillars
							</h3>
							<button
								onClick={() => setShowPresets(false)}
								className="p-1 text-gray-400 hover:text-gray-600"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						<p className="text-gray-600 mb-4">
							Click on a pillar to add it to your content strategy
						</p>
						<div className="space-y-3">
							{PRESET_PILLARS.map((preset) => {
								const IconComponent = getIconComponent(preset.emoji);
								const alreadyAdded = pillars.some(
									(p) => p.name === preset.name,
								);
								return (
									<button
										key={preset.name}
										onClick={() => !alreadyAdded && handleAddPreset(preset)}
										disabled={alreadyAdded || isPending}
										className={`w-full text-left p-4 rounded-xl border transition-all ${
											alreadyAdded
												? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
												: "border-gray-200 hover:border-gray-300 hover:shadow-md"
										}`}
									>
										<div className="flex items-start gap-3">
											<div
												className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
												style={getColorStyle(preset.color)}
											>
												<IconComponent className="w-5 h-5 text-white" />
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<h4 className="font-semibold text-gray-900">
														{preset.name}
													</h4>
													{alreadyAdded && (
														<span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
															Added
														</span>
													)}
													{isPending && !alreadyAdded && (
														<Loader2 className="w-4 h-4 animate-spin" />
													)}
												</div>
												<p className="text-sm text-gray-600">
													{preset.description}
												</p>
											</div>
										</div>
									</button>
								);
							})}
						</div>
						<button
							onClick={() => setShowPresets(false)}
							className="btn btn-secondary w-full mt-4"
						>
							Done
						</button>
					</div>
				</div>
			)}

			{/* Add custom pillar form */}
			{showAddForm && (
				<div className="card mb-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-900">
							Create Custom Pillar
						</h3>
						<button
							onClick={resetForm}
							className="p-1 text-gray-400 hover:text-gray-600"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Pillar Name
							</label>
							<input
								type="text"
								value={newPillarName}
								onChange={(e) => setNewPillarName(e.target.value)}
								placeholder="e.g., Weekly Tips, Client Wins"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Description
							</label>
							<textarea
								value={newPillarDescription}
								onChange={(e) => setNewPillarDescription(e.target.value)}
								placeholder="What kind of content goes in this pillar?"
								rows={2}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Color
								</label>
								<div className="flex gap-2">
									{PILLAR_COLORS.map((color) => (
										<button
											key={color.value}
											onClick={() => setNewPillarColor(color.value)}
											className={`w-8 h-8 rounded-lg transition-transform ${
												newPillarColor === color.value
													? "ring-2 ring-offset-2 ring-gray-400 scale-110"
													: "hover:scale-105"
											}`}
											style={{ backgroundColor: color.value }}
											title={color.name}
										/>
									))}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Icon
								</label>
								<div className="flex gap-2 flex-wrap">
									{PILLAR_ICONS.map((iconItem) => {
										const IconComp = iconItem.icon;
										return (
											<button
												key={iconItem.name}
												onClick={() => setNewPillarEmoji(iconItem.emoji)}
												className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
													newPillarEmoji === iconItem.emoji
														? "bg-gray-900 text-white"
														: "bg-gray-100 text-gray-600 hover:bg-gray-200"
												}`}
											>
												<IconComp className="w-4 h-4" />
											</button>
										);
									})}
								</div>
							</div>
						</div>
						<div className="flex gap-3 pt-2">
							<button onClick={resetForm} className="btn btn-secondary">
								Cancel
							</button>
							<button
								onClick={handleAddCustomPillar}
								disabled={!newPillarName.trim() || isPending}
								className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isPending ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Creating...
									</>
								) : (
									"Create Pillar"
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Pillars grid */}
			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{pillars.map((pillar) => {
					const IconComponent = getIconComponent(pillar.emoji);
					return (
						<div key={pillar.id} className="card">
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-center gap-3">
									<div
										className="w-12 h-12 rounded-xl flex items-center justify-center"
										style={getColorStyle(pillar.color)}
									>
										<IconComponent className="w-6 h-6 text-white" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">
											{pillar.name}
										</h3>
										<p className="text-sm text-gray-500">
											{pillar._count.ideas} idea
											{pillar._count.ideas !== 1 ? "s" : ""}
										</p>
									</div>
								</div>
								<button
									onClick={() => handleDeletePillar(pillar.id)}
									disabled={isPending}
									className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
									title="Delete pillar"
								>
									<Trash2 className="w-4 h-4" />
								</button>
							</div>
							{pillar.description && (
								<p className="text-sm text-gray-600 mb-4">
									{pillar.description}
								</p>
							)}

							{/* Weight slider */}
							<div className="mb-4">
								<div className="flex items-center justify-between mb-1">
									<label className="text-xs font-medium text-gray-500">
										Content Weight
									</label>
									<span className="text-xs text-gray-500">
										{pillar.weight}/10
									</span>
								</div>
								<input
									type="range"
									min="1"
									max="10"
									value={pillar.weight}
									onChange={(e) =>
										handleUpdateWeight(pillar.id, parseInt(e.target.value))
									}
									className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
									style={{
										accentColor: pillar.color || PILLAR_COLORS[0].value,
									}}
								/>
								<p className="text-xs text-gray-400 mt-1">
									Higher weight = more content from this pillar
								</p>
							</div>

							{/* Action buttons */}
							<div className="flex gap-2">
								<button
									className="btn btn-secondary btn-sm flex-1"
									disabled
									title="Coming soon"
								>
									<Sparkles className="w-3 h-3 mr-1" />
									Generate Ideas
								</button>
								<button
									className="btn btn-outline btn-sm flex-1"
									disabled
									title="Coming soon"
								>
									<Wand2 className="w-3 h-3 mr-1" />
									Month Plan
								</button>
							</div>
						</div>
					);
				})}

				{/* Add new pillar card */}
				{!showAddForm && (
					<button
						onClick={() => setShowAddForm(true)}
						className="card border-dashed border-2 border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center min-h-[200px] transition-colors"
					>
						<div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
							<Plus className="w-6 h-6 text-gray-400" />
						</div>
						<p className="font-medium text-gray-600">Add New Pillar</p>
					</button>
				)}
			</div>
		</div>
	);
}
