# 履歴書・職務経歴書サイト 構築計画

## ゴール

Notion で管理する履歴書・職務経歴書を GitHub Pages で公開する。

## アーキテクチャ

```
Notion (コンテンツ管理)
  ↓  Notion API
GitHub Actions (ビルドパイプライン)
  ↓  静的サイト生成
GitHub Pages (ホスティング)
```

## フェーズ

### Phase 1: Notion 側の準備

- [ ] 履歴書用の Notion ページ/データベースを作成
- [ ] 職務経歴書用の Notion ページ/データベースを作成
- [ ] Notion Integration (API キー) を作成し、ページへのアクセスを許可

### Phase 2: プロジェクトの基盤構築

- [ ] 静的サイトジェネレータの選定と導入 (候補: Next.js / Astro / Hugo)
- [ ] プロジェクトの初期セットアップ (パッケージ管理、ディレクトリ構成)
- [ ] Notion API からコンテンツを取得するスクリプトの作成
- [ ] 取得したデータを HTML/マークダウンに変換する処理の実装

### Phase 3: サイトのデザイン・実装

- [ ] 履歴書ページのテンプレート作成
- [ ] 職務経歴書ページのテンプレート作成
- [ ] レスポンシブ対応 (PC / スマホ)
- [ ] PDF 出力機能 (印刷用スタイルシート or PDF生成)

### Phase 4: CI/CD パイプライン構築

- [ ] GitHub Secrets に Notion API キーとページ ID を登録
- [ ] GitHub Actions ワークフローの作成 (Notion 取得 → ビルド → デプロイ)
- [ ] GitHub Pages の設定 (リポジトリ Settings で有効化)
- [ ] 定期実行の設定 (cron or 手動トリガー)

### Phase 5: 公開・運用

- [ ] 動作確認・最終調整
- [ ] カスタムドメインの設定 (任意)
- [ ] README の更新 (使い方・運用手順)

## 技術選定メモ

| 項目 | 候補 | 備考 |
|------|------|------|
| 静的サイト生成 | **Astro** / Next.js / Hugo | Astro は軽量で静的サイトに最適 |
| Notion 連携 | **@notionhq/client** (公式SDK) | JavaScript/TypeScript で利用 |
| スタイリング | **Tailwind CSS** / vanilla CSS | 好みに応じて選択 |
| デプロイ | **GitHub Actions** + GitHub Pages | push / スケジュール実行 |

## ブランチ戦略

- `main` — 本番 (GitHub Pages のソース)
- `develop` — 開発統合ブランチ
- `feature/*` — 各フェーズ・機能ごとの作業ブランチ

## 次のアクション

1. 技術スタック (静的サイトジェネレータ等) の確定
2. Notion 側のページ構成を決定
3. Phase 2 のプロジェクト初期セットアップに着手
