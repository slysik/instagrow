import Link from "next/link";
import {
	Sparkles,
	Hash,
	Calendar,
	Video,
	MessageSquare,
	BarChart3,
	Layers,
	RefreshCw,
	Wand2,
	ArrowRight,
	Zap,
} from "lucide-react";

const tools = [
	{
		icon: Sparkles,
		name: "Caption Writer",
		description: "Generate scroll-stopping captions",
		href: "/dashboard/caption-writer",
		color: "from-orange-500 to-pink-500",
	},
	{
		icon: Hash,
		name: "SEO Suite",
		description: "Discover high-impact hashtags",
		href: "/dashboard/seo-suite",
		color: "from-pink-500 to-purple-500",
	},
	{
		icon: Calendar,
		name: "Content Calendar",
		description: "Plan your posts visually",
		href: "/dashboard/calendar",
		color: "from-purple-500 to-indigo-500",
	},
	{
		icon: Video,
		name: "Reel Script",
		description: "Create viral Reel scripts",
		href: "/dashboard/reel-script",
		color: "from-indigo-500 to-blue-500",
	},
	{
		icon: MessageSquare,
		name: "Story Prompts",
		description: "Engage with daily prompts",
		href: "/dashboard/story-prompts",
		color: "from-blue-500 to-cyan-500",
	},
	{
		icon: BarChart3,
		name: "Analytics Coach",
		description: "Learn what's working",
		href: "/dashboard/analytics",
		color: "from-cyan-500 to-teal-500",
	},
	{
		icon: Layers,
		name: "Pillar Builder",
		description: "Organize content themes",
		href: "/dashboard/pillars",
		color: "from-teal-500 to-green-500",
	},
	{
		icon: RefreshCw,
		name: "Carousel Repurposer",
		description: "Transform content into carousels",
		href: "/dashboard/carousel",
		color: "from-green-500 to-orange-500",
	},
];

export default function DashboardPage() {
	return (
		<div className="max-w-6xl mx-auto">
			{/* Welcome section */}
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					Welcome to InstaGrow!
				</h1>
				<p className="text-gray-600">
					Create amazing Instagram content with AI-powered tools.
				</p>
			</div>

			{/* Make My Week CTA */}
			<div className="card bg-ig-gradient mb-8">
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
					<div className="flex items-start gap-4">
						<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
							<Wand2 className="w-6 h-6 text-white" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-white mb-1">
								Make My Week
							</h2>
							<p className="text-white/80">
								Generate a full week of content in one click based on your
								content pillars
							</p>
						</div>
					</div>
					<Link
						href="/dashboard/make-my-week"
						className="btn bg-white text-[var(--gradient-mid)] hover:bg-gray-100 whitespace-nowrap"
					>
						Get Started
						<ArrowRight className="w-4 h-4 ml-2" />
					</Link>
				</div>
			</div>

			{/* Quick stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
				<div className="card">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
							<Zap className="w-5 h-5 text-blue-600" />
						</div>
						<div>
							<p className="text-2xl font-bold">50</p>
							<p className="text-sm text-gray-600">AI Credits Left</p>
						</div>
					</div>
				</div>
				<div className="card">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
							<Calendar className="w-5 h-5 text-green-600" />
						</div>
						<div>
							<p className="text-2xl font-bold">0</p>
							<p className="text-sm text-gray-600">Posts Scheduled</p>
						</div>
					</div>
				</div>
				<div className="card">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
							<Layers className="w-5 h-5 text-purple-600" />
						</div>
						<div>
							<p className="text-2xl font-bold">0</p>
							<p className="text-sm text-gray-600">Content Pillars</p>
						</div>
					</div>
				</div>
				<div className="card">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
							<Sparkles className="w-5 h-5 text-orange-600" />
						</div>
						<div>
							<p className="text-2xl font-bold">0</p>
							<p className="text-sm text-gray-600">Ideas Generated</p>
						</div>
					</div>
				</div>
			</div>

			{/* Tools grid */}
			<div className="mb-8">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">AI Tools</h2>
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
					{tools.map((tool) => (
						<Link
							key={tool.name}
							href={tool.href}
							className="card hover:shadow-lg transition-all group"
						>
							<div
								className={`w-10 h-10 bg-gradient-to-br ${tool.color} rounded-lg flex items-center justify-center mb-3`}
							>
								<tool.icon className="w-5 h-5 text-white" />
							</div>
							<h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[var(--gradient-mid)] transition-colors">
								{tool.name}
							</h3>
							<p className="text-sm text-gray-600">{tool.description}</p>
						</Link>
					))}
				</div>
			</div>

			{/* Getting started checklist */}
			<div className="card">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">
					Getting Started
				</h2>
				<div className="space-y-3">
					<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
						<div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
							<svg
								className="w-4 h-4 text-green-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<span className="text-gray-700">Create your account</span>
					</div>
					<Link
						href="/dashboard/pillars"
						className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
					>
						<div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
							<span className="text-xs font-bold text-gray-500">2</span>
						</div>
						<span className="text-gray-700 group-hover:text-[var(--gradient-mid)]">
							Set up your content pillars
						</span>
						<ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-[var(--gradient-mid)]" />
					</Link>
					<Link
						href="/dashboard/settings"
						className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
					>
						<div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
							<span className="text-xs font-bold text-gray-500">3</span>
						</div>
						<span className="text-gray-700 group-hover:text-[var(--gradient-mid)]">
							Connect your Instagram account
						</span>
						<ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-[var(--gradient-mid)]" />
					</Link>
					<Link
						href="/dashboard/make-my-week"
						className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
					>
						<div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
							<span className="text-xs font-bold text-gray-500">4</span>
						</div>
						<span className="text-gray-700 group-hover:text-[var(--gradient-mid)]">
							Generate your first week of content
						</span>
						<ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-[var(--gradient-mid)]" />
					</Link>
				</div>
			</div>
		</div>
	);
}
