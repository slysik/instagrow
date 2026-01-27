import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
	title: "Terms of Service | InstaGrow",
	description: "Terms of Service for InstaGrow AI content creation platform",
};

export default function TermsPage() {
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

			{/* Hero Section */}
			<section className="py-12 md:py-16">
				<div className="container">
					<div className="max-w-3xl mx-auto">
						<h1 className="heading-lg mb-4">Terms of Service</h1>
						<p className="text-[var(--text-secondary)] text-sm">
							Last updated:{" "}
							{new Date().toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					</div>
				</div>
			</section>

			{/* Terms Content */}
			<section className="py-12 md:py-16">
				<div className="container">
					<div className="max-w-3xl mx-auto space-y-12">
						{/* Section 1: Service Description */}
						<div>
							<h2 className="heading-md mb-4">1. Service Description</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								InstaGrow is an AI-powered content creation platform designed to
								help creators, businesses, and teams manage and optimize their
								social media presence. Our service provides tools for content
								generation, scheduling, analytics, and engagement optimization
								across multiple social platforms.
							</p>
							<p className="text-[var(--text-secondary)]">
								InstaGrow (the "Service") is provided by InstaGrow, Inc.
								("Company", "we", "our", or "us"). These Terms of Service
								("Terms") govern your use of our website, mobile applications,
								and all associated services (collectively, the "Platform").
							</p>
						</div>

						{/* Section 2: User Accounts */}
						<div>
							<h2 className="heading-md mb-4">
								2. User Accounts and Registration
							</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								To access certain features of the Service, you may be required
								to create an account. When creating an account, you agree to:
							</p>
							<ul className="space-y-3 mb-4 ml-6">
								<li className="text-[var(--text-secondary)]">
									<span className="font-semibold">Accuracy:</span> Provide
									accurate, current, and complete information
								</li>
								<li className="text-[var(--text-secondary)]">
									<span className="font-semibold">Password Security:</span>{" "}
									Maintain the confidentiality of your password and accept
									responsibility for all activities that occur under your
									account
								</li>
								<li className="text-[var(--text-secondary)]">
									<span className="font-semibold">Authorization:</span> Ensure
									you have authority to authorize third-party social media
									accounts connected to your InstaGrow account
								</li>
								<li className="text-[var(--text-secondary)]">
									<span className="font-semibold">Age Requirement:</span> Be at
									least 18 years old to use the Service
								</li>
							</ul>
							<p className="text-[var(--text-secondary)]">
								You are responsible for immediately notifying us of any
								unauthorized use of your account or any other breach of
								security.
							</p>
						</div>

						{/* Section 3: User Obligations */}
						<div>
							<h2 className="heading-md mb-4">
								3. User Obligations and Restrictions
							</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								You agree that you will not:
							</p>
							<ul className="space-y-3 mb-6 ml-6">
								<li className="text-[var(--text-secondary)]">
									Use the Service for any illegal purpose or in violation of any
									applicable laws or regulations
								</li>
								<li className="text-[var(--text-secondary)]">
									Create content that is defamatory, harassing, threatening,
									abusive, or discriminatory
								</li>
								<li className="text-[var(--text-secondary)]">
									Attempt to gain unauthorized access to our systems or networks
								</li>
								<li className="text-[var(--text-secondary)]">
									Reverse engineer, decompile, or attempt to discover the source
									code or algorithms of the Service
								</li>
								<li className="text-[var(--text-secondary)]">
									Use automated tools or scripts to access the Service (except
									through our official APIs with appropriate authorization)
								</li>
								<li className="text-[var(--text-secondary)]">
									Interfere with or disrupt the integrity or performance of the
									Service or third-party systems
								</li>
								<li className="text-[var(--text-secondary)]">
									Violate the terms of service of any third-party platform you
									connect to InstaGrow
								</li>
								<li className="text-[var(--text-secondary)]">
									Use the Service to spam, harass, or send unsolicited messages
								</li>
							</ul>
						</div>

						{/* Section 4: Intellectual Property */}
						<div>
							<h2 className="heading-md mb-4">
								4. Intellectual Property Rights
							</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								<span className="font-semibold">Our IP:</span> InstaGrow retains
								all right, title, and interest in and to the Service, including
								all code, features, functionality, and user interface elements.
								The InstaGrow name, logo, and all related trademarks are the
								exclusive property of InstaGrow, Inc.
							</p>
							<p className="text-[var(--text-secondary)] mb-4">
								<span className="font-semibold">AI-Generated Content:</span>{" "}
								Content generated by InstaGrow's AI models ("AI-Generated
								Content") is provided for your use subject to these Terms. You
								retain the right to use, modify, and distribute AI-Generated
								Content created through the Service, provided you comply with
								applicable laws and the policies of third-party platforms where
								you publish this content.
							</p>
							<p className="text-[var(--text-secondary)] mb-4">
								<span className="font-semibold">Your Content:</span> You retain
								all rights to any content you upload or input into the Service
								("Your Content"). By uploading Your Content, you grant InstaGrow
								a worldwide, non-exclusive, royalty-free license to use Your
								Content for the purposes of providing the Service, improving our
								AI models (with your consent), and displaying content within
								your account.
							</p>
							<p className="text-[var(--text-secondary)]">
								<span className="font-semibold">Third-Party Content:</span> The
								Service may include content from third parties. Use of such
								content is subject to their respective terms and licenses.
							</p>
						</div>

						{/* Section 5: Disclaimer of Warranties */}
						<div>
							<h2 className="heading-md mb-4">5. Disclaimer of Warranties</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								THE SERVICE IS PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS.
								INSTAGROW MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND,
								EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
							</p>
							<ul className="space-y-3 mb-4 ml-6">
								<li className="text-[var(--text-secondary)]">
									The accuracy, completeness, or reliability of the Service
								</li>
								<li className="text-[var(--text-secondary)]">
									That the Service will be uninterrupted, error-free, or secure
								</li>
								<li className="text-[var(--text-secondary)]">
									That any defects or errors will be corrected
								</li>
								<li className="text-[var(--text-secondary)]">
									That AI-Generated Content will achieve specific results or
									engagement metrics
								</li>
								<li className="text-[var(--text-secondary)]">
									Any warranties of merchantability, fitness for a particular
									purpose, or non-infringement
								</li>
							</ul>
							<p className="text-[var(--text-secondary)]">
								You use the Service entirely at your own risk. We recommend
								reviewing all AI-Generated Content before publishing to ensure
								accuracy and alignment with your brand.
							</p>
						</div>

						{/* Section 6: Limitation of Liability */}
						<div>
							<h2 className="heading-md mb-4">6. Limitation of Liability</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								TO THE MAXIMUM EXTENT PERMITTED BY LAW, INSTAGROW SHALL NOT BE
								LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
								PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
							</p>
							<ul className="space-y-3 mb-6 ml-6">
								<li className="text-[var(--text-secondary)]">
									Loss of profits, revenue, data, or use
								</li>
								<li className="text-[var(--text-secondary)]">
									Business interruption or loss of business opportunity
								</li>
								<li className="text-[var(--text-secondary)]">
									Damage to reputation or brand
								</li>
								<li className="text-[var(--text-secondary)]">
									Loss of followers, engagement, or social media performance
								</li>
							</ul>
							<p className="text-[var(--text-secondary)] mb-4">
								IN NO EVENT SHALL INSTAGROW'S TOTAL LIABILITY EXCEED THE AMOUNT
								YOU HAVE PAID INSTAGROW IN THE TWELVE (12) MONTHS PRECEDING THE
								CLAIM OR $100, WHICHEVER IS GREATER.
							</p>
							<p className="text-[var(--text-secondary)]">
								Some jurisdictions do not allow the limitation of liability for
								consequential or incidental damages, so this limitation may not
								apply to you.
							</p>
						</div>

						{/* Section 7: Payment and Billing */}
						<div>
							<h2 className="heading-md mb-4">7. Payment and Billing</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								<span className="font-semibold">Pricing:</span> InstaGrow offers
								free and paid subscription plans. Pricing is subject to change
								with 30 days' written notice. Price changes will not affect your
								current billing period.
							</p>
							<p className="text-[var(--text-secondary)] mb-4">
								<span className="font-semibold">Billing:</span> By providing
								payment information, you authorize InstaGrow to charge your
								payment method for the subscription plan you select. Billing
								occurs on the date your subscription renews each month or year,
								depending on your plan.
							</p>
							<p className="text-[var(--text-secondary)] mb-4">
								<span className="font-semibold">Refunds:</span> Except as
								required by law, all subscription fees are non-refundable.
								Cancellation of your subscription will take effect at the end of
								your current billing period.
							</p>
							<p className="text-[var(--text-secondary)]">
								<span className="font-semibold">Past Due Accounts:</span> If
								your payment method fails or your account becomes past due, we
								may suspend access to the Service until payment is received.
							</p>
						</div>

						{/* Section 8: Termination */}
						<div>
							<h2 className="heading-md mb-4">8. Termination</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								<span className="font-semibold">Termination by You:</span> You
								may terminate your account at any time by going to your account
								settings or by contacting us at support@instagrow.app. Upon
								termination, your subscription will end at the conclusion of
								your current billing period (if applicable).
							</p>
							<p className="text-[var(--text-secondary)] mb-4">
								<span className="font-semibold">Termination by Us:</span>{" "}
								InstaGrow may terminate or suspend your account and access to
								the Service immediately if:
							</p>
							<ul className="space-y-3 mb-4 ml-6">
								<li className="text-[var(--text-secondary)]">
									You violate these Terms or any applicable laws
								</li>
								<li className="text-[var(--text-secondary)]">
									You engage in fraudulent, abusive, or harmful activity
								</li>
								<li className="text-[var(--text-secondary)]">
									Your account has been inactive for 12 months (free tier only)
								</li>
								<li className="text-[var(--text-secondary)]">
									We discontinue the Service or a particular feature
								</li>
							</ul>
							<p className="text-[var(--text-secondary)]">
								Upon termination, your access to the Service will be revoked.
								You are responsible for backing up any data or content you wish
								to retain before termination.
							</p>
						</div>

						{/* Section 9: Indemnification */}
						<div>
							<h2 className="heading-md mb-4">9. Indemnification</h2>
							<p className="text-[var(--text-secondary)]">
								You agree to defend, indemnify, and hold harmless InstaGrow, its
								officers, directors, employees, and agents from any claims,
								damages, losses, or expenses (including legal fees) arising from
								or related to: (a) Your Content or AI-Generated Content you
								create or publish; (b) your violation of these Terms or
								applicable laws; (c) your use of the Service; or (d) your
								violation of any third party's rights.
							</p>
						</div>

						{/* Section 10: Privacy */}
						<div>
							<h2 className="heading-md mb-4">
								10. Privacy and Data Protection
							</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								Your use of the Service is also governed by our Privacy Policy,
								which describes how we collect, use, and protect your personal
								information. By using the Service, you consent to our collection
								and use of data as outlined in the Privacy Policy.
							</p>
							<p className="text-[var(--text-secondary)]">
								We take data security seriously and implement industry-standard
								protections. However, no method of transmission over the
								internet or electronic storage is 100% secure. You use the
								Service at your own risk.
							</p>
						</div>

						{/* Section 11: Third-Party Platforms */}
						<div>
							<h2 className="heading-md mb-4">
								11. Third-Party Platforms and Integrations
							</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								InstaGrow integrates with third-party social media platforms
								(Instagram, Facebook, TikTok, etc.). Your use of these
								integrations is subject to each platform's terms of service.
								InstaGrow is not responsible for:
							</p>
							<ul className="space-y-3 mb-4 ml-6">
								<li className="text-[var(--text-secondary)]">
									Changes to third-party platform APIs or policies
								</li>
								<li className="text-[var(--text-secondary)]">
									Removal or suspension of your account by third-party platforms
								</li>
								<li className="text-[var(--text-secondary)]">
									Interruption of service due to third-party platform changes
								</li>
								<li className="text-[var(--text-secondary)]">
									Content moderation or removal decisions by third-party
									platforms
								</li>
							</ul>
							<p className="text-[var(--text-secondary)]">
								You are responsible for maintaining valid credentials and
								permissions for any third-party accounts you connect to
								InstaGrow.
							</p>
						</div>

						{/* Section 12: Modifications to Terms */}
						<div>
							<h2 className="heading-md mb-4">12. Modifications to Terms</h2>
							<p className="text-[var(--text-secondary)]">
								InstaGrow reserves the right to modify these Terms at any time.
								We will notify you of significant changes via email or by
								posting a notice on the Platform. Your continued use of the
								Service after changes become effective constitutes your
								acceptance of the modified Terms. If you do not agree to the
								modifications, you may terminate your account.
							</p>
						</div>

						{/* Section 13: Governing Law */}
						<div>
							<h2 className="heading-md mb-4">
								13. Governing Law and Dispute Resolution
							</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								These Terms are governed by and construed in accordance with the
								laws of the State of California, without regard to its conflict
								of law principles. You agree that any dispute arising from or
								related to these Terms or the Service shall be subject to the
								exclusive jurisdiction of the state and federal courts located
								in San Francisco County, California.
							</p>
							<p className="text-[var(--text-secondary)] mb-4">
								<span className="font-semibold">Arbitration Clause:</span> For
								claims less than $10,000, either party may elect to have the
								dispute resolved through binding arbitration instead of court
								proceedings. Arbitration will be conducted by a single neutral
								arbitrator under the rules of JAMS.
							</p>
							<p className="text-[var(--text-secondary)]">
								You agree to attempt to resolve any dispute through informal
								negotiation before pursuing formal legal action.
							</p>
						</div>

						{/* Section 14: Severability */}
						<div>
							<h2 className="heading-md mb-4">14. Severability</h2>
							<p className="text-[var(--text-secondary)]">
								If any provision of these Terms is found to be invalid or
								unenforceable, the remaining provisions shall continue in full
								force and effect. If a provision is deemed unenforceable, it
								shall be modified to the minimum extent necessary to make it
								valid and enforceable.
							</p>
						</div>

						{/* Section 15: Entire Agreement */}
						<div>
							<h2 className="heading-md mb-4">15. Entire Agreement</h2>
							<p className="text-[var(--text-secondary)]">
								These Terms, together with our Privacy Policy and any other
								policies referenced herein, constitute the entire agreement
								between you and InstaGrow regarding the Service and supersede
								all prior negotiations, understandings, and agreements. There
								are no other agreements, oral or otherwise, between us
								concerning the Service.
							</p>
						</div>

						{/* Section 16: Contact Information */}
						<div>
							<h2 className="heading-md mb-4">16. Contact Information</h2>
							<p className="text-[var(--text-secondary)] mb-4">
								If you have any questions about these Terms or the Service,
								please contact us at:
							</p>
							<div className="bg-[var(--bg-light)] p-6 rounded-lg">
								<p className="text-[var(--text-primary)] font-semibold mb-2">
									InstaGrow, Inc.
								</p>
								<p className="text-[var(--text-secondary)]">
									Email:{" "}
									<a
										href="mailto:support@instagrow.app"
										className="text-[var(--gradient-mid)] hover:underline"
									>
										support@instagrow.app
									</a>
								</p>
								<p className="text-[var(--text-secondary)] mt-4 text-sm">
									We typically respond to inquiries within 48 business hours.
								</p>
							</div>
						</div>

						{/* Section 17: Acknowledgment */}
						<div className="pt-8 border-t border-[var(--border-light)]">
							<p className="text-[var(--text-secondary)] text-sm">
								By accessing or using InstaGrow, you acknowledge that you have
								read, understood, and agree to be bound by these Terms of
								Service. If you do not agree to these Terms, please do not use
								the Service.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 bg-[var(--bg-light)]">
				<div className="container text-center">
					<h2 className="heading-md mb-4">Ready to get started?</h2>
					<p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
						Start creating amazing content with InstaGrow's AI-powered tools
						today.
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
