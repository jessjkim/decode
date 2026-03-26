import type { SourceBundle } from "./sourceBundle";

export const buildSummaryPrompt = (bundle: SourceBundle) => {
  return [
    "You are writing for patients with no medical background.",
    "Use ONLY the sources below. If a detail is missing, say it is not specified.",
    "Return 2-3 sentences with citations like [1], [2].",
    "",
    "Sources:",
    bundle.sources
      .map((source, index) => `[${index + 1}] ${source.title}\n${source.excerpt}\n${source.url}`)
      .join("\n\n")
  ].join("\n");
};

export const buildQuestionsPrompt = (bundle: SourceBundle) => {
  return [
    "You are writing for patients with no medical background.",
    "Use ONLY the sources below. If a detail is missing, say it is not specified.",
    "Return 3 short questions the patient should ask. Cite each question like [1].",
    "",
    "Sources:",
    bundle.sources
      .map((source, index) => `[${index + 1}] ${source.title}\n${source.excerpt}\n${source.url}`)
      .join("\n\n")
  ].join("\n");
};
