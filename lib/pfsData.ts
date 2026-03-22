import fs from "node:fs";
import path from "node:path";

type PfsCodeEntry = {
  code: string;
  description: string | null;
  statusCode: string | null;
  paymentIndicator: string | null;
  workRvu: number | null;
  nonFacilityPeRvu: number | null;
  facilityPeRvu: number | null;
  malpracticeRvu: number | null;
  totalNonFacilityRvu: number | null;
  totalFacilityRvu: number | null;
  pcTcIndicator: string | null;
  globalDays: string | null;
};

type PfsPayload = {
  source: {
    url: string;
    file: string;
    release: string;
    generatedAt: string;
  };
  codes: Record<string, PfsCodeEntry>;
};

let cachedPayload: PfsPayload | null = null;

export const loadPfsPayload = (): PfsPayload => {
  if (cachedPayload) return cachedPayload;
  const dataPath = path.join(process.cwd(), "data", "pfs-2025.json");
  const raw = fs.readFileSync(dataPath, "utf8");
  cachedPayload = JSON.parse(raw) as PfsPayload;
  return cachedPayload;
};

export const lookupCptCode = (code: string) => {
  const payload = loadPfsPayload();
  return payload.codes[code] ?? null;
};
