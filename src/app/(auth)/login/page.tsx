"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, Loader } from "lucide-react";

function LoginContent() {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
	const error = searchParams.get("error");
	const [isLoading, setIsLoading] = useState(false);

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		await signIn("google", { callbackUrl });
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8 sm:px-6">
			{/* Back to home link */}
			<Link
				href="/"
				className="absolute top-6 left-6 sm:top-8 sm:left-8 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
			>
				← Back
			</Link>

			<div className="w-full max-w-md">
				{/* Logo and Header */}
				<div className="text-center mb-10">
					<h1 className="text-4xl sm:text-5xl font-bold text-ig-gradient mb-3">
						InstaGrow
					</h1>
					<p className="text-lg text-[var(--text-secondary)] mb-2">
						Save 2+ hours per week
					</p>
					<p className="text-sm text-[var(--text-muted)]">
						Create amazing Instagram content with AI
					</p>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
						<AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
						<div className="text-sm text-red-700">
							{error === "OAuthAccountNotLinked"
								? "This email is already associated with another account."
								: "An error occurred during sign in. Please try again."}
						</div>
					</div>
				)}

				{/* Main Card */}
				<div className="card shadow-lg border-[rgba(0,0,0,0.04)]">
					{/* Button with Loading State */}
					<button
						onClick={handleGoogleSignIn}
						disabled={isLoading}
						className="w-full flex items-center justify-center gap-3 px-4 py-4 mb-4 border border-[rgba(0,0,0,0.08)] rounded-xl bg-white hover:bg-gray-50 hover:border-[var(--gradient-mid)]/30 hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
					>
						{isLoading ? (
							<>
								<Loader className="w-5 h-5 animate-spin text-[var(--gradient-mid)]" />
								<span className="font-medium text-gray-700">Signing in...</span>
							</>
						) : (
							<>
								<svg className="w-5 h-5" viewBox="0 0 24 24">
									<path
										fill="#4285F4"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="#34A853"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="#FBBC05"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="#EA4335"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
								<span className="font-medium text-gray-700">
									Continue with Google
								</span>
							</>
						)}
					</button>

					{/* Value Proposition */}
					<div className="space-y-3 mb-6 pt-4 border-t border-[var(--border-light)]">
						<div className="flex items-start gap-3">
							<span className="text-lg">✨</span>
							<div className="text-sm">
								<p className="font-medium text-[var(--text-primary)]">
									8 AI tools included
								</p>
								<p className="text-[var(--text-muted)]">
									Caption writer, hashtag suite, content calendar, and more
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<span className="text-lg">🚀</span>
							<div className="text-sm">
								<p className="font-medium text-[var(--text-primary)]">
									Get started free
								</p>
								<p className="text-[var(--text-muted)]">
									3 AI generations per day. Upgrade anytime.
								</p>
							</div>
						</div>
					</div>

					{/* CTA Text */}
					<p className="text-center text-sm font-medium text-[var(--text-primary)] mb-4">
						Create better content in less time
					</p>

					{/* Legal Text */}
					<p className="text-center text-xs text-[var(--text-muted)]">
						By signing in, you agree to our{" "}
						<a
							href="/terms"
							className="text-[var(--gradient-mid)] hover:underline"
						>
							Terms of Service
						</a>{" "}
						and{" "}
						<a
							href="/privacy"
							className="text-[var(--gradient-mid)] hover:underline"
						>
							Privacy Policy
						</a>
					</p>
				</div>

				{/* Secondary CTA */}
				<p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
					Want to learn more?{" "}
					<Link
						href="/"
						className="font-medium text-[var(--gradient-mid)] hover:underline flex items-center justify-center gap-1 inline-flex"
					>
						Back to home <ArrowRight className="w-4 h-4" />
					</Link>
				</p>
			</div>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
					<div className="w-full max-w-md">
						<div className="text-center mb-10">
							<div className="h-12 bg-gray-200 rounded-lg w-32 mx-auto mb-3"></div>
							<div className="h-5 bg-gray-200 rounded w-40 mx-auto mb-2"></div>
							<div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
						</div>
						<div className="card shadow-lg">
							<div className="h-14 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
							<div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
								<div className="h-12 bg-gray-200 rounded animate-pulse"></div>
								<div className="h-12 bg-gray-200 rounded animate-pulse"></div>
							</div>
							<div className="h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
						</div>
					</div>
				</div>
			}
		>
			<LoginContent />
		</Suspense>
	);
}
