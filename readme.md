# CW Follow-up Email Automation

nocall.aiからのWebhookを受信して、自動でフォローアップメールを送信するGoogle Apps Script。

## 機能

- nocall.ai Webhook受信・フォローアップメール自動送信
- 職歴提出状況・目標達成度による4パターンのメール送信制御
- パーソナライズされた動的コンテンツ生成

## セットアップ

```bash
npm install -g @google/clasp
clasp login
clasp create --title "CW Follow-up Emailv2"
clasp push
```

Apps Scriptエディタでウェブアプリとしてデプロイし、WebhookエンドポイントURLをnocall.aiに登録。

## メール送信ルール

前提: `agent.id` が `430` の場合にのみ送信処理を行います。それ以外の `agent.id` は処理をスキップし、メールは送信されません。

4つのパターンでメール送信を制御：

1. **`shokureki`が"未提出" + `goalStatus`が"achieved"** → 標準テンプレート（`emailContents.md`）
2. **`shokureki`が"未提出" + `goalStatus`が"未達成"** → 未提出用テンプレート（`emailContentsUnsubmitted.md`）
3. **`shokureki`が"提出済み" + `goalStatus`が"achieved"** → 提出済み用テンプレート（`emailContentdSubmitted.md`）
4. **`shokureki`が"提出済み" + `goalStatus`が"未達成"** → **メール送信なし**

## メールテンプレート

### 標準テンプレート (`emailContents.md`)
未提出 + 目標達成時に使用：
- パーソナライズされた挨拶
- **目標結果をそのまま表示した確定面談詳細**
- 職歴情報提出リンク
- 参考資料・連絡先

### 未提出テンプレート (`emailContentsUnsubmitted.md`)
未提出 + 目標未達成時に使用：
- パーソナライズされた挨拶
- 職歴情報提出要求に焦点
- 職歴情報提出リンク
- 参考資料・連絡先

### 提出済みテンプレート (`emailContentdSubmitted.md`)
提出済み + 目標達成時に使用：
- パーソナライズされた挨拶
- **目標結果をそのまま表示した確定面談詳細**
- 職歴情報提出リンクなし（既に提出済み）
- 連絡先情報

## メール設定

- **送信者**: `crowdworks@nocall.ai`
- **送信者名**: "クラウドワークス エージェント テック本部事務局"
- **Reply-To**: `crowdworks@nocall.ai`
- **CC先**: `career-crowdtech@crowdtech.jp`, `marie.terao@crowdworks.co.jp`, `ittetsu.yao@crowdworks.co.jp`

## テスト

```javascript
testWebhook()      // Webhook処理テスト
testSimpleEmail()  // メール送信テスト
```