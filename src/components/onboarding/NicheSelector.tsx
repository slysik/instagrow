"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
	Dumbbell,
	Plane,
	UtensilsCrossed,
	Sparkles,
	Briefcase,
	Gamepad2,
	Palette,
	GraduationCap,
	MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NicheOption {
	id: string;
	label: string;
	icon: LucideIcon;
	color: string;
}

const NICHE_OPTIONS: NicheOption[] = [
	{
		id: "fitness-health",
		label: "Fitness & Health",
		icon: Dumbbell,
		color: "from-orange-500 to-red-500",
	},
	{
		id: "travel-lifestyle",
		label: "Travel & Lifestyle",
		icon: Plane,
		color: "from-blue-500 to-cyan-500",
	},
	{
		id: "food-cooking",
		label: "Food & Cooking",
		icon: UtensilsCrossed,
		color: "from-orange-400 to-yellow-500",
	},
	{
		id: "fashion-beauty",
		label: "Fashion & Beauty",
		icon: Sparkles,
		color: "from-pink-500 to-purple-500",
	},
	{
		id: "business-entrepreneurship",
		label: "Business & Entrepreneurship",
		icon: Briefcase,
		color: "from-gray-700 to-gray-900",
	},
	{
		id: "tech-gaming",
		label: "Tech & Gaming",
		icon: Gamepad2,
		color: "from-purple-600 to-indigo-600",
	},
	{
		id: "art-design",
		label: "Art & Design",
		icon: Palette,
		color: "from-pink-400 to-orange-400",
	},
	{
		id: "education-coaching",
		label: "Education & Coaching",
		icon: GraduationCap,
		color: "from-green-500 to-teal-500",
	},
	{
		id: "other",
		label: "Other",
		icon: MoreHorizontal,
		color: "from-gray-400 to-gray-600",
	},
];

interface NicheSelectorProps {
	selectedNiche: string;
	customNiche: string;
	onNicheSelect: (niche: string) => void;
	onCustomNicheChange: (value: string) => void;
}

export function NicheSelector({
	selectedNiche,
	customNiche,
	onNicheSelect,
	onCustomNicheChange,
}: NicheSelectorProps) {
	const [showCustomInput, setShowCustomInput] = useState(
		selectedNiche === "other",
	);

	const handleSelect = (nicheId: string) => {
		onNicheSelect(nicheId);
		if (nicheId === "other") {
			setShowCustomInput(true);
		} else {
			setShowCustomInput(false);
			onCustomNicheChange("");
		}
	};

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
				{NICHE_OPTIONS.map((niche, index) => {
					const Icon = niche.icon;
					const isSelected = selectedNiche === niche.id;

					return (
						<motion.button
							key={niche.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.2, delay: index * 0.05 }}
							onClick={() => handleSelect(niche.id)}
							className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
								isSelected
									? "border-pink-500 bg-pink-50/50 shadow-lg shadow-pink-500/10"
									: "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
							}`}
						>
							<div className="flex items-center gap-3">
								<div
									className={`w-10 h-10 rounded-lg bg-gradient-to-br ${niche.color} flex items-center justify-center`}
								>
									<Icon className="w-5 h-5 text-white" />
								</div>
								<span
									className={`font-medium ${isSelected ? "text-pink-700" : "text-gray-700"}`}
								>
									{niche.label}
								</span>
							</div>
							{isSelected && (
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									className="absolute top-2 right-2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center"
								>
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
								</motion.div>
							)}
						</motion.button>
					);
				})}
			</div>

			{/* Custom niche input */}
			{showCustomInput && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					className="mt-4"
				>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Tell us about your niche
					</label>
					<input
						type="text"
						value={customNiche}
						onChange={(e) => onCustomNicheChange(e.target.value)}
						placeholder="e.g., Sustainable Living, Pet Care, Music Production..."
						className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
						autoFocus
					/>
				</motion.div>
			)}
		</div>
	);
}

export { NICHE_OPTIONS };
