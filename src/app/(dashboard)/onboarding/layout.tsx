// Onboarding has its own layout without the dashboard sidebar
export default function OnboardingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
