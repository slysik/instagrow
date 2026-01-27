"use client";

import React from "react";

interface ErrorStateProps {
	title: string;
	description: string;
	onRetry?: () => void;
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
	return (
		<div className="flex items-center justify-center min-h-[400px] px-4 py-8">
			<div className="text-center max-w-md">
				{/* Error Icon Container */}
				<div className="mb-6 flex justify-center">
					<div
						className="inline-flex items-center justify-center w-16 h-16 rounded-full"
						style={{ backgroundColor: "#FEE2E2" }}
						role="img"
						aria-label="Error"
					>
						<svg
							width="32"
							height="32"
							viewBox="0 0 32 32"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<circle
								cx="16"
								cy="16"
								r="14"
								stroke="var(--error)"
								strokeWidth="2"
							/>
							<path
								d="M16 8V16"
								stroke="var(--error)"
								strokeWidth="2"
								strokeLinecap="round"
							/>
							<circle cx="16" cy="22" r="1.5" fill="var(--error)" />
						</svg>
					</div>
				</div>

				{/* Title */}
				<h3
					className="mb-2 font-semibold"
					style={{
						fontSize: "1.25rem",
						fontWeight: 600,
						color: "var(--text-primary)",
						lineHeight: 1.3,
					}}
				>
					{title}
				</h3>

				{/* Description */}
				<p
					className="mb-6"
					style={{
						fontSize: "0.9375rem",
						color: "var(--text-secondary)",
						lineHeight: 1.6,
					}}
				>
					{description}
				</p>

				{/* Retry Button */}
				{onRetry && (
					<button
						onClick={onRetry}
						className="btn btn-primary"
						aria-label="Retry action"
					>
						Try Again
					</button>
				)}
			</div>
		</div>
	);
}
