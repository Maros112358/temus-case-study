// routes/api/prompt.js

import { json } from '@sveltejs/kit';
import { OpenAI } from 'openai';
import { ChromaClient } from 'chromadb';

// Initialize ChromaDB
const chroma = new ChromaClient();
const openai = new OpenAI()

// Initialize OpenAI
async function retrieveRelevantData(query: String, topK = 5) {
    const collection = await chroma.getOrCreateCollection({ name: 'financial_reports' });
    const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: query,
    });
    const queryEmbedding: number[] = response.data[0].embedding
    const result = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
    });

  return {
    files: result.metadatas[0].map(metadata => metadata.file_name),
    documents: result.documents[0],
    pages: result.metadatas[0].map(metadata => metadata.page)
  };
}

async function generateAnswer(conversation, context: String, newMessage: string) {
  const messages = conversation.map(({ visibleContent, ...rest }) => rest);
  console.log({messages})
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messages
  });
  return response.choices[0].message.content;
}

async function continueConversation(conversation) {
  const lastMessage = conversation.at(-1)
  const relevantData = await retrieveRelevantData(lastMessage.visibleContent);
  const context = JSON.stringify(relevantData);
  lastMessage.content = `Context: ${context}\n\nQuestion: ${lastMessage.visibleContent}`
  const answer = await generateAnswer(conversation, context);
  lastMessage.content = lastMessage.visibleContent
  conversation.push({
    'content': answer,
    'role': 'assistant',
    'visibleContent': answer
  })
  return conversation
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
