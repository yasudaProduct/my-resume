# my-resume

GitHub Pages で公開する履歴書・職務経歴書サイトです。

コンテンツは Notion で管理し、GitHub Pages でホスティングします。

## Next.js を GitHub Pages で公開

- **`basePath` / `assetPrefix` を設定する**
  - Pagesのサブパス配信に合わせて、静的アセットの参照先を `/<repo>/...` に揃えます。
  - このリポジトリでは、GitHub Actions 上（`GITHUB_ACTIONS=true`）のビルド時だけ自動で `/<repo>` を設定するようにしています（`app/next.config.ts`）。

- **静的ホスティングなので `output: "export"` を使う**
  - GitHub Pages では Node サーバーを動かせないため、`next build` で静的HTMLとして出力します。
  - このリポジトリでは `app/out` を Pages にデプロイしています（`.github/workflows/deploy.yml`）。

- **`trailingSlash: true` にしてルーティング事故を減らす**
  - `export` + Pages の組み合わせでは、`/career` と `/career/` の扱いでハマりがちです。
  - `trailingSlash: true` でディレクトリ配信（`career/index.html`）に寄せると安定します。

- **リンクは `next/link` を使う（`<a href="/">` を避ける）**
  - `basePath` 配下で正しいパスに解決されるので、サブパス配信でも遷移が壊れにくいです。

- **`next/image` を使うなら注意**
  - `output: "export"` の場合、画像最適化が使えないので `images.unoptimized: true` が必要です（このリポジトリは対応済み）。

- **ローカルで Pages 配下を擬似再現したいとき**
  - ビルド時に以下を付けると、`/my-resume/_next/...` のように出力されているか確認できます。
    - `GITHUB_ACTIONS=true`
    - `GITHUB_REPOSITORY=<owner>/<repo>`（例: `yasudaproduct/my-resume`）

