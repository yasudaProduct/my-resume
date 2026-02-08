import { fetchResume } from "@/lib/notion";
import "../print.css";

export default async function PrintResumePage() {
  const data = await fetchResume();

  if (!data) {
    return <div className="print-error">データが取得できませんでした</div>;
  }

  const { profile, educationWork, certifications } = data;
  const education = educationWork.filter((e) => e.category === "学歴");
  const work = educationWork.filter((e) => e.category === "職歴");

  return (
    <div className="print-page">
      {/* Title */}
      <h1 className="print-title">履 歴 書</h1>

      {/* Top section: Photo + Basic Info */}
      <div className="print-header">
        {/* Photo area */}
        <div className="print-photo">
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.photoUrl} alt="証明写真" />
          ) : (
            <div className="print-photo-placeholder">
              写真
              <br />
              (30×40mm)
            </div>
          )}
        </div>

        {/* Basic info table */}
        <table className="print-table print-basic-info">
          <tbody>
            <tr>
              <th className="print-th-label">ふりがな</th>
              <td colSpan={3} className="print-furigana">
                {profile.furigana}
              </td>
            </tr>
            <tr>
              <th className="print-th-label">氏名</th>
              <td colSpan={3} className="print-name">
                {profile.name}
              </td>
            </tr>
            <tr>
              <th className="print-th-label">生年月日</th>
              <td colSpan={3}>{profile.birthDate}</td>
            </tr>
            <tr>
              <th className="print-th-label">住所</th>
              <td colSpan={3}>{profile.address}</td>
            </tr>
            <tr>
              <th className="print-th-label">電話番号</th>
              <td>{profile.phone}</td>
              <th className="print-th-label">最寄り駅</th>
              <td>{profile.nearestStation}</td>
            </tr>
            <tr>
              <th className="print-th-label">メール</th>
              <td colSpan={3}>{profile.email}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Education & Work History */}
      <table className="print-table print-history">
        <thead>
          <tr>
            <th className="print-th-date">年</th>
            <th className="print-th-date">月</th>
            <th className="print-th-content">学歴・職歴</th>
          </tr>
        </thead>
        <tbody>
          {/* Education header */}
          <tr>
            <td colSpan={3} className="print-section-header">
              学歴
            </td>
          </tr>
          {education.map((entry, i) => {
            const [year, month] = parseDateToYearMonth(entry.date);
            return (
              <tr key={`edu-${i}`}>
                <td className="print-td-date">{year}</td>
                <td className="print-td-date">{month}</td>
                <td>{entry.content}</td>
              </tr>
            );
          })}
          {/* Empty rows for education */}
          {education.length < 5 &&
            Array(5 - education.length)
              .fill(null)
              .map((_, i) => (
                <tr key={`edu-empty-${i}`}>
                  <td className="print-td-date"></td>
                  <td className="print-td-date"></td>
                  <td></td>
                </tr>
              ))}

          {/* Work header */}
          <tr>
            <td colSpan={3} className="print-section-header">
              職歴
            </td>
          </tr>
          {work.map((entry, i) => {
            const [year, month] = parseDateToYearMonth(entry.date);
            return (
              <tr key={`work-${i}`}>
                <td className="print-td-date">{year}</td>
                <td className="print-td-date">{month}</td>
                <td>{entry.content}</td>
              </tr>
            );
          })}
          {/* "以上" row */}
          <tr>
            <td className="print-td-date"></td>
            <td className="print-td-date"></td>
            <td className="print-end-marker">以上</td>
          </tr>
        </tbody>
      </table>

      {/* Certifications */}
      <table className="print-table print-cert">
        <thead>
          <tr>
            <th className="print-th-date">年</th>
            <th className="print-th-date">月</th>
            <th className="print-th-content">資格・免許</th>
          </tr>
        </thead>
        <tbody>
          {certifications.map((cert, i) => {
            const [year, month] = parseDateToYearMonth(cert.date);
            return (
              <tr key={`cert-${i}`}>
                <td className="print-td-date">{year}</td>
                <td className="print-td-date">{month}</td>
                <td>{cert.name}</td>
              </tr>
            );
          })}
          {/* Empty rows */}
          {certifications.length < 4 &&
            Array(4 - certifications.length)
              .fill(null)
              .map((_, i) => (
                <tr key={`cert-empty-${i}`}>
                  <td className="print-td-date"></td>
                  <td className="print-td-date"></td>
                  <td></td>
                </tr>
              ))}
        </tbody>
      </table>

      {/* Self PR */}
      <table className="print-table print-pr">
        <thead>
          <tr>
            <th>志望動機・自己PR</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="print-pr-content">
              {profile.selfPr}
              {profile.hobbies && (
                <>
                  <br />
                  <br />
                  <strong>趣味・特技：</strong>
                  {profile.hobbies}
                </>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// Helper function to parse date string like "2020年4月" to ["2020", "4"]
function parseDateToYearMonth(dateStr: string): [string, string] {
  const match = dateStr.match(/(\d+)年(\d+)?月?/);
  if (match) {
    return [match[1], match[2] || ""];
  }
  return [dateStr, ""];
}
