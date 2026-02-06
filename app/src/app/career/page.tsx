import { fetchCareer } from "@/lib/notion";
import { renderBlocks } from "@/lib/notion-renderer";

export default async function CareerPage() {
  const entries = await fetchCareer();

  if (entries.length === 0) {
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
                {entry.period && (
                  <div>
                    <span className="text-gray-500">在籍期間：</span>
                    {entry.period}
                  </div>
                )}
                {entry.employmentType && (
                  <div>
                    <span className="text-gray-500">雇用形態：</span>
                    {entry.employmentType}
                  </div>
                )}
                {entry.position && (
                  <div>
                    <span className="text-gray-500">役職：</span>
                    {entry.position}
                  </div>
                )}
                {entry.employeeCount && (
                  <div>
                    <span className="text-gray-500">従業員数：</span>
                    {entry.employeeCount}
                  </div>
                )}
                {entry.businessDescription && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">事業内容：</span>
                    {entry.businessDescription}
                  </div>
                )}
              </div>
            </div>

            {/* Notion blocks content */}
            <div
              dangerouslySetInnerHTML={{
                __html: renderBlocks(entry.blocks),
              }}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
