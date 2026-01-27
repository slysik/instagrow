"use client";

import { useState } from "react";
import {
	User,
	Instagram,
	Bell,
	Mic2,
	CreditCard,
	Clock,
	AlertTriangle,
	Check,
	ChevronDown,
	Globe,
} from "lucide-react";

// Mock data for demonstration
const mockUser = {
	name: "Sarah Johnson",
	email: "sarah@example.com",
	avatar: null,
	connectedInstagram: "@sarahcreates",
};

const toneOptions = [
	{
		value: "casual",
		label: "Casual",
		description: "Friendly and conversational",
	},
	{
		value: "professional",
		label: "Professional",
		description: "Polished and business-like",
	},
	{ value: "playful", label: "Playful", description: "Fun and energetic" },
	{
		value: "luxury",
		label: "Luxury",
		description: "Sophisticated and refined",
	},
];

const industryOptions = [
	"Fashion & Beauty",
	"Food & Beverage",
	"Health & Fitness",
	"Travel & Lifestyle",
	"Technology",
	"Education",
	"E-commerce",
	"Real Estate",
	"Entertainment",
	"Other",
];

const timezones = [
	"America/New_York",
	"America/Chicago",
	"America/Denver",
	"America/Los_Angeles",
	"America/Phoenix",
	"Europe/London",
	"Europe/Paris",
	"Asia/Tokyo",
	"Asia/Singapore",
	"Australia/Sydney",
];

const postingWindows = [
	{ id: "morning", label: "Morning (6am - 9am)", selected: true },
	{ id: "midday", label: "Midday (11am - 1pm)", selected: true },
	{ id: "afternoon", label: "Afternoon (3pm - 5pm)", selected: false },
	{ id: "evening", label: "Evening (7pm - 9pm)", selected: true },
];

// Toggle Switch Component
function Toggle({
	enabled,
	onChange,
	label,
	description,
}: {
	enabled: boolean;
	onChange: (value: boolean) => void;
	label: string;
	description?: string;
}) {
	return (
		<div className="flex items-start justify-between gap-4">
			<div className="flex-1">
				<p className="font-medium text-gray-900">{label}</p>
				{description && (
					<p className="text-sm text-gray-500 mt-0.5">{description}</p>
				)}
			</div>
			<button
				onClick={() => onChange(!enabled)}
				className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${
					enabled ? "bg-[var(--primary)]" : "bg-gray-200"
				}`}
			>
				<span
					className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
						enabled ? "translate-x-5" : "translate-x-0"
					}`}
				/>
			</button>
		</div>
	);
}

// Section Card Component
function SettingsSection({
	icon: Icon,
	title,
	description,
	children,
	iconColor = "text-gray-600",
	iconBg = "bg-gray-100",
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	description?: string;
	children: React.ReactNode;
	iconColor?: string;
	iconBg?: string;
}) {
	return (
		<div className="card">
			<div className="flex items-start gap-4 mb-6">
				<div
					className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
				>
					<Icon className={`w-5 h-5 ${iconColor}`} />
				</div>
				<div>
					<h2 className="text-lg font-semibold text-gray-900">{title}</h2>
					{description && (
						<p className="text-sm text-gray-500 mt-0.5">{description}</p>
					)}
				</div>
			</div>
			{children}
		</div>
	);
}

export default function SettingsPage() {
	// Profile state
	const [name, setName] = useState(mockUser.name);

	// Notification preferences
	const [emailNotifications, setEmailNotifications] = useState(true);
	const [weeklyDigest, setWeeklyDigest] = useState(true);
	const [featureAnnouncements, setFeatureAnnouncements] = useState(false);

	// Brand voice
	const [selectedTone, setSelectedTone] = useState("casual");
	const [selectedIndustry, setSelectedIndustry] = useState("Fashion & Beauty");
	const [showToneDropdown, setShowToneDropdown] = useState(false);
	const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);

	// Posting times
	const [timezone, setTimezone] = useState("America/Los_Angeles");
	const [selectedWindows, setSelectedWindows] = useState(postingWindows);
	const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);

	// Delete confirmation
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const toggleWindow = (id: string) => {
		setSelectedWindows((prev) =>
			prev.map((w) => (w.id === id ? { ...w, selected: !w.selected } : w)),
		);
	};

	const currentTone = toneOptions.find((t) => t.value === selectedTone);

	return (
		<div className="max-w-3xl mx-auto">
			{/* Page header */}
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
				<p className="text-gray-600">Manage your account and preferences</p>
			</div>

			<div className="space-y-6">
				{/* Profile Section */}
				<SettingsSection
					icon={User}
					title="Profile"
					description="Your personal information"
					iconColor="text-blue-600"
					iconBg="bg-blue-100"
				>
					<div className="space-y-4">
						{/* Avatar */}
						<div className="flex items-center gap-4">
							<div className="w-16 h-16 bg-ig-gradient rounded-full flex items-center justify-center text-white text-xl font-bold">
								{name
									.split(" ")
									.map((n) => n[0])
									.join("")}
							</div>
							<button className="btn btn-outline btn-sm">Change Avatar</button>
						</div>

						{/* Name input */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								Full Name
							</label>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
							/>
						</div>

						{/* Email (readonly) */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								Email Address
							</label>
							<input
								type="email"
								value={mockUser.email}
								readOnly
								className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
							/>
							<p className="text-xs text-gray-400 mt-1">
								Contact support to change your email
							</p>
						</div>
					</div>
				</SettingsSection>

				{/* Instagram Connection */}
				<SettingsSection
					icon={Instagram}
					title="Instagram Connection"
					description="Connect your Instagram account to schedule posts"
					iconColor="text-pink-600"
					iconBg="bg-pink-100"
				>
					{mockUser.connectedInstagram ? (
						<div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
									<Check className="w-4 h-4 text-green-600" />
								</div>
								<div>
									<p className="font-medium text-gray-900">
										{mockUser.connectedInstagram}
									</p>
									<p className="text-sm text-green-600">Connected</p>
								</div>
							</div>
							<button className="btn btn-outline btn-sm text-gray-600">
								Disconnect
							</button>
						</div>
					) : (
						<button className="btn bg-ig-gradient text-white hover:opacity-90 w-full">
							<Instagram className="w-5 h-5 mr-2" />
							Connect Instagram
						</button>
					)}
				</SettingsSection>

				{/* Notification Preferences */}
				<SettingsSection
					icon={Bell}
					title="Notifications"
					description="Manage how we contact you"
					iconColor="text-purple-600"
					iconBg="bg-purple-100"
				>
					<div className="space-y-5">
						<Toggle
							enabled={emailNotifications}
							onChange={setEmailNotifications}
							label="Email Notifications"
							description="Receive important updates about your account"
						/>
						<div className="h-px bg-gray-100" />
						<Toggle
							enabled={weeklyDigest}
							onChange={setWeeklyDigest}
							label="Weekly Digest"
							description="Get a summary of your content performance every week"
						/>
						<div className="h-px bg-gray-100" />
						<Toggle
							enabled={featureAnnouncements}
							onChange={setFeatureAnnouncements}
							label="New Feature Announcements"
							description="Be the first to know about new tools and features"
						/>
					</div>
				</SettingsSection>

				{/* Brand Voice Settings */}
				<SettingsSection
					icon={Mic2}
					title="Brand Voice"
					description="Customize how AI generates content for your brand"
					iconColor="text-orange-600"
					iconBg="bg-orange-100"
				>
					<div className="space-y-4">
						{/* Tone selector */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								Tone of Voice
							</label>
							<div className="relative">
								<button
									onClick={() => setShowToneDropdown(!showToneDropdown)}
									className="w-full px-4 py-2.5 border border-gray-200 rounded-lg flex items-center justify-between hover:border-gray-300 transition-colors text-left"
								>
									<div>
										<span className="font-medium text-gray-900">
											{currentTone?.label}
										</span>
										<span className="text-gray-500 ml-2">
											- {currentTone?.description}
										</span>
									</div>
									<ChevronDown
										className={`w-5 h-5 text-gray-400 transition-transform ${
											showToneDropdown ? "rotate-180" : ""
										}`}
									/>
								</button>
								{showToneDropdown && (
									<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
										{toneOptions.map((tone) => (
											<button
												key={tone.value}
												onClick={() => {
													setSelectedTone(tone.value);
													setShowToneDropdown(false);
												}}
												className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between ${
													selectedTone === tone.value ? "bg-blue-50" : ""
												}`}
											>
												<div>
													<span className="font-medium text-gray-900">
														{tone.label}
													</span>
													<span className="text-gray-500 ml-2">
														- {tone.description}
													</span>
												</div>
												{selectedTone === tone.value && (
													<Check className="w-4 h-4 text-[var(--primary)]" />
												)}
											</button>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Industry selector */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								Industry
							</label>
							<div className="relative">
								<button
									onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
									className="w-full px-4 py-2.5 border border-gray-200 rounded-lg flex items-center justify-between hover:border-gray-300 transition-colors text-left"
								>
									<span className="text-gray-900">{selectedIndustry}</span>
									<ChevronDown
										className={`w-5 h-5 text-gray-400 transition-transform ${
											showIndustryDropdown ? "rotate-180" : ""
										}`}
									/>
								</button>
								{showIndustryDropdown && (
									<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
										{industryOptions.map((industry) => (
											<button
												key={industry}
												onClick={() => {
													setSelectedIndustry(industry);
													setShowIndustryDropdown(false);
												}}
												className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between ${
													selectedIndustry === industry ? "bg-blue-50" : ""
												}`}
											>
												<span className="text-gray-900">{industry}</span>
												{selectedIndustry === industry && (
													<Check className="w-4 h-4 text-[var(--primary)]" />
												)}
											</button>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</SettingsSection>

				{/* Subscription Status */}
				<SettingsSection
					icon={CreditCard}
					title="Subscription"
					description="Manage your plan and billing"
					iconColor="text-green-600"
					iconBg="bg-green-100"
				>
					<div className="space-y-4">
						{/* Current plan */}
						<div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
							<div className="flex items-center justify-between">
								<div>
									<span className="badge bg-[var(--primary)] text-white mb-2">
										Current Plan
									</span>
									<h3 className="text-lg font-semibold text-gray-900">
										Free Trial
									</h3>
									<p className="text-sm text-gray-600">
										50 AI credits remaining - Resets in 14 days
									</p>
								</div>
								<button className="btn btn-primary">Upgrade</button>
							</div>
						</div>

						{/* Billing info placeholder */}
						<div className="p-4 bg-gray-50 rounded-lg">
							<p className="text-sm text-gray-500">
								No billing information on file. Upgrade to add a payment method.
							</p>
						</div>
					</div>
				</SettingsSection>

				{/* Best Posting Times */}
				<SettingsSection
					icon={Clock}
					title="Posting Schedule"
					description="Set your timezone and preferred posting windows"
					iconColor="text-indigo-600"
					iconBg="bg-indigo-100"
				>
					<div className="space-y-4">
						{/* Timezone selector */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								<Globe className="w-4 h-4 inline mr-1.5" />
								Timezone
							</label>
							<div className="relative">
								<button
									onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
									className="w-full px-4 py-2.5 border border-gray-200 rounded-lg flex items-center justify-between hover:border-gray-300 transition-colors text-left"
								>
									<span className="text-gray-900">
										{timezone
											.replace("_", " ")
											.replace("America/", "")
											.replace("Europe/", "")
											.replace("Asia/", "")
											.replace("Australia/", "")}{" "}
										({timezone})
									</span>
									<ChevronDown
										className={`w-5 h-5 text-gray-400 transition-transform ${
											showTimezoneDropdown ? "rotate-180" : ""
										}`}
									/>
								</button>
								{showTimezoneDropdown && (
									<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
										{timezones.map((tz) => (
											<button
												key={tz}
												onClick={() => {
													setTimezone(tz);
													setShowTimezoneDropdown(false);
												}}
												className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between ${
													timezone === tz ? "bg-blue-50" : ""
												}`}
											>
												<span className="text-gray-900">{tz}</span>
												{timezone === tz && (
													<Check className="w-4 h-4 text-[var(--primary)]" />
												)}
											</button>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Posting windows */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Preferred Posting Windows
							</label>
							<div className="space-y-2">
								{selectedWindows.map((window) => (
									<button
										key={window.id}
										onClick={() => toggleWindow(window.id)}
										className={`w-full p-3 border rounded-lg flex items-center justify-between transition-all ${
											window.selected
												? "border-[var(--primary)] bg-blue-50"
												: "border-gray-200 hover:border-gray-300"
										}`}
									>
										<span
											className={
												window.selected
													? "text-gray-900 font-medium"
													: "text-gray-600"
											}
										>
											{window.label}
										</span>
										<div
											className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
												window.selected
													? "bg-[var(--primary)] border-[var(--primary)]"
													: "border-gray-300"
											}`}
										>
											{window.selected && (
												<Check className="w-3 h-3 text-white" />
											)}
										</div>
									</button>
								))}
							</div>
							<p className="text-xs text-gray-500 mt-2">
								We&apos;ll suggest optimal posting times within these windows
								based on your audience engagement.
							</p>
						</div>
					</div>
				</SettingsSection>

				{/* Danger Zone */}
				<div className="card border-red-200 bg-red-50/30">
					<div className="flex items-start gap-4 mb-6">
						<div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
							<AlertTriangle className="w-5 h-5 text-red-600" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-gray-900">
								Danger Zone
							</h2>
							<p className="text-sm text-gray-500 mt-0.5">
								Irreversible and destructive actions
							</p>
						</div>
					</div>

					<div className="p-4 border border-red-200 rounded-lg bg-white">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h3 className="font-medium text-gray-900">Delete Account</h3>
								<p className="text-sm text-gray-500 mt-0.5">
									Permanently delete your account and all associated data. This
									action cannot be undone.
								</p>
							</div>
							<button
								onClick={() => setShowDeleteConfirm(true)}
								className="btn bg-red-600 text-white hover:bg-red-700 flex-shrink-0"
							>
								Delete Account
							</button>
						</div>
					</div>
				</div>

				{/* Delete Confirmation Modal */}
				{showDeleteConfirm && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<div
							className="absolute inset-0 bg-black/50"
							onClick={() => setShowDeleteConfirm(false)}
						/>
						<div className="relative bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
									<AlertTriangle className="w-6 h-6 text-red-600" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										Delete Account?
									</h3>
									<p className="text-sm text-gray-500">This cannot be undone</p>
								</div>
							</div>
							<p className="text-gray-600 mb-6">
								All your data including content, analytics, and settings will be
								permanently deleted. Are you absolutely sure?
							</p>
							<div className="flex gap-3">
								<button
									onClick={() => setShowDeleteConfirm(false)}
									className="btn btn-secondary flex-1"
								>
									Cancel
								</button>
								<button className="btn bg-red-600 text-white hover:bg-red-700 flex-1">
									Yes, Delete My Account
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Save button */}
				<div className="flex justify-end pt-4">
					<button className="btn btn-primary">Save Changes</button>
				</div>
			</div>
		</div>
	);
}
