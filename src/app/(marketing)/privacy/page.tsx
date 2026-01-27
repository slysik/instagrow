import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
	title: "Privacy Policy | InstaGrow",
	description: "Learn how InstaGrow protects your data and privacy.",
};

export default function PrivacyPage() {
	return (
		<main className="min-h-screen bg-[var(--bg-white)]">
			{/* Navigation - Same as landing page */}
			<nav className="sticky top-0 z-50 bg-white border-b border-[var(--border-light)]">
				<div className="container flex items-center justify-between h-16">
					<Link href="/" className="text-xl font-bold text-ig-gradient">
						InstaGrow
					</Link>
					<div className="hidden md:flex items-center gap-8">
						<Link
							href="/#tools"
							className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
						>
							Tools
						</Link>
						<Link
							href="/#pricing"
							className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
						>
							Pricing
						</Link>
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
					<div className="md:hidden">
						<Link href="/login" className="btn btn-gradient btn-sm">
							Get started
						</Link>
					</div>
				</div>
			</nav>

			{/* Page Header */}
			<section className="py-16 md:py-20 border-b border-[var(--border-light)]">
				<div className="container">
					<div className="max-w-3xl">
						<h1 className="heading-xl mb-4">Privacy Policy</h1>
						<p className="text-lg text-[var(--text-secondary)]">
							Your privacy is important to us. This policy explains how
							InstaGrow collects, uses, and protects your information.
						</p>
						<p className="text-sm text-[var(--text-muted)] mt-4">
							Last updated: January 2025
						</p>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<section className="py-12 md:py-16">
				<div className="container">
					<div className="max-w-3xl space-y-12">
						{/* 1. Overview */}
						<div>
							<h2 className="heading-md mb-4">1. Overview</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								InstaGrow (&ldquo;we,&rdquo; &ldquo;us,&rdquo;
								&ldquo;our,&rdquo; or &ldquo;Company&rdquo;) is committed to
								protecting your privacy. This Privacy Policy explains how we
								collect, use, disclose, and safeguard your information when you
								visit our website and use our services (the
								&ldquo;Service&rdquo;).
							</p>
							<p className="text-[var(--text-secondary)]">
								Please read this privacy policy carefully. If you do not agree
								with our policies and practices, please do not use our Service.
								By accessing and using InstaGrow, you acknowledge that you have
								read, understood, and agree to be bound by all the provisions of
								this Privacy Policy.
							</p>
						</div>

						{/* 2. Information We Collect */}
						<div>
							<h2 className="heading-md mb-4">2. Information We Collect</h2>

							<h3 className="text-lg font-semibold mb-3 mt-6">
								2.1 Account Information
							</h3>
							<p className="text-[var(--text-secondary)] mb-4">
								When you create an InstaGrow account, we collect:
							</p>
							<ul className="space-y-2 text-[var(--text-secondary)] mb-4">
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Email address</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Full name</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Password (hashed and encrypted)</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Profile information and avatar</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Business information (optional)</span>
								</li>
							</ul>

							<h3 className="text-lg font-semibold mb-3 mt-6">
								2.2 Instagram Connection Data
							</h3>
							<p className="text-[var(--text-secondary)] mb-4">
								To use InstaGrow, you authorize us to access your Instagram
								account through OAuth. We collect:
							</p>
							<ul className="space-y-2 text-[var(--text-secondary)] mb-4">
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>
										Instagram profile information (username, follower count)
									</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Post content and engagement metrics</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Insights data (impressions, reaches, engagement)</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>
										Account followers and following lists (basic info)
									</span>
								</li>
							</ul>

							<h3 className="text-lg font-semibold mb-3 mt-6">
								2.3 Usage Data
							</h3>
							<p className="text-[var(--text-secondary)] mb-4">
								We automatically collect information about your interactions
								with InstaGrow:
							</p>
							<ul className="space-y-2 text-[var(--text-secondary)] mb-4">
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Features used and time spent in each feature</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Content generated (captions, hashtags, scripts)</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>IP address and device information</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Browser type and operating system</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>
										Pages or features accessed and time spent (analytics)
									</span>
								</li>
							</ul>

							<h3 className="text-lg font-semibold mb-3 mt-6">
								2.4 Payment Information
							</h3>
							<p className="text-[var(--text-secondary)]">
								Payment information is processed securely through Stripe. We do
								not store complete credit card details. We collect subscription
								plan, billing email, and transaction history.
							</p>
						</div>

						{/* 3. How We Use Your Information */}
						<div>
							<h2 className="heading-md mb-4">
								3. How We Use Your Information
							</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								InstaGrow uses the collected information for various purposes:
							</p>

							<h3 className="text-lg font-semibold mb-3 mt-6">
								3.1 Service Delivery
							</h3>
							<ul className="space-y-2 text-[var(--text-secondary)] mb-4">
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Generate AI-powered content captions and scripts</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Provide analytics and insights about your content</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Manage your content calendar and scheduling</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Process subscription and billing</span>
								</li>
							</ul>

							<h3 className="text-lg font-semibold mb-3 mt-6">
								3.2 Improvement and Optimization
							</h3>
							<ul className="space-y-2 text-[var(--text-secondary)] mb-4">
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Analyze usage patterns to improve features</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Train and optimize our AI models</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Troubleshoot technical issues</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Personalize your experience</span>
								</li>
							</ul>

							<h3 className="text-lg font-semibold mb-3 mt-6">
								3.3 Communication
							</h3>
							<ul className="space-y-2 text-[var(--text-secondary)] mb-4">
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Send account updates and security alerts</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Respond to customer support inquiries</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Send product updates and feature announcements</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>
										Send marketing emails (with your consent and opt-out option)
									</span>
								</li>
							</ul>
						</div>

						{/* 4. Cookies and Tracking */}
						<div>
							<h2 className="heading-md mb-4">4. Cookies and Tracking</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								InstaGrow uses cookies and similar tracking technologies to
								enhance your experience. Cookies are small data files stored on
								your device.
							</p>

							<h3 className="text-lg font-semibold mb-3 mt-6">
								4.1 Types of Cookies
							</h3>
							<ul className="space-y-2 text-[var(--text-secondary)] mb-4">
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>
										<strong>Essential Cookies:</strong> Required for
										authentication and session management
									</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>
										<strong>Functional Cookies:</strong> Remember your
										preferences and settings
									</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>
										<strong>Analytics Cookies:</strong> Help us understand how
										you use InstaGrow
									</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>
										<strong>Marketing Cookies:</strong> Track performance of ads
										(only with consent)
									</span>
								</li>
							</ul>

							<h3 className="text-lg font-semibold mb-3 mt-6">
								4.2 Managing Cookies
							</h3>
							<p className="text-[var(--text-secondary)]">
								You can control cookie preferences through your browser
								settings. Most browsers allow you to refuse cookies or alert you
								when cookies are being sent. Note that disabling essential
								cookies may impact functionality.
							</p>
						</div>

						{/* 5. Third-Party Services */}
						<div>
							<h2 className="heading-md mb-4">5. Third-Party Services</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								InstaGrow integrates with third-party services to provide our
								functionality. These services have their own privacy policies:
							</p>

							<h3 className="text-lg font-semibold mb-3 mt-6">5.1 OpenAI</h3>
							<p className="text-[var(--text-secondary)] mb-4">
								InstaGrow uses OpenAI&apos;s API to generate AI-powered content.
								Content you send to OpenAI is processed according to their
								Privacy Policy and Data Usage Policy. We do not use your content
								for training unless you explicitly opt in.
							</p>

							<h3 className="text-lg font-semibold mb-3 mt-6">5.2 Stripe</h3>
							<p className="text-[var(--text-secondary)] mb-4">
								Payment processing is handled by Stripe, a PCI-compliant payment
								processor. Stripe collects and processes payment information
								according to their Privacy Policy. We never store your complete
								credit card information.
							</p>

							<h3 className="text-lg font-semibold mb-3 mt-6">
								5.3 Meta (Instagram)
							</h3>
							<p className="text-[var(--text-secondary)] mb-4">
								When you connect your Instagram account via OAuth, we access
								your account through Meta&apos;s Graph API. Instagram data is
								handled according to Meta&apos;s Data Policy. We only request
								the minimum permissions necessary to provide our service.
							</p>

							<h3 className="text-lg font-semibold mb-3 mt-6">
								5.4 Analytics Services
							</h3>
							<p className="text-[var(--text-secondary)]">
								We use analytics services (such as Google Analytics) to
								understand usage patterns. These services may track your
								activity across our site. You can opt out through your browser
								or the analytics provider&apos;s tools.
							</p>
						</div>

						{/* 6. Data Security */}
						<div>
							<h2 className="heading-md mb-4">6. Data Security</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								We implement industry-standard security measures to protect your
								information:
							</p>

							<ul className="space-y-2 text-[var(--text-secondary)] mb-4">
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>
										End-to-end encryption for sensitive data in transit
									</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>AES-256 encryption for data at rest</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Secure password hashing with bcrypt</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Regular security audits and penetration testing</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>Access controls and authentication (OAuth 2.0)</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>
										Compliance with GDPR, CCPA, and other data protection
										regulations
									</span>
								</li>
							</ul>

							<p className="text-[var(--text-secondary)]">
								However, no method of transmission over the internet is 100%
								secure. While we strive to protect your information, we cannot
								guarantee absolute security. You use InstaGrow at your own risk.
							</p>
						</div>

						{/* 7. Your Data Rights */}
						<div>
							<h2 className="heading-md mb-4">7. Your Data Rights</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								Depending on your location, you may have certain rights
								regarding your personal information:
							</p>

							<h3 className="text-lg font-semibold mb-3 mt-6">
								7.1 Access and Portability
							</h3>
							<p className="text-[var(--text-secondary)] mb-4">
								You have the right to access your personal data and receive a
								copy in a portable format. You can download your data from your
								account settings or contact us.
							</p>

							<h3 className="text-lg font-semibold mb-3 mt-6">
								7.2 Correction
							</h3>
							<p className="text-[var(--text-secondary)] mb-4">
								You can update, correct, or modify your account information at
								any time through your account settings.
							</p>

							<h3 className="text-lg font-semibold mb-3 mt-6">
								7.3 Deletion (Right to be Forgotten)
							</h3>
							<p className="text-[var(--text-secondary)] mb-4">
								You may request deletion of your account and associated personal
								data. Upon request, we will delete your information within 30
								days, except where retention is required by law or for
								legitimate business purposes.
							</p>

							<h3 className="text-lg font-semibold mb-3 mt-6">
								7.4 Opt-Out and Preferences
							</h3>
							<p className="text-[var(--text-secondary)]">
								You can opt out of marketing emails, analytics tracking, and
								cookie collection at any time. You can manage these preferences
								in your account settings or by following unsubscribe links in
								our emails.
							</p>
						</div>

						{/* 8. Retention */}
						<div>
							<h2 className="heading-md mb-4">8. Data Retention</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								We retain your personal data only as long as necessary to
								provide InstaGrow and comply with legal obligations:
							</p>

							<ul className="space-y-2 text-[var(--text-secondary)] mb-4">
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>
										<strong>Account data:</strong> Retained while your account
										is active, then deleted within 30 days of account deletion
									</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>
										<strong>Generated content:</strong> Retained for 90 days,
										then deleted unless you export it
									</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>
										<strong>Analytics data:</strong> Aggregated and anonymized
										after 24 months
									</span>
								</li>
								<li className="flex gap-3">
									<span className="text-[var(--gradient-mid)]">•</span>
									<span>
										<strong>Payment records:</strong> Retained for 7 years per
										tax regulations
									</span>
								</li>
							</ul>
						</div>

						{/* 9. Children's Privacy */}
						<div>
							<h2 className="heading-md mb-4">9. Children&apos;s Privacy</h2>
							<p className="text-[var(--text-secondary)]">
								InstaGrow is not intended for children under 13 years of age. We
								do not knowingly collect personal information from children
								under 13. If we become aware that a child under 13 has provided
								us with personal information, we will delete such information
								and terminate the child&apos;s account. If you believe we have
								collected information from a child under 13, please contact us
								immediately.
							</p>
						</div>

						{/* 10. International Data Transfer */}
						<div>
							<h2 className="heading-md mb-4">
								10. International Data Transfer
							</h2>
							<p className="text-[var(--text-secondary)]">
								InstaGrow operates from the United States. Your information may
								be transferred to, stored in, and processed in countries other
								than your country of residence. These countries may have data
								protection laws different from your home country. By using
								InstaGrow, you consent to the transfer of your information to
								countries outside your country of residence.
							</p>
						</div>

						{/* 11. Changes to This Policy */}
						<div>
							<h2 className="heading-md mb-4">
								11. Changes to This Privacy Policy
							</h2>
							<p className="text-[var(--text-secondary)]">
								InstaGrow may update this Privacy Policy from time to time. We
								will notify you of material changes by posting the new Privacy
								Policy on this page and updating the &ldquo;Last updated&rdquo;
								date. We may also send you an email notification of significant
								changes. Your continued use of InstaGrow constitutes your
								acceptance of the updated Privacy Policy.
							</p>
						</div>

						{/* 12. Contact Us */}
						<div>
							<h2 className="heading-md mb-4">12. Contact Us</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								If you have questions or concerns about this Privacy Policy or
								our privacy practices, please contact us:
							</p>

							<div className="bg-[var(--bg-light)] rounded-lg p-6 space-y-3">
								<div>
									<p className="font-semibold text-[var(--text-primary)] mb-1">
										Email
									</p>
									<a
										href="mailto:support@instagrow.app"
										className="text-[var(--gradient-mid)] hover:text-[var(--gradient-dark)] transition-colors"
									>
										support@instagrow.app
									</a>
								</div>
								<div>
									<p className="font-semibold text-[var(--text-primary)] mb-1">
										Response Time
									</p>
									<p className="text-[var(--text-secondary)]">
										We will respond to privacy requests within 14 business days.
									</p>
								</div>
								<div>
									<p className="font-semibold text-[var(--text-primary)] mb-1">
										Legal Requests
									</p>
									<p className="text-[var(--text-secondary)]">
										For formal legal requests or GDPR/CCPA inquiries, please
										include &ldquo;PRIVACY REQUEST&rdquo; in the subject line.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 bg-[var(--bg-light)] border-t border-[var(--border-light)]">
				<div className="container text-center">
					<h2 className="heading-md mb-4">Ready to get started?</h2>
					<p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
						Join thousands of creators using InstaGrow to save time and grow
						their audience.
					</p>
					<Link href="/login" className="btn btn-gradient btn-lg">
						Get started free
						<ArrowRight className="w-4 h-4 ml-2" />
					</Link>
				</div>
			</section>

			{/* Footer - Same as landing page */}
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
