# Supabase セットアップガイド

The ShelfのSupabase接続手順です。

## 1. Supabaseプロジェクト作成

1. [Supabase](https://supabase.com) にアクセスしてアカウント作成/ログイン
2. 「New Project」をクリック
3. プロジェクト名を入力（例: `challenger-showcase`）
4. データベースパスワードを設定（安全な場所に保存）
5. リージョンを選択（日本なら `Northeast Asia (Tokyo)` を推奨）
6. 「Create new project」をクリック

## 2. 環境変数の設定

### 認証情報の取得

1. Supabaseダッシュボードで「Settings」→「API」を開く
2. 以下の値をコピー：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### .env.local の設定

プロジェクトルートの `.env.local` を編集：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. データベースセットアップ

### SQLエディタでマイグレーション実行

Supabaseダッシュボードの「SQL Editor」で以下のファイルを順番に実行：

1. **001_initial_schema.sql** - テーブル作成
2. **002_rls_policies.sql** - セキュリティポリシー設定
3. **003_seed_data.sql** - 初期データ投入

各ファイルは `supabase/migrations/` フォルダにあります。

### 実行方法

1. 「SQL Editor」→「New Query」
2. マイグレーションファイルの内容をコピー&ペースト
3. 「Run」をクリック
4. 順番に3つすべて実行

### 確認

```sql
-- テーブル確認
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- データ確認
SELECT COUNT(*) FROM factories;  -- 8件
SELECT COUNT(*) FROM genres;     -- 7件
SELECT COUNT(*) FROM owner_picks; -- 3件
```

## 4. 動作確認

### 開発サーバー起動

```bash
npm run dev
```

### 確認ポイント

- [ ] ページが表示される
- [ ] 工房一覧が8件表示される
- [ ] ジャンルフィルタが動作する
- [ ] ソート（新着順/名前順/ランダム）が動作する
- [ ] 工房カードをクリックすると詳細モーダルが開く
- [ ] 店主のおすすめセクションが表示される

### コンソール確認

ブラウザの開発者ツールでコンソールを確認：
- `Supabase not configured, using static data` → Supabase未接続（静的データ使用中）
- エラーなし → Supabase接続成功

## 5. トラブルシューティング

### 「Failed to fetch」エラー

- `.env.local` の値が正しいか確認
- Supabaseプロジェクトが起動しているか確認
- RLSポリシーが正しく設定されているか確認

### データが表示されない

```sql
-- RLSポリシー確認
SELECT * FROM pg_policies WHERE tablename = 'factories';

-- データ確認
SELECT * FROM factories LIMIT 1;
```

### ジャンルフィルタが動作しない

```sql
-- genresテーブル確認
SELECT * FROM genres;

-- factories.genre_idがNULLでないか確認
SELECT id, name, genre_id FROM factories;
```

## 6. 本番デプロイ

### Vercelデプロイ

1. Vercelにプロジェクトをインポート
2. 環境変数を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. デプロイ

### Supabase本番設定

1. 「Settings」→「API」→「JWT Settings」でJWTの有効期限を確認
2. 必要に応じてカスタムドメインを設定

## テーブル構成

| テーブル | 説明 |
|---------|------|
| `users` | ユーザー情報 |
| `genres` | ジャンルマスタ |
| `factories` | 工房情報 |
| `works` | 作品ポートフォリオ |
| `featured_factories` | 注目工房（月別） |
| `owner_picks` | 店主のおすすめ |

## 次のステップ

- [ ] Google OAuth認証の実装
- [ ] 画像アップロード機能（Supabase Storage）
- [ ] 工房登録フォームの実装
- [ ] 管理画面の構築
