"use client";

import { motion } from "framer-motion";
import { TrendingUp, Heart, ShoppingBag, Megaphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Goal {
	id: string;
	label: string;
	description: string;
	icon: LucideIcon;
	color: string;
}

const GOALS: Goal[] = [
	{
		id: "growth",
		label: "Grow My Following",
		description: "Reach more people and build your audience",
		icon: TrendingUp,
		color: "from-green-500 to-emerald-500",
	},
	{
		id: "engagement",
		label: "Increase Engagement",
		description: "Get more likes, comments, and shares",
		icon: Heart,
		color: "from-pink-500 to-rose-500",
	},
	{
		id: "sales",
		label: "Drive Sales",
		description: "Convert followers into customers",
		icon: ShoppingBag,
		color: "from-orange-500 to-amber-500",
	},
	{
		id: "brand-awareness",
		label: "Build Brand Awareness",
		description: "Establish your presence and recognition",
		icon: Megaphone,
		color: "from-purple-500 to-indigo-500",
	},
];

interface GoalsSelectorProps {
	selectedGoals: string[];
	onGoalToggle: (goalId: string) => void;
}

export function GoalsSelector({
	selectedGoals,
	onGoalToggle,
}: GoalsSelectorProps) {
	return (
		<div className="space-y-3">
			{GOALS.map((goal, index) => {
				const Icon = goal.icon;
				const isSelected = selectedGoals.includes(goal.id);

				return (
					<motion.button
						key={goal.id}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.2, delay: index * 0.05 }}
						onClick={() => onGoalToggle(goal.id)}
						className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
							isSelected
								? "border-pink-500 bg-pink-50/50 shadow-lg shadow-pink-500/10"
								: "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
						}`}
					>
						<div className="flex items-start gap-4">
							{/* Checkbox */}
							<div
								className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center transition-all ${
									isSelected
										? "bg-gradient-to-br from-pink-500 to-purple-500"
										: "border-2 border-gray-300"
								}`}
							>
								{isSelected && (
									<motion.svg
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className="w-4 h-4 text-white"
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
									</motion.svg>
								)}
							</div>

							{/* Icon */}
							<div
								className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center flex-shrink-0`}
							>
								<Icon className="w-6 h-6 text-white" />
							</div>

							{/* Text */}
							<div className="flex-1">
								<h3
									className={`font-semibold ${isSelected ? "text-pink-700" : "text-gray-900"}`}
								>
									{goal.label}
								</h3>
								<p className="text-sm text-gray-600">{goal.description}</p>
							</div>
						</div>
					</motion.button>
				);
			})}

			{/* Helper text */}
			<p className="text-sm text-gray-500 text-center pt-2">
				Select all that apply - you can always update these later
			</p>
		</div>
	);
}

export { GOALS };
