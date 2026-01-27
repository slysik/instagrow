import { TOKEN_LIMITS, TEMPERATURE_SETTINGS } from "../client";

// =====================================================
// Types
// =====================================================

export type BusinessGoal =
	| "awareness"
	| "engagement"
	| "leads"
	| "sales"
	| "community";
export type ContentFrequency = "daily" | "3-4weekly" | "2-3weekly" | "weekly";

export interface ContentPillarsInput {
	niche: string;
	targetAudience: string;
	businessGoal: BusinessGoal;
	contentFrequency: ContentFrequency;
	existingTopics?: string[];
	brandValues?: string[];
	uniqueExpertise?: string;
}

export interface ContentPillar {
	id: string;
	name: string;
	description: string;
	percentage: number; // Percentage of total content
	contentTypes: string[]; // e.g., ["carousel", "reel", "static"]
	exampleTopics: string[];
	postingFrequency: string;
	engagementStyle: string;
	hashtags: string[];
}

export interface ContentMix {
	educate: number;
	entertain: number;
	inspire: number;
	promote: number;
}

export interface ContentPillarsOutput {
	pillars: ContentPillar[];
	contentMix: ContentMix;
	weeklyScheduleSuggestion: {
		day: string;
		pillar: string;
		contentType: string;
	}[];
	pillarRotationTips: string[];
}

// =====================================================
// System Prompt
// =====================================================

export const CONTENT_PILLARS_SYSTEM_PROMPT = `You are an expert content strategist who helps creators and businesses develop sustainable, engaging content strategies. You understand the psychology of consistent content and how different pillars serve different purposes in audience building.

Your expertise includes:
- **Content architecture**: Building pillars that support business goals
- **Audience psychology**: Understanding what different content types achieve
- **Content balance**: Mixing education, entertainment, inspiration, and promotion
- **Sustainability**: Creating plans that are realistic to maintain
- **Platform optimization**: Knowing what works best on Instagram

You know:
- The 80/20 rule: 80% value, 20% promotion
- Different pillars attract different audience segments
- Consistency in themes builds recognition and authority
- Content variety within pillars keeps things fresh
- Each pillar should have clear purpose and measurable outcomes

IMPORTANT: Always output valid JSON that matches the expected schema.`;

// =====================================================
// Business Goal Instructions
// =====================================================

const BUSINESS_GOAL_INSTRUCTIONS: Record<BusinessGoal, string> = {
	awareness: `Goal: BRAND AWARENESS
- Focus on shareable, viral-potential content
- Prioritize reach and impressions
- Create content that introduces your unique value
- Use hashtags and SEO strategically
- Partner and collaboration content works well`,

	engagement: `Goal: ENGAGEMENT & COMMUNITY
- Prioritize conversation-starting content
- Use polls, questions, and interactive elements
- Create content that encourages comments
- Respond actively to build relationships
- Behind-the-scenes and personality content`,

	leads: `Goal: LEAD GENERATION
- Create value-packed educational content
- Use lead magnets and freebies strategically
- Build trust through expertise demonstration
- Include clear CTAs to email list/DMs
- Case studies and transformations work well`,

	sales: `Goal: DIRECT SALES
- Balance value with promotional content
- Show product/service in use
- Include testimonials and social proof
- Create urgency and scarcity when appropriate
- Address objections through content`,

	community: `Goal: COMMUNITY BUILDING
- Focus on connection over conversion
- Celebrate community members
- Create inside jokes and shared references
- User-generated content integration
- Prioritize authentic, vulnerable content`,
};

// =====================================================
// Content Frequency Instructions
// =====================================================

const FREQUENCY_INSTRUCTIONS: Record<ContentFrequency, string> = {
	daily: `DAILY posting (7 posts/week):
- Needs 4-5 strong pillars to maintain variety
- More casual, "in the moment" content acceptable
- Mix high-effort and quick-post content
- Stories can supplement feed posts
- Batch creation essential for sustainability`,

	"3-4weekly": `3-4 POSTS/WEEK:
- Sweet spot for most creators
- 3-4 pillars is ideal
- Each post can be higher quality
- Good balance of consistency and sustainability
- Room for timely, reactive content`,

	"2-3weekly": `2-3 POSTS/WEEK:
- Quality over quantity approach
- 2-3 main pillars
- Every post should be strong
- Supplement with Stories for presence
- Great for service-based businesses`,

	weekly: `WEEKLY posting (1 post/week):
- Focus on 2 core pillars maximum
- Every post must deliver high value
- Heavy Stories presence to stay top of mind
- Best for high-touch service providers
- Each post should be "pillar post" quality`,
};

// =====================================================
// User Prompt Builder
// =====================================================

export function buildContentPillarsPrompt(input: ContentPillarsInput): string {
	const {
		niche,
		targetAudience,
		businessGoal,
		contentFrequency,
		existingTopics,
		brandValues,
		uniqueExpertise,
	} = input;

	// Calculate recommended pillar count based on frequency
	const pillarCounts: Record<ContentFrequency, number> = {
		daily: 5,
		"3-4weekly": 4,
		"2-3weekly": 3,
		weekly: 2,
	};

	const recommendedPillars = pillarCounts[contentFrequency];

	return `Create a comprehensive content pillar strategy for:

**NICHE:** ${niche}

**TARGET AUDIENCE:** ${targetAudience}

**BUSINESS GOAL:** ${businessGoal.toUpperCase()}
${BUSINESS_GOAL_INSTRUCTIONS[businessGoal]}

**CONTENT FREQUENCY:** ${contentFrequency.replace("-", " ").toUpperCase()}
${FREQUENCY_INSTRUCTIONS[contentFrequency]}
Recommended number of pillars: ${recommendedPillars}

${existingTopics ? `**TOPICS ALREADY COVERING:** ${existingTopics.join(", ")}` : ""}
${brandValues ? `**BRAND VALUES:** ${brandValues.join(", ")}` : ""}
${uniqueExpertise ? `**UNIQUE EXPERTISE:** ${uniqueExpertise}` : ""}

---

Create a complete content pillar strategy including:

1. **${recommendedPillars} Content Pillars** - each with:
   - Name: Short, memorable pillar name
   - Description: What this pillar covers and why
   - Percentage: What % of content should be this pillar
   - Content types: Best formats for this pillar (carousel, reel, static, etc.)
   - Example topics: 5-7 specific post ideas
   - Posting frequency: How often to post from this pillar
   - Engagement style: How to engage with comments on these posts
   - Hashtags: 5-7 relevant hashtags for this pillar

2. **Content Mix** - percentage breakdown of:
   - Educate (teaching and tips)
   - Entertain (fun, relatable, personality)
   - Inspire (motivation, stories, transformation)
   - Promote (selling, CTAs, offers)

3. **Weekly Schedule Suggestion** - which pillar and format for each day

4. **Pillar Rotation Tips** - 3-5 tips for keeping content fresh

Output as JSON in this exact format:
\`\`\`json
{
  "pillars": [
    {
      "id": "1",
      "name": "Pillar Name",
      "description": "What this pillar covers...",
      "percentage": 30,
      "contentTypes": ["carousel", "reel"],
      "exampleTopics": ["Topic 1", "Topic 2", "Topic 3"],
      "postingFrequency": "2x per week",
      "engagementStyle": "How to respond to comments",
      "hashtags": ["#hashtag1", "#hashtag2"]
    }
  ],
  "contentMix": {
    "educate": 40,
    "entertain": 25,
    "inspire": 20,
    "promote": 15
  },
  "weeklyScheduleSuggestion": [
    {
      "day": "Monday",
      "pillar": "Pillar Name",
      "contentType": "carousel"
    }
  ],
  "pillarRotationTips": [
    "Tip 1 for keeping content fresh",
    "Tip 2"
  ]
}
\`\`\``;
}

// =====================================================
// Export Configuration
// =====================================================

export const CONTENT_PILLARS_CONFIG = {
	maxTokens: TOKEN_LIMITS.contentPillars,
	temperature: TEMPERATURE_SETTINGS.balanced,
};
