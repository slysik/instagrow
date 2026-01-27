import { TOKEN_LIMITS, TEMPERATURE_SETTINGS } from "../client";

// =====================================================
// Types
// =====================================================

export type WeekGoal =
	| "growth"
	| "engagement"
	| "sales"
	| "content-bank"
	| "balanced";
export type AvailableTime = "minimal" | "moderate" | "dedicated";

export interface ContentPillarReference {
	name: string;
	description: string;
}

export interface MakeMyWeekInput {
	niche: string;
	pillars: ContentPillarReference[];
	weekGoal: WeekGoal;
	availableTime: AvailableTime;
	upcomingEvents?: string; // Launches, holidays, etc.
	lastWeekPerformance?: string; // What worked, what didn't
	contentBacklog?: string[]; // Existing ideas to incorporate
}

export interface DailyContent {
	day: string;
	date?: string;
	feedPost?: {
		pillar: string;
		type: string;
		topic: string;
		caption: string;
		hashtags: string[];
		bestTime: string;
	};
	stories: {
		count: number;
		themes: string[];
		stickerSuggestions: string[];
	};
	engagement: {
		commentTime: string;
		focusAccounts?: string[];
		engagementTasks: string[];
	};
	batching?: string;
}

export interface WeeklyPlan {
	weekTheme: string;
	weekGoals: string[];
	dailyContent: DailyContent[];
	contentSummary: {
		totalPosts: number;
		postsByPillar: Record<string, number>;
		contentTypes: Record<string, number>;
	};
	batchingSchedule: {
		day: string;
		task: string;
		duration: string;
	}[];
	engagementGoals: {
		dailyComments: number;
		dailyDMs: number;
		storiesPerDay: number;
		targetAccountTypes: string[];
	};
	successMetrics: string[];
}

export interface MakeMyWeekOutput {
	plan: WeeklyPlan;
}

// =====================================================
// System Prompt
// =====================================================

export const MAKE_MY_WEEK_SYSTEM_PROMPT = `You are an expert content planning strategist who helps creators plan their entire week of Instagram content. You understand the balance between creating content, engaging with community, and running a sustainable business.

Your expertise includes:
- **Strategic planning**: Aligning weekly content with bigger goals
- **Batch creation**: Organizing content creation for efficiency
- **Engagement strategy**: When and how to engage for maximum impact
- **Content variety**: Ensuring the week feels dynamic, not repetitive
- **Time management**: Creating realistic, achievable plans

You know:
- Consistency matters more than perfection
- Engagement time is as important as posting time
- Stories and feed should complement, not duplicate
- Weekends often have lower engagement but loyal viewers
- Batching creates sustainability

IMPORTANT: Always output valid JSON that matches the expected schema.`;

// =====================================================
// Week Goal Instructions
// =====================================================

const WEEK_GOAL_INSTRUCTIONS: Record<WeekGoal, string> = {
	growth: `Goal: FOLLOWER GROWTH
- Focus on shareable, saveable content
- More Reels (higher reach potential)
- Collaboration or trending content
- Heavy hashtag optimization
- Prioritize reach over deep engagement`,

	engagement: `Goal: ENGAGEMENT & CONNECTION
- Focus on conversation-starting content
- More carousels (high save rate)
- Question-based content
- Interactive Stories daily
- Prioritize comments over reach`,

	sales: `Goal: SALES & CONVERSIONS
- Strategic promotional content
- Testimonial/social proof content
- Educational content that leads to offers
- Story sequences for products
- Balance value with CTAs`,

	"content-bank": `Goal: BUILD CONTENT BANK
- Batch-friendly evergreen content
- Carousel tutorials (easy to repurpose)
- Template-based content
- Focus on timeless topics
- Create more, schedule strategically`,

	balanced: `Goal: BALANCED APPROACH
- Mix of growth and engagement content
- Regular posting rhythm
- Sustainable engagement time
- Variety across content types
- Maintain current performance`,
};

// =====================================================
// Available Time Instructions
// =====================================================

const TIME_INSTRUCTIONS: Record<AvailableTime, string> = {
	minimal: `TIME: MINIMAL (2-3 hours/week total)
- 3 feed posts maximum
- Quick-to-create content types
- Batch everything in one session
- Focus Stories on quick updates
- 15 mins/day engagement maximum`,

	moderate: `TIME: MODERATE (5-7 hours/week)
- 4-5 feed posts
- Mix of quick and quality content
- Two batching sessions
- Daily Stories presence
- 30 mins/day engagement`,

	dedicated: `TIME: DEDICATED (10+ hours/week)
- 5-7 feed posts
- High-quality, planned content
- Detailed Stories strategy
- Full engagement routine
- 45+ mins/day engagement`,
};

// =====================================================
// User Prompt Builder
// =====================================================

export function buildMakeMyWeekPrompt(input: MakeMyWeekInput): string {
	const {
		niche,
		pillars,
		weekGoal,
		availableTime,
		upcomingEvents,
		lastWeekPerformance,
		contentBacklog,
	} = input;

	const pillarList = pillars
		.map((p) => `- **${p.name}**: ${p.description}`)
		.join("\n");

	return `Create a complete week of Instagram content for:

**NICHE:** ${niche}

**CONTENT PILLARS:**
${pillarList}

**THIS WEEK'S GOAL:** ${weekGoal.toUpperCase().replace("-", " ")}
${WEEK_GOAL_INSTRUCTIONS[weekGoal]}

**AVAILABLE TIME:** ${availableTime.toUpperCase()}
${TIME_INSTRUCTIONS[availableTime]}

${upcomingEvents ? `**UPCOMING EVENTS/LAUNCHES:** ${upcomingEvents}` : ""}
${lastWeekPerformance ? `**LAST WEEK'S PERFORMANCE:** ${lastWeekPerformance}` : ""}
${contentBacklog?.length ? `**EXISTING CONTENT IDEAS TO USE:** ${contentBacklog.join(", ")}` : ""}

---

Create a comprehensive weekly content plan including:

1. **Week Theme** - An overarching theme or focus for the week

2. **Week Goals** - 3-4 specific, measurable goals

3. **Daily Content** for each day (Monday-Sunday):
   - Feed post (if any): pillar, type, topic, caption, hashtags, best posting time
   - Stories: count, themes, sticker suggestions
   - Engagement: time to engage, focus accounts, tasks
   - Batching notes (if applicable)

4. **Content Summary**:
   - Total posts planned
   - Posts by pillar breakdown
   - Content types breakdown

5. **Batching Schedule**:
   - Which days to batch what content
   - Duration for each batching session

6. **Engagement Goals**:
   - Daily comments target
   - Daily DMs target
   - Stories per day
   - Types of accounts to engage with

7. **Success Metrics** - How to know if the week was successful

Output as JSON in this exact format:
\`\`\`json
{
  "plan": {
    "weekTheme": "Theme for the week",
    "weekGoals": ["Goal 1", "Goal 2", "Goal 3"],
    "dailyContent": [
      {
        "day": "Monday",
        "feedPost": {
          "pillar": "Pillar name",
          "type": "carousel",
          "topic": "Post topic",
          "caption": "Full caption with CTAs...",
          "hashtags": ["#tag1", "#tag2"],
          "bestTime": "11:00 AM"
        },
        "stories": {
          "count": 3,
          "themes": ["Behind the scenes", "Quick tip"],
          "stickerSuggestions": ["Poll", "Question box"]
        },
        "engagement": {
          "commentTime": "12:00 PM",
          "focusAccounts": ["Niche accounts"],
          "engagementTasks": ["Reply to all comments", "Engage on 10 accounts"]
        },
        "batching": "Batch Tuesday's content"
      }
    ],
    "contentSummary": {
      "totalPosts": 5,
      "postsByPillar": {
        "Pillar 1": 2,
        "Pillar 2": 3
      },
      "contentTypes": {
        "carousel": 2,
        "reel": 2,
        "static": 1
      }
    },
    "batchingSchedule": [
      {
        "day": "Sunday",
        "task": "Plan and write captions",
        "duration": "1 hour"
      }
    ],
    "engagementGoals": {
      "dailyComments": 20,
      "dailyDMs": 5,
      "storiesPerDay": 3,
      "targetAccountTypes": ["Niche creators", "Ideal clients"]
    },
    "successMetrics": [
      "Metric 1",
      "Metric 2"
    ]
  }
}
\`\`\``;
}

// =====================================================
// Export Configuration
// =====================================================

export const MAKE_MY_WEEK_CONFIG = {
	maxTokens: TOKEN_LIMITS.makeMyWeek,
	temperature: TEMPERATURE_SETTINGS.balanced,
};
