import { fetchResume } from "@/lib/notion";
import { renderBlocks } from "@/lib/notion-renderer";

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

  const { profile, blocks } = data;
  const blocksHtml = renderBlocks(blocks);

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-center mb-1">履歴書</h1>
      </div>

      {/* Profile */}
      <div className="p-6">
        <div className="flex gap-6">
          {/* Photo */}
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

          {/* Basic info */}
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-0.5">{profile.furigana}</p>
            <h2 className="text-2xl font-bold mb-4">{profile.name}</h2>

            <table className="text-sm w-full">
              <tbody>
                {profile.birthDate && (
                  <tr>
                    <th className="text-left text-gray-500 pr-4 py-1 whitespace-nowrap align-top">
                      生年月日
                    </th>
                    <td className="py-1">{profile.birthDate}</td>
                  </tr>
                )}
                {profile.address && (
                  <tr>
                    <th className="text-left text-gray-500 pr-4 py-1 whitespace-nowrap align-top">
                      住所
                    </th>
                    <td className="py-1">{profile.address}</td>
                  </tr>
                )}
                {profile.nearestStation && (
                  <tr>
                    <th className="text-left text-gray-500 pr-4 py-1 whitespace-nowrap align-top">
                      最寄り駅
                    </th>
                    <td className="py-1">{profile.nearestStation}</td>
                  </tr>
                )}
                {profile.phone && (
                  <tr>
                    <th className="text-left text-gray-500 pr-4 py-1 whitespace-nowrap align-top">
                      電話番号
                    </th>
                    <td className="py-1">{profile.phone}</td>
                  </tr>
                )}
                {profile.email && (
                  <tr>
                    <th className="text-left text-gray-500 pr-4 py-1 whitespace-nowrap align-top">
                      メールアドレス
                    </th>
                    <td className="py-1">{profile.email}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Body from Notion blocks */}
      <div className="px-6 pb-8">
        <div dangerouslySetInnerHTML={{ __html: blocksHtml }} />
      </div>
    </div>
  );
}
