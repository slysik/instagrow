"use client";

import React from "react";

interface EmptyStateProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	actionLabel?: string;
	actionHref?: string;
	onAction?: () => void;
}

export function EmptyState({
	icon,
	title,
	description,
	actionLabel,
	actionHref,
	onAction,
}: EmptyStateProps) {
	const handleClick = () => {
		if (onAction) {
			onAction();
		} else if (actionHref) {
			window.location.href = actionHref;
		}
	};

	return (
		<div className="flex items-center justify-center min-h-[400px] px-4 py-8">
			<div className="text-center max-w-md">
				{/* Icon Container */}
				<div className="mb-6 flex justify-center">
					<div
						className="inline-flex items-center justify-center w-16 h-16 rounded-full"
						style={{ backgroundColor: "var(--bg-muted)" }}
					>
						<div className="text-3xl opacity-60" role="img" aria-hidden="true">
							{icon}
						</div>
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

				{/* Action Button */}
				{actionLabel && (
					<button
						onClick={handleClick}
						className="btn btn-primary"
						aria-label={actionLabel}
					>
						{actionLabel}
					</button>
				)}
			</div>
		</div>
	);
}
