import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// --- Helper functions ---

function richTextToPlain(richText: RichTextItemResponse[]): string {
  return richText.map((t) => t.plain_text).join("");
}

function getPropertyValue(
  page: PageObjectResponse,
  name: string
): string {
  const prop = page.properties[name];
  if (!prop) return "";

  switch (prop.type) {
    case "title":
      return richTextToPlain(prop.title);
    case "rich_text":
      return richTextToPlain(prop.rich_text);
    case "email":
      return prop.email ?? "";
    case "phone_number":
      return prop.phone_number ?? "";
    case "number":
      return prop.number?.toString() ?? "";
    case "date":
      return prop.date?.start ?? "";
    case "select":
      return prop.select?.name ?? "";
    default:
      return "";
  }
}

// --- Types ---

export interface ResumeProfile {
  name: string;
  furigana: string;
  birthDate: string;
  address: string;
  phone: string;
  email: string;
  nearestStation: string;
  photoUrl: string | null;
}

export interface ResumeData {
  profile: ResumeProfile;
  blocks: BlockObjectResponse[];
}

export interface CareerEntry {
  company: string;
  period: string;
  employmentType: string;
  position: string;
  businessDescription: string;
  employeeCount: string;
  order: number;
  blocks: BlockObjectResponse[];
}

// --- Fetch blocks recursively ---

async function fetchBlocks(blockId: string): Promise<BlockObjectResponse[]> {
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const block of response.results) {
      if ("type" in block) {
        blocks.push(block as BlockObjectResponse);
      }
    }

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return blocks;
}

// --- Resume ---

export async function fetchResume(): Promise<ResumeData | null> {
  const dbId = process.env.NOTION_RESUME_DB_ID;
  if (!dbId) return null;

  const response = await notion.dataSources.query({
    data_source_id: dbId,
    page_size: 1,
  });

  if (response.results.length === 0) return null;

  const page = response.results[0] as PageObjectResponse;

  const profile: ResumeProfile = {
    name: getPropertyValue(page, "氏名"),
    furigana: getPropertyValue(page, "フリガナ"),
    birthDate: getPropertyValue(page, "生年月日"),
    address: getPropertyValue(page, "住所"),
    phone: getPropertyValue(page, "電話番号"),
    email: getPropertyValue(page, "メールアドレス"),
    nearestStation: getPropertyValue(page, "最寄り駅"),
    photoUrl: null,
  };

  // Get photo if available
  const photoProp = page.properties["顔写真"];
  if (photoProp?.type === "files" && photoProp.files.length > 0) {
    const file = photoProp.files[0];
    if (file.type === "file") {
      profile.photoUrl = file.file.url;
    } else if (file.type === "external") {
      profile.photoUrl = file.external.url;
    }
  }

  const blocks = await fetchBlocks(page.id);

  return { profile, blocks };
}

// --- Career ---

export async function fetchCareer(): Promise<CareerEntry[]> {
  const dbId = process.env.NOTION_CAREER_DB_ID;
  if (!dbId) return [];

  const response = await notion.dataSources.query({
    data_source_id: dbId,
    sorts: [{ property: "並び順", direction: "ascending" }],
  });

  const entries: CareerEntry[] = [];

  for (const result of response.results) {
    const page = result as PageObjectResponse;

    const entry: CareerEntry = {
      company: getPropertyValue(page, "会社名"),
      period: getPropertyValue(page, "在籍期間"),
      employmentType: getPropertyValue(page, "雇用形態"),
      position: getPropertyValue(page, "役職"),
      businessDescription: getPropertyValue(page, "事業内容"),
      employeeCount: getPropertyValue(page, "従業員数"),
      order: Number(getPropertyValue(page, "並び順")) || 0,
      blocks: await fetchBlocks(page.id),
    };

    entries.push(entry);
  }

  return entries;
}
