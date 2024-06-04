import type { OpenAI } from "openai";

/**
 * Embeds the text using OpenAI 'text-embedding-ada-002' embedding
 * @param text text to be embedded
 * @param openai OpenAI object to use
 * @returns embedding as a list of floats
 */
export default async function getEmbedding(text: string, openai: OpenAI) {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
}
