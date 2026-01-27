"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
	BarChart3,
	TrendingUp,
	TrendingDown,
	Clock,
	Heart,
	MessageCircle,
	Eye,
	Users,
	Sparkles,
	ArrowRight,
	Instagram,
	Lightbulb,
	Copy,
	Check,
	RefreshCw,
	Loader2,
	AlertCircle,
} from "lucide-react";
import {
	getConnectedAccounts,
	getAnalyticsSummary,
	getTopPosts,
	getBestPostingTimes,
	syncAccountMetrics,
	syncPostMetrics,
} from "@/lib/actions/instagram";

type Trend = "up" | "down" | "stable";

interface MetricData {
	current: number;
	change: number;
	trend: Trend;
}

interface AnalyticsData {
	followers: MetricData;
	reach: MetricData;
	engagement: MetricData;
	impressions: MetricData;
}

interface TopPost {
	id: string;
	igMediaId: string | null;
	caption: string;
	contentType: string;
	publishedAt: Date | null;
	likes: number;
	comments: number;
	reach: number;
	engagement: number;
}

interface ConnectedAccount {
	id: string;
	igUserId: string;
	igUsername: string;
	igName: string | null;
	igProfilePic: string | null;
	igFollowerCount: number | null;
	isActive: boolean;
	tokenExpiresAt: Date | null;
}

function EmptyState() {
	return (
		<div className="max-w-2xl mx-auto text-center py-16">
			<div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
				<BarChart3 className="w-10 h-10 text-white" />
			</div>
			<h1 className="text-2xl font-bold text-gray-900 mb-3">
				Connect Instagram to unlock Analytics
			</h1>
			<p className="text-gray-600 mb-8 max-w-md mx-auto">
				Get personalized insights, see your top performing posts, and receive
				AI-powered recommendations to grow your account faster.
			</p>
			<div className="card max-w-md mx-auto mb-8">
				<div className="flex items-center gap-4 mb-4">
					<div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
						<Instagram className="w-6 h-6 text-white" />
					</div>
					<div className="text-left">
						<h3 className="font-semibold text-gray-900">
							Connect your Instagram
						</h3>
						<p className="text-sm text-gray-600">
							Business or Creator account required
						</p>
					</div>
				</div>
				<Link
					href="/dashboard/settings"
					className="btn bg-ig-gradient text-white w-full justify-center"
				>
					Connect Instagram
					<ArrowRight className="w-4 h-4 ml-2" />
				</Link>
			</div>
			<div className="space-y-3 text-left max-w-sm mx-auto">
				<p className="text-sm font-medium text-gray-700 mb-2">
					What you will get:
				</p>
				{[
					"10-second daily growth briefings",
					"AI analysis of your top performing posts",
					"Personalized content recommendations",
					"Best posting times for your audience",
				].map((feature, i) => (
					<div
						key={i}
						className="flex items-center gap-2 text-sm text-gray-600"
					>
						<div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
							<Check className="w-3 h-3 text-green-600" />
						</div>
						{feature}
					</div>
				))}
			</div>
		</div>
	);
}

function LoadingState() {
	return (
		<div className="max-w-6xl mx-auto">
			<div className="flex items-center justify-center py-20">
				<Loader2 className="w-8 h-8 animate-spin text-gray-400" />
				<span className="ml-3 text-gray-600">Loading analytics...</span>
			</div>
		</div>
	);
}

function ErrorState({
	message,
	onRetry,
}: {
	message: string;
	onRetry: () => void;
}) {
	return (
		<div className="max-w-2xl mx-auto text-center py-16">
			<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
				<AlertCircle className="w-8 h-8 text-red-500" />
			</div>
			<h2 className="text-xl font-semibold text-gray-900 mb-2">
				Failed to load analytics
			</h2>
			<p className="text-gray-600 mb-6">{message}</p>
			<button onClick={onRetry} className="btn btn-primary">
				<RefreshCw className="w-4 h-4 mr-2" />
				Try Again
			</button>
		</div>
	);
}

function GrowthBriefing({
	analytics,
	bestTimes,
}: {
	analytics: AnalyticsData;
	bestTimes: Record<string, string[]> | null;
}) {
	// Generate insight based on data
	const engagementTrend = analytics.engagement.trend;
	const reachChange = analytics.reach.change;

	let headline = "Your account is growing steadily!";
	let detail = "Keep posting consistently to maintain your momentum.";

	if (engagementTrend === "up" && reachChange > 10) {
		headline = "Your content is crushing it!";
		detail = `Engagement is up and reach increased by ${reachChange}%. Your audience loves what you're posting.`;
	} else if (engagementTrend === "down") {
		headline = "Time to refresh your content strategy";
		detail =
			"Engagement has dipped. Try experimenting with different content formats or posting times.";
	} else if (reachChange > 20) {
		headline = "Your reach is exploding!";
		detail = `Reach is up ${reachChange}% this period. Consider posting more to capitalize on the momentum.`;
	}

	// Find best posting day/time
	const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	let bestDay = "Wednesday";
	let bestTime = "7:00 PM";

	if (bestTimes) {
		// Find day with earliest peak time (usually more active)
		for (const day of days) {
			if (bestTimes[day] && bestTimes[day].length > 0) {
				bestDay = day;
				bestTime = bestTimes[day][0];
				break;
			}
		}
	}

	return (
		<div className="card bg-ig-gradient mb-6">
			<div className="flex items-start gap-4">
				<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
					<Sparkles className="w-6 h-6 text-white" />
				</div>
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<h2 className="text-lg font-bold text-white">
							10-Second Growth Briefing
						</h2>
						<span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
							This Week
						</span>
					</div>
					<p className="text-xl font-semibold text-white mb-2">{headline}</p>
					<p className="text-white/80 text-sm mb-4">{detail}</p>
					<div className="flex flex-wrap gap-4">
						<div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
							{analytics.engagement.trend === "up" ? (
								<TrendingUp className="w-4 h-4 text-green-300" />
							) : analytics.engagement.trend === "down" ? (
								<TrendingDown className="w-4 h-4 text-red-300" />
							) : (
								<TrendingUp className="w-4 h-4 text-white/70" />
							)}
							<span className="text-white font-semibold">
								{analytics.engagement.change > 0 ? "+" : ""}
								{analytics.engagement.change}%
							</span>
							<span className="text-white/70 text-sm">
								engagement vs last period
							</span>
						</div>
						<div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
							<Clock className="w-4 h-4 text-white/70" />
							<span className="text-white/70 text-sm">Best time:</span>
							<span className="text-white font-semibold">
								{bestDay} at {bestTime}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Helper component for trend icons - defined outside of GrowthTrends to avoid recreation on each render
function TrendIcon({ trend }: { trend: Trend }) {
	if (trend === "up") return <TrendingUp className="w-3 h-3" />;
	if (trend === "down") return <TrendingDown className="w-3 h-3" />;
	return null;
}

function GrowthTrends({
	analytics,
	period,
	onPeriodChange,
	onRefresh,
	isRefreshing,
}: {
	analytics: AnalyticsData;
	period: "week" | "month";
	onPeriodChange: (period: "week" | "month") => void;
	onRefresh: () => void;
	isRefreshing: boolean;
}) {
	return (
		<div className="card mb-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold text-gray-900">Growth Trends</h2>
				<div className="flex items-center gap-2">
					<button
						onClick={onRefresh}
						disabled={isRefreshing}
						className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
						title="Sync latest data"
					>
						<RefreshCw
							className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
						/>
					</button>
					<select
						value={period}
						onChange={(e) => onPeriodChange(e.target.value as "week" | "month")}
						className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
					>
						<option value="week">Last 7 days</option>
						<option value="month">Last 30 days</option>
					</select>
				</div>
			</div>
			<div className="grid grid-cols-3 gap-4 mb-6">
				<div className="text-center p-4 bg-gray-50 rounded-xl">
					<div className="flex items-center justify-center gap-1 mb-1">
						<Users className="w-4 h-4 text-gray-500" />
						<span className="text-sm text-gray-600">Followers</span>
					</div>
					<p className="text-2xl font-bold text-gray-900">
						{analytics.followers.current.toLocaleString()}
					</p>
					<div
						className={`flex items-center justify-center gap-1 text-sm ${
							analytics.followers.trend === "up"
								? "text-green-600"
								: analytics.followers.trend === "down"
									? "text-red-600"
									: "text-gray-500"
						}`}
					>
						<TrendIcon trend={analytics.followers.trend} />
						{analytics.followers.change > 0 ? "+" : ""}
						{analytics.followers.change}%
					</div>
				</div>
				<div className="text-center p-4 bg-gray-50 rounded-xl">
					<div className="flex items-center justify-center gap-1 mb-1">
						<Eye className="w-4 h-4 text-gray-500" />
						<span className="text-sm text-gray-600">Reach</span>
					</div>
					<p className="text-2xl font-bold text-gray-900">
						{analytics.reach.current.toLocaleString()}
					</p>
					<div
						className={`flex items-center justify-center gap-1 text-sm ${
							analytics.reach.trend === "up"
								? "text-green-600"
								: analytics.reach.trend === "down"
									? "text-red-600"
									: "text-gray-500"
						}`}
					>
						<TrendIcon trend={analytics.reach.trend} />
						{analytics.reach.change > 0 ? "+" : ""}
						{analytics.reach.change}%
					</div>
				</div>
				<div className="text-center p-4 bg-gray-50 rounded-xl">
					<div className="flex items-center justify-center gap-1 mb-1">
						<Heart className="w-4 h-4 text-gray-500" />
						<span className="text-sm text-gray-600">Engagement</span>
					</div>
					<p className="text-2xl font-bold text-gray-900">
						{analytics.engagement.current.toFixed(1)}%
					</p>
					<div
						className={`flex items-center justify-center gap-1 text-sm ${
							analytics.engagement.trend === "up"
								? "text-green-600"
								: analytics.engagement.trend === "down"
									? "text-red-600"
									: "text-gray-500"
						}`}
					>
						<TrendIcon trend={analytics.engagement.trend} />
						{analytics.engagement.change > 0 ? "+" : ""}
						{analytics.engagement.change}%
					</div>
				</div>
			</div>
			{/* Chart placeholder - could be enhanced with actual chart library */}
			<div className="relative h-48 bg-gray-50 rounded-xl overflow-hidden">
				<div className="absolute inset-0 flex items-center justify-center text-gray-400">
					<p className="text-sm">Chart visualization coming soon</p>
				</div>
			</div>
		</div>
	);
}

function TopPerformingPosts({
	posts,
	onRefresh,
	isLoading,
}: {
	posts: TopPost[];
	onRefresh: () => void;
	isLoading: boolean;
}) {
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const handleCopyStyle = (postId: string) => {
		setCopiedId(postId);
		setTimeout(() => setCopiedId(null), 2000);
	};

	const formatEngagement = (engagement: number) => {
		return (engagement * 100).toFixed(1) + "%";
	};

	const formatDate = (date: Date | null) => {
		if (!date) return "Unknown";
		const now = new Date();
		const diffDays = Math.floor(
			(now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
		);
		if (diffDays === 0) return "Today";
		if (diffDays === 1) return "Yesterday";
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
		return `${Math.floor(diffDays / 30)} months ago`;
	};

	if (posts.length === 0) {
		return (
			<div className="card mb-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold text-gray-900">
						Top Performing Posts
					</h2>
				</div>
				<div className="text-center py-8 text-gray-500">
					<BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
					<p>No posts tracked yet.</p>
					<p className="text-sm mt-1">
						Posts will appear here once you sync your metrics.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="card mb-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold text-gray-900">
					Top Performing Posts
				</h2>
				<button
					onClick={onRefresh}
					disabled={isLoading}
					className="text-sm text-[var(--gradient-mid)] hover:underline flex items-center gap-1"
				>
					<RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
					Refresh
				</button>
			</div>
			<div className="space-y-4">
				{posts.map((post, index) => (
					<div
						key={post.id}
						className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
					>
						<div className="relative">
							<div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
								<BarChart3 className="w-6 h-6 text-gray-400" />
							</div>
							<span className="absolute -top-2 -left-2 w-6 h-6 bg-ig-gradient text-white text-xs font-bold rounded-full flex items-center justify-center">
								{index + 1}
							</span>
							<span className="absolute -bottom-1 -right-1 text-xs bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600">
								{post.contentType}
							</span>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm text-gray-900 font-medium truncate mb-2">
								{post.caption || "No caption"}
							</p>
							<div className="flex flex-wrap gap-3 text-xs text-gray-500">
								<span className="flex items-center gap-1">
									<Heart className="w-3 h-3" />
									{post.likes.toLocaleString()}
								</span>
								<span className="flex items-center gap-1">
									<MessageCircle className="w-3 h-3" />
									{post.comments}
								</span>
								<span className="flex items-center gap-1">
									<Eye className="w-3 h-3" />
									{post.reach.toLocaleString()}
								</span>
								<span className="font-semibold text-green-600">
									{formatEngagement(post.engagement)} engagement
								</span>
							</div>
							<p className="text-xs text-gray-400 mt-1">
								{formatDate(post.publishedAt)}
							</p>
						</div>
						<button
							onClick={() => handleCopyStyle(post.id)}
							className="btn btn-sm btn-secondary flex items-center gap-1.5 whitespace-nowrap"
						>
							{copiedId === post.id ? (
								<>
									<Check className="w-3.5 h-3.5 text-green-600" />
									<span className="text-green-600">Copied!</span>
								</>
							) : (
								<>
									<Copy className="w-3.5 h-3.5" />
									Make 5 more
								</>
							)}
						</button>
					</div>
				))}
			</div>
		</div>
	);
}

function Recommendations({ analytics }: { analytics: AnalyticsData }) {
	// Generate dynamic recommendations based on analytics
	const recommendations = [];

	if (analytics.engagement.trend === "down") {
		recommendations.push({
			id: 1,
			icon: "video",
			title: "Try more Reels",
			description:
				"Video content typically gets higher engagement. Consider posting 2-3 Reels this week.",
			action: "Create Reel Script",
			actionHref: "/dashboard/reel-script",
		});
	}

	recommendations.push({
		id: 2,
		icon: "clock",
		title: "Post at your peak time",
		description:
			"Check your best posting times and schedule your best content for maximum reach.",
		action: "Open Calendar",
		actionHref: "/dashboard/calendar",
	});

	if (analytics.reach.trend === "down") {
		recommendations.push({
			id: 3,
			icon: "hashtag",
			title: "Refresh your hashtags",
			description:
				"Your reach is declining. Try using different hashtags to boost discovery.",
			action: "Optimize Hashtags",
			actionHref: "/dashboard/seo-suite",
		});
	}

	if (recommendations.length < 3) {
		recommendations.push({
			id: 4,
			icon: "content",
			title: "Keep up the consistency",
			description:
				"Your metrics look healthy! Maintain your posting schedule to keep growing.",
			action: "Plan Content",
			actionHref: "/dashboard/make-my-week",
		});
	}

	const getIcon = (type: string) => {
		switch (type) {
			case "video":
				return <BarChart3 className="w-5 h-5" />;
			case "clock":
				return <Clock className="w-5 h-5" />;
			case "hashtag":
				return <Lightbulb className="w-5 h-5" />;
			default:
				return <Sparkles className="w-5 h-5" />;
		}
	};

	return (
		<div className="card">
			<div className="flex items-center gap-2 mb-4">
				<div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
					<Lightbulb className="w-4 h-4 text-white" />
				</div>
				<h2 className="text-lg font-semibold text-gray-900">
					AI Recommendations
				</h2>
			</div>
			<div className="space-y-4">
				{recommendations.slice(0, 3).map((rec) => (
					<div
						key={rec.id}
						className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
					>
						<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 flex-shrink-0">
							{getIcon(rec.icon)}
						</div>
						<div className="flex-1">
							<h3 className="font-semibold text-gray-900 mb-1">{rec.title}</h3>
							<p className="text-sm text-gray-600 mb-3">{rec.description}</p>
							<Link
								href={rec.actionHref}
								className="text-sm font-medium text-[var(--gradient-mid)] hover:underline flex items-center gap-1"
							>
								{rec.action}
								<ArrowRight className="w-3 h-3" />
							</Link>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default function AnalyticsPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
	const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
		null,
	);
	const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
	const [topPosts, setTopPosts] = useState<TopPost[]>([]);
	const [bestTimes, setBestTimes] = useState<Record<string, string[]> | null>(
		null,
	);
	const [period, setPeriod] = useState<"week" | "month">("week");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isLoadingPosts, setIsLoadingPosts] = useState(false);

	const loadData = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Get connected accounts
			const accountsResult = await getConnectedAccounts();
			if (!accountsResult.success || !accountsResult.data) {
				setAccounts([]);
				setIsLoading(false);
				return;
			}

			setAccounts(accountsResult.data);

			if (accountsResult.data.length === 0) {
				setIsLoading(false);
				return;
			}

			// Select first account if none selected
			const accountId = selectedAccountId || accountsResult.data[0].id;
			setSelectedAccountId(accountId);

			// Load analytics for selected account
			await loadAccountData(accountId, period);
		} catch (err) {
			console.error("Error loading analytics:", err);
			setError("Failed to load analytics data");
		} finally {
			setIsLoading(false);
		}
	}, [selectedAccountId, period]);

	const loadAccountData = async (
		accountId: string,
		currentPeriod: "week" | "month",
	) => {
		// Load analytics summary
		const analyticsResult = await getAnalyticsSummary(accountId, currentPeriod);
		if (analyticsResult.success && analyticsResult.data) {
			setAnalytics(analyticsResult.data);
		}

		// Load top posts
		const postsResult = await getTopPosts(accountId, 10);
		if (postsResult.success && postsResult.data) {
			setTopPosts(postsResult.data);
		}

		// Load best posting times
		const timesResult = await getBestPostingTimes(accountId);
		if (timesResult.success && timesResult.data) {
			setBestTimes(timesResult.data);
		}
	};

	useEffect(() => {
		loadData();
	}, [loadData]);

	const handlePeriodChange = async (newPeriod: "week" | "month") => {
		setPeriod(newPeriod);
		if (selectedAccountId) {
			await loadAccountData(selectedAccountId, newPeriod);
		}
	};

	const handleRefresh = async () => {
		if (!selectedAccountId || isRefreshing) return;

		setIsRefreshing(true);
		try {
			// Sync account metrics from Instagram
			await syncAccountMetrics(selectedAccountId);
			await syncPostMetrics(selectedAccountId);

			// Reload data
			await loadAccountData(selectedAccountId, period);
		} catch (err) {
			console.error("Error refreshing metrics:", err);
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleRefreshPosts = async () => {
		if (!selectedAccountId || isLoadingPosts) return;

		setIsLoadingPosts(true);
		try {
			await syncPostMetrics(selectedAccountId);
			const postsResult = await getTopPosts(selectedAccountId, 10);
			if (postsResult.success && postsResult.data) {
				setTopPosts(postsResult.data);
			}
		} catch (err) {
			console.error("Error refreshing posts:", err);
		} finally {
			setIsLoadingPosts(false);
		}
	};

	if (isLoading) {
		return <LoadingState />;
	}

	if (error) {
		return <ErrorState message={error} onRetry={loadData} />;
	}

	if (accounts.length === 0) {
		return (
			<div className="max-w-6xl mx-auto">
				<EmptyState />
			</div>
		);
	}

	// Default analytics if none loaded yet
	const displayAnalytics: AnalyticsData = analytics || {
		followers: { current: 0, change: 0, trend: "stable" },
		reach: { current: 0, change: 0, trend: "stable" },
		engagement: { current: 0, change: 0, trend: "stable" },
		impressions: { current: 0, change: 0, trend: "stable" },
	};

	return (
		<div className="max-w-6xl mx-auto">
			{/* Page header */}
			<div className="mb-6">
				<div className="flex items-center gap-3 mb-2">
					<div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center">
						<BarChart3 className="w-5 h-5 text-white" />
					</div>
					<div className="flex-1">
						<h1 className="text-2xl font-bold text-gray-900">
							Analytics Coach
						</h1>
						<p className="text-gray-600 text-sm">
							Learn what is working and get AI-powered growth tips
						</p>
					</div>
					{accounts.length > 1 && (
						<select
							value={selectedAccountId || ""}
							onChange={(e) => {
								setSelectedAccountId(e.target.value);
								loadAccountData(e.target.value, period);
							}}
							className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
						>
							{accounts.map((account) => (
								<option key={account.id} value={account.id}>
									@{account.igUsername}
								</option>
							))}
						</select>
					)}
				</div>
			</div>

			{/* 10-Second Growth Briefing */}
			<GrowthBriefing analytics={displayAnalytics} bestTimes={bestTimes} />

			{/* Two column layout for larger screens */}
			<div className="grid lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					{/* Growth Trends */}
					<GrowthTrends
						analytics={displayAnalytics}
						period={period}
						onPeriodChange={handlePeriodChange}
						onRefresh={handleRefresh}
						isRefreshing={isRefreshing}
					/>

					{/* Top Performing Posts */}
					<TopPerformingPosts
						posts={topPosts}
						onRefresh={handleRefreshPosts}
						isLoading={isLoadingPosts}
					/>
				</div>

				<div className="lg:col-span-1">
					{/* AI Recommendations */}
					<Recommendations analytics={displayAnalytics} />
				</div>
			</div>
		</div>
	);
}
