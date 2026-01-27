"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getOnboardingStatus } from "@/lib/actions/onboarding";

interface OnboardingCheckProps {
	children: React.ReactNode;
}

export function OnboardingCheck({ children }: OnboardingCheckProps) {
	const { data: session, status } = useSession();
	const pathname = usePathname();
	const router = useRouter();
	const [isChecking, setIsChecking] = useState(true);
	const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(
		null,
	);

	useEffect(() => {
		async function checkOnboarding() {
			if (status === "loading") return;

			if (status === "unauthenticated") {
				setIsChecking(false);
				return;
			}

			if (session?.user?.id) {
				try {
					const isComplete = await getOnboardingStatus(session.user.id);
					setOnboardingComplete(isComplete);

					// Only redirect if we're not already on the onboarding page
					// and onboarding is not complete
					if (!isComplete && !pathname.startsWith("/onboarding")) {
						router.push("/onboarding");
					}
				} catch (error) {
					console.error("Failed to check onboarding status:", error);
				}
			}

			setIsChecking(false);
		}

		checkOnboarding();
	}, [session?.user?.id, status, pathname, router]);

	// Show loading state while checking
	if (isChecking || status === "loading") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-warm-cream">
				<div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
			</div>
		);
	}

	// If on onboarding page, always render children
	if (pathname.startsWith("/onboarding")) {
		return <>{children}</>;
	}

	// If onboarding not complete, don't render dashboard (redirect will happen)
	if (onboardingComplete === false) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-warm-cream">
				<div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
			</div>
		);
	}

	return <>{children}</>;
}
