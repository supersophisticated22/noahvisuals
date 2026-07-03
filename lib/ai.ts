import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export const AI_MODEL = "claude-sonnet-5";

export class MissingKeyError extends Error {}

export function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new MissingKeyError("ANTHROPIC_API_KEY is niet geconfigureerd");
  return new Anthropic({ apiKey: key });
}

/** Concatenate all text blocks from a Messages response. */
export function responseText(resp: Anthropic.Message): string {
  return resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

/** Parse a JSON object from model output that may be fenced. */
export function extractJson<T = unknown>(text: string): T {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1] : trimmed;
  return JSON.parse(raw) as T;
}
