/**
 * Represents possible roles in the chat between user and chatbot
 */
export type Role = "user" | "system" | "assistant";

/**
 * Represents the message in the conversation between user and chatbot
 *
 */
export interface Message {
  /**
   * The role of the participant
   */
  role: Role;

  /**
   * The content that the bot sees (including context from the knowledge base)
   */
  content: string;

  /**
   * The content visible to the user on the frontend
   */
  visibleContent: string;
}

/**
 * Represents a list of messages between user and chatbot
 */
export type Conversation = Message[];
