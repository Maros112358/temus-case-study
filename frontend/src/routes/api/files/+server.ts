/**
 * Handles fetching of the list of uploaded files
 */

import { promises as fs } from "fs";
import { FINANCIAL_REPORTS_PATH } from "$lib/const";

export const GET = async () => {
  try {
    await fs.mkdir(FINANCIAL_REPORTS_PATH, { recursive: true });
    const files = await fs.readdir(FINANCIAL_REPORTS_PATH);
    return new Response(JSON.stringify(files), { status: 200 });
  } catch (error) {
    console.error("Failed to read directory:", error);
    return new Response(`Failed to read directory: ${error}`, { status: 500 });
  }
};
