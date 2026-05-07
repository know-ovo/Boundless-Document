/** 从 Markdown 正文推导状态栏用的粗略字数与行数（不含精确光标列）。 */
export function getDocumentStats(markdown: string): { lines: number; chars: number } {
  const chars = [...markdown].length;
  const lines = markdown.length === 0 ? 1 : markdown.split('\n').length;
  return { lines, chars };
}
