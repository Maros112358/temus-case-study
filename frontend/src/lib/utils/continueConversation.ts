import type { Conversation } from "$lib/types/conversation";
import type { OpenAI } from "openai";
import type { Db } from "@datastax/astra-db-ts";
import retrieveRelevantData from "./retrieveRelevantData";
import generateAnswer from "./generateAnswer";

/**
 * Generate a next message in the conversation
 * @param conversation What conversation to generate the new chatbot message for
 * @param db AstraDB object to use
 * @param openai OpenAI object to use
 * @param topK How many relevant data records to fetch for the context
 * @returns original conversation with a new message
 */
export default async function continueConversation(
  conversation: Conversation,
  db: Db,
  openai: OpenAI,
  topK: number
) {
  const lastMessage = conversation.at(-1);
  if (!lastMessage) {
    throw Error("Last message in conversation not found!");
  }

  // fetch relevant data
  const relevantData = await retrieveRelevantData(
    lastMessage.visibleContent,
    topK,
    db,
    openai
  );
  const context = JSON.stringify(relevantData);

  // add context to the user's question
  lastMessage.content = `Context: ${context}\n\nQuestion: ${lastMessage.visibleContent}`;

  // generate andswer and remove the context
  const answer = await generateAnswer(conversation, openai);
  lastMessage.content = lastMessage.visibleContent;

  if (!answer) {
    throw Error("Answer is missing!");
  }

  conversation.push({
    content: answer,
    role: "assistant",
    visibleContent: answer,
  });

  return conversation;
}
