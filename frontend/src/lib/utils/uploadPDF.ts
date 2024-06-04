import extractTextFromPDF from "./extractTextFromPDF";
import cleanText from "./cleanText";
import getEmbedding from "./getEmbedding";
import { ASTRADB_HOST, ASTRADB_TOKEN } from "$lib/const";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { OpenAI } from "openai";

/**
 * Embeds and ploads PDF file embeddings to AstraDB
 * @param uint8Array array representing PDF file
 * @returns extracted text
 */
export default async function uploadPDF(pdf: Uint8Array, file: FormDataEntryValue) {
  if (!ASTRADB_TOKEN) {
    throw Error("ASTRADB_TOKEN is missing");
  }

  // Initialize AstraDB
  const client = new DataAPIClient(ASTRADB_TOKEN);
  const db = client.db(ASTRADB_HOST);
  const collection = await db.collection("financial_reports");

  // Initialize OpenAI
  const openai = new OpenAI();

  // Parse the PDF file
  const pdfData = await extractTextFromPDF(pdf);

  for (let i = 0; i < pdfData.pages.length; i++) {
    const cleanedText = cleanText(pdfData.pages[i].text);
    const embedding = await getEmbedding(cleanedText, openai);
    // Store in AstraDB
    await collection.insertOne(
      {
        text: cleanedText,
        _id: `${file.name}_${i}`,
        file_name: file.name,
        page: pdfData.pages[i].pageNumber,
      },
      { vector: embedding }
    );
  }
}
