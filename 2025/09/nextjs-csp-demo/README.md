# Content Security Policy (CSP) 脆弱性デモ

このプロジェクトは、Content Security Policy (CSP) の効果を実際に体験できるデモアプリケーションです。各脆弱性について、CSP有効・無効の2つのページを比較することで、CSPがいかに効果的にセキュリティ脅威から保護するかを学習できます。

## 🎯 学習目標

- Content Security Policy (CSP) の基本概念を理解する
- 代表的なWeb脆弱性とCSPによる対策効果を体験する
- CSPの各ディレクティブの役割と設定方法を学ぶ
- セキュアなWebアプリケーション開発のベストプラクティスを習得する

## 🔧 技術スタック

- **Framework**: Next.js 15.5 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Runtime**: Node.js

## 📝 デモ対象の脆弱性

1. **クロスサイトスクリプティング（XSS）攻撃**
   - 悪意のあるスクリプトが実行される脆弱性
   - CSP: `script-src 'self' 'nonce-xxx'` による保護

2. **データインジェクション攻撃**
   - eval()やFunction()による動的コード実行
   - CSP: `script-src` での `'unsafe-eval'` 除外による保護

3. **クリックジャッキング攻撃**
   - 透明なフレームで騙すクリック詐欺
   - CSP: `frame-ancestors 'self'` による保護

4. **不正な外部リソースの読み込み**
   - 悪意のあるスクリプト・追跡ピクセルの読み込み
   - CSP: `script-src`, `img-src` による制限

5. **HTTPS混在コンテンツ（Mixed Content）**
   - HTTPSサイトでHTTPリソースを読み込む問題
   - CSP: `upgrade-insecure-requests` による自動HTTPS化

6. **フレーム埋め込み制御**
   - iframeによる不正な埋め込み
   - CSP: `frame-src` による制限

7. **インラインスクリプト・evalの禁止**
   - 危険なインラインスクリプトやeval()の実行
   - CSP: `'unsafe-inline'`, `'unsafe-eval'` の除外

8. **コンテンツインジェクション**
   - 不正なHTMLコンテンツの注入
   - CSP: 複数ディレクティブによる包括的保護

## 🚀 セットアップ

### 前提条件

- Node.js 18以上
- pnpm（推奨）または npm

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd nextjs-csp-demo

# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

ブラウザで `http://localhost:3000` にアクセスしてデモを開始してください。

## 🔒 CSP設定の詳細

このデモアプリケーションでは、Next.jsのミドルウェアを使用してCSPヘッダーを設定しています。

### 適用されるCSP設定

```
default-src 'self';
script-src 'self' 'nonce-{random}' 'strict-dynamic';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self';
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'self';
upgrade-insecure-requests;
block-all-mixed-content;
report-uri /api/csp-report
```

### 各ディレクティブの説明

- **default-src**: 他のディレクティブで明示されていないリソースのデフォルトポリシー
- **script-src**: JavaScriptの実行を制御
- **style-src**: CSSの読み込みと実行を制御  
- **img-src**: 画像リソースの読み込みを制御
- **frame-src**: iframeの埋め込みを制御
- **object-src**: オブジェクト要素（Flash等）の埋め込みを制御
- **upgrade-insecure-requests**: HTTPリクエストをHTTPSに自動アップグレード
- **frame-ancestors**: このページのiframe埋め込みを制御
- **report-uri**: CSP違反レポートの送信先

## 📊 CSP違反レポート

CSP違反が発生した場合、`/api/csp-report` エンドポイントにレポートが送信されます。実際の本番環境では、これらのレポートを分析してセキュリティ問題を特定します。

## 🧪 テスト方法

1. **ホームページ**から各脆弱性のデモにアクセス
2. **CSP無効版**で攻撃が実行される様子を確認
3. **CSP有効版**で同じ攻撃がブロックされることを確認
4. **ブラウザ開発者ツール**のConsoleでCSP違反エラーを確認
5. **Networkタブ**でブロックされたリクエストを確認

## 📚 学習リソース

### CSP関連の公式ドキュメント
- [MDN - Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Level 3 Specification](https://www.w3.org/TR/CSP3/)
- [Google Web Fundamentals - CSP](https://web.dev/csp/)

### セキュリティベストプラクティス
- [OWASP - Content Security Policy](https://owasp.org/www-community/controls/Content_Security_Policy)
- [CSP Evaluator by Google](https://csp-evaluator.withgoogle.com/)

## ⚠️ 注意事項

- このアプリケーションは**教育目的のみ**で作成されています
- 実際の攻撃コードは含まれていませんが、脆弱性のパターンを再現しています
- 本番環境では、より厳格なCSP設定と入力検証を実装してください
- CSPは**Defense in Depth**の一部として使用し、他のセキュリティ対策と組み合わせてください

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します。セキュリティに関する問題を発見した場合は、責任ある開示をお願いします。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🔗 関連プロジェクト

- [DOMPurify](https://github.com/cure53/DOMPurify) - HTMLサニタイザー
- [helmet](https://helmetjs.github.io/) - セキュリティヘッダー設定ライブラリ
- [CSP Hash Generator](https://report-uri.com/home/hash) - CSPハッシュ生成ツール
