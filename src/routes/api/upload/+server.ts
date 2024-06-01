import { promises as fs } from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist';
import { OpenAI } from 'openai';
import { ChromaClient } from 'chromadb';

// Initialize OpenAI API
const openai = new OpenAI()

// Initialize ChromaDB client
const chroma = new ChromaClient();

export const POST = async ({ request }) => {
  const data = await request.formData();
  const file = data.get('file');
  const collection = await chroma.getOrCreateCollection({name:'financial_reports'});

  if (!file) {
    return new Response('No file uploaded', { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const uploadPath = path.join(process.cwd(), 'data', file.name);
  const uint8Array = new Uint8Array(arrayBuffer);

  try {
    await fs.mkdir(path.dirname(uploadPath), { recursive: true });
    await fs.writeFile(uploadPath, buffer);

    // Parse the PDF file
    const loadingTask = pdfjsLib.getDocument(uint8Array);
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const text = await extractTextFromPage(page);
      const cleanedText = cleanText(text);

      // Get embeddings from OpenAI
      const embedding = await getEmbedding(cleanedText);
      console.log

      // Create metadata
      const metadata = {
        file_name: file.name,
        page: i,
      };

      // Store in ChromaDB
      await collection.add({
        ids: [`${file.name}_${i}`],
        documents: [cleanedText],
        metadatas: [metadata],
        embeddings: [embedding],
      });
    }

    return new Response('File uploaded and processed successfully', { status: 200 });
  } catch (error) {
    console.error('File upload or processing failed:', error);
    return new Response('File upload or processing failed', { status: 500 });
  }
};

// Function to extract text from a PDF page
async function extractTextFromPage(page: PDFPage) {
  const textContent = await page.getTextContent();
  let text = '';
  textContent.items.forEach((item) => {
    text += item.str + ' ';
  });
  return text.trim();
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
  console.log(response.data[0].embedding.length)
  return response.data[0].embedding
}
