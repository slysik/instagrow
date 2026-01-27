"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface OnboardingPillar {
	name: string;
	description: string;
	color: string;
	emoji: string;
}

export interface OnboardingData {
	niche: string;
	goals: string[];
	pillars: OnboardingPillar[];
	postingTimes: {
		morning: string;
		evening: string;
	};
}

// Suggested pillars based on niche
const NICHE_PILLAR_SUGGESTIONS: Record<string, OnboardingPillar[]> = {
	"fitness-health": [
		{
			name: "Workout Tips",
			description: "Exercise routines and fitness advice",
			color: "bg-orange-500",
			emoji: "💪",
		},
		{
			name: "Nutrition",
			description: "Healthy eating tips and recipes",
			color: "bg-green-500",
			emoji: "🥗",
		},
		{
			name: "Motivation",
			description: "Inspiring quotes and success stories",
			color: "bg-purple-500",
			emoji: "✨",
		},
		{
			name: "Progress Updates",
			description: "Transformations and milestones",
			color: "bg-blue-500",
			emoji: "📈",
		},
	],
	"travel-lifestyle": [
		{
			name: "Destinations",
			description: "Travel guides and recommendations",
			color: "bg-blue-500",
			emoji: "✈️",
		},
		{
			name: "Travel Tips",
			description: "Packing, budgeting, and planning advice",
			color: "bg-teal-500",
			emoji: "💡",
		},
		{
			name: "Local Experiences",
			description: "Food, culture, and hidden gems",
			color: "bg-orange-500",
			emoji: "🌍",
		},
		{
			name: "Behind the Scenes",
			description: "The reality of travel life",
			color: "bg-pink-500",
			emoji: "📸",
		},
	],
	"food-cooking": [
		{
			name: "Recipes",
			description: "Step-by-step cooking guides",
			color: "bg-orange-500",
			emoji: "🍳",
		},
		{
			name: "Kitchen Tips",
			description: "Cooking hacks and techniques",
			color: "bg-yellow-500",
			emoji: "👨‍🍳",
		},
		{
			name: "Food Reviews",
			description: "Restaurant and product reviews",
			color: "bg-red-500",
			emoji: "⭐",
		},
		{
			name: "Behind the Scenes",
			description: "Your cooking process and fails",
			color: "bg-pink-500",
			emoji: "🎬",
		},
	],
	"fashion-beauty": [
		{
			name: "Outfit Ideas",
			description: "Style inspiration and lookbooks",
			color: "bg-pink-500",
			emoji: "👗",
		},
		{
			name: "Beauty Tips",
			description: "Makeup and skincare routines",
			color: "bg-purple-500",
			emoji: "💄",
		},
		{
			name: "Trends",
			description: "What's in and what's out",
			color: "bg-orange-500",
			emoji: "🔥",
		},
		{
			name: "Reviews",
			description: "Product reviews and hauls",
			color: "bg-teal-500",
			emoji: "🛍️",
		},
	],
	"business-entrepreneurship": [
		{
			name: "Tips & Strategies",
			description: "Business growth advice",
			color: "bg-blue-500",
			emoji: "📊",
		},
		{
			name: "Behind the Scenes",
			description: "Day in the life of an entrepreneur",
			color: "bg-orange-500",
			emoji: "🎯",
		},
		{
			name: "Success Stories",
			description: "Wins and lessons learned",
			color: "bg-green-500",
			emoji: "🏆",
		},
		{
			name: "Motivation",
			description: "Inspiring content for entrepreneurs",
			color: "bg-purple-500",
			emoji: "💡",
		},
	],
	"tech-gaming": [
		{
			name: "Reviews",
			description: "Tech and game reviews",
			color: "bg-blue-500",
			emoji: "🎮",
		},
		{
			name: "Tips & Tutorials",
			description: "How-tos and guides",
			color: "bg-green-500",
			emoji: "📱",
		},
		{
			name: "News & Trends",
			description: "Latest in tech and gaming",
			color: "bg-purple-500",
			emoji: "📰",
		},
		{
			name: "Setup Tours",
			description: "Desk setups and gear",
			color: "bg-orange-500",
			emoji: "🖥️",
		},
	],
	"art-design": [
		{
			name: "Process Videos",
			description: "Creating art from start to finish",
			color: "bg-purple-500",
			emoji: "🎨",
		},
		{
			name: "Tips & Tutorials",
			description: "Techniques and how-tos",
			color: "bg-blue-500",
			emoji: "✏️",
		},
		{
			name: "Inspiration",
			description: "What inspires your work",
			color: "bg-pink-500",
			emoji: "💫",
		},
		{
			name: "Behind the Scenes",
			description: "Your creative process",
			color: "bg-orange-500",
			emoji: "🎬",
		},
	],
	"education-coaching": [
		{
			name: "Tips & Advice",
			description: "Actionable educational content",
			color: "bg-blue-500",
			emoji: "📚",
		},
		{
			name: "Q&A",
			description: "Answering follower questions",
			color: "bg-green-500",
			emoji: "❓",
		},
		{
			name: "Success Stories",
			description: "Student wins and testimonials",
			color: "bg-orange-500",
			emoji: "⭐",
		},
		{
			name: "Behind the Scenes",
			description: "Your teaching journey",
			color: "bg-purple-500",
			emoji: "🎯",
		},
	],
	other: [
		{
			name: "Education",
			description: "Tips, tutorials, and valuable knowledge",
			color: "bg-blue-500",
			emoji: "📚",
		},
		{
			name: "Behind the Scenes",
			description: "Authentic glimpses into your process",
			color: "bg-orange-500",
			emoji: "🎬",
		},
		{
			name: "Engagement",
			description: "Questions, polls, and community content",
			color: "bg-pink-500",
			emoji: "💬",
		},
		{
			name: "Inspiration",
			description: "Motivational and inspiring content",
			color: "bg-purple-500",
			emoji: "✨",
		},
	],
};

export async function getSuggestedPillars(
	niche: string,
): Promise<OnboardingPillar[]> {
	const normalizedNiche = niche
		.toLowerCase()
		.replace(/[& ]/g, "-")
		.replace(/--+/g, "-");
	return (
		NICHE_PILLAR_SUGGESTIONS[normalizedNiche] || NICHE_PILLAR_SUGGESTIONS.other
	);
}

export async function saveOnboardingData(
	data: OnboardingData,
): Promise<{ success: boolean; error?: string }> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Not authenticated" };
		}

		const userId = session.user.id;

		// Get or create an InstagramAccount placeholder for the user
		let igAccount = await prisma.instagramAccount.findFirst({
			where: { userId },
		});

		if (!igAccount) {
			// Create a placeholder Instagram account
			igAccount = await prisma.instagramAccount.create({
				data: {
					userId,
					igUserId: `placeholder_${userId}`,
					igUsername: session.user.name || "user",
					igName: session.user.name,
					bestPostingTimes: {
						default: {
							morning: data.postingTimes.morning,
							evening: data.postingTimes.evening,
						},
					},
					accessToken: "placeholder",
				},
			});
		} else {
			// Update posting times
			await prisma.instagramAccount.update({
				where: { id: igAccount.id },
				data: {
					bestPostingTimes: {
						default: {
							morning: data.postingTimes.morning,
							evening: data.postingTimes.evening,
						},
					},
				},
			});
		}

		// Delete existing pillars for this account (in case of re-onboarding)
		await prisma.pillar.deleteMany({
			where: { accountId: igAccount.id },
		});

		// Create the new pillars
		await prisma.pillar.createMany({
			data: data.pillars.map((pillar, index) => ({
				accountId: igAccount.id,
				name: pillar.name,
				description: pillar.description,
				color: pillar.color,
				emoji: pillar.emoji,
				weight: 1,
			})),
		});

		return { success: true };
	} catch (error) {
		console.error("Error saving onboarding data:", error);
		return { success: false, error: "Failed to save onboarding data" };
	}
}

export async function completeOnboarding(
	userId: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		const session = await auth();
		if (!session?.user?.id || session.user.id !== userId) {
			return { success: false, error: "Not authenticated" };
		}

		await prisma.user.update({
			where: { id: userId },
			data: { onboardingComplete: true },
		});

		revalidatePath("/dashboard");
		return { success: true };
	} catch (error) {
		console.error("Error completing onboarding:", error);
		return { success: false, error: "Failed to complete onboarding" };
	}
}

export async function getOnboardingStatus(userId: string): Promise<boolean> {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { onboardingComplete: true },
		});

		return user?.onboardingComplete ?? false;
	} catch (error) {
		console.error("Error getting onboarding status:", error);
		return false;
	}
}
