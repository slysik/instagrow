import { TOKEN_LIMITS, TEMPERATURE_SETTINGS } from "../client";

// =====================================================
// Types
// =====================================================

export type StoryGoal = "engagement" | "dm" | "traffic" | "sales" | "community";
export type StoryType =
	| "daily"
	| "dm-day"
	| "engagement-boost"
	| "launch"
	| "behind-scenes";

export interface StoryPromptsInput {
	niche: string;
	goal: StoryGoal;
	storyType: StoryType;
	productOrOffer?: string;
	targetAudience?: string;
	count?: number;
}

export interface StoryPrompt {
	id: string;
	frameNumber: number;
	type: "text" | "poll" | "quiz" | "question" | "slider" | "countdown" | "link";
	content: string;
	visualSuggestion: string;
	stickerUsage?: string;
	captionOverlay?: string;
	engagementTip: string;
}

export interface StorySequence {
	id: string;
	title: string;
	description: string;
	frames: StoryPrompt[];
	totalFrames: number;
	estimatedWatchTime: string;
	bestTimeToPost: string;
}

export interface StoryPromptsOutput {
	sequences: StorySequence[];
}

// =====================================================
// System Prompt
// =====================================================

export const STORY_PROMPTS_SYSTEM_PROMPT = `You are an expert Instagram Stories strategist who creates engaging, conversion-focused story sequences. You understand how to use Instagram's native features (polls, quizzes, questions, sliders, countdowns) to maximize engagement and drive specific actions.

Your expertise includes:
- **Engagement psychology**: Using interactive elements that people can't resist tapping
- **DM-driving strategies**: Creating conversations that move to DMs naturally
- **Story sequencing**: Building narrative arcs across multiple story frames
- **Sticker strategy**: Knowing which stickers drive which behaviors
- **Timing optimization**: Understanding when and how to post for maximum views

You know:
- Stories with stickers get 83% more engagement than those without
- Question stickers are goldmines for DM conversations
- Poll/Quiz results create reason for follow-up stories
- "This or That" formats are highly engaging
- Behind-the-scenes content feels more authentic

IMPORTANT: Always output valid JSON that matches the expected schema.`;

// =====================================================
// Story Goal Instructions
// =====================================================

const STORY_GOAL_INSTRUCTIONS: Record<StoryGoal, string> = {
	engagement: `Goal: MAXIMIZE ENGAGEMENT (views, taps, interactions)
- Use multiple interactive stickers per sequence
- Create "can't resist tapping" moments
- Use polls with strong opinions/hot takes
- Include quizzes that make people curious about the answer
- Design for shares to friends`,

	dm: `Goal: DRIVE DM CONVERSATIONS
- Use question stickers that prompt genuine responses
- Create "DM me for..." moments naturally
- Tease exclusive content only available via DM
- Make DM-ing feel low-friction and valuable
- Include "reply to this story" prompts`,

	traffic: `Goal: DRIVE LINK CLICKS
- Build desire before showing the link
- Use countdown stickers for urgency
- Tease the value they'll get by clicking
- Make the link sticker prominent and clear
- Include social proof before the CTA`,

	sales: `Goal: DRIVE SALES/CONVERSIONS
- Address objections in story sequence
- Show transformation/results
- Use countdown for urgency
- Include testimonials or social proof
- Make buying feel like the obvious choice`,

	community: `Goal: BUILD COMMUNITY CONNECTION
- Share behind-the-scenes moments
- Ask for opinions and feedback
- Celebrate community wins
- Create "insider" feeling
- Use casual, authentic tone`,
};

// =====================================================
// Story Type Instructions
// =====================================================

const STORY_TYPE_INSTRUCTIONS: Record<StoryType, string> = {
	daily: `DAILY stories (everyday content):
- 3-5 frames ideal
- Mix of value and personality
- At least one interactive element
- Feels casual and authentic
- "Day in my life" elements`,

	"dm-day": `DM DAY stories (encourage DM conversations):
- 4-6 frames building to DM CTA
- Multiple question stickers
- "Reply to this story" prompts
- Tease exclusive value in DMs
- Make responding feel easy and natural`,

	"engagement-boost": `ENGAGEMENT BOOST stories (maximize interactions):
- 5-7 frames with multiple stickers
- This or That polls
- Quiz games with reveals
- Slider for opinions
- Create follow-up content opportunity`,

	launch: `LAUNCH stories (product/offer launch):
- 6-8 frames with complete narrative
- Problem -> Solution -> Offer arc
- Countdown sticker for urgency
- Social proof/testimonials
- Clear CTA with link sticker`,

	"behind-scenes": `BEHIND THE SCENES stories:
- 4-6 authentic, casual frames
- Show the process, not just the result
- Include personality and humor
- Ask for feedback/opinions
- Create connection and relatability`,
};

// =====================================================
// User Prompt Builder
// =====================================================

export function buildStoryPromptsPrompt(input: StoryPromptsInput): string {
	const {
		niche,
		goal,
		storyType,
		productOrOffer,
		targetAudience,
		count = 2,
	} = input;

	return `Create ${count} complete Instagram Story sequences for:

**NICHE:** ${niche}

**GOAL:** ${goal.toUpperCase()}
${STORY_GOAL_INSTRUCTIONS[goal]}

**STORY TYPE:** ${storyType.toUpperCase().replace("-", " ")}
${STORY_TYPE_INSTRUCTIONS[storyType]}

${productOrOffer ? `**PRODUCT/OFFER:** ${productOrOffer}` : ""}
${targetAudience ? `**TARGET AUDIENCE:** ${targetAudience}` : ""}

---

Create ${count} complete story sequences. Each sequence should include:
1. **Title**: A name for this story sequence
2. **Description**: Brief overview of the sequence strategy
3. **Frames**: 4-8 individual story frames with:
   - Frame number and type (text/poll/quiz/question/slider/countdown/link)
   - Content (the actual text/question to display)
   - Visual suggestion (background, photos, graphics)
   - Sticker usage (which sticker and how to use it)
   - Caption overlay (any text on the image)
   - Engagement tip (why this frame works)
4. **Meta info**: Total frames, estimated watch time, best posting time

Output as JSON in this exact format:
\`\`\`json
{
  "sequences": [
    {
      "id": "1",
      "title": "Sequence Title",
      "description": "What this sequence achieves",
      "frames": [
        {
          "id": "1-1",
          "frameNumber": 1,
          "type": "text",
          "content": "The content or question for this frame",
          "visualSuggestion": "Photo/video/graphic suggestion",
          "stickerUsage": "Which sticker and placement",
          "captionOverlay": "Text overlay on the visual",
          "engagementTip": "Why this frame drives engagement"
        }
      ],
      "totalFrames": 5,
      "estimatedWatchTime": "45 seconds",
      "bestTimeToPost": "11am or 7pm"
    }
  ]
}
\`\`\``;
}

// =====================================================
// Export Configuration
// =====================================================

export const STORY_PROMPTS_CONFIG = {
	maxTokens: TOKEN_LIMITS.storyPrompts,
	temperature: TEMPERATURE_SETTINGS.creative,
};
