import { fetchCareer } from "@/lib/notion";
import type { SkillEntry } from "@/lib/notion";
import "../print.css";

export default async function PrintCareerPage() {
  const data = await fetchCareer();

  if (!data || data.entries.length === 0) {
    return <div className="print-error">データが取得できませんでした</div>;
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
    <div className="print-career-page">
      {/* Title */}
      <h1 className="print-career-title">職 務 経 歴 書</h1>

      {/* Career entries */}
      {entries.map((entry, index) => (
        <section
          key={index}
          className={`print-career-section ${index > 0 ? "print-page-break" : ""}`}
        >
          {/* Company header */}
          <div className="print-career-company">
            <h2 className="print-career-company-name">{entry.company}</h2>
            <div className="print-career-company-info">
              {entry.period && (
                <div className="print-career-info-item">
                  <span className="print-career-info-label">在籍期間：</span>
                  <span className="print-career-info-value">{entry.period}</span>
                </div>
              )}
              {entry.employmentType && (
                <div className="print-career-info-item">
                  <span className="print-career-info-label">雇用形態：</span>
                  <span className="print-career-info-value">
                    {entry.employmentType}
                  </span>
                </div>
              )}
              {entry.position && (
                <div className="print-career-info-item">
                  <span className="print-career-info-label">役職：</span>
                  <span className="print-career-info-value">{entry.position}</span>
                </div>
              )}
              {entry.employeeCount && (
                <div className="print-career-info-item">
                  <span className="print-career-info-label">従業員数：</span>
                  <span className="print-career-info-value">
                    {entry.employeeCount}
                  </span>
                </div>
              )}
              {entry.businessDescription && (
                <div
                  className="print-career-info-item"
                  style={{ gridColumn: "1 / -1" }}
                >
                  <span className="print-career-info-label">事業内容：</span>
                  <span className="print-career-info-value">
                    {entry.businessDescription}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {entry.summary && (
            <div className="print-career-summary">
              <div className="print-career-summary-title">職務要約</div>
              {entry.summary}
            </div>
          )}

          {/* Projects */}
          {entry.projects.length > 0 && (
            <div>
              <h3 className="print-career-section-title">担当プロジェクト</h3>
              {entry.projects.map((project, pi) => (
                <div key={pi} className="print-project">
                  <h4 className="print-project-name">{project.name}</h4>
                  <div className="print-project-info">
                    {project.period && (
                      <div className="print-career-info-item">
                        <span className="print-career-info-label">期間：</span>
                        <span className="print-career-info-value">
                          {project.period}
                        </span>
                      </div>
                    )}
                    {project.teamSize && (
                      <div className="print-career-info-item">
                        <span className="print-career-info-label">
                          チーム規模：
                        </span>
                        <span className="print-career-info-value">
                          {project.teamSize}
                        </span>
                      </div>
                    )}
                    {project.role && (
                      <div className="print-career-info-item">
                        <span className="print-career-info-label">役割：</span>
                        <span className="print-career-info-value">
                          {project.role}
                        </span>
                      </div>
                    )}
                  </div>
                  {project.responsibilities && (
                    <div className="print-project-detail">
                      <span className="print-project-detail-label">担当業務：</span>
                      <span className="print-project-detail-value">
                        {project.responsibilities}
                      </span>
                    </div>
                  )}
                  {project.technologies && (
                    <div className="print-project-detail">
                      <span className="print-project-detail-label">使用技術：</span>
                      <span className="print-project-detail-value">
                        {project.technologies}
                      </span>
                    </div>
                  )}
                  {project.achievements && (
                    <div className="print-project-detail">
                      <span className="print-project-detail-label">成果：</span>
                      <span className="print-project-detail-value">
                        {project.achievements}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="print-career-section print-page-break">
          <h3 className="print-career-section-title">使用技術・スキル</h3>
          <table className="print-skills-table">
            <tbody>
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <tr key={category}>
                  <th>{category}</th>
                  <td>{categorySkills.map((s) => s.name).join("、")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
