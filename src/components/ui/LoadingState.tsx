"use client";

import React from "react";

interface LoadingStateProps {
	variant: "spinner" | "skeleton";
	text?: string;
}

export function LoadingState({ variant, text }: LoadingStateProps) {
	if (variant === "spinner") {
		return (
			<div className="flex items-center justify-center min-h-[400px] px-4 py-8">
				<div className="text-center">
					{/* Animated Spinner */}
					<div className="mb-4 flex justify-center">
						<div
							className="inline-block w-10 h-10 border-4 border-transparent rounded-full"
							style={{
								borderTopColor: "var(--primary)",
								borderRightColor: "var(--primary)",
								animation: "spin 1s linear infinite",
							}}
							role="status"
							aria-label="Loading"
						>
							<span className="sr-only">Loading...</span>
						</div>
					</div>

					{/* Optional Text */}
					{text && (
						<p
							style={{
								fontSize: "0.9375rem",
								color: "var(--text-secondary)",
								marginTop: "0.75rem",
							}}
						>
							{text}
						</p>
					)}
				</div>

				{/* CSS for spinner animation */}
				<style>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          }
        `}</style>
			</div>
		);
	}

	// Skeleton variant
	if (variant === "skeleton") {
		return (
			<div className="space-y-4 px-4 py-8">
				{/* Header Skeleton */}
				<div className="h-8 rounded-md w-3/4 bg-gray-200 animate-pulse" />

				{/* Content Skeletons */}
				<div className="space-y-3">
					<div className="h-4 rounded-md w-full bg-gray-200 animate-pulse" />
					<div className="h-4 rounded-md w-5/6 bg-gray-200 animate-pulse" />
					<div className="h-4 rounded-md w-4/6 bg-gray-200 animate-pulse" />
				</div>

				{/* Secondary Content Skeletons */}
				<div className="mt-8 space-y-3">
					<div className="h-4 rounded-md w-full bg-gray-200 animate-pulse" />
					<div className="h-4 rounded-md w-5/6 bg-gray-200 animate-pulse" />
				</div>

				{/* Button Skeleton */}
				<div className="mt-8 h-10 rounded-full w-32 bg-gray-200 animate-pulse" />

				{/* CSS for skeleton animation */}
				<style>{`
          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .animate-pulse {
              animation: none;
            }
          }
        `}</style>
			</div>
		);
	}

	return null;
}
