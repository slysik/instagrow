import Anthropic from "@anthropic-ai/sdk";
import { anthropic, DEFAULT_MODEL, TEMPERATURE_SETTINGS } from "./client";
import type { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream";

// =====================================================
// Types
// =====================================================

export interface AIGenerateOptions {
	prompt: string;
	systemPrompt?: string;
	maxTokens?: number;
	temperature?: number;
	stream?: boolean;
}

export interface AIResponse {
	content: string;
	promptTokens: number;
	completionTokens: number;
	model: string;
}

export interface AIStreamCallbacks {
	onToken?: (token: string) => void;
	onComplete?: (response: AIResponse) => void;
	onError?: (error: Error) => void;
}

// =====================================================
// Retry Logic with Exponential Backoff
// =====================================================

interface RetryOptions {
	maxRetries?: number;
	initialDelayMs?: number;
	maxDelayMs?: number;
	backoffMultiplier?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
	maxRetries: 3,
	initialDelayMs: 1000,
	maxDelayMs: 30000,
	backoffMultiplier: 2,
};

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
	if (error instanceof Error) {
		// Rate limit errors
		if (error.message.includes("rate_limit")) return true;
		// Server errors (5xx)
		if (error.message.includes("500") || error.message.includes("503"))
			return true;
		// Network errors
		if (
			error.message.includes("ECONNRESET") ||
			error.message.includes("ETIMEDOUT")
		)
			return true;
		// Overloaded errors
		if (error.message.includes("overloaded")) return true;
	}
	return false;
}

async function withRetry<T>(
	operation: () => Promise<T>,
	options: RetryOptions = {},
): Promise<T> {
	const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
	let lastError: Error | null = null;
	let delay = opts.initialDelayMs;

	for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			// Don't retry if it's not a retryable error
			if (!isRetryableError(error)) {
				throw lastError;
			}

			// Don't retry if we've exhausted attempts
			if (attempt === opts.maxRetries) {
				throw lastError;
			}

			// Add jitter to prevent thundering herd
			const jitter = Math.random() * 0.3 + 0.85; // 0.85 to 1.15
			const actualDelay = Math.min(delay * jitter, opts.maxDelayMs);

			console.warn(
				`AI request failed (attempt ${attempt + 1}/${opts.maxRetries + 1}), ` +
					`retrying in ${Math.round(actualDelay)}ms: ${lastError.message}`,
			);

			await sleep(actualDelay);
			delay *= opts.backoffMultiplier;
		}
	}

	throw lastError!;
}

// =====================================================
// Main AI Service
// =====================================================

/**
 * Generate a non-streaming AI response
 */
export async function generate(
	options: AIGenerateOptions,
): Promise<AIResponse> {
	const {
		prompt,
		systemPrompt,
		maxTokens = 1024,
		temperature = TEMPERATURE_SETTINGS.balanced,
	} = options;

	const response = await withRetry(async () => {
		return await anthropic.messages.create({
			model: DEFAULT_MODEL,
			max_tokens: maxTokens,
			temperature,
			system: systemPrompt,
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
		});
	});

	// Extract text content from the response
	const textContent = response.content
		.filter((block): block is Anthropic.TextBlock => block.type === "text")
		.map((block) => block.text)
		.join("");

	return {
		content: textContent,
		promptTokens: response.usage.input_tokens,
		completionTokens: response.usage.output_tokens,
		model: response.model,
	};
}

/**
 * Generate a streaming AI response
 */
export async function generateStream(
	options: AIGenerateOptions,
	callbacks: AIStreamCallbacks,
): Promise<void> {
	const {
		prompt,
		systemPrompt,
		maxTokens = 1024,
		temperature = TEMPERATURE_SETTINGS.balanced,
	} = options;

	let fullContent = "";
	let promptTokens = 0;
	let completionTokens = 0;
	let model = DEFAULT_MODEL;

	try {
		const stream: MessageStream = anthropic.messages.stream({
			model: DEFAULT_MODEL,
			max_tokens: maxTokens,
			temperature,
			system: systemPrompt,
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
		});

		for await (const event of stream) {
			if (event.type === "content_block_delta") {
				if (event.delta.type === "text_delta") {
					const token = event.delta.text;
					fullContent += token;
					callbacks.onToken?.(token);
				}
			} else if (event.type === "message_start") {
				model = event.message.model;
				promptTokens = event.message.usage.input_tokens;
			} else if (event.type === "message_delta") {
				completionTokens = event.usage.output_tokens;
			}
		}

		callbacks.onComplete?.({
			content: fullContent,
			promptTokens,
			completionTokens,
			model,
		});
	} catch (error) {
		const err = error instanceof Error ? error : new Error(String(error));
		callbacks.onError?.(err);
		throw err;
	}
}

/**
 * Unified generate function that handles both streaming and non-streaming
 */
export async function generateContent(
	options: AIGenerateOptions & { stream?: false },
): Promise<AIResponse>;
export async function generateContent(
	options: AIGenerateOptions & { stream: true },
	callbacks: AIStreamCallbacks,
): Promise<void>;
export async function generateContent(
	options: AIGenerateOptions,
	callbacks?: AIStreamCallbacks,
): Promise<AIResponse | void> {
	if (options.stream && callbacks) {
		return generateStream(options, callbacks);
	}
	return generate(options);
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Estimate token count for a string (rough approximation)
 * Useful for pre-checking if content might exceed limits
 */
export function estimateTokenCount(text: string): number {
	// Rough estimate: ~4 characters per token for English
	return Math.ceil(text.length / 4);
}

/**
 * Parse structured JSON output from AI response
 */
export function parseJSONResponse<T>(content: string): T | null {
	try {
		// Try to extract JSON from markdown code blocks
		const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
		if (jsonMatch) {
			return JSON.parse(jsonMatch[1]) as T;
		}

		// Try direct JSON parse
		return JSON.parse(content) as T;
	} catch {
		console.warn(
			"Failed to parse AI response as JSON:",
			content.substring(0, 100),
		);
		return null;
	}
}

// Re-export types and utilities
export { DEFAULT_MODEL, TEMPERATURE_SETTINGS, TOKEN_LIMITS } from "./client";
export type { Anthropic };
