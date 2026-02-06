import { fetchCareer } from "@/lib/notion";
import type { ProjectEntry, SkillEntry } from "@/lib/notion";

export default async function CareerPage() {
  const data = await fetchCareer();

  if (!data || data.entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <h1 className="text-2xl font-bold mb-4">職務経歴書</h1>
        <p>データが取得できませんでした。</p>
        <p className="text-sm mt-2">
          Notion データベースの設定と環境変数を確認してください。
        </p>
      </div>
    );
  }

  const { entries, skills } = data;

  // Group skills by category
  const skillsByCategory = skills.reduce<Record<string, SkillEntry[]>>(
    (acc, skill) => {
      const cat = skill.category || "その他";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    },
    {}
  );

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-center">職務経歴書</h1>
      </div>

      {/* Career entries */}
      <div className="p-6 space-y-8">
        {entries.map((entry, index) => (
          <section
            key={index}
            className={index > 0 ? "print-break" : undefined}
          >
            {/* Company header */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h2 className="text-xl font-bold mb-2">{entry.company}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <InfoItem label="在籍期間" value={entry.period} />
                <InfoItem label="雇用形態" value={entry.employmentType} />
                <InfoItem label="役職" value={entry.position} />
                <InfoItem label="従業員数" value={entry.employeeCount} />
                <InfoItem
                  label="事業内容"
                  value={entry.businessDescription}
                  span
                />
              </div>
            </div>

            {/* Summary */}
            {entry.summary && (
              <div className="mb-4">
                <h3 className="text-base font-semibold mb-1">職務要約</h3>
                <p className="text-sm whitespace-pre-wrap">{entry.summary}</p>
              </div>
            )}

            {/* Projects */}
            {entry.projects.length > 0 && (
              <div className="space-y-4">
                {entry.projects.map((project, pi) => (
                  <ProjectCard key={pi} project={project} />
                ))}
              </div>
            )}
          </section>
        ))}

        {/* Skills */}
        {skills.length > 0 && (
          <section className="print-break">
            <h2 className="text-xl font-bold mb-3 pb-1 border-b border-gray-300">
              使用技術・スキル
            </h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                {Object.entries(skillsByCategory).map(
                  ([category, categorySkills]) => (
                    <tr key={category}>
                      <th className="text-left text-gray-500 pr-4 py-2 whitespace-nowrap align-top border-b border-gray-100 w-32">
                        {category}
                      </th>
                      <td className="py-2 border-b border-gray-100">
                        {categorySkills.map((s) => s.name).join(", ")}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  span,
}: {
  label: string;
  value: string;
  span?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={span ? "sm:col-span-2" : undefined}>
      <span className="text-gray-500">{label}：</span>
      {value}
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectEntry }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold mb-2">{project.name}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm mb-2">
        <InfoItem label="期間" value={project.period} />
        <InfoItem label="チーム規模" value={project.teamSize} />
        <InfoItem label="役割" value={project.role} />
      </div>
      {project.responsibilities && (
        <div className="text-sm mb-1">
          <span className="text-gray-500 font-medium">担当業務：</span>
          <span className="whitespace-pre-wrap">{project.responsibilities}</span>
        </div>
      )}
      {project.technologies && (
        <div className="text-sm mb-1">
          <span className="text-gray-500 font-medium">使用技術：</span>
          <span>{project.technologies}</span>
        </div>
      )}
      {project.achievements && (
        <div className="text-sm">
          <span className="text-gray-500 font-medium">成果：</span>
          <span className="whitespace-pre-wrap">{project.achievements}</span>
        </div>
      )}
    </div>
  );
}
