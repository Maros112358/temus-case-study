import type { Conversation } from "$lib/types/conversation";
import type { OpenAI } from "openai";

/**
 * Generates a next message in the conversation
 * @param conversation current conversation
 * @param openai OpenAI object to use
 * @returns new message in the conversation
 */
export default async function generateAnswer(conversation: Conversation, openai: OpenAI) {
  const messages = conversation.map(({ visibleContent, ...rest }) => rest);
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: messages,
  });

  return response.choices[0].message.content;
}
