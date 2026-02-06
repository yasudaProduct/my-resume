import { fetchResume } from "@/lib/notion";
import type { EducationWorkEntry, CertificationEntry } from "@/lib/notion";

export default async function ResumePage() {
  const data = await fetchResume();

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <h1 className="text-2xl font-bold mb-4">履歴書</h1>
        <p>データが取得できませんでした。</p>
        <p className="text-sm mt-2">
          Notion データベースの設定と環境変数を確認してください。
        </p>
      </div>
    );
  }

  const { profile, educationWork, certifications } = data;

  const education = educationWork.filter((e) => e.category === "学歴");
  const work = educationWork.filter((e) => e.category === "職歴");

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-center">履歴書</h1>
      </div>

      {/* Profile */}
      <div className="p-6">
        <div className="flex gap-6">
          {profile.photoUrl && (
            <div className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.photoUrl}
                alt="証明写真"
                className="w-28 h-36 object-cover border border-gray-300"
              />
            </div>
          )}

          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-0.5">{profile.furigana}</p>
            <h2 className="text-2xl font-bold mb-4">{profile.name}</h2>

            <table className="text-sm w-full">
              <tbody>
                <ProfileRow label="生年月日" value={profile.birthDate} />
                <ProfileRow label="住所" value={profile.address} />
                <ProfileRow label="最寄り駅" value={profile.nearestStation} />
                <ProfileRow label="電話番号" value={profile.phone} />
                <ProfileRow label="メールアドレス" value={profile.email} />
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Education & Work History */}
      {educationWork.length > 0 && (
        <Section title="学歴・職歴">
          {education.length > 0 && (
            <HistoryTable label="学歴" entries={education} />
          )}
          {work.length > 0 && (
            <HistoryTable label="職歴" entries={work} />
          )}
        </Section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <Section title="資格・免許">
          <table className="w-full text-sm">
            <tbody>
              {certifications.map((cert, i) => (
                <CertRow key={i} cert={cert} />
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* Self PR */}
      {profile.selfPr && (
        <Section title="自己PR">
          <p className="text-sm whitespace-pre-wrap">{profile.selfPr}</p>
        </Section>
      )}

      {/* Hobbies */}
      {profile.hobbies && (
        <Section title="趣味・特技">
          <p className="text-sm whitespace-pre-wrap">{profile.hobbies}</p>
        </Section>
      )}
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <tr>
      <th className="text-left text-gray-500 pr-4 py-1 whitespace-nowrap align-top">
        {label}
      </th>
      <td className="py-1">{value}</td>
    </tr>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 pb-6">
      <h3 className="text-lg font-bold mb-3 pb-1 border-b border-gray-300">
        {title}
      </h3>
      {children}
    </div>
  );
}

function HistoryTable({
  label,
  entries,
}: {
  label: string;
  entries: EducationWorkEntry[];
}) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-500 mb-1">{label}</h4>
      <table className="w-full text-sm">
        <tbody>
          {entries.map((entry, i) => (
            <tr key={i}>
              <td className="py-1 pr-4 whitespace-nowrap text-gray-600 align-top w-28">
                {entry.date}
              </td>
              <td className="py-1">{entry.content}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CertRow({ cert }: { cert: CertificationEntry }) {
  return (
    <tr>
      <td className="py-1 pr-4 whitespace-nowrap text-gray-600 align-top w-28">
        {cert.date}
      </td>
      <td className="py-1">{cert.name}</td>
    </tr>
  );
}
