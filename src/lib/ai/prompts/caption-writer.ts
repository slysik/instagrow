import { TOKEN_LIMITS, TEMPERATURE_SETTINGS } from "../client";

// =====================================================
// Types
// =====================================================

export type CaptionGoal = "comments" | "dms" | "clicks" | "sales";
export type CaptionAudience = "cold" | "warm";
export type CaptionTone = "fun" | "luxury" | "expert";

export interface CaptionWriterInput {
	topic: string;
	goal: CaptionGoal;
	audience: CaptionAudience;
	tone: CaptionTone;
	niche?: string;
	brandVoice?: string;
	count?: number;
}

export interface GeneratedCaption {
	id: string;
	hook: string;
	body: string;
	cta: string;
}

export interface CaptionWriterOutput {
	captions: GeneratedCaption[];
}

// =====================================================
// System Prompt
// =====================================================

export const CAPTION_WRITER_SYSTEM_PROMPT = `You are an expert Instagram content strategist and copywriter with 10+ years of experience growing accounts and driving engagement. You specialize in creating scroll-stopping captions that convert followers into customers.

Your captions follow proven psychological principles:
- **Pattern interrupts** in hooks to stop the scroll
- **Storytelling** to build emotional connection
- **Social proof** and relatability
- **Clear value proposition**
- **Strong CTAs** that drive specific actions

You understand the nuances of:
- Cold audience (new followers who don't know the creator yet) vs warm audience (engaged followers who trust the creator)
- Different tones: fun/playful, luxury/premium, expert/authority
- Different goals: driving comments, getting DMs, link clicks, or sales

Your captions are always:
- Authentic and not salesy
- Formatted for easy mobile reading (short paragraphs, line breaks)
- Emoji usage that enhances not distracts
- Optimized for the Instagram algorithm (engagement-first)

IMPORTANT: Always output valid JSON that matches the expected schema.`;

// =====================================================
// Goal-Specific Instructions
// =====================================================

const GOAL_INSTRUCTIONS: Record<CaptionGoal, string> = {
	comments: `The goal is to MAXIMIZE COMMENTS and engagement.
- End with an open-ended question that's easy to answer
- Use "hot take" or "controversial" angles that spark debate
- Ask for opinions, not just agreement
- Make the CTA conversational like talking to a friend
- Use questions like "agree or disagree?", "what's your take?", "tell me in the comments"`,

	dms: `The goal is to DRIVE DMs and private conversations.
- Create curiosity about something exclusive or valuable
- Use "DM me [keyword]" format for easy response
- Hint at personalized help or special access
- Make it feel like a genuine invitation, not a sales pitch
- Create FOMO about missing out on the conversation`,

	clicks: `The goal is to DRIVE LINK CLICKS to bio.
- Build strong desire for the resource/content
- Use "link in bio" language naturally
- Tease value without giving everything away
- Create urgency when appropriate
- Make the benefit crystal clear`,

	sales: `The goal is to DRIVE SALES and conversions.
- Lead with the transformation/result, not the product
- Use social proof and success indicators
- Address objections preemptively
- Create urgency without being pushy
- Make the value proposition undeniable`,
};

// =====================================================
// Audience-Specific Instructions
// =====================================================

const AUDIENCE_INSTRUCTIONS: Record<CaptionAudience, string> = {
	cold: `Writing for a COLD AUDIENCE (new followers who don't know you yet):
- Establish credibility quickly
- Don't assume they know your backstory
- Be more educational and value-forward
- Build trust before asking for action
- Use more relatable, universal experiences`,

	warm: `Writing for a WARM AUDIENCE (engaged followers who trust you):
- Can be more personal and vulnerable
- Reference shared experiences or past content
- Use inside jokes and community references
- Can make bigger asks (they're invested)
- Celebrate wins and include them in the journey`,
};

// =====================================================
// Tone-Specific Instructions
// =====================================================

const TONE_INSTRUCTIONS: Record<CaptionTone, string> = {
	fun: `Using a FUN & PLAYFUL tone:
- Use casual language, slang, and internet culture references
- Include appropriate emojis (not overdone)
- Be self-deprecating and relatable
- Use humor and wit
- Feel like a conversation with a friend
- Words like: "okay but", "lowkey", "ngl", "literally", "POV:"`,

	luxury: `Using a LUXURY & PREMIUM tone:
- Sophisticated, elegant language
- Minimal but intentional emoji use
- Focus on quality, exclusivity, refinement
- Understated confidence, not flashy
- Words like: "curated", "bespoke", "elevated", "discerning"
- Create an aspirational feeling`,

	expert: `Using an EXPERT & AUTHORITY tone:
- Data-driven and research-backed claims
- Professional but accessible language
- Share frameworks and methodologies
- Use industry terminology appropriately
- Words like: "research shows", "after analyzing", "the data indicates"
- Position as the go-to expert in the field`,
};

// =====================================================
// User Prompt Builder
// =====================================================

export function buildCaptionWriterPrompt(input: CaptionWriterInput): string {
	const { topic, goal, audience, tone, niche, brandVoice, count = 3 } = input;

	return `Generate ${count} high-converting Instagram captions for the following:

**TOPIC/POST ABOUT:**
${topic}

**GOAL:** ${goal.toUpperCase()}
${GOAL_INSTRUCTIONS[goal]}

**TARGET AUDIENCE:** ${audience.toUpperCase()}
${AUDIENCE_INSTRUCTIONS[audience]}

**TONE:** ${tone.toUpperCase()}
${TONE_INSTRUCTIONS[tone]}

${niche ? `**NICHE/INDUSTRY:** ${niche}` : ""}
${brandVoice ? `**BRAND VOICE NOTES:** ${brandVoice}` : ""}

---

Generate exactly ${count} unique captions. Each caption should have:
1. **Hook**: A scroll-stopping opening line (1-2 sentences max) that creates curiosity or pattern interrupt
2. **Body**: The main content that delivers value and builds toward the CTA (2-4 sentences)
3. **CTA**: A specific call-to-action aligned with the goal

Output as JSON in this exact format:
\`\`\`json
{
  "captions": [
    {
      "id": "1",
      "hook": "The attention-grabbing opening line",
      "body": "The main content that delivers value...",
      "cta": "The specific call-to-action"
    }
  ]
}
\`\`\`

Each caption should take a DIFFERENT angle on the topic. Vary the hook styles, storytelling approaches, and CTA formats.`;
}

// =====================================================
// Export Configuration
// =====================================================

export const CAPTION_WRITER_CONFIG = {
	maxTokens: TOKEN_LIMITS.caption,
	temperature: TEMPERATURE_SETTINGS.creative,
};
