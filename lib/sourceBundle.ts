export type SourceEntry = {
  id: string;
  title: string;
  url: string;
  excerpt: string;
};

export type SourceBundle = {
  code: string;
  sources: SourceEntry[];
};

export const buildCmsSource = (code: string, description: string | null, globalDays: string | null) => {
  const excerptParts = [
    description ? `CMS short descriptor: ${description}.` : "CMS short descriptor: not listed.",
    globalDays ? `Global days: ${globalDays}.` : "Global days: not listed."
  ];

  return {
    id: "cms-pfs-2025",
    title: `CMS PFS 2025 RVU file for CPT ${code}`,
    url: "https://www.cms.gov/files/zip/rvu25d.zip",
    excerpt: excerptParts.join(" ")
  };
};
