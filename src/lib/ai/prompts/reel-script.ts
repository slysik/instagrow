import { TOKEN_LIMITS, TEMPERATURE_SETTINGS } from "../client";

// =====================================================
// Types
// =====================================================

export type ReelDuration = "15" | "30" | "60" | "90";
export type ReelStyle =
	| "educational"
	| "storytelling"
	| "trending"
	| "behindTheScenes";
export type ReelEnergy = "high" | "medium" | "calm";

export interface ReelScriptInput {
	topic: string;
	duration: ReelDuration;
	style: ReelStyle;
	energy: ReelEnergy;
	niche?: string;
	targetAction?: string; // What should viewers do after watching?
}

export interface ShotSuggestion {
	timestamp: string; // e.g., "0:00-0:05"
	visual: string;
	audio: string;
	textOverlay?: string;
}

export interface ReelScript {
	hook: string;
	keyPoints: string[];
	cta: string;
	shots: ShotSuggestion[];
	caption: string;
	hashtags: string[];
}

export interface ReelScriptOutput {
	script: ReelScript;
}

// =====================================================
// System Prompt
// =====================================================

export const REEL_SCRIPT_SYSTEM_PROMPT = `You are an expert Instagram Reels creator and viral content strategist. You understand the psychology of short-form video that hooks viewers in the first second and keeps them watching to the end.

Your expertise includes:
- **Hook mastery**: Creating opening moments that stop the scroll instantly
- **Pacing**: Knowing exactly when to cut, transition, and reveal information
- **Retention psychology**: Using curiosity gaps, pattern interrupts, and payoffs
- **Trending formats**: Understanding what formats are working NOW on Instagram
- **Audio strategy**: Leveraging trending sounds and voice-over techniques

Your scripts are:
- Designed for high watch-time and replay value
- Easy to film with minimal equipment
- Structured for the algorithm (hook, value, CTA)
- Authentic and not over-produced feeling

IMPORTANT: Always output valid JSON that matches the expected schema.`;

// =====================================================
// Style-Specific Instructions
// =====================================================

const STYLE_INSTRUCTIONS: Record<ReelStyle, string> = {
	educational: `EDUCATIONAL style reels:
- Lead with a surprising fact or "did you know" hook
- Deliver clear, actionable value
- Use numbered tips or step-by-step format
- End with a "save for later" CTA
- Visual text overlays for key points
- Format: Hook (problem) -> Solution -> Action`,

	storytelling: `STORYTELLING style reels:
- Start mid-action or with a cliffhanger
- Use first-person narrative
- Build emotional connection
- Include a twist or unexpected ending
- Format: Tension -> Journey -> Resolution -> Lesson
- Make it relatable and personal`,

	trending: `TRENDING format reels:
- Follow current audio trends and formats
- Put your unique spin on a proven format
- Reference pop culture when relevant
- Use trending transitions
- Format: Adapt the trending structure to your niche
- Stay authentic while riding the trend wave`,

	behindTheScenes: `BEHIND THE SCENES style reels:
- Show the process, not just the result
- Be authentically messy/real
- Include "day in my life" elements
- Let viewers feel like insiders
- Format: Setup -> Process -> Reveal
- Use minimal editing for authentic feel`,
};

// =====================================================
// Energy-Specific Instructions
// =====================================================

const ENERGY_INSTRUCTIONS: Record<ReelEnergy, string> = {
	high: `HIGH ENERGY approach:
- Fast cuts (2-3 seconds max per shot)
- Enthusiastic voice-over or on-camera presence
- Dynamic movements and transitions
- Upbeat music or trending audio
- Quick text animations
- No slow moments - constant momentum`,

	medium: `MEDIUM ENERGY approach:
- Balanced pacing (3-5 seconds per shot)
- Conversational voice-over
- Mix of talking head and b-roll
- Moderate tempo music
- Clear but not overwhelming text
- Room to breathe between points`,

	calm: `CALM ENERGY approach:
- Slower, intentional pacing
- Soft-spoken or ASMR-style audio
- Aesthetic visuals and smooth transitions
- Lo-fi or ambient music
- Minimal text overlays
- Focus on ambiance and feeling`,
};

// =====================================================
// Duration Guidelines
// =====================================================

const DURATION_GUIDELINES: Record<ReelDuration, string> = {
	"15": `15-SECOND REEL:
- ONE main point only
- Hook: 0-2 seconds (make every millisecond count)
- Value: 2-12 seconds (quick, punchy delivery)
- CTA: 12-15 seconds (brief but clear)
- 3-4 shots maximum
- Perfect for: quick tips, hot takes, reactions`,

	"30": `30-SECOND REEL:
- 2-3 key points
- Hook: 0-3 seconds
- Value: 3-25 seconds (room for detail)
- CTA: 25-30 seconds
- 5-7 shots typical
- Perfect for: tutorials, mini-stories, listicles`,

	"60": `60-SECOND REEL:
- Full mini-tutorial or story
- Hook: 0-5 seconds (can be more elaborate)
- Setup: 5-15 seconds
- Value: 15-50 seconds (multiple points with depth)
- CTA: 50-60 seconds
- 8-12 shots typical
- Perfect for: step-by-step guides, longer stories`,

	"90": `90-SECOND REEL:
- Comprehensive content
- Hook: 0-5 seconds
- Context: 5-20 seconds
- Main content: 20-80 seconds (detailed walkthrough)
- CTA: 80-90 seconds
- 12-18 shots typical
- Perfect for: detailed tutorials, vlogs, deep dives`,
};

// =====================================================
// User Prompt Builder
// =====================================================

export function buildReelScriptPrompt(input: ReelScriptInput): string {
	const { topic, duration, style, energy, niche, targetAction } = input;

	return `Create a complete Instagram Reel script for the following:

**TOPIC:**
${topic}

**DURATION:** ${duration} seconds
${DURATION_GUIDELINES[duration]}

**STYLE:** ${style.toUpperCase()}
${STYLE_INSTRUCTIONS[style]}

**ENERGY LEVEL:** ${energy.toUpperCase()}
${ENERGY_INSTRUCTIONS[energy]}

${niche ? `**NICHE/INDUSTRY:** ${niche}` : ""}
${targetAction ? `**DESIRED VIEWER ACTION:** ${targetAction}` : ""}

---

Create a complete reel script with:
1. **Hook**: The opening moment that stops the scroll (must work in first 1-3 seconds)
2. **Key Points**: 2-5 main points or story beats to cover
3. **CTA**: What you want viewers to do after watching
4. **Shot List**: Detailed shot-by-shot breakdown with timestamps, visuals, audio, and optional text overlays
5. **Caption**: A caption to pair with the reel (optimized for engagement)
6. **Hashtags**: 5-10 relevant hashtags

Output as JSON in this exact format:
\`\`\`json
{
  "script": {
    "hook": "The exact words/action to start the reel",
    "keyPoints": [
      "First key point or story beat",
      "Second key point",
      "Third key point"
    ],
    "cta": "The specific call-to-action",
    "shots": [
      {
        "timestamp": "0:00-0:03",
        "visual": "Description of what appears on screen",
        "audio": "What's being said or music description",
        "textOverlay": "Optional text shown on screen"
      }
    ],
    "caption": "The caption to post with the reel...",
    "hashtags": ["#hashtag1", "#hashtag2"]
  }
}
\`\`\``;
}

// =====================================================
// Response Parser
// =====================================================

export function parseReelScriptResponse(content: string): ReelScript | null {
	try {
		// Try to extract JSON from markdown code blocks
		const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
		const jsonString = jsonMatch ? jsonMatch[1] : content;

		const parsed = JSON.parse(jsonString) as ReelScriptOutput;
		return parsed.script;
	} catch (error) {
		console.warn(
			"Failed to parse reel script response:",
			content.substring(0, 100),
		);
		return null;
	}
}

// =====================================================
// Export Configuration
// =====================================================

export const REEL_SCRIPT_CONFIG = {
	maxTokens: TOKEN_LIMITS.reelScript,
	temperature: TEMPERATURE_SETTINGS.creative,
};
