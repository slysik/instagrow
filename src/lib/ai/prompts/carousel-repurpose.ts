import { TOKEN_LIMITS, TEMPERATURE_SETTINGS } from "../client";

// =====================================================
// Types
// =====================================================

export type SourceContentType =
	| "blogPost"
	| "video"
	| "podcast"
	| "newsletter"
	| "thread"
	| "other";
export type OutputFormat = "carousel" | "story" | "reel";

export interface CarouselRepurposeInput {
	content: string;
	sourceType: SourceContentType;
	outputFormat: OutputFormat;
	niche?: string;
	brandVoice?: string;
	slideCount?: number; // For carousel
}

export interface CarouselSlide {
	slideNumber: number;
	headline: string;
	body: string;
	visualSuggestion: string;
	designNotes?: string;
}

export interface StorySequence {
	frameNumber: number;
	type: "text" | "poll" | "quiz" | "question" | "countdown" | "image";
	content: string;
	stickerSuggestion?: string;
	interactionPrompt?: string;
}

export interface ReelTransformation {
	hook: string;
	script: string;
	keyPoints: string[];
	visualSuggestions: string[];
	audioSuggestion: string;
}

export interface CarouselRepurposeOutput {
	format: OutputFormat;
	carousel?: {
		slides: CarouselSlide[];
		coverSuggestion: string;
		caption: string;
	};
	story?: {
		frames: StorySequence[];
		caption: string;
	};
	reel?: ReelTransformation;
}

// =====================================================
// System Prompt
// =====================================================

export const CAROUSEL_REPURPOSE_SYSTEM_PROMPT = `You are an expert content repurposing strategist who transforms long-form content into engaging Instagram formats. You understand how to extract the most valuable insights and present them in scroll-stopping, shareable formats.

Your expertise includes:
- **Content extraction**: Identifying the most engaging and shareable points
- **Format optimization**: Knowing what works best for carousels, stories, and reels
- **Visual storytelling**: Suggesting compelling visuals for each piece
- **Engagement hooks**: Creating openings that stop the scroll
- **Information hierarchy**: Organizing content for easy consumption

You know:
- Carousels perform best with 7-10 slides (sweet spot for engagement)
- Each slide needs a visual anchor and clear takeaway
- Stories need interactive elements to boost engagement
- Content should be simplified, not dumbed down

IMPORTANT: Always output valid JSON that matches the expected schema.`;

// =====================================================
// Source Type Instructions
// =====================================================

const SOURCE_TYPE_INSTRUCTIONS: Record<SourceContentType, string> = {
	blogPost: `Repurposing from a BLOG POST:
- Extract the main thesis and 5-7 key points
- Use the existing headings as a structure guide
- Include any statistics or data points
- Preserve the original voice while making it punchy`,

	video: `Repurposing from a VIDEO transcript/script:
- Pull the most quotable moments
- Focus on visual storytelling elements
- Keep the conversational tone
- Highlight any demonstrations or examples`,

	podcast: `Repurposing from a PODCAST:
- Extract the "aha moments" and key insights
- Quote memorable one-liners
- Capture the personality and energy
- Focus on actionable advice`,

	newsletter: `Repurposing from a NEWSLETTER:
- Use the hook and main topic
- Preserve the personal tone
- Extract bullet points and lists
- Include any personal stories or examples`,

	thread: `Repurposing from a TWITTER/X THREAD:
- Keep the punchy, tweet-style format
- Expand on compressed ideas
- Maintain the sequential logic
- Add visual context where tweets were text-only`,

	other: `Repurposing from OTHER content:
- Identify the core message and value
- Extract 5-7 key takeaways
- Adapt tone for Instagram audience
- Focus on what's most shareable`,
};

// =====================================================
// Output Format Instructions
// =====================================================

const OUTPUT_FORMAT_INSTRUCTIONS: Record<OutputFormat, string> = {
	carousel: `Creating a CAROUSEL (swipeable multi-image post):
- Cover slide: Must stop the scroll with a bold hook/title
- Content slides: One main point per slide, easy to read
- Final slide: Strong CTA (save, share, follow)
- Ideal: 7-10 slides total
- Each slide needs: headline, supporting text, visual suggestion
- Use consistent design language throughout`,

	story: `Creating a STORY SEQUENCE:
- Use a mix of interactive elements (polls, quizzes, questions)
- Build engagement through the sequence
- Include "tap to learn more" or "DM me" CTAs
- 5-8 frames ideal
- Each frame: engaging content + suggested sticker/interaction`,

	reel: `Creating a REEL script:
- Strong hook in first 1-3 seconds
- Condense content into 30-60 second script
- Include visual and audio suggestions
- Focus on one main message with 2-3 supporting points
- End with clear CTA`,
};

// =====================================================
// User Prompt Builder
// =====================================================

export function buildCarouselRepurposePrompt(
	input: CarouselRepurposeInput,
): string {
	const {
		content,
		sourceType,
		outputFormat,
		niche,
		brandVoice,
		slideCount = 8,
	} = input;

	const formatSpecificOutput = {
		carousel: `For carousel output, include:
- slides: Array of ${slideCount} slide objects with:
  - slideNumber, headline, body, visualSuggestion, designNotes (optional)
- coverSuggestion: Ideas for the cover slide design
- caption: Full caption for the post`,

		story: `For story output, include:
- frames: Array of 5-8 story frame objects with:
  - frameNumber, type (text/poll/quiz/question/countdown/image), content
  - stickerSuggestion (optional), interactionPrompt (optional)
- caption: Brief description for the story highlight`,

		reel: `For reel output, include:
- hook: The opening line/moment
- script: Full script for the reel
- keyPoints: Array of main points covered
- visualSuggestions: Array of visual ideas
- audioSuggestion: Music/audio recommendation`,
	};

	return `Transform the following content into an engaging Instagram ${outputFormat}:

**ORIGINAL CONTENT:**
${content}

**SOURCE TYPE:** ${sourceType.toUpperCase()}
${SOURCE_TYPE_INSTRUCTIONS[sourceType]}

**OUTPUT FORMAT:** ${outputFormat.toUpperCase()}
${OUTPUT_FORMAT_INSTRUCTIONS[outputFormat]}

${niche ? `**NICHE/INDUSTRY:** ${niche}` : ""}
${brandVoice ? `**BRAND VOICE:** ${brandVoice}` : ""}

---

${formatSpecificOutput[outputFormat]}

Output as JSON in this format:
\`\`\`json
{
  "format": "${outputFormat}",
  ${
		outputFormat === "carousel"
			? `"carousel": {
    "slides": [
      {
        "slideNumber": 1,
        "headline": "The scroll-stopping cover headline",
        "body": "Supporting text for this slide",
        "visualSuggestion": "What visual to use",
        "designNotes": "Optional design tips"
      }
    ],
    "coverSuggestion": "Cover design ideas",
    "caption": "The full caption for the post..."
  }`
			: ""
	}
  ${
		outputFormat === "story"
			? `"story": {
    "frames": [
      {
        "frameNumber": 1,
        "type": "text",
        "content": "Frame content",
        "stickerSuggestion": "Suggested sticker",
        "interactionPrompt": "Optional interaction"
      }
    ],
    "caption": "Story highlight description"
  }`
			: ""
	}
  ${
		outputFormat === "reel"
			? `"reel": {
    "hook": "Opening hook line",
    "script": "Full reel script...",
    "keyPoints": ["Point 1", "Point 2"],
    "visualSuggestions": ["Visual 1", "Visual 2"],
    "audioSuggestion": "Trending sound or music type"
  }`
			: ""
	}
}
\`\`\``;
}

// =====================================================
// Export Configuration
// =====================================================

export const CAROUSEL_REPURPOSE_CONFIG = {
	maxTokens: TOKEN_LIMITS.carousel,
	temperature: TEMPERATURE_SETTINGS.balanced,
};
