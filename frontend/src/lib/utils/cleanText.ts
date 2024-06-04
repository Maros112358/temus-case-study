/**
 * Replaces white text by spaces
 * @param text
 * @returns cleaned text
 */
export default function cleanText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}
