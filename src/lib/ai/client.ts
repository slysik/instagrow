import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
// The SDK automatically uses the ANTHROPIC_API_KEY environment variable
const anthropic = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY,
});

export { anthropic };

// Default model configuration
export const DEFAULT_MODEL = "claude-sonnet-4-20250514";

// Token limits for different use cases
export const TOKEN_LIMITS = {
	caption: 1024,
	reelScript: 2048,
	seoSuite: 1024,
	carousel: 2048,
	storyPrompts: 1024,
	contentPillars: 1536,
	makeMyWeek: 3072,
} as const;

// Temperature settings for different content types
export const TEMPERATURE_SETTINGS = {
	creative: 0.9, // For more creative/varied content
	balanced: 0.7, // For balanced creativity and consistency
	focused: 0.5, // For more focused/structured output
} as const;
