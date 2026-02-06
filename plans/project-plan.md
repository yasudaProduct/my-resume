# 履歴書・職務経歴書サイト 構築計画

## ゴール

Notion で管理する履歴書・職務経歴書を GitHub Pages で公開する。

## アーキテクチャ

```
Notion (コンテンツ管理)
  ↓  Notion API
GitHub Actions (ビルドパイプライン)
  ↓  Next.js 静的エクスポート
GitHub Pages (ホスティング)
```

## 技術スタック (確定)

| 項目 | 選定 | 備考 |
|------|------|------|
| フレームワーク | **Next.js** (App Router) | 静的エクスポート (`output: 'export'`) |
| Notion 連携 | **@notionhq/client** | Notion 公式 SDK |
| スタイリング | **Tailwind CSS** | ユーティリティファースト |
| デプロイ | **GitHub Actions** + GitHub Pages | push / 手動 / スケジュール実行 |

## フェーズ

### Phase 1: Notion 側の準備 (ユーザー作業)

- [ ] Notion Integration (API キー) を作成
- [ ] 履歴書用の Notion データベースを作成 (→ notion-structure.md 参照)
- [ ] 職務経歴書用の Notion データベースを作成
- [ ] 各データベースに Integration のアクセスを許可

### Phase 2: プロジェクトの基盤構築

- [x] Next.js + Tailwind CSS の初期セットアップ
- [x] Notion API クライアントの実装
- [x] データ取得・変換処理の実装

### Phase 3: サイトのデザイン・実装

- [x] 履歴書ページのテンプレート作成
- [x] 職務経歴書ページのテンプレート作成
- [x] レスポンシブ対応 (PC / スマホ)
- [x] 印刷用スタイルシート (PDF 出力対応)

### Phase 4: CI/CD パイプライン構築

- [x] GitHub Actions ワークフローの作成
- [ ] GitHub Secrets に Notion API キーとページ ID を登録 (ユーザー作業)
- [ ] GitHub Pages の有効化 (ユーザー作業)

### Phase 5: 公開・運用

- [ ] Notion にサンプルデータを入力して動作確認
- [ ] カスタムドメインの設定 (任意)
- [ ] README の更新

## ブランチ戦略

- `main` — 本番 (GitHub Pages のソース)
- `develop` — 開発統合ブランチ
- `feature/*` — 各フェーズ・機能ごとの作業ブランチ
