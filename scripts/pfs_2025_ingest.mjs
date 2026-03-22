import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { fileURLToPath } from "node:url";
import unzipper from "unzipper";
import { parse } from "csv-parse/sync";

const CMS_ZIP_URL = "https://www.cms.gov/files/zip/rvu25d.zip";
const CMS_ZIP_NAME = "rvu25d.zip";
const CMS_CSV_NAME = "PPRRVU2025_Oct.csv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "..", "data");
const outputPath = path.join(dataDir, "pfs-2025.json");

const fields = {
  code: 0,
  mod: 1,
  description: 2,
  statusCode: 3,
  paymentIndicator: 4,
  workRvu: 5,
  nonFacilityPeRvu: 6,
  nonFacilityPeIndicator: 7,
  facilityPeRvu: 8,
  facilityPeIndicator: 9,
  malpracticeRvu: 10,
  totalNonFacilityRvu: 11,
  totalFacilityRvu: 12,
  pcTcIndicator: 13,
  globalDays: 14
};

const toNumber = (value) => {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "NA") return null;
  const num = Number.parseFloat(trimmed);
  return Number.isNaN(num) ? null : num;
};

const downloadZip = async (destPath) => {
  const response = await fetch(CMS_ZIP_URL);
  if (!response.ok) {
    throw new Error(`Failed to download CMS zip: ${response.status}`);
  }
  const fileStream = createWriteStream(destPath);
  await pipeline(response.body, fileStream);
};

const extractCsv = async (zipPath, extractDir) => {
  await fs.promises.mkdir(extractDir, { recursive: true });
  await createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractDir }))
    .promise();
  const csvPath = path.join(extractDir, CMS_CSV_NAME);
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Expected CSV not found: ${csvPath}`);
  }
  return csvPath;
};

const parseCsv = async (csvPath) => {
  const text = await fs.promises.readFile(csvPath, "utf8");
  const lines = text.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.startsWith("HCPCS"));
  if (headerIndex === -1) {
    throw new Error("CSV header not found");
  }
  const dataText = lines.slice(headerIndex + 1).join("\n");
  const records = parse(dataText, {
    relax_column_count: true,
    skip_empty_lines: true
  });
  const codes = {};

  for (const row of records) {
    const code = row[fields.code]?.trim();
    const mod = row[fields.mod]?.trim();
    if (!code || mod) continue;
    if (codes[code]) continue;
    codes[code] = {
      code,
      description: row[fields.description]?.trim(),
      statusCode: row[fields.statusCode]?.trim(),
      paymentIndicator: row[fields.paymentIndicator]?.trim(),
      workRvu: toNumber(row[fields.workRvu]),
      nonFacilityPeRvu: toNumber(row[fields.nonFacilityPeRvu]),
      facilityPeRvu: toNumber(row[fields.facilityPeRvu]),
      malpracticeRvu: toNumber(row[fields.malpracticeRvu]),
      totalNonFacilityRvu: toNumber(row[fields.totalNonFacilityRvu]),
      totalFacilityRvu: toNumber(row[fields.totalFacilityRvu]),
      pcTcIndicator: row[fields.pcTcIndicator]?.trim(),
      globalDays: row[fields.globalDays]?.trim()
    };
  }

  return codes;
};

const run = async () => {
  await fs.promises.mkdir(dataDir, { recursive: true });
  const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "pfs-"));
  const zipPath = path.join(tmpDir, CMS_ZIP_NAME);

  await downloadZip(zipPath);
  const csvPath = await extractCsv(zipPath, tmpDir);
  const codes = await parseCsv(csvPath);

  const payload = {
    source: {
      url: CMS_ZIP_URL,
      file: CMS_CSV_NAME,
      release: "2025 October",
      generatedAt: new Date().toISOString()
    },
    codes
  };

  await fs.promises.writeFile(outputPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Saved ${Object.keys(codes).length} CPT entries to ${outputPath}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
