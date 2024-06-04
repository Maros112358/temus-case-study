import { promises as fs } from "fs";
import { dev } from "$app/environment";
import path from "path";
import uploadPDF from "$lib/utils/uploadPDF.js";

/**
 * Handles pdf file upload on /api/upload
 * ONLY PARSES PDF AND SAVED TO ASTRADB IN DEV ENVIRONMENT!!!
 */
export const POST = async ({ request }) => {
  const data = await request.formData();
  const file = data.get("file");
  if (!file) {
    return new Response("No file uploaded", { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadPath = path.join("/tmp/data", file.name);
    await fs.mkdir(path.dirname(uploadPath), { recursive: true });
    await fs.writeFile(uploadPath, buffer);

    if (dev) {
      // upload PDF file only in DEV
      const uint8Array = new Uint8Array(buffer);
      uploadPDF(uint8Array, file);
    }

    return new Response("File uploaded and processed successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("File upload or processing failed:", error);
    return new Response(`File upload or processing failed: ${error}`, {
      status: 500,
    });
  }
};
