import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

/**
 * Extracts text from a PDF file
 * @param uint8Array array representing PDF file
 * @returns extracted text
 */
export default async function extractTextFromPDF(uint8Array: Uint8Array) {
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContentItems = await page.getTextContent();
    let textContent = "";

    textContentItems.items.forEach((item) => {
      textContent += item.str + " ";
    });

    pages.push({ text: textContent.trim(), pageNumber: i });
  }

  return { pages };
}
