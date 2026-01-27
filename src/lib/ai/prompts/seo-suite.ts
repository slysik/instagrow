import { TOKEN_LIMITS, TEMPERATURE_SETTINGS } from "../client";

// =====================================================
// Types
// =====================================================

export type ContentType = "post" | "reel" | "carousel" | "story";

export interface SEOSuiteInput {
	topic: string;
	contentType: ContentType;
	niche?: string;
	targetAudience?: string;
	includeAltText?: boolean;
}

export interface HashtagGroup {
	category: string;
	hashtags: string[];
	avgReach: string; // "high" | "medium" | "niche"
}

export interface SEOSuiteOutput {
	hashtags: {
		primary: string[]; // Main niche hashtags (high volume)
		secondary: string[]; // Supporting hashtags (medium volume)
		niche: string[]; // Specific/community hashtags (lower volume, higher engagement)
		banned: string[]; // Hashtags to avoid (shadowban risk)
		recommended: HashtagGroup[];
	};
	altText: string;
	keywords: {
		primary: string[];
		lsi: string[]; // Latent Semantic Indexing keywords
		longTail: string[];
	};
	searchPhrases: {
		instagram: string[]; // How users search on Instagram
		google: string[]; // How users search on Google (for SEO)
	};
}

// =====================================================
// System Prompt
// =====================================================

export const SEO_SUITE_SYSTEM_PROMPT = `You are an expert in Instagram SEO, hashtag strategy, and discoverability optimization. You understand how the Instagram algorithm ranks and surfaces content to users.

Your expertise includes:
- **Hashtag research**: Understanding reach, engagement rates, and saturation levels
- **Alt text optimization**: Writing descriptive, accessible, and SEO-friendly alt text
- **Keyword strategy**: Identifying primary, LSI, and long-tail keywords
- **Search behavior**: Understanding how users search on Instagram vs Google
- **Trend analysis**: Knowing which hashtags are growing vs declining

You know:
- The ideal hashtag mix (30% high reach, 40% medium, 30% niche)
- Which hashtags trigger shadowbans or reduced reach
- How to write alt text that's both accessible AND discoverable
- The difference between hashtags for reach vs engagement

IMPORTANT: Always output valid JSON that matches the expected schema.`;

// =====================================================
// Content Type Instructions
// =====================================================

const CONTENT_TYPE_INSTRUCTIONS: Record<ContentType, string> = {
	post: `For a STATIC POST:
- Focus on hashtags that work well for image content
- Alt text should describe the visual elements in detail
- Include hashtags for photography/visual styles if relevant
- Consider hashtags for the time of day/week trends`,

	reel: `For a REEL:
- Prioritize trending hashtags and reel-specific tags
- Include #reels, #reelsviral, and similar discovery tags
- Alt text should describe both visual and audio elements
- Focus on entertainment and educational hashtags`,

	carousel: `For a CAROUSEL:
- Use hashtags that indicate multi-image content
- Alt text should cover the carousel's overall theme
- Include educational/informative hashtags (carousels = value)
- Add hashtags for "save-worthy" content`,

	story: `For a STORY:
- Fewer hashtags (Stories support max 10 visible)
- Focus on stickers and location tags over hashtags
- Alt text is less critical but still useful
- Prioritize interactive content hashtags`,
};

// =====================================================
// User Prompt Builder
// =====================================================

export function buildSEOSuitePrompt(input: SEOSuiteInput): string {
	const {
		topic,
		contentType,
		niche,
		targetAudience,
		includeAltText = true,
	} = input;

	return `Generate a complete Instagram SEO strategy for the following content:

**TOPIC/CONTENT:**
${topic}

**CONTENT TYPE:** ${contentType.toUpperCase()}
${CONTENT_TYPE_INSTRUCTIONS[contentType]}

${niche ? `**NICHE/INDUSTRY:** ${niche}` : ""}
${targetAudience ? `**TARGET AUDIENCE:** ${targetAudience}` : ""}

---

Generate a comprehensive SEO package including:

1. **Hashtags** (organized by reach level):
   - Primary (5-7): High-volume hashtags in your niche (100K-1M+ posts)
   - Secondary (8-10): Medium-volume supporting hashtags (10K-100K posts)
   - Niche (5-8): Specific community/topic hashtags (1K-10K posts)
   - Also identify any hashtags to AVOID (shadowban risk, overused, or off-brand)

2. **Recommended Hashtag Groups**: 2-3 themed groups the user can copy/paste

${includeAltText ? `3. **Alt Text**: Descriptive, accessible alt text for the content (125-150 characters ideal)` : ""}

4. **Keywords**:
   - Primary keywords (3-5): Main terms to include in caption
   - LSI keywords (5-7): Related semantic terms
   - Long-tail keywords (3-5): Specific phrases people search

5. **Search Phrases**:
   - Instagram searches (5-7): How users find this content on IG
   - Google searches (3-5): Related Google searches (for cross-platform SEO)

Output as JSON in this exact format:
\`\`\`json
{
  "hashtags": {
    "primary": ["#hashtag1", "#hashtag2"],
    "secondary": ["#hashtag1", "#hashtag2"],
    "niche": ["#hashtag1", "#hashtag2"],
    "banned": ["#hashtag1"],
    "recommended": [
      {
        "category": "Group Name",
        "hashtags": ["#tag1", "#tag2", "#tag3"],
        "avgReach": "medium"
      }
    ]
  },
  "altText": "Descriptive alt text for the image...",
  "keywords": {
    "primary": ["keyword1", "keyword2"],
    "lsi": ["related term1", "related term2"],
    "longTail": ["long tail phrase 1", "long tail phrase 2"]
  },
  "searchPhrases": {
    "instagram": ["how to X on instagram", "best X for Y"],
    "google": ["topic keyword 2024", "how to topic"]
  }
}
\`\`\``;
}

// =====================================================
// Export Configuration
// =====================================================

export const SEO_SUITE_CONFIG = {
	maxTokens: TOKEN_LIMITS.seoSuite,
	temperature: TEMPERATURE_SETTINGS.focused,
};
