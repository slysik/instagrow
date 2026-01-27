"use client";

import { useState } from "react";
import {
	Video,
	Film,
	Play,
	Copy,
	Check,
	Loader2,
	Sparkles,
	Camera,
	Type,
	Clock,
	ChevronRight,
} from "lucide-react";

type Preset = "educational" | "before-after" | "storytime" | "how-to";
type Duration = "15s" | "30s" | "60s";
type Tab = "script" | "shots" | "teleprompter";

interface ScriptBeat {
	timestamp: string;
	text: string;
}

interface Shot {
	shotNumber: number;
	shotType: string;
	cameraAngle: string;
	duration: string;
	notes: string;
}

interface GeneratedScript {
	hook: string;
	keyPoints: string[];
	cta: string;
	fullScript: string;
	onScreenBeats: ScriptBeat[];
	shotList: Shot[];
}

const presets: { id: Preset; label: string; description: string }[] = [
	{
		id: "educational",
		label: "Educational",
		description: "Teach something valuable",
	},
	{
		id: "before-after",
		label: "Before/After",
		description: "Show transformation",
	},
	{
		id: "storytime",
		label: "Storytime",
		description: "Share a personal story",
	},
	{ id: "how-to", label: "How-To", description: "Step-by-step tutorial" },
];

const durations: { id: Duration; label: string; seconds: number }[] = [
	{ id: "15s", label: "15 seconds", seconds: 15 },
	{ id: "30s", label: "30 seconds", seconds: 30 },
	{ id: "60s", label: "60 seconds", seconds: 60 },
];

// Mock AI responses based on preset and duration
const generateMockScript = (
	topic: string,
	preset: Preset,
	duration: Duration,
): GeneratedScript => {
	const mockScripts: Record<Preset, GeneratedScript> = {
		educational: {
			hook: `Stop scrolling! Here's something about ${topic} that will change how you think...`,
			keyPoints: [
				`Most people don't realize this key insight about ${topic}`,
				`The science behind ${topic} is fascinating`,
				`Here's the practical application you can use today`,
			],
			cta: `Follow for more ${topic} tips! Save this for later.`,
			fullScript: `Stop scrolling! Here's something about ${topic} that will change how you think.

Most people don't realize this key insight about ${topic}. Let me break it down for you.

The science behind ${topic} is fascinating. Studies show that understanding this can improve your results by up to 3x.

Here's the practical application you can use today: Start implementing this one simple change and watch the difference.

Follow for more ${topic} tips! Save this for later so you don't forget.`,
			onScreenBeats: [
				{ timestamp: "0-2s", text: "Stop scrolling!" },
				{ timestamp: "2-5s", text: `${topic} insight` },
				{ timestamp: "5-10s", text: "Key fact #1" },
				{
					timestamp: duration === "15s" ? "10-15s" : "10-20s",
					text: "The science",
				},
				...(duration !== "15s"
					? [
							{
								timestamp: duration === "30s" ? "20-28s" : "20-40s",
								text: "Practical tip",
							},
							{
								timestamp: duration === "30s" ? "28-30s" : "40-60s",
								text: "Follow for more!",
							},
						]
					: []),
			],
			shotList: [
				{
					shotNumber: 1,
					shotType: "Talking Head",
					cameraAngle: "Eye level, slightly off-center",
					duration: "2s",
					notes: "Hook - energetic expression, lean in",
				},
				{
					shotNumber: 2,
					shotType: "B-roll or graphic",
					cameraAngle: "N/A",
					duration: "3s",
					notes: `Visual representing ${topic}`,
				},
				{
					shotNumber: 3,
					shotType: "Talking Head",
					cameraAngle: "Medium close-up",
					duration: "5s",
					notes: "Explain the insight",
				},
				{
					shotNumber: 4,
					shotType: "Demonstration",
					cameraAngle: "Top-down or POV",
					duration: duration === "15s" ? "5s" : "10s",
					notes: "Show practical application",
				},
				...(duration !== "15s"
					? [
							{
								shotNumber: 5,
								shotType: "Talking Head",
								cameraAngle: "Close-up",
								duration: duration === "30s" ? "10s" : "20s",
								notes: "CTA with smile, point to follow button",
							},
						]
					: []),
			],
		},
		"before-after": {
			hook: `Watch this ${topic} transformation...`,
			keyPoints: [
				`The before state - struggling with ${topic}`,
				`What changed everything`,
				`The after - unbelievable results`,
			],
			cta: `Want this transformation? Link in bio!`,
			fullScript: `Watch this ${topic} transformation...

Here's where I started. Struggling with ${topic}, feeling stuck, not knowing what to do.

Then I discovered one thing that changed everything.

And here's the after. The results speak for themselves.

Want this transformation? Link in bio to get started on your own journey!`,
			onScreenBeats: [
				{ timestamp: "0-2s", text: "BEFORE" },
				{ timestamp: "2-8s", text: "The struggle" },
				{
					timestamp: duration === "15s" ? "8-12s" : "8-15s",
					text: "The change",
				},
				{
					timestamp: duration === "15s" ? "12-15s" : "15-25s",
					text: "AFTER",
				},
				...(duration !== "15s"
					? [
							{
								timestamp: duration === "30s" ? "25-30s" : "25-60s",
								text: "Link in bio!",
							},
						]
					: []),
			],
			shotList: [
				{
					shotNumber: 1,
					shotType: "Before reveal",
					cameraAngle: "Wide shot",
					duration: "2s",
					notes: "Show the before state dramatically",
				},
				{
					shotNumber: 2,
					shotType: "Transition",
					cameraAngle: "Creative wipe",
					duration: "1s",
					notes: "Use trending transition sound",
				},
				{
					shotNumber: 3,
					shotType: "After reveal",
					cameraAngle: "Same angle as before",
					duration: duration === "15s" ? "7s" : "12s",
					notes: "Dramatic pause, then reveal",
				},
				{
					shotNumber: 4,
					shotType: "Talking Head",
					cameraAngle: "Close-up",
					duration: "5s",
					notes: "Share what made the difference",
				},
			],
		},
		storytime: {
			hook: `I need to tell you what happened with ${topic}...`,
			keyPoints: [
				`Setting the scene - it all started when...`,
				`The plot twist - things took an unexpected turn`,
				`The resolution - here's what I learned`,
			],
			cta: `Has this ever happened to you? Comment below!`,
			fullScript: `I need to tell you what happened with ${topic}...

So it all started when I was just minding my own business. Little did I know what was about to happen.

Then, out of nowhere, things took an unexpected turn. I couldn't believe it.

But here's what I learned from this experience. And honestly? It changed my perspective completely.

Has this ever happened to you? Comment below, I want to hear your stories!`,
			onScreenBeats: [
				{ timestamp: "0-3s", text: "Storytime..." },
				{
					timestamp: duration === "15s" ? "3-8s" : "3-12s",
					text: "It started when...",
				},
				{
					timestamp: duration === "15s" ? "8-12s" : "12-22s",
					text: "Plot twist",
				},
				{
					timestamp: duration === "15s" ? "12-15s" : "22-30s",
					text: "The lesson",
				},
				...(duration === "60s"
					? [
							{ timestamp: "30-50s", text: "Full story details" },
							{ timestamp: "50-60s", text: "Comment below!" },
						]
					: []),
			],
			shotList: [
				{
					shotNumber: 1,
					shotType: "Talking Head",
					cameraAngle: "Close-up, intimate",
					duration: "3s",
					notes: "Lean in, create curiosity",
				},
				{
					shotNumber: 2,
					shotType: "Talking Head",
					cameraAngle: "Medium shot",
					duration: duration === "15s" ? "5s" : "10s",
					notes: "Animated storytelling",
				},
				{
					shotNumber: 3,
					shotType: "Reaction shot",
					cameraAngle: "Close-up",
					duration: "3s",
					notes: "Show genuine emotion at the twist",
				},
				{
					shotNumber: 4,
					shotType: "Talking Head",
					cameraAngle: "Eye level",
					duration: duration === "15s" ? "4s" : "10s",
					notes: "Reflective, share the lesson",
				},
			],
		},
		"how-to": {
			hook: `Here's the easiest way to ${topic}...`,
			keyPoints: [
				`Step 1: Start with the basics`,
				`Step 2: The technique that makes it easy`,
				`Step 3: The final touch for perfect results`,
			],
			cta: `Save this tutorial for later! Follow for more how-tos.`,
			fullScript: `Here's the easiest way to ${topic}. Trust me, this method works every time.

Step 1: Start with the basics. Get your foundation right.

Step 2: Here's the technique that makes it easy. This is the secret most people miss.

Step 3: The final touch for perfect results. And just like that, you're done!

Save this tutorial for later! Follow for more how-tos that actually work.`,
			onScreenBeats: [
				{ timestamp: "0-2s", text: `How to ${topic}` },
				{
					timestamp: duration === "15s" ? "2-5s" : "2-8s",
					text: "Step 1: Basics",
				},
				{
					timestamp: duration === "15s" ? "5-10s" : "8-18s",
					text: "Step 2: The secret",
				},
				{
					timestamp: duration === "15s" ? "10-15s" : "18-28s",
					text: "Step 3: Final touch",
				},
				...(duration !== "15s"
					? [
							{
								timestamp: duration === "30s" ? "28-30s" : "28-60s",
								text: "Save this!",
							},
						]
					: []),
			],
			shotList: [
				{
					shotNumber: 1,
					shotType: "Talking Head",
					cameraAngle: "Eye level",
					duration: "2s",
					notes: "Confident hook",
				},
				{
					shotNumber: 2,
					shotType: "Demonstration",
					cameraAngle: "Top-down / POV",
					duration: duration === "15s" ? "4s" : "8s",
					notes: "Show Step 1 clearly",
				},
				{
					shotNumber: 3,
					shotType: "Close-up detail",
					cameraAngle: "45-degree angle",
					duration: duration === "15s" ? "4s" : "8s",
					notes: "Highlight the technique",
				},
				{
					shotNumber: 4,
					shotType: "Final result",
					cameraAngle: "Hero shot",
					duration: duration === "15s" ? "3s" : "6s",
					notes: "Show completed result with satisfaction",
				},
				{
					shotNumber: 5,
					shotType: "Talking Head",
					cameraAngle: "Close-up",
					duration: "2s",
					notes: "CTA with pointing gesture",
				},
			],
		},
	};

	return mockScripts[preset];
};

export default function ReelScriptPage() {
	const [topic, setTopic] = useState("");
	const [preset, setPreset] = useState<Preset>("educational");
	const [duration, setDuration] = useState<Duration>("30s");
	const [activeTab, setActiveTab] = useState<Tab>("script");
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedScript, setGeneratedScript] =
		useState<GeneratedScript | null>(null);
	const [copied, setCopied] = useState(false);

	const handleGenerate = async () => {
		if (!topic.trim()) return;

		setIsGenerating(true);
		// Simulate AI generation delay
		await new Promise((resolve) => setTimeout(resolve, 1500));

		const script = generateMockScript(topic, preset, duration);
		setGeneratedScript(script);
		setIsGenerating(false);
	};

	const handleCopy = async () => {
		if (!generatedScript) return;
		await navigator.clipboard.writeText(generatedScript.fullScript);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const tabs: { id: Tab; label: string; icon: typeof Video }[] = [
		{ id: "script", label: "Script", icon: Type },
		{ id: "shots", label: "Shot List", icon: Camera },
		{ id: "teleprompter", label: "Teleprompter", icon: Play },
	];

	return (
		<div className="max-w-4xl mx-auto">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-2">
					<div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
						<Video className="w-5 h-5 text-white" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900">
						Reel Script Generator
					</h1>
				</div>
				<p className="text-gray-600">
					Create viral Reel scripts with hooks, key points, and shot lists.
				</p>
			</div>

			{/* Input Section */}
			<div className="card mb-6">
				<div className="space-y-6">
					{/* Topic Input */}
					<div>
						<label
							htmlFor="topic"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Topic or Idea
						</label>
						<textarea
							id="topic"
							value={topic}
							onChange={(e) => setTopic(e.target.value)}
							placeholder="e.g., 5 morning habits that changed my life, how to meal prep for the week, my fitness transformation..."
							className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gradient-mid)] focus:border-transparent resize-none"
							rows={3}
						/>
					</div>

					{/* Preset Selector */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Script Style
						</label>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
							{presets.map((p) => (
								<button
									key={p.id}
									onClick={() => setPreset(p.id)}
									className={`p-3 rounded-xl border-2 text-left transition-all ${
										preset === p.id
											? "border-[var(--gradient-mid)] bg-pink-50"
											: "border-gray-200 hover:border-gray-300"
									}`}
								>
									<span
										className={`block font-medium ${
											preset === p.id
												? "text-[var(--gradient-mid)]"
												: "text-gray-900"
										}`}
									>
										{p.label}
									</span>
									<span className="text-xs text-gray-500">{p.description}</span>
								</button>
							))}
						</div>
					</div>

					{/* Duration Selector */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							<Clock className="w-4 h-4 inline mr-1" />
							Duration
						</label>
						<div className="flex gap-3">
							{durations.map((d) => (
								<button
									key={d.id}
									onClick={() => setDuration(d.id)}
									className={`px-4 py-2 rounded-full font-medium transition-all ${
										duration === d.id
											? "bg-ig-gradient text-white"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
								>
									{d.label}
								</button>
							))}
						</div>
					</div>

					{/* Generate Button */}
					<button
						onClick={handleGenerate}
						disabled={!topic.trim() || isGenerating}
						className="btn btn-gradient w-full disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isGenerating ? (
							<>
								<Loader2 className="w-5 h-5 mr-2 animate-spin" />
								Generating Script...
							</>
						) : (
							<>
								<Sparkles className="w-5 h-5 mr-2" />
								Generate Reel Script
							</>
						)}
					</button>
				</div>
			</div>

			{/* Generated Script Section */}
			{generatedScript && (
				<div className="card">
					{/* Tabs */}
					<div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
									activeTab === tab.id
										? "bg-white text-gray-900 shadow-sm"
										: "text-gray-600 hover:text-gray-900"
								}`}
							>
								<tab.icon className="w-4 h-4" />
								{tab.label}
							</button>
						))}
					</div>

					{/* Script Tab */}
					{activeTab === "script" && (
						<div className="space-y-6">
							{/* Hook */}
							<div className="p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border border-orange-100">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-xs font-bold text-orange-600 uppercase tracking-wide">
										Hook
									</span>
									<span className="text-xs text-gray-500">
										(First 1-3 seconds)
									</span>
								</div>
								<p className="text-gray-900 font-medium">
									{generatedScript.hook}
								</p>
							</div>

							{/* Key Points */}
							<div>
								<div className="flex items-center gap-2 mb-3">
									<span className="text-sm font-semibold text-gray-900">
										Key Points
									</span>
								</div>
								<div className="space-y-2">
									{generatedScript.keyPoints.map((point, index) => (
										<div
											key={index}
											className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
										>
											<span className="flex-shrink-0 w-6 h-6 bg-ig-gradient text-white text-sm font-bold rounded-full flex items-center justify-center">
												{index + 1}
											</span>
											<p className="text-gray-700">{point}</p>
										</div>
									))}
								</div>
							</div>

							{/* CTA */}
							<div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-xs font-bold text-purple-600 uppercase tracking-wide">
										Call to Action
									</span>
								</div>
								<p className="text-gray-900 font-medium">
									{generatedScript.cta}
								</p>
							</div>

							{/* On-Screen Text Beats */}
							<div>
								<div className="flex items-center gap-2 mb-3">
									<Type className="w-4 h-4 text-gray-600" />
									<span className="text-sm font-semibold text-gray-900">
										On-Screen Text Beats
									</span>
								</div>
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b border-gray-200">
												<th className="text-left py-2 px-3 font-medium text-gray-600">
													Timestamp
												</th>
												<th className="text-left py-2 px-3 font-medium text-gray-600">
													Text Overlay
												</th>
											</tr>
										</thead>
										<tbody>
											{generatedScript.onScreenBeats.map((beat, index) => (
												<tr
													key={index}
													className="border-b border-gray-100 last:border-0"
												>
													<td className="py-2 px-3 font-mono text-gray-500">
														{beat.timestamp}
													</td>
													<td className="py-2 px-3 text-gray-900">
														{beat.text}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>

							{/* Copy Button */}
							<button onClick={handleCopy} className="btn btn-secondary w-full">
								{copied ? (
									<>
										<Check className="w-4 h-4 mr-2 text-green-600" />
										Copied to Clipboard!
									</>
								) : (
									<>
										<Copy className="w-4 h-4 mr-2" />
										Copy Full Script
									</>
								)}
							</button>
						</div>
					)}

					{/* Shot List Tab */}
					{activeTab === "shots" && (
						<div className="space-y-4">
							<div className="flex items-center gap-2 mb-4">
								<Film className="w-5 h-5 text-gray-600" />
								<span className="font-semibold text-gray-900">
									Shot List for Filming
								</span>
							</div>

							<div className="space-y-3">
								{generatedScript.shotList.map((shot) => (
									<div
										key={shot.shotNumber}
										className="p-4 bg-gray-50 rounded-xl border border-gray-100"
									>
										<div className="flex items-start gap-4">
											<div className="flex-shrink-0 w-8 h-8 bg-ig-gradient text-white font-bold rounded-lg flex items-center justify-center">
												{shot.shotNumber}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex flex-wrap items-center gap-2 mb-2">
													<span className="font-semibold text-gray-900">
														{shot.shotType}
													</span>
													<span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
														{shot.duration}
													</span>
												</div>
												<div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
													<Camera className="w-3.5 h-3.5" />
													{shot.cameraAngle}
												</div>
												<p className="text-sm text-gray-500">{shot.notes}</p>
											</div>
										</div>
									</div>
								))}
							</div>

							<div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
								<p className="text-sm text-amber-800">
									<strong>Pro tip:</strong> Film all talking head shots first,
									then capture B-roll. This saves setup time!
								</p>
							</div>
						</div>
					)}

					{/* Teleprompter Tab */}
					{activeTab === "teleprompter" && (
						<div className="space-y-4">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<Play className="w-5 h-5 text-gray-600" />
									<span className="font-semibold text-gray-900">
										Teleprompter Mode
									</span>
								</div>
								<button
									onClick={handleCopy}
									className="btn btn-sm btn-secondary"
								>
									{copied ? (
										<Check className="w-4 h-4" />
									) : (
										<Copy className="w-4 h-4" />
									)}
								</button>
							</div>

							<div className="bg-gray-900 rounded-2xl p-8 min-h-[400px] flex items-center justify-center">
								<div className="text-center max-w-2xl">
									<p className="text-2xl md:text-3xl lg:text-4xl font-medium text-white leading-relaxed">
										{generatedScript.fullScript}
									</p>
								</div>
							</div>

							<p className="text-sm text-gray-500 text-center">
								Position your phone at eye level while filming. Read naturally
								and maintain eye contact with the camera.
							</p>
						</div>
					)}
				</div>
			)}

			{/* Empty state */}
			{!generatedScript && !isGenerating && (
				<div className="card text-center py-12">
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<Video className="w-8 h-8 text-gray-400" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						No script generated yet
					</h3>
					<p className="text-gray-500 mb-4">
						Enter your topic, choose a style, and generate your Reel script.
					</p>
					<div className="flex items-center justify-center gap-2 text-sm text-gray-400">
						<span>Topic</span>
						<ChevronRight className="w-4 h-4" />
						<span>Style</span>
						<ChevronRight className="w-4 h-4" />
						<span>Duration</span>
						<ChevronRight className="w-4 h-4" />
						<span>Generate</span>
					</div>
				</div>
			)}
		</div>
	);
}
