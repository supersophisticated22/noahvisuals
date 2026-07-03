import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import {
  CONTENT_FILES,
  type ContentFile,
  type CustomPage,
  type PagesContent,
  type Service,
  type Stage,
} from "@/lib/types";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const HISTORY_DIR = path.join(CONTENT_ROOT, "history");

function assertFile(file: string): asserts file is ContentFile {
  if (!CONTENT_FILES.includes(file as ContentFile)) {
    throw new Error(`Unknown content file: ${file}`);
  }
}

function filePath(stage: Stage, file: ContentFile): string {
  return path.join(CONTENT_ROOT, stage, `${file}.json`);
}

/** Read and parse a content file. Throws on unknown file names. */
export async function readContent<T = unknown>(
  stage: Stage,
  file: string,
): Promise<T> {
  assertFile(file);
  const raw = await fs.readFile(filePath(stage, file), "utf8");
  return JSON.parse(raw) as T;
}

/** Write a content file (pretty-printed). Draft only in practice. */
export async function writeContent(
  stage: Stage,
  file: string,
  data: unknown,
): Promise<void> {
  assertFile(file);
  await fs.writeFile(filePath(stage, file), JSON.stringify(data, null, 2) + "\n", "utf8");
}

/** All content files present in draft/ (json + txt), e.g. services.json, llms.txt. */
async function listDraftFiles(): Promise<string[]> {
  const dir = path.join(CONTENT_ROOT, "draft");
  const names = await fs.readdir(dir);
  return names.filter((n) => n.endsWith(".json") || n.endsWith(".txt"));
}

/**
 * Snapshot the current published/ files into a timestamped history folder,
 * then copy every draft/ file over published/.
 */
export async function publish(): Promise<{ snapshot: string }> {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const snapDir = path.join(HISTORY_DIR, stamp);
  await fs.mkdir(snapDir, { recursive: true });

  for (const name of await listDraftFiles()) {
    // Snapshot existing published content (skip if it doesn't exist yet).
    try {
      const current = await fs.readFile(
        path.join(CONTENT_ROOT, "published", name),
        "utf8",
      );
      await fs.writeFile(path.join(snapDir, name), current, "utf8");
    } catch {
      // no prior published version — nothing to snapshot
    }
    // Promote draft -> published.
    const draft = await fs.readFile(path.join(CONTENT_ROOT, "draft", name), "utf8");
    await fs.writeFile(path.join(CONTENT_ROOT, "published", name), draft, "utf8");
  }

  return { snapshot: stamp };
}

export type HistoryEntry = { name: string; createdAt: string; files: string[] };

/** List history snapshots, newest first. */
export async function listHistory(): Promise<HistoryEntry[]> {
  let names: string[];
  try {
    names = await fs.readdir(HISTORY_DIR);
  } catch {
    return [];
  }
  const entries: HistoryEntry[] = [];
  for (const name of names) {
    if (name.startsWith(".")) continue;
    const dir = path.join(HISTORY_DIR, name);
    const stat = await fs.stat(dir);
    if (!stat.isDirectory()) continue;
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
    // Snapshot name is an ISO timestamp with ':' and '.' replaced by '-'.
    const createdAt = name.replace(
      /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/,
      "$1T$2:$3:$4.$5Z",
    );
    entries.push({ name, createdAt, files });
  }
  entries.sort((a, b) => (a.name < b.name ? 1 : -1));
  return entries;
}

/** Restore a history snapshot's files into draft/ (user must re-publish). */
export async function restoreSnapshot(name: string): Promise<void> {
  // Prevent path traversal — name must be a plain folder name.
  if (name.includes("/") || name.includes("..") || name.startsWith(".")) {
    throw new Error("Invalid snapshot name");
  }
  const snapDir = path.join(HISTORY_DIR, name);
  const files = (await fs.readdir(snapDir)).filter(
    (f) => f.endsWith(".json") || f.endsWith(".txt"),
  );
  for (const f of files) {
    if (f.includes("/") || f.includes("..")) continue;
    const data = await fs.readFile(path.join(snapDir, f), "utf8");
    await fs.writeFile(path.join(CONTENT_ROOT, "draft", path.basename(f)), data, "utf8");
  }
}

// ---------------------------------------------------------------------------
// Public-site loaders (preview-aware)
// ---------------------------------------------------------------------------

/** True when the `cms_preview` cookie is set — public site then reads draft/. */
export async function isPreviewMode(): Promise<boolean> {
  try {
    const store = await cookies();
    return store.get("cms_preview")?.value === "true";
  } catch {
    return false;
  }
}

async function resolveStage(preview?: boolean): Promise<Stage> {
  const usePreview = preview ?? (await isPreviewMode());
  return usePreview ? "draft" : "published";
}

/** All services, sorted by `order`. Pass preview to force draft. */
export async function getServices(preview?: boolean): Promise<Service[]> {
  const stage = await resolveStage(preview);
  const services = await readContent<Service[]>(stage, "services");
  return [...services].sort((a, b) => a.order - b.order);
}

/** Visible services only, sorted — for public rendering. */
export async function getVisibleServices(preview?: boolean): Promise<Service[]> {
  return (await getServices(preview)).filter((s) => s.visible);
}

export async function getServiceBySlug(
  slug: string,
  preview?: boolean,
): Promise<Service | undefined> {
  return (await getServices(preview)).find((s) => s.slug === slug);
}

export async function getPages(preview?: boolean): Promise<PagesContent> {
  const stage = await resolveStage(preview);
  return readContent<PagesContent>(stage, "pages");
}

/** True if draft/ differs from published/ for any content file. */
export async function hasUnpublishedChanges(): Promise<boolean> {
  for (const name of await listDraftFiles()) {
    try {
      const [draft, published] = await Promise.all([
        fs.readFile(path.join(CONTENT_ROOT, "draft", name), "utf8"),
        fs.readFile(path.join(CONTENT_ROOT, "published", name), "utf8"),
      ]);
      if (draft.trim() !== published.trim()) return true;
    } catch {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Custom pages (AI-generated, user-created)
// ---------------------------------------------------------------------------

export async function getCustomPages(preview?: boolean): Promise<CustomPage[]> {
  const stage = await resolveStage(preview);
  try {
    const pages = await readContent<CustomPage[]>(stage, "custom-pages");
    return [...pages].sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

export async function getVisibleCustomPages(preview?: boolean): Promise<CustomPage[]> {
  return (await getCustomPages(preview)).filter((p) => p.visible);
}

export async function getCustomPageBySlug(
  slug: string,
  preview?: boolean,
): Promise<CustomPage | undefined> {
  return (await getCustomPages(preview)).find((p) => p.slug === slug);
}

// ---------------------------------------------------------------------------
// llms.txt (plain text)
// ---------------------------------------------------------------------------

function llmsPath(stage: Stage): string {
  return path.join(CONTENT_ROOT, stage, "llms.txt");
}

export async function getLlms(preview?: boolean): Promise<string> {
  const stage = await resolveStage(preview);
  try {
    return await fs.readFile(llmsPath(stage), "utf8");
  } catch {
    return "";
  }
}

export async function readLlmsDraft(): Promise<string> {
  try {
    return await fs.readFile(llmsPath("draft"), "utf8");
  } catch {
    return "";
  }
}

export async function writeLlmsDraft(text: string): Promise<void> {
  await fs.writeFile(llmsPath("draft"), text, "utf8");
}

/** Build an llms.txt from the current draft content. */
export async function generateLlms(): Promise<string> {
  const [pages, services, custom] = await Promise.all([
    getPages(true),
    getServices(true),
    getCustomPages(true),
  ]);
  const lines: string[] = [];
  lines.push(`# ${pages.seo.site_name || "Noah Visuals"}`);
  lines.push("");
  lines.push(`> ${pages.seo.default_description || pages.hero.tagline}`);
  lines.push("");
  if (pages.about.body) {
    lines.push(pages.about.body);
    lines.push("");
  }
  lines.push("## Diensten");
  for (const s of services.filter((s) => s.visible)) {
    lines.push(`- [${s.title}](/${s.slug}): ${s.description}`);
  }
  lines.push("");
  if (custom.filter((p) => p.visible).length) {
    lines.push("## Pagina's");
    for (const p of custom.filter((p) => p.visible)) {
      lines.push(`- [${p.title}](/${p.slug}): ${p.seo.description || ""}`.trim());
    }
    lines.push("");
  }
  lines.push("## Contact");
  if (pages.contact.email) lines.push(`- E-mail: ${pages.contact.email}`);
  if (pages.contact.phone) lines.push(`- Telefoon: ${pages.contact.phone}`);
  if (pages.contact.location) lines.push(`- Locatie: ${pages.contact.location}`);
  lines.push("");
  return lines.join("\n");
}
