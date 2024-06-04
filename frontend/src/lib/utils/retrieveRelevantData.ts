import type { FoundDoc, SomeDoc, Db } from "@datastax/astra-db-ts";
import type { OpenAI } from "openai";
import getEmbedding from "./getEmbedding";

/**
  Retrieves data relevant to the query
  @param query query to which are looking for relevant data
  @param topK how many records to retrieve
  @param db AstraDB object to use
  @param openai OpenAI object to use
  @returns list of relevant data objects
*/
export default async function retrieveRelevantData(
  query: string,
  topK: number = 5,
  db: Db,
  openai: OpenAI
) {
  // embed the query
  const queryEmbedding = await getEmbedding(query, openai);

  // fetch relevant data
  const collection = await db.collection("financial_reports");
  const cursor = collection.find(
    {},
    {
      vector: queryEmbedding,
      includeSimilarity: true,
      limit: topK,
    }
  );

  // preprocess the relevant data to our desired format
  const results: FoundDoc<SomeDoc>[] = await cursor.toArray();
  const extractedData = results.map((item) => ({
    text: item.text,
    page: item.page,
    file_name: item.file_name,
  }));
  return extractedData;
}
