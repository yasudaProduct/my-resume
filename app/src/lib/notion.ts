import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// --- Helper functions ---

function richTextToPlain(richText: RichTextItemResponse[]): string {
  return richText.map((t) => t.plain_text).join("");
}

/** "2009-04-01" → "2009年4月" */
function formatDateJa(dateStr: string): string {
  const match = dateStr.match(/^(\d{4})-(\d{2})/);
  if (!match) return dateStr;
  const year = match[1];
  const month = parseInt(match[2], 10);
  return `${year}年${month}月`;
}

/** Date property → "YYYY年M月" (single) or "YYYY年M月〜YYYY年M月" (range) */
function getDateValue(page: PageObjectResponse, name: string): string {
  const prop = page.properties[name];
  if (!prop || prop.type !== "date" || !prop.date) return "";
  const start = formatDateJa(prop.date.start);
  const end = prop.date.end ? formatDateJa(prop.date.end) : "";
  return end ? `${start}〜${end}` : start;
}

function getCheckboxValue(page: PageObjectResponse, name: string): boolean {
  const prop = page.properties[name];
  if (!prop || prop.type !== "checkbox") return false;
  return prop.checkbox;
}

function getPropertyValue(page: PageObjectResponse, name: string): string {
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

async function queryDatabase(
  dbId: string,
  sorts?: { property: string; direction: "ascending" | "descending" }[]
): Promise<PageObjectResponse[]> {
  const response = await notion.dataSources.query({
    data_source_id: dbId,
    sorts,
  });

  return response.results.filter(
    (r): r is PageObjectResponse => "properties" in r
  );
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
  selfPr: string;
  hobbies: string;
}

export interface EducationWorkEntry {
  content: string;
  date: string;
  category: string;
  order: number;
}

export interface CertificationEntry {
  name: string;
  date: string;
  order: number;
}

export interface ResumeData {
  profile: ResumeProfile;
  educationWork: EducationWorkEntry[];
  certifications: CertificationEntry[];
}

export interface ProjectEntry {
  name: string;
  company: string;
  period: string;
  teamSize: string;
  role: string;
  responsibilities: string;
  technologies: string;
  achievements: string;
  order: number;
  hidden: boolean;
}

export interface SkillEntry {
  name: string;
  category: string;
  order: number;
}

export interface CareerEntry {
  company: string;
  period: string;
  employmentType: string;
  position: string;
  businessDescription: string;
  employeeCount: string;
  summary: string;
  order: number;
  projects: ProjectEntry[];
}

export interface CareerData {
  entries: CareerEntry[];
  skills: SkillEntry[];
}

// --- Resume ---

export async function fetchResume(): Promise<ResumeData | null> {
  const resumeDbId = process.env.NOTION_RESUME_DB_ID;
  if (!resumeDbId) return null;

  const pages = await queryDatabase(resumeDbId);
  if (pages.length === 0) return null;

  const page = pages[0];

  const profile: ResumeProfile = {
    name: getPropertyValue(page, "氏名"),
    furigana: getPropertyValue(page, "フリガナ"),
    birthDate: getPropertyValue(page, "生年月日"),
    address: getPropertyValue(page, "住所"),
    phone: getPropertyValue(page, "電話番号"),
    email: getPropertyValue(page, "メールアドレス"),
    nearestStation: getPropertyValue(page, "最寄り駅"),
    photoUrl: null,
    selfPr: getPropertyValue(page, "自己PR"),
    hobbies: getPropertyValue(page, "趣味・特技"),
  };

  const photoProp = page.properties["顔写真"];
  if (photoProp?.type === "files" && photoProp.files.length > 0) {
    const file = photoProp.files[0];
    if (file.type === "file") {
      profile.photoUrl = file.file.url;
    } else if (file.type === "external") {
      profile.photoUrl = file.external.url;
    }
  }

  // Fetch education/work history
  const educationWork: EducationWorkEntry[] = [];
  const eduDbId = process.env.NOTION_EDUCATION_WORK_DB_ID;
  if (eduDbId) {
    const eduPages = await queryDatabase(eduDbId, [
      { property: "並び順", direction: "ascending" },
    ]);
    for (const p of eduPages) {
      educationWork.push({
        content: getPropertyValue(p, "内容"),
        date: getDateValue(p, "年月"),
        category: getPropertyValue(p, "区分"),
        order: Number(getPropertyValue(p, "並び順")) || 0,
      });
    }
  }

  // Fetch certifications
  const certifications: CertificationEntry[] = [];
  const certDbId = process.env.NOTION_CERTIFICATION_DB_ID;
  if (certDbId) {
    const certPages = await queryDatabase(certDbId, [
      { property: "並び順", direction: "ascending" },
    ]);
    for (const p of certPages) {
      certifications.push({
        name: getPropertyValue(p, "資格名"),
        date: getDateValue(p, "年月"),
        order: Number(getPropertyValue(p, "並び順")) || 0,
      });
    }
  }

  return { profile, educationWork, certifications };
}

// --- Career ---

export async function fetchCareer(): Promise<CareerData | null> {
  const careerDbId = process.env.NOTION_CAREER_DB_ID;
  if (!careerDbId) return null;

  const careerPages = await queryDatabase(careerDbId, [
    { property: "並び順", direction: "ascending" },
  ]);

  // Fetch all projects
  const allProjects: ProjectEntry[] = [];
  const projectDbId = process.env.NOTION_PROJECT_DB_ID;
  if (projectDbId) {
    const projectPages = await queryDatabase(projectDbId, [
      { property: "並び順", direction: "ascending" },
    ]);
    for (const p of projectPages) {
      const hidden = getCheckboxValue(p, "非表示");
      if (hidden) continue;
      allProjects.push({
        name: getPropertyValue(p, "プロジェクト名"),
        company: getPropertyValue(p, "会社名"),
        period: getDateValue(p, "期間"),
        teamSize: getPropertyValue(p, "チーム規模"),
        role: getPropertyValue(p, "役割"),
        responsibilities: getPropertyValue(p, "担当業務"),
        technologies: getPropertyValue(p, "使用技術"),
        achievements: getPropertyValue(p, "成果"),
        order: Number(getPropertyValue(p, "並び順")) || 0,
        hidden: false,
      });
    }
  }

  // Build career entries with matched projects
  const entries: CareerEntry[] = careerPages.map((page) => {
    const company = getPropertyValue(page, "会社名");
    return {
      company,
      period: getDateValue(page, "在籍期間"),
      employmentType: getPropertyValue(page, "雇用形態"),
      position: getPropertyValue(page, "役職"),
      businessDescription: getPropertyValue(page, "事業内容"),
      employeeCount: getPropertyValue(page, "従業員数"),
      summary: getPropertyValue(page, "職務要約"),
      order: Number(getPropertyValue(page, "並び順")) || 0,
      projects: allProjects.filter((p) => p.company === company),
    };
  });

  // Fetch skills
  const skills: SkillEntry[] = [];
  const skillDbId = process.env.NOTION_SKILL_DB_ID;
  if (skillDbId) {
    const skillPages = await queryDatabase(skillDbId, [
      { property: "並び順", direction: "ascending" },
    ]);
    for (const p of skillPages) {
      skills.push({
        name: getPropertyValue(p, "スキル名"),
        category: getPropertyValue(p, "カテゴリ"),
        order: Number(getPropertyValue(p, "並び順")) || 0,
      });
    }
  }

  return { entries, skills };
}
