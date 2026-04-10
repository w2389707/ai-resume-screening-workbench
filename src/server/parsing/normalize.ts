export function normalizeResumeText(input: string) {
  return input
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n")
    .replace(/ *\n */g, "\n")
    .replace(/\n([A-Za-z])/g, "\n$1")
    .replace(/([.!?])\s*\n([A-Za-z])/g, "$1\n$2")
    .replace(/\n+/g, "\n")
    .trim();
}
