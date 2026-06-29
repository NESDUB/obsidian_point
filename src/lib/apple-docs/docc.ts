export type AppleDocAvailability = {
  platform: string;
  introducedAt?: string;
  deprecatedAt?: string;
  obsoletedAt?: string;
  beta?: boolean;
  unavailable?: boolean;
  message?: string;
};

export type AppleDocRelatedLink = {
  title: string;
  path?: string;
  url?: string;
  abstract?: string;
  kind?: string;
  sourceSection?: string;
};

export type AppleDocCodeBlock = {
  language?: string;
  code: string;
};

export type AppleDocBrief = {
  source: "live-apple-docc";
  requestedInput: string;
  normalizedPath: string;
  doccDataURL: string;
  officialURL: string;
  title: string;
  role?: string;
  framework?: string;
  abstract?: string;
  availability: AppleDocAvailability[];
  headings: string[];
  codeBlocks: AppleDocCodeBlock[];
  related: AppleDocRelatedLink[];
  markdown: string;
  rawMetadata?: unknown;
  fetchedAt: string;
};

type JSONValue = null | boolean | number | string | JSONValue[] | { [key: string]: JSONValue };
type JSONObject = { [key: string]: JSONValue };

const APPLE_DOC_BASE = "https://developer.apple.com";
const APPLE_DOCC_DATA_BASE = "https://developer.apple.com/tutorials/data";

export class AppleDocCError extends Error {
  status?: number;
  detail?: string;

  constructor(message: string, options?: { status?: number; detail?: string }) {
    super(message);
    this.name = "AppleDocCError";
    this.status = options?.status;
    this.detail = options?.detail;
  }
}

export function normalizeAppleDocPath(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new AppleDocCError("Missing documentation path or URL.");
  }

  let path = trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname !== "developer.apple.com") {
      throw new AppleDocCError("Only developer.apple.com documentation URLs are supported in this POC.");
    }
    path = url.pathname;
  } catch (error) {
    if (error instanceof AppleDocCError) throw error;
    // Not a URL; continue treating the input as a path.
  }

  path = path
    .replace(/^https?:\/\/developer\.apple\.com/i, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .split("#")[0]
    .split("?")[0];

  if (!path.startsWith("documentation/") && !path.startsWith("tutorials/")) {
    throw new AppleDocCError(
      "Path must start with documentation/ or tutorials/, or be a developer.apple.com documentation URL."
    );
  }

  return decodeURIComponent(path).toLowerCase();
}

export function buildAppleDocCDataURL(normalizedPath: string): string {
  const encodedPath = normalizedPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${APPLE_DOCC_DATA_BASE}/${encodedPath}.json`;
}

export function buildOfficialURL(normalizedPath: string): string {
  const encodedPath = normalizedPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${APPLE_DOC_BASE}/${encodedPath}`;
}

export async function fetchLiveAppleDocBrief(input: string): Promise<AppleDocBrief> {
  const normalizedPath = normalizeAppleDocPath(input);
  const doccDataURL = buildAppleDocCDataURL(normalizedPath);
  const officialURL = buildOfficialURL(normalizedPath);

  const response = await fetch(doccDataURL, {
    headers: {
      Accept: "application/json, text/json;q=0.9, */*;q=0.1",
      "User-Agent": "ObsidianPointAppleDocPOC/0.1 (+https://obsidianpoint.co/r/apple-docs/poc)",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    const body = await safeReadText(response);
    throw new AppleDocCError(`Apple DocC fetch failed with HTTP ${response.status}.`, {
      status: response.status,
      detail: body.slice(0, 500),
    });
  }

  const doc = (await response.json()) as JSONObject;
  return renderAppleDocBrief({
    doc,
    requestedInput: input,
    normalizedPath,
    doccDataURL,
    officialURL,
  });
}

function renderAppleDocBrief(args: {
  doc: JSONObject;
  requestedInput: string;
  normalizedPath: string;
  doccDataURL: string;
  officialURL: string;
}): AppleDocBrief {
  const { doc, requestedInput, normalizedPath, doccDataURL, officialURL } = args;
  const metadata = asObject(doc.metadata) ?? {};
  const references = asObject(doc.references);

  const title = stringFrom(metadata.title) || inferTitleFromPath(normalizedPath);
  const role = stringFrom(metadata.role);
  const framework = frameworkName(metadata, normalizedPath);
  const abstract = inlineContentToText(metadata.abstract ?? doc.abstract, references);
  const availability = extractAvailability(metadata.platforms);

  const primaryMarkdown = renderPrimarySections(doc, references);
  const topicMarkdown = renderTopicSections(doc, references);
  const related = extractRelatedLinks(doc, references);
  const codeBlocks = extractCodeBlocks(doc);
  const headings = extractHeadings(doc, references);

  const markdown = [
    `# ${title}`,
    "",
    `Source: Live Apple DocC JSON`,
    framework ? `Framework: ${framework}` : undefined,
    role ? `Role: ${role}` : undefined,
    `Path: ${normalizedPath}`,
    `Official URL: ${officialURL}`,
    `DocC JSON: ${doccDataURL}`,
    "",
    abstract ? `## Abstract\n\n${abstract}` : undefined,
    availability.length > 0 ? `## Availability\n\n${availability.map(formatAvailability).join("\n")}` : undefined,
    primaryMarkdown ? `## Content\n\n${primaryMarkdown}` : undefined,
    topicMarkdown ? `## Topic Sections\n\n${topicMarkdown}` : undefined,
    related.length > 0 ? `## Related\n\n${related.slice(0, 30).map(formatRelated).join("\n")}` : undefined,
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  return {
    source: "live-apple-docc",
    requestedInput,
    normalizedPath,
    doccDataURL,
    officialURL,
    title,
    role,
    framework,
    abstract,
    availability,
    headings,
    codeBlocks,
    related,
    markdown,
    rawMetadata: metadata,
    fetchedAt: new Date().toISOString(),
  };
}

export function briefToMarkdown(brief: AppleDocBrief): string {
  return `${brief.markdown}\n`;
}

function renderPrimarySections(doc: JSONObject, references: JSONObject | undefined): string {
  const chunks: string[] = [];

  const primaryContentSections = asArray(doc.primaryContentSections);
  for (const sectionValue of primaryContentSections) {
    const section = asObject(sectionValue);
    if (!section) continue;

    const heading = stringFrom(section.title) || kindToTitle(stringFrom(section.kind));
    const rendered = renderDocCNode(section.content ?? section, references, 3).trim();
    const declaration = renderDeclarationSection(section).trim();
    const finalBody = [declaration, rendered].filter(Boolean).join("\n\n");

    if (finalBody) {
      chunks.push(heading ? `### ${heading}\n\n${finalBody}` : finalBody);
    }
  }

  // Some article pages use sections instead of primaryContentSections.
  const sections = asArray(doc.sections);
  for (const sectionValue of sections) {
    const section = asObject(sectionValue);
    if (!section) continue;
    const heading = stringFrom(section.title) || kindToTitle(stringFrom(section.kind));
    const rendered = renderDocCNode(section.content ?? section, references, 3).trim();
    if (rendered) chunks.push(heading ? `### ${heading}\n\n${rendered}` : rendered);
  }

  return dedupeStrings(chunks).join("\n\n");
}

function renderTopicSections(doc: JSONObject, references: JSONObject | undefined): string {
  const output: string[] = [];
  const containers = [doc.topicSections, doc.relationshipSections, doc.seeAlsoSections];

  for (const container of containers) {
    for (const sectionValue of asArray(container)) {
      const section = asObject(sectionValue);
      if (!section) continue;
      const title = stringFrom(section.title) || stringFrom(section.kind) || "Related";
      const identifiers = asArray(section.identifiers);
      const lines: string[] = [];

      for (const identifierValue of identifiers) {
        const identifier = stringFrom(identifierValue);
        if (!identifier) continue;
        const ref = references ? asObject(references[identifier]) : undefined;
        const refTitle = stringFrom(ref?.title) || identifier;
        const refPath = normalizeReferenceURL(stringFrom(ref?.url));
        const refAbstract = inlineContentToText(ref?.abstract, references);
        lines.push(`- ${refPath ? `[${refTitle}](${buildOfficialURL(refPath)})` : refTitle}${refAbstract ? ` — ${refAbstract}` : ""}`);
      }

      if (lines.length) output.push(`### ${title}\n\n${lines.join("\n")}`);
    }
  }

  return dedupeStrings(output).join("\n\n");
}

function renderDeclarationSection(section: JSONObject): string {
  const declarations = asArray(section.declarations);
  const output: string[] = [];

  for (const declarationValue of declarations) {
    const declaration = asObject(declarationValue);
    if (!declaration) continue;

    const tokens = asArray(declaration.tokens);
    const tokenText = tokens.map((token) => stringFrom(asObject(token)?.text)).filter(Boolean).join("");
    const languages = asArray(declaration.languages).map((lang) => stringFrom(lang)).filter(Boolean);
    const language = languages[0] ?? "swift";

    if (tokenText.trim()) output.push(`\`\`\`${language}\n${tokenText.trim()}\n\`\`\``);
  }

  return output.join("\n\n");
}

function renderDocCNode(value: JSONValue | undefined, references: JSONObject | undefined, headingLevel = 2): string {
  if (value === undefined || value === null) return "";

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => renderDocCNode(entry, references, headingLevel)).filter(Boolean).join("\n\n");
  }

  const node = value as JSONObject;
  const type = stringFrom(node.type) ?? stringFrom(node.kind);

  switch (type) {
    case "heading": {
      const level = numberFrom(node.level) ?? headingLevel;
      const text = inlineContentToText(node.text ?? node.inlineContent ?? node.content, references);
      return text ? `${"#".repeat(Math.min(Math.max(level, 2), 6))} ${text}` : "";
    }
    case "paragraph":
      return inlineContentToText(node.inlineContent ?? node.content, references);
    case "aside": {
      const style = stringFrom(node.style) || "Note";
      const body = renderDocCNode(node.content, references, headingLevel).trim();
      return body ? `> **${capitalize(style)}:** ${body.replace(/\n/g, "\n> ")}` : "";
    }
    case "unorderedList":
    case "orderedList": {
      const items = asArray(node.items ?? node.content);
      return items
        .map((item, index) => {
          const rendered = renderDocCNode(item, references, headingLevel).trim().replace(/\n/g, "\n  ");
          if (!rendered) return "";
          return type === "orderedList" ? `${index + 1}. ${rendered}` : `- ${rendered}`;
        })
        .filter(Boolean)
        .join("\n");
    }
    case "listItem":
      return renderDocCNode(node.content ?? node.inlineContent, references, headingLevel);
    case "codeListing":
    case "codeBlock": {
      const code = codeFromNode(node);
      const language = stringFrom(node.syntax) || stringFrom(node.language) || "swift";
      return code ? `\`\`\`${language}\n${code}\n\`\`\`` : "";
    }
    case "table":
      return renderTable(node, references);
    case "row":
    case "cell":
      return renderDocCNode(node.content, references, headingLevel);
    default: {
      if (node.inlineContent) return inlineContentToText(node.inlineContent, references);
      if (node.content) return renderDocCNode(node.content, references, headingLevel);
      if (node.text) return inlineContentToText(node.text, references);
      return "";
    }
  }
}

function inlineContentToText(value: JSONValue | undefined, references: JSONObject | undefined): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    return value.map((entry) => inlineContentToText(entry, references)).join("").replace(/\s+/g, " ").trim();
  }

  const node = value as JSONObject;
  const type = stringFrom(node.type) ?? stringFrom(node.kind);

  switch (type) {
    case "text":
      return stringFrom(node.text) ?? "";
    case "codeVoice":
    case "inlineCode":
      return `\`${stringFrom(node.code) ?? stringFrom(node.text) ?? ""}\``;
    case "emphasis":
      return `_${inlineContentToText(node.inlineContent ?? node.content, references)}_`;
    case "strong":
      return `**${inlineContentToText(node.inlineContent ?? node.content, references)}**`;
    case "reference": {
      const identifier = stringFrom(node.identifier);
      const ref = identifier && references ? asObject(references[identifier]) : undefined;
      const title = stringFrom(ref?.title) || stringFrom(node.title) || identifier || "Reference";
      const refPath = normalizeReferenceURL(stringFrom(ref?.url));
      return refPath ? `[${title}](${buildOfficialURL(refPath)})` : title;
    }
    default:
      return inlineContentToText(node.inlineContent ?? node.content ?? node.text, references);
  }
}

function renderTable(node: JSONObject, references: JSONObject | undefined): string {
  const rows = asArray(node.rows).map((row) => {
    const rowObject = asObject(row);
    const cells = asArray(rowObject?.cells ?? rowObject?.content).map((cell) => renderDocCNode(cell, references).replace(/\n/g, " "));
    return cells;
  });

  if (!rows.length) return "";
  const header = rows[0];
  const separator = header.map(() => "---");
  const body = rows.slice(1);

  return [header, separator, ...body].map((row) => `| ${row.join(" | ")} |`).join("\n");
}

function codeFromNode(node: JSONObject): string {
  const rawCode = node.code;
  if (typeof rawCode === "string") return rawCode.trim();

  const codeLines = asArray(rawCode);
  if (codeLines.length) {
    return codeLines
      .map((line) => {
        if (typeof line === "string") return line;
        const lineObject = asObject(line);
        return stringFrom(lineObject?.text) ?? inlineContentToText(lineObject?.tokens, undefined);
      })
      .join("")
      .trim();
  }

  const tokens = asArray(node.tokens);
  if (tokens.length) {
    return tokens.map((token) => stringFrom(asObject(token)?.text)).filter(Boolean).join("").trim();
  }

  return "";
}

function extractAvailability(platformsValue: JSONValue | undefined): AppleDocAvailability[] {
  return asArray(platformsValue)
    .map((entry) => {
      const platform = asObject(entry);
      if (!platform) return undefined;
      const name = stringFrom(platform.name);
      if (!name) return undefined;
      return {
        platform: name,
        introducedAt: stringFrom(platform.introducedAt),
        deprecatedAt: stringFrom(platform.deprecatedAt),
        obsoletedAt: stringFrom(platform.obsoletedAt),
        beta: booleanFrom(platform.beta),
        unavailable: booleanFrom(platform.unavailable),
        message: stringFrom(platform.message),
      } satisfies AppleDocAvailability;
    })
    .filter(Boolean) as AppleDocAvailability[];
}

function extractRelatedLinks(doc: JSONObject, references: JSONObject | undefined): AppleDocRelatedLink[] {
  if (!references) return [];

  const related: AppleDocRelatedLink[] = [];
  const sections = [doc.topicSections, doc.relationshipSections, doc.seeAlsoSections];

  for (const sectionGroup of sections) {
    for (const sectionValue of asArray(sectionGroup)) {
      const section = asObject(sectionValue);
      if (!section) continue;
      const sourceSection = stringFrom(section.title) || stringFrom(section.kind);
      for (const identifierValue of asArray(section.identifiers)) {
        const identifier = stringFrom(identifierValue);
        if (!identifier) continue;
        const ref = asObject(references[identifier]);
        if (!ref) continue;
        const title = stringFrom(ref.title);
        if (!title) continue;
        const path = normalizeReferenceURL(stringFrom(ref.url));
        related.push({
          title,
          path,
          url: path ? buildOfficialURL(path) : stringFrom(ref.url),
          abstract: inlineContentToText(ref.abstract, references),
          kind: stringFrom(ref.kind) || stringFrom(ref.role),
          sourceSection,
        });
      }
    }
  }

  return uniqueBy(related, (item) => `${item.title}:${item.path ?? item.url ?? ""}`);
}

function extractCodeBlocks(root: JSONValue): AppleDocCodeBlock[] {
  const blocks: AppleDocCodeBlock[] = [];

  walk(root, (node) => {
    const object = asObject(node);
    if (!object) return;
    const type = stringFrom(object.type) ?? stringFrom(object.kind);
    if (type === "codeListing" || type === "codeBlock") {
      const code = codeFromNode(object);
      if (code) blocks.push({ language: stringFrom(object.syntax) || stringFrom(object.language), code });
    }
  });

  return uniqueBy(blocks, (block) => `${block.language ?? ""}:${block.code}`);
}

function extractHeadings(root: JSONValue, references: JSONObject | undefined): string[] {
  const headings: string[] = [];

  walk(root, (node) => {
    const object = asObject(node);
    if (!object) return;
    const type = stringFrom(object.type) ?? stringFrom(object.kind);
    if (type === "heading") {
      const text = inlineContentToText(object.text ?? object.inlineContent ?? object.content, references);
      if (text) headings.push(text);
    }
  });

  return dedupeStrings(headings);
}

function walk(value: JSONValue | undefined, visitor: (value: JSONValue) => void): void {
  if (value === undefined || value === null) return;
  visitor(value);
  if (Array.isArray(value)) {
    value.forEach((entry) => walk(entry, visitor));
    return;
  }
  if (typeof value === "object") {
    Object.values(value).forEach((entry) => walk(entry, visitor));
  }
}

function frameworkName(metadata: JSONObject | undefined, normalizedPath: string): string | undefined {
  const modules = asArray(metadata?.modules);
  const firstModule = asObject(modules[0]);
  const moduleName = stringFrom(firstModule?.name);
  if (moduleName) return moduleName;
  const [, framework] = normalizedPath.split("/");
  return framework ? framework.charAt(0).toUpperCase() + framework.slice(1) : undefined;
}

function normalizeReferenceURL(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const clean = url.replace(/^https?:\/\/developer\.apple\.com\//i, "").replace(/^\/+/, "").replace(/\/+$/, "");
  if (!clean.startsWith("documentation/") && !clean.startsWith("tutorials/")) return undefined;
  return decodeURIComponent(clean).toLowerCase();
}

function formatAvailability(item: AppleDocAvailability): string {
  const suffix = item.unavailable
    ? " unavailable"
    : item.introducedAt
      ? ` ${item.introducedAt}+`
      : "";
  const flags = [item.beta ? "beta" : undefined, item.deprecatedAt ? `deprecated ${item.deprecatedAt}` : undefined]
    .filter(Boolean)
    .join(", ");
  return `- ${item.platform}${suffix}${flags ? ` (${flags})` : ""}${item.message ? ` — ${item.message}` : ""}`;
}

function formatRelated(item: AppleDocRelatedLink): string {
  const target = item.url ? `[${item.title}](${item.url})` : item.title;
  return `- ${target}${item.abstract ? ` — ${item.abstract}` : ""}`;
}

function kindToTitle(kind: string | undefined): string | undefined {
  if (!kind) return undefined;
  return kind
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (match) => match.toUpperCase());
}

function inferTitleFromPath(path: string): string {
  const last = path.split("/").filter(Boolean).at(-1) ?? path;
  return last
    .split(/[\-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function asObject(value: JSONValue | undefined): JSONObject | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JSONObject) : undefined;
}

function asArray(value: JSONValue | undefined): JSONValue[] {
  return Array.isArray(value) ? value : [];
}

function stringFrom(value: JSONValue | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function numberFrom(value: JSONValue | undefined): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function booleanFrom(value: JSONValue | undefined): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function dedupeStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function uniqueBy<T>(values: T[], key: (value: T) => string): T[] {
  const seen = new Set<string>();
  const output: T[] = [];
  for (const value of values) {
    const k = key(value);
    if (seen.has(k)) continue;
    seen.add(k);
    output.push(value);
  }
  return output;
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}
