/**
 * Handles download of financial report files
 */

import { promises as fs } from "fs";
import path from "path";
import { FINANCIAL_REPORTS_PATH } from "$lib/const.js";

/**
 * GET /api/download?file=fileName
 */
export const GET = async ({ url }) => {
  const fileName = url.searchParams.get("file");
  if (!fileName) {
    return new Response("File not specified", { status: 400 });
  }

  try {
    const filePath = path.join(FINANCIAL_REPORTS_PATH, fileName);
    const file = await fs.readFile(filePath);
    return new Response(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("File not found:", error);
    return new Response(`File not found: ${error}`, { status: 404 });
  }
};
