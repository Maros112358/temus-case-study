import { json } from '@sveltejs/kit';
import { OpenAI } from 'openai';
import { DataAPIClient } from '@datastax/astra-db-ts';

// Initialize AstraDB client
const ASTRADB_TOKEN = process.env.ASTRADB_TOKEN || 'xxx';
const client = new DataAPIClient(ASTRADB_TOKEN);
const db = client.db('https://2e43f80e-6e86-4407-9343-2e9fc1c44ad9-us-east-2.apps.astra.datastax.com');

// Initialize OpenAI
const openai = new OpenAI();

async function retrieveRelevantData(query: string, topK = 5) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  });

  const queryEmbedding = response.data[0].embedding;

  const collection = await db.collection('financial_reports')
  const cursor = collection.find({}, {
    vector: queryEmbedding,
    includeSimilarity: true,
    limit: topK
  })

  const results = await cursor.toArray()
  const extractedData = results.map(item => ({
    text: item.text,
    page: item.page,
    file_name: item.file_name
  }));
  console.log({extractedData})
  return extractedData;
}

async function generateAnswer(conversation) {
  const messages = conversation.map(({ visibleContent, ...rest }) => rest);

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messages,
  });

  return response.choices[0].message.content;
}

async function continueConversation(conversation) {
  const lastMessage = conversation.at(-1);
  const relevantData = await retrieveRelevantData(lastMessage.visibleContent);
  const context = JSON.stringify(relevantData);

  lastMessage.content = `Context: ${context}\n\nQuestion: ${lastMessage.visibleContent}`
  const answer = await generateAnswer(conversation);
  lastMessage.content = lastMessage.visibleContent;

  conversation.push({
    content: answer,
    role: 'assistant',
    visibleContent: answer,
  });

  return conversation;
}

export async function POST({ request }) {
  try {
    const { conversation } = await request.json();
    const newConversation = await continueConversation(conversation);
    return json({ newConversation });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}
