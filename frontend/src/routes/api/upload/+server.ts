import { promises as fs } from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import { DataAPIClient } from '@datastax/astra-db-ts';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Initialize OpenAI API
const openai = new OpenAI();

// Initialize AstraDB client
const ASTRADB_TOKEN = process.env.ASTRADB_TOKEN || 'xxx';
const client = new DataAPIClient(ASTRADB_TOKEN);
const db = client.db('https://2e43f80e-6e86-4407-9343-2e9fc1c44ad9-us-east-2.apps.astra.datastax.com');

export const POST = async ({ request }) => {
  const data = await request.formData();
  const file = data.get('file');

  if (!file) {
    return new Response('No file uploaded', { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const uint8Array = new Uint8Array(buffer);
  const uploadPath = path.join('/tmp/data', file.name);
  const collection = await db.collection('financial_reports');

  try {
    await fs.mkdir(path.dirname(uploadPath), { recursive: true });
    await fs.writeFile(uploadPath, buffer);

    // Parse the PDF file
    const pdfData = await extractTextFromPDF(uint8Array);

    for (let i = 0; i < pdfData.pages.length; i++) {
      const cleanedText = cleanText(pdfData.pages[i].text);
      const embedding = await getEmbedding(cleanedText);
      console.log({i})
      // Store in AstraDB
      await collection.insertOne({ 
        text: cleanedText, 
        file_name: file.name, 
        page: pdfData.pages[i].pageNumber 
      }, { vector: embedding });
    }

    return new Response('File uploaded and processed successfully', { status: 200 });
  } catch (error) {
    console.error('File upload or processing failed:', error);
    return new Response(`File upload or processing failed: ${error}`, { status: 500 });
  }
};

// Function to extract text from a PDF buffer
async function extractTextFromPDF(uint8Array) {
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContentItems = await page.getTextContent();
    let textContent = '';

    textContentItems.items.forEach((item) => {
      textContent += item.str + ' ';
    });

    pages.push({ text: textContent.trim(), pageNumber: i });
  }

  return { pages };
}

// Function to clean text
function cleanText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

// Function to get embeddings from OpenAI
async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return response.data[0].embedding;
}
