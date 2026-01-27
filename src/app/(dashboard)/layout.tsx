"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
	LayoutDashboard,
	Sparkles,
	Hash,
	Calendar,
	Video,
	MessageSquare,
	BarChart3,
	Layers,
	RefreshCw,
	Settings,
	LogOut,
	Menu,
	X,
	Wand2,
	FileText,
} from "lucide-react";
import { useState } from "react";
import { OnboardingCheck } from "@/components/OnboardingCheck";

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ name: "Make My Week", href: "/dashboard/make-my-week", icon: Wand2 },
	{ name: "Content Library", href: "/dashboard/library", icon: FileText },
	{ name: "Caption Writer", href: "/dashboard/caption-writer", icon: Sparkles },
	{ name: "SEO Suite", href: "/dashboard/seo-suite", icon: Hash },
	{ name: "Content Calendar", href: "/dashboard/calendar", icon: Calendar },
	{ name: "Reel Script", href: "/dashboard/reel-script", icon: Video },
	{
		name: "Story Prompts",
		href: "/dashboard/story-prompts",
		icon: MessageSquare,
	},
	{ name: "Analytics Coach", href: "/dashboard/analytics", icon: BarChart3 },
	{ name: "Pillar Builder", href: "/dashboard/pillars", icon: Layers },
	{
		name: "Carousel Repurposer",
		href: "/dashboard/carousel",
		icon: RefreshCw,
	},
];

const bottomNav = [
	{ name: "Settings", href: "/dashboard/settings", icon: Settings },
];

function DashboardContent({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// If on onboarding page, just render children without the sidebar
	if (pathname.startsWith("/onboarding")) {
		return <>{children}</>;
	}

	return (
		<div className="min-h-screen bg-warm-cream">
			{/* Mobile sidebar backdrop */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r border-[rgba(0,0,0,0.06)] transform transition-transform duration-200 lg:translate-x-0 ${
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex flex-col h-full">
					{/* Logo */}
					<div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
						<Link
							href="/dashboard"
							className="text-xl font-bold text-ig-gradient"
						>
							InstaGrow
						</Link>
						<button
							className="lg:hidden p-2 -mr-2 text-gray-500 hover:text-gray-700"
							onClick={() => setSidebarOpen(false)}
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* Navigation */}
					<nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
						{navigation.map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.name}
									href={item.href}
									className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
										isActive
											? "bg-ig-gradient text-white"
											: "text-gray-700 hover:bg-gray-100"
									}`}
									onClick={() => setSidebarOpen(false)}
								>
									<item.icon className="w-5 h-5" />
									{item.name}
								</Link>
							);
						})}
					</nav>

					{/* Bottom navigation */}
					<div className="px-3 py-4 border-t border-gray-100 space-y-1">
						{bottomNav.map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.name}
									href={item.href}
									className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
										isActive
											? "bg-ig-gradient text-white"
											: "text-gray-700 hover:bg-gray-100"
									}`}
									onClick={() => setSidebarOpen(false)}
								>
									<item.icon className="w-5 h-5" />
									{item.name}
								</Link>
							);
						})}
						<button
							onClick={() => signOut({ callbackUrl: "/" })}
							className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 w-full"
						>
							<LogOut className="w-5 h-5" />
							Sign Out
						</button>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<div className="lg:pl-64">
				{/* Top header */}
				<header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.04)] lg:px-8">
					<button
						className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
						onClick={() => setSidebarOpen(true)}
					>
						<Menu className="w-6 h-6" />
					</button>
					<div className="flex-1" />
					<div className="flex items-center gap-4">
						<span className="text-sm text-gray-600">Free Trial</span>
						<Link
							href="/dashboard/settings"
							className="btn btn-primary text-sm py-2 px-4"
						>
							Upgrade
						</Link>
					</div>
				</header>

				{/* Page content */}
				<main className="p-4 lg:p-8">{children}</main>
			</div>
		</div>
	);
}

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<OnboardingCheck>
			<DashboardContent>{children}</DashboardContent>
		</OnboardingCheck>
	);
}
