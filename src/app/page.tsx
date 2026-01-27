"use client";

import { useState } from "react";
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
	Check,
	ArrowRight,
	Wand2,
	Instagram,
	Facebook,
	Twitter,
	Menu,
	X,
} from "lucide-react";

const tools = [
	{
		emoji: "✨",
		icon: Sparkles,
		name: "Caption Writer",
		description:
			"Generate scroll-stopping captions that match your brand voice.",
	},
	{
		emoji: "#️⃣",
		icon: Hash,
		name: "SEO Suite",
		description: "Discover niche-specific hashtags to get discovered.",
	},
	{
		emoji: "📅",
		icon: Calendar,
		name: "Content Calendar",
		description: "Visual planning with best-time recommendations.",
	},
	{
		emoji: "🎬",
		icon: Video,
		name: "Reel Script",
		description: "Hook-to-CTA scripts with shot lists for viral Reels.",
	},
	{
		emoji: "💬",
		icon: MessageSquare,
		name: "Story Prompts",
		description: "Daily engagement ideas and poll templates.",
	},
	{
		emoji: "📊",
		icon: BarChart3,
		name: "Analytics Coach",
		description: "Learn what's working + get competitive insights.",
	},
	{
		emoji: "🎯",
		icon: Layers,
		name: "Pillar Builder",
		description: "Organize content themes that resonate with your audience.",
	},
	{
		emoji: "🔄",
		icon: RefreshCw,
		name: "Carousel Repurposer",
		description: "Transform blogs and threads into engaging carousels.",
	},
];

const pricingPlans = [
	{
		name: "Free",
		price: 0,
		period: "forever",
		description: "Get started with the basics",
		features: [
			"3 AI generations/day",
			"1 Instagram account",
			"Caption Writer",
			"Basic hashtag suggestions",
		],
		cta: "Get started free",
		popular: false,
	},
	{
		name: "Essentials",
		price: 6,
		period: "/month",
		description: "For growing creators",
		features: [
			"Unlimited AI generations",
			"3 Instagram accounts",
			"All 8 AI tools",
			"Analytics Coach",
			"Email support",
		],
		cta: "Start free trial",
		popular: true,
	},
	{
		name: "Team",
		price: 12,
		period: "/month",
		description: "For teams and agencies",
		features: [
			"Everything in Essentials",
			"10 Instagram accounts",
			"Make My Week automation",
			"Team collaboration",
			"Priority support",
		],
		cta: "Start free trial",
		popular: false,
	},
];

export default function LandingPage() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<main className="min-h-screen bg-[var(--bg-white)]">
			{/* Navigation - Clean, minimal like Buffer */}
			<nav className="sticky top-0 z-50 bg-white border-b border-[var(--border-light)]">
				<div className="container flex items-center justify-between h-16">
					<Link href="/" className="text-xl font-bold text-ig-gradient">
						InstaGrow
					</Link>
					<div className="hidden md:flex items-center gap-8">
						<a
							href="#tools"
							className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
						>
							Tools
						</a>
						<a
							href="#pricing"
							className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
						>
							Pricing
						</a>
						<Link
							href="/login"
							className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
						>
							Log in
						</Link>
						<Link href="/login" className="btn btn-gradient btn-sm">
							Get started free
						</Link>
					</div>
					<div className="md:hidden flex items-center gap-3">
						<Link href="/login" className="btn btn-gradient btn-sm">
							Get started
						</Link>
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="p-2 text-gray-600 hover:text-gray-900"
							aria-label="Toggle menu"
						>
							{mobileMenuOpen ? (
								<X className="w-6 h-6" />
							) : (
								<Menu className="w-6 h-6" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile menu */}
				{mobileMenuOpen && (
					<div className="md:hidden border-t border-[var(--border-light)] bg-white">
						<div className="container py-4 space-y-3">
							<a
								href="#tools"
								onClick={() => setMobileMenuOpen(false)}
								className="block py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
							>
								Tools
							</a>
							<a
								href="#pricing"
								onClick={() => setMobileMenuOpen(false)}
								className="block py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
							>
								Pricing
							</a>
							<Link
								href="/login"
								onClick={() => setMobileMenuOpen(false)}
								className="block py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
							>
								Log in
							</Link>
						</div>
					</div>
				)}
			</nav>

			{/* Hero - Buffer style: clean, centered, with social proof */}
			<section className="py-16 md:py-24">
				<div className="container">
					<div className="max-w-3xl mx-auto text-center">
						{/* Badge */}
						<div className="badge mb-6">
							<span>🚀</span>
							<span>Now with AI-powered content generation</span>
						</div>

						{/* Headline */}
						<h1 className="heading-xl mb-6">
							Grow your Instagram.{" "}
							<span className="text-ig-gradient">Without the chaos.</span>
						</h1>

						{/* Subtitle */}
						<p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
							8 AI-powered tools to create better content in less time. Plan
							your week, write captions, and grow your audience — all in one
							place.
						</p>

						{/* CTA */}
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
							<Link href="/login" className="btn btn-gradient btn-lg">
								Get started free
								<ArrowRight className="w-4 h-4 ml-2" />
							</Link>
							<span className="text-sm text-[var(--text-muted)]">
								No credit card required
							</span>
						</div>

						{/* Social Proof */}
						<div className="flex items-center justify-center gap-6 text-sm text-[var(--text-secondary)]">
							<div className="flex items-center gap-2">
								<div className="flex -space-x-2">
									{[1, 2, 3, 4].map((i) => (
										<div
											key={i}
											className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white"
										/>
									))}
								</div>
								<span>2,000+ creators</span>
							</div>
							<div className="hidden sm:flex items-center gap-1">
								{[1, 2, 3, 4, 5].map((i) => (
									<span key={i} className="text-yellow-400">
										★
									</span>
								))}
								<span className="ml-1">4.9/5 rating</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Platform Icons */}
			<section className="py-8 border-y border-[var(--border-light)] bg-[var(--bg-light)]">
				<div className="container">
					<p className="text-center text-sm text-[var(--text-muted)] mb-4">
						Works with Instagram, Facebook, TikTok, and more
					</p>
					<div className="flex items-center justify-center gap-8">
						<Instagram className="w-6 h-6 text-[var(--text-muted)]" />
						<Facebook className="w-6 h-6 text-[var(--text-muted)]" />
						<Twitter className="w-6 h-6 text-[var(--text-muted)]" />
						<svg
							className="w-6 h-6 text-[var(--text-muted)]"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
						</svg>
					</div>
				</div>
			</section>

			{/* Tools Section - Buffer card-based layout with emojis */}
			<section id="tools" className="section">
				<div className="container">
					<div className="text-center mb-12">
						<h2 className="heading-lg mb-4">
							Everything you need to create better content
						</h2>
						<p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
							Stop switching between apps. InstaGrow brings all your content
							tools together.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
						{tools.map((tool) => (
							<div key={tool.name} className="card">
								<span className="text-2xl mb-3 block">{tool.emoji}</span>
								<h3 className="font-semibold mb-2">{tool.name}</h3>
								<p className="text-sm text-[var(--text-secondary)]">
									{tool.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Make My Week Feature - Highlighted section */}
			<section className="py-16 bg-[var(--bg-light)]">
				<div className="container">
					<div className="max-w-4xl mx-auto">
						<div className="card p-8 md:p-12 bg-gradient-to-br from-white to-[var(--bg-light)] border-2 border-[var(--border-light)]">
							<div className="flex flex-col md:flex-row items-start gap-6">
								<div className="w-16 h-16 rounded-2xl bg-ig-gradient flex items-center justify-center flex-shrink-0">
									<Wand2 className="w-8 h-8 text-white" />
								</div>
								<div>
									<div className="badge mb-4">
										<span>✨</span>
										<span>Most popular feature</span>
									</div>
									<h3 className="heading-md mb-3">Make My Week</h3>
									<p className="text-[var(--text-secondary)] mb-6">
										One click generates a complete week of content — captions,
										hashtags, posting schedule, and Reel ideas — all based on
										your content pillars and best-performing posts.
									</p>
									<Link href="/login" className="btn btn-gradient">
										Try it free
										<ArrowRight className="w-4 h-4 ml-2" />
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Pricing - Clean, simple like Buffer */}
			<section id="pricing" className="section">
				<div className="container">
					<div className="text-center mb-12">
						<h2 className="heading-lg mb-4">Simple, transparent pricing</h2>
						<p className="text-lg text-[var(--text-secondary)]">
							Start free. Upgrade when you need more.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
						{pricingPlans.map((plan) => (
							<div
								key={plan.name}
								className={`card relative ${
									plan.popular
										? "border-2 border-[var(--gradient-mid)] shadow-lg"
										: ""
								}`}
							>
								{plan.popular && (
									<div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-ig-gradient text-white text-xs font-semibold rounded-full">
										Most popular
									</div>
								)}
								<div className="mb-4">
									<h3 className="font-semibold text-lg">{plan.name}</h3>
									<p className="text-sm text-[var(--text-secondary)]">
										{plan.description}
									</p>
								</div>
								<div className="mb-6">
									<span className="text-4xl font-bold">
										{plan.price === 0 ? "Free" : `$${plan.price}`}
									</span>
									{plan.price > 0 && (
										<span className="text-[var(--text-secondary)]">
											{plan.period}
										</span>
									)}
								</div>
								<ul className="space-y-3 mb-6">
									{plan.features.map((feature) => (
										<li
											key={feature}
											className="flex items-start gap-2 text-sm"
										>
											<Check className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
											<span>{feature}</span>
										</li>
									))}
								</ul>
								<Link
									href="/login"
									className={`btn w-full ${
										plan.popular ? "btn-gradient" : "btn-outline"
									}`}
								>
									{plan.cta}
								</Link>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Final CTA - Simple, clean */}
			<section className="py-16 bg-[var(--bg-dark)]">
				<div className="container text-center">
					<h2 className="heading-lg text-white mb-4">
						Ready to grow your Instagram?
					</h2>
					<p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
						Join 2,000+ creators who spend less time on content and more time
						growing their business.
					</p>
					<Link href="/login" className="btn btn-gradient btn-lg">
						Get started free
						<ArrowRight className="w-5 h-5 ml-2" />
					</Link>
				</div>
			</section>

			{/* Footer - Minimal */}
			<footer className="py-8 bg-[var(--bg-dark)] border-t border-white/10">
				<div className="container">
					<div className="flex flex-col md:flex-row items-center justify-between gap-4">
						<div className="text-white font-bold">InstaGrow</div>
						<div className="flex items-center gap-6 text-white/60 text-sm">
							<Link
								href="/terms"
								className="hover:text-white transition-colors"
							>
								Terms
							</Link>
							<Link
								href="/privacy"
								className="hover:text-white transition-colors"
							>
								Privacy
							</Link>
							<a
								href="mailto:support@instagrow.app"
								className="hover:text-white transition-colors"
							>
								Support
							</a>
						</div>
						<p className="text-white/40 text-sm">
							© {new Date().getFullYear()} InstaGrow
						</p>
					</div>
				</div>
			</footer>
		</main>
	);
}
