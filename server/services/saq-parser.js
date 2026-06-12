'use strict';
// Parse SAQ prompts formatted with separate "**Part A — ...**" / "**Part B — ...**" /
// "**Part C — ...**" sections (split by "---") plus an optional trailing
// "## Historical Context" section. Returns null if the prompt isn't in this format.
// Mirrors client/src/lib/saqPrompt.js.
function parseSaqPrompt(prompt) {
  if (!prompt?.includes('**Part A') && !prompt?.includes('**Part B')) return null;

  const parts = {};
  const sections = prompt.split('\n---\n');

  for (const section of sections) {
    const match = section.match(/\*\*Part\s+([A-C])\s*[—-]\s*([^\*]+)\*\*\s*\n\n([\s\S]*)/);
    if (match) {
      const letter = match[1];
      const title = match[2].trim();
      const text = match[3].trim();
      parts[letter] = { title, text };
    }
  }

  const contextMatch = prompt.match(/## Historical Context\s*\n\n?([\s\S]+?)$/);
  const context = contextMatch ? contextMatch[1].trim() : null;

  if (parts.A && parts.B && parts.C) {
    return { parts, context };
  }
  return null;
}

module.exports = { parseSaqPrompt };
