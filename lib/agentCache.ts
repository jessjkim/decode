import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

type CachedSummary = {
  code: string;
  summary: string;
  questions: string[];
  sourceHash: string;
  updatedAt: string;
  sources: {
    id: string;
    title: string;
    url: string;
    excerpt: string;
  }[];
};

type CacheFile = {
  summaries: Record<string, CachedSummary>;
};

const cachePath = path.join(process.cwd(), "data", "cpt-summaries.json");

const readCache = (): CacheFile => {
  if (!fs.existsSync(cachePath)) {
    return { summaries: {} };
  }
  const raw = fs.readFileSync(cachePath, "utf8");
  return JSON.parse(raw) as CacheFile;
};

const writeCache = (cache: CacheFile) => {
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), "utf8");
};

export const hashSources = (sources: CachedSummary["sources"]) => {
  const payload = JSON.stringify(sources);
  return crypto.createHash("sha256").update(payload).digest("hex");
};

export const getCachedSummary = (code: string) => {
  const cache = readCache();
  return cache.summaries[code] ?? null;
};

export const saveCachedSummary = (summary: CachedSummary) => {
  const cache = readCache();
  cache.summaries[summary.code] = summary;
  writeCache(cache);
};
