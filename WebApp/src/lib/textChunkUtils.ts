/**
 * Teilt einen langen Text in Chunks der Länge maxChunkChars (Zeichen, grob Token/4)
 */
export function chunkText(text: string, maxChunkChars: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + maxChunkChars));
    start += maxChunkChars;
  }
  return chunks;
}
