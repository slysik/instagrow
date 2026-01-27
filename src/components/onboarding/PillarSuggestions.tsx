"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Pencil, Check, Sparkles } from "lucide-react";
import type { OnboardingPillar } from "@/lib/actions/onboarding";

const PILLAR_COLORS = [
	"bg-orange-500",
	"bg-pink-500",
	"bg-purple-500",
	"bg-blue-500",
	"bg-teal-500",
	"bg-green-500",
	"bg-red-500",
	"bg-yellow-500",
];

const PILLAR_EMOJIS = [
	"📚",
	"💡",
	"🎯",
	"✨",
	"🔥",
	"💪",
	"🎬",
	"📸",
	"🎨",
	"🏆",
	"⭐",
	"💬",
	"🛍️",
	"💄",
	"🍳",
	"✈️",
	"🎮",
	"📱",
	"🖥️",
	"📊",
	"🎓",
	"❓",
	"🌍",
	"👗",
];

interface PillarSuggestionsProps {
	pillars: OnboardingPillar[];
	onPillarsChange: (pillars: OnboardingPillar[]) => void;
	isLoading?: boolean;
}

export function PillarSuggestions({
	pillars,
	onPillarsChange,
	isLoading = false,
}: PillarSuggestionsProps) {
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [editForm, setEditForm] = useState<OnboardingPillar | null>(null);
	const [showAddForm, setShowAddForm] = useState(false);
	const [newPillar, setNewPillar] = useState<OnboardingPillar>({
		name: "",
		description: "",
		color: PILLAR_COLORS[0],
		emoji: "📚",
	});

	const handleRemove = (index: number) => {
		const newPillars = pillars.filter((_, i) => i !== index);
		onPillarsChange(newPillars);
	};

	const startEditing = (index: number) => {
		setEditingIndex(index);
		setEditForm({ ...pillars[index] });
	};

	const saveEdit = () => {
		if (editingIndex === null || !editForm) return;
		const newPillars = [...pillars];
		newPillars[editingIndex] = editForm;
		onPillarsChange(newPillars);
		setEditingIndex(null);
		setEditForm(null);
	};

	const cancelEdit = () => {
		setEditingIndex(null);
		setEditForm(null);
	};

	const handleAddPillar = () => {
		if (!newPillar.name.trim()) return;
		onPillarsChange([...pillars, newPillar]);
		setNewPillar({
			name: "",
			description: "",
			color: PILLAR_COLORS[(pillars.length + 1) % PILLAR_COLORS.length],
			emoji: "📚",
		});
		setShowAddForm(false);
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin mb-4" />
				<p className="text-gray-600">
					<Sparkles className="w-4 h-4 inline mr-2 animate-pulse" />
					Generating personalized pillars...
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<AnimatePresence mode="popLayout">
				{pillars.map((pillar, index) => (
					<motion.div
						key={`${pillar.name}-${index}`}
						layout
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, x: -100 }}
						transition={{ duration: 0.2, delay: index * 0.05 }}
						className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
					>
						{editingIndex === index ? (
							/* Edit mode */
							<div className="space-y-3">
								<div className="flex items-center gap-3">
									{/* Emoji selector */}
									<div className="relative">
										<select
											value={editForm?.emoji}
											onChange={(e) =>
												setEditForm({ ...editForm!, emoji: e.target.value })
											}
											className="appearance-none w-12 h-12 text-2xl text-center bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors"
										>
											{PILLAR_EMOJIS.map((emoji) => (
												<option key={emoji} value={emoji}>
													{emoji}
												</option>
											))}
										</select>
									</div>

									<div className="flex-1">
										<input
											type="text"
											value={editForm?.name}
											onChange={(e) =>
												setEditForm({ ...editForm!, name: e.target.value })
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-medium"
											placeholder="Pillar name"
										/>
									</div>

									<div className="flex gap-2">
										<button
											onClick={saveEdit}
											className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
										>
											<Check className="w-4 h-4" />
										</button>
										<button
											onClick={cancelEdit}
											className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
										>
											<X className="w-4 h-4" />
										</button>
									</div>
								</div>

								<input
									type="text"
									value={editForm?.description}
									onChange={(e) =>
										setEditForm({ ...editForm!, description: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
									placeholder="Description"
								/>

								{/* Color selector */}
								<div className="flex gap-2">
									{PILLAR_COLORS.map((color) => (
										<button
											key={color}
											onClick={() => setEditForm({ ...editForm!, color })}
											className={`w-6 h-6 rounded-full ${color} transition-transform ${
												editForm?.color === color
													? "ring-2 ring-offset-2 ring-gray-400 scale-110"
													: "hover:scale-105"
											}`}
										/>
									))}
								</div>
							</div>
						) : (
							/* View mode */
							<div className="flex items-start gap-4">
								<div
									className={`w-12 h-12 ${pillar.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}
								>
									{pillar.emoji}
								</div>

								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-gray-900">{pillar.name}</h3>
									<p className="text-sm text-gray-600 truncate">
										{pillar.description}
									</p>
								</div>

								<div className="flex gap-1 flex-shrink-0">
									<button
										onClick={() => startEditing(index)}
										className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
										title="Edit pillar"
									>
										<Pencil className="w-4 h-4" />
									</button>
									<button
										onClick={() => handleRemove(index)}
										className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
										title="Remove pillar"
									>
										<X className="w-4 h-4" />
									</button>
								</div>
							</div>
						)}
					</motion.div>
				))}
			</AnimatePresence>

			{/* Add new pillar */}
			{showAddForm ? (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-xl border-2 border-dashed border-pink-300 p-4"
				>
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<select
								value={newPillar.emoji}
								onChange={(e) =>
									setNewPillar({ ...newPillar, emoji: e.target.value })
								}
								className="appearance-none w-12 h-12 text-2xl text-center bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors"
							>
								{PILLAR_EMOJIS.map((emoji) => (
									<option key={emoji} value={emoji}>
										{emoji}
									</option>
								))}
							</select>

							<input
								type="text"
								value={newPillar.name}
								onChange={(e) =>
									setNewPillar({ ...newPillar, name: e.target.value })
								}
								className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-medium"
								placeholder="Pillar name"
								autoFocus
							/>
						</div>

						<input
							type="text"
							value={newPillar.description}
							onChange={(e) =>
								setNewPillar({ ...newPillar, description: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
							placeholder="Description (optional)"
						/>

						<div className="flex gap-2">
							{PILLAR_COLORS.map((color) => (
								<button
									key={color}
									onClick={() => setNewPillar({ ...newPillar, color })}
									className={`w-6 h-6 rounded-full ${color} transition-transform ${
										newPillar.color === color
											? "ring-2 ring-offset-2 ring-gray-400 scale-110"
											: "hover:scale-105"
									}`}
								/>
							))}
						</div>

						<div className="flex gap-2 pt-2">
							<button
								onClick={() => setShowAddForm(false)}
								className="btn btn-secondary flex-1"
							>
								Cancel
							</button>
							<button
								onClick={handleAddPillar}
								disabled={!newPillar.name.trim()}
								className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Add Pillar
							</button>
						</div>
					</div>
				</motion.div>
			) : (
				<motion.button
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					onClick={() => setShowAddForm(true)}
					className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-pink-400 hover:bg-pink-50/50 transition-all flex items-center justify-center gap-2 text-gray-500 hover:text-pink-600"
				>
					<Plus className="w-5 h-5" />
					Add Custom Pillar
				</motion.button>
			)}

			{/* Helper text */}
			<p className="text-sm text-gray-500 text-center">
				We recommend 3-5 pillars for a balanced content strategy
			</p>
		</div>
	);
}
