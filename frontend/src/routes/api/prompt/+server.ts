
/**
 * Handles answering the user's query
 */

import { json } from "@sveltejs/kit";
import { OpenAI } from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import continueConversation from "$lib/utils/continueConversation.js";
import type { Conversation } from "$lib/types/conversation.js";
import { ASTRADB_HOST, ASTRADB_TOKEN, TOP_K } from "$lib/const.js";

/**
 * POST /api/prompt
 */
export async function POST({ request }) {
  try {
    if (!ASTRADB_TOKEN) {
      throw Error("ASTRADB_TOKEN is missing");
    }

    // Initialize ASTRADB
    const client = new DataAPIClient(ASTRADB_TOKEN);
    const db = client.db(ASTRADB_HOST);

    // Initialize OpenAI
    const openai = new OpenAI();

    const { conversation }: { conversation: Conversation } =
      await request.json();
    const newConversation = await continueConversation(
      conversation,
      db,
      openai,
      TOP_K
    );
    return json({ newConversation });
  } catch (error) {
    return json({ error }, { status: 500 });
  }
}
