import { describe, test, expect } from 'vitest';
import { extractCallbackUrl, extractRelativeCallbackUrl, extractAllowedCallbackUrl } from './main.js';

describe('extractCallbackUrl', () => {
	test.each([
		['https://myapp.com/protected', 'https://myapp.com/protected', '正常なコールバックURL'],
		['https://myapp.com/user/profile', 'https://myapp.com/user/profile', 'ネストされたパス'],
		['https://myapp.com/api/v1/data?param=value', 'https://myapp.com/api/v1/data?param=value', 'クエリパラメータ付き'],
		['https://myapp.com/page#section', 'https://myapp.com/page#section', 'フラグメント付き']
	])('callbackUrl=%s の場合、%s を返す (%s)', (callbackUrl, expected) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractCallbackUrl(accessUrl);
		
		expect(result).toBe(expected);
	});
  
	test('コールバックURLパラメータが存在しない場合はnullを返す', () => {
		const accessUrl = new URL("https://myapp.com");
		const result = extractCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	test.each([
		['https://evil.com/malicious', '異なるオリジンのコールバックURL'],
		['https://myapp.com:8080/page', 'ポートが異なる場合'],
		['http://myapp.com/page', 'プロトコルが異なる場合'],
		['https://sub.myapp.com/page', 'サブドメインが異なる場合'],
		['://invalid', '不正なURLフォーマット']
	])('callbackUrl=%s を使用した場合、%s は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// Open Redirect攻撃パターンのテストケース
	test.each([
		['//evil.com/malicious', 'ネットワークパス（プロトコル相対URL）攻撃'],
		['///evil.com/malicious', 'トリプルスラッシュ攻撃'],
		['\\\\evil.com\\malicious', 'バックスラッシュエスケープ攻撃'],
		['/\\evil.com/malicious', 'スラッシュ＋バックスラッシュ攻撃'],
		['javascript:alert("XSS")', 'JavaScript擬似プロトコル攻撃'],
		['data:text/html,<script>alert("XSS")</script>', 'Data URI攻撃'],
		['vbscript:msgbox("XSS")', 'VBScript擬似プロトコル攻撃'],
		['file:///etc/passwd', 'File プロトコル攻撃'],
		['ftp://evil.com/malicious', 'FTP プロトコル攻撃'],
		['https://myapp.com.evil.com/malicious', 'ドメイン偽装攻撃'],
		['https://myapp-com.evil.com/malicious', 'ハイフンを使ったドメイン偽装'],
		['https://myapp.com@evil.com/malicious', 'ユーザー情報を使った攻撃'],
		['https://evil.com/malicious?myapp.com', 'クエリパラメータでの偽装'],
		['https://evil.com/malicious#myapp.com', 'フラグメントでの偽装'],
		['https://127.0.0.1:8080/admin', 'ローカルホストへの攻撃'],
		['https://localhost:3000/admin', 'localhostへの攻撃'],
		['https://[::1]:8080/admin', 'IPv6ローカルホスト攻撃'],
		['https://192.168.1.1/admin', 'プライベートIPアドレス攻撃'],
		['https://10.0.0.1/admin', 'RFC1918プライベートIP攻撃'],
		['https://172.16.0.1/admin', 'RFC1918プライベートIP攻撃2'],
		['https://169.254.1.1/metadata', 'リンクローカルアドレス攻撃'],
		['https://myapp.com../evil.com', 'ディレクトリトラバーサル風攻撃'],
		['https://myapp.com%2eevil.com', 'URLエンコードを使った攻撃'],
		['https://myapp.com%00.evil.com', 'ヌルバイト攻撃'],
		['https://myapp.com\uFF0Eevil.com', 'Unicode攻撃'],
		['https://myapp.com\u3002evil.com', 'Unicode正規化攻撃'],
		['https://еvil.com/malicious', 'IDN同形異義語攻撃（キリル文字）'],
		['https://mуapp.com/evil', 'キリル文字でのドメイン偽装'],
		['https://EVIL.COM/MALICIOUS', '大文字での攻撃'],
		['HtTpS://EvIl.CoM/MaLiCiOuS', '大文字小文字混在攻撃']
	])('Open Redirect攻撃: callbackUrl=%s (%s) は拒否する', (callbackUrl, description) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	test.each([
		['/secure-page', '相対パスのコールバックURL'],
		['https://myapp.com/page?param=value', '同じオリジンでクエリパラメータを含むURL'],
		['https://myapp.com/page#section', '同じオリジンでフラグメントを含むURL'],
		['invalid-url', '相対パスとして解釈される文字列']
	])('callbackUrl=%s を使用した場合、%s は許可する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractCallbackUrl(accessUrl);
		
		expect(result).toBe(callbackUrl);
	});

	// より複雑なOpen Redirect攻撃パターン
	test.each([
		['https://myapp.com:443/../../../evil.com', 'パストラバーサル攻撃'],
		['https://myapp.com:443/..\\..\\..\\evil.com', 'Windowsパストラバーサル攻撃'],
		['https://user:pass@evil.com', 'ユーザー認証情報を含む攻撃'],
		['https://myapp.com%2f@evil.com', 'URLエンコードスラッシュ攻撃'],
		['https://myapp.com%252f@evil.com', '二重URLエンコード攻撃'],
		['https://myapp.com%25252f@evil.com', '三重URLエンコード攻撃'],
		['https://evil.com#myapp.com', 'フラグメントでの正当サイト偽装'],
		['https://evil.com/redirect?url=myapp.com', 'リダイレクトチェーン攻撃'],
		['https://myapp.com.example.evil.com', '長いサブドメイン偽装'],
		['https://myapp.com-secure.evil.com', 'セキュア風サブドメイン偽装']
	])('高度なOpen Redirect攻撃: callbackUrl=%s は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// SSRF (Server-Side Request Forgery) 関連の攻撃パターン
	test.each([
		['https://metadata.google.internal/computeMetadata/v1/', 'Google Cloud metadata攻撃'],
		['https://169.254.169.254/latest/meta-data/', 'AWS metadata攻撃'],
		['https://168.63.129.16/metadata/', 'Azure metadata攻撃'],
		['https://0.0.0.0:22/ssh', 'ゼロIP攻撃'],
		['https://127.1:8080/admin', '省略形ローカルホスト攻撃'],
		['https://[0:0:0:0:0:0:0:1]:8080/admin', 'IPv6完全形ローカルホスト攻撃'],
		['https://0x7f000001:8080/admin', '16進数ローカルホスト攻撃'],
		['https://2130706433:8080/admin', '10進数ローカルホスト攻撃'],
		['https://017700000001:8080/admin', '8進数ローカルホスト攻撃']
	])('SSRF攻撃パターン: callbackUrl=%s は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// 新しく追加されたセキュリティチェックのテスト
	test.each([
		['', '空文字列'],
		['   ', '空白のみ'],
		['/path\0evil', 'ヌルバイト'],
		['/path%00evil', 'URLエンコードされたヌルバイト'],
		['/path\x01evil', '制御文字SOH'],
		['/path\x1fevil', '制御文字US'],
		['/path\x7fevil', '制御文字DEL'],
		['/path\x80evil', '拡張ASCII制御文字']
	])('基本的なセキュリティチェック: callbackUrl=%s (%s) は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	test.each([
		['\\evil\\path', 'Windowsパス形式'],
		['/path\\evil', '混在スラッシュ'],
		['\\\\evil\\malicious', 'UNCパス形式']
	])('バックスラッシュ攻撃: callbackUrl=%s (%s) は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	test.each([
		['javascript:alert("XSS")', 'JavaScript擬似プロトコル'],
		['data:text/html,<script>alert("XSS")</script>', 'Data URI'],
		['vbscript:msgbox("XSS")', 'VBScript擬似プロトコル'],
		['file:///etc/passwd', 'File プロトコル'],
		['ftp://evil.com/malicious', 'FTP プロトコル'],
		['mailto:admin@evil.com', 'Mailto プロトコル'],
		['tel:+1234567890', 'Tel プロトコル'],
		['chrome://settings/', 'Chrome内部プロトコル'],
		['chrome-extension://abc123/popup.html', 'Chrome拡張プロトコル']
	])('危険なプロトコル: callbackUrl=%s (%s) は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	test.each([
		['https://myapp.com/path%2finjection', 'エンコードされたスラッシュ'],
		['https://myapp.com/path%5cinjection', 'エンコードされたバックスラッシュ'],
		['https://myapp.com/path%2einjection', 'エンコードされたドット'],
		['https://myapp.com/path%40injection', 'エンコードされた@'],
		['https://myapp.com/path%3ainjection', 'エンコードされたコロン']
	])('URLエンコード攻撃: callbackUrl=%s (%s) は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	test('DoS攻撃（長すぎるURL）は拒否する', () => {
		const longUrl = 'https://myapp.com/path' + 'a'.repeat(2050);
		const encoded = encodeURIComponent(longUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	test('正常な長さのURLは許可する', () => {
		const normalUrl = 'https://myapp.com/path' + 'a'.repeat(100);
		const encoded = encodeURIComponent(normalUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractCallbackUrl(accessUrl);
		
		expect(result).toBe(normalUrl);
	});

	// ポート番号テスト
	test.each([
		['https://myapp.com:8080/path', 'HTTPSの非標準ポート'],
		['http://myapp.com:3000/path', 'HTTPの非標準ポート'],
		['https://myapp.com:22/path', 'SSHポート'],
		['https://myapp.com:21/path', 'FTPポート']
	])('非標準ポート: callbackUrl=%s (%s) は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// 標準ポートは許可
	test.each([
		['https://myapp.com:443/path', 'HTTPS標準ポート'],
		['http://myapp.com:80/path', 'HTTP標準ポート（HTTPSサイトからは通常拒否されるが、テスト用）']
	])('標準ポート: callbackUrl=%s (%s)', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractCallbackUrl(accessUrl);
		
		// プロトコルが異なる場合は拒否される
		if (callbackUrl.startsWith('http://')) {
			expect(result).toBe(null);
		} else {
			expect(result).toBe(callbackUrl);
		}
	});
});

describe('extractRelativeCallbackUrl', () => {
	test.each([
		['/secure-page', '/secure-page', '基本的な絶対パス'],
		['/user/profile', '/user/profile', 'ネストされた絶対パス'],
		['dashboard', 'dashboard', '相対パス（ファイル名のみ）'],
		['admin/settings', 'admin/settings', '相対パス（ディレクトリ付き）'],
		['/api/v1/users?id=123', '/api/v1/users?id=123', 'クエリパラメータ付きパス'],
		['/page#section', '/page#section', 'フラグメント付きパス'],
		['', null, '空文字列は拒否'],
		['   ', null, '空白のみは拒否']
	])('callbackUrl=%s の場合、%s を返す (%s)', (callbackUrl, expected, description) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractRelativeCallbackUrl(accessUrl);
		
		expect(result).toBe(expected);
	});

	test('コールバックURLパラメータが存在しない場合はnullを返す', () => {
		const accessUrl = new URL("https://myapp.com");
		const result = extractRelativeCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// 絶対URL形式の拒否テスト
	test.each([
		['https://evil.com/malicious', 'HTTPS絶対URL'],
		['http://evil.com/malicious', 'HTTP絶対URL'],
		['ftp://evil.com/file', 'FTP絶対URL'],
		['file:///etc/passwd', 'File絶対URL'],
		['javascript:alert("XSS")', 'JavaScript擬似プロトコル'],
		['data:text/html,<script>alert("XSS")</script>', 'Data URI'],
		['mailto:admin@evil.com', 'Mailto URL'],
		['tel:+1234567890', 'Tel URL']
	])('絶対URL: callbackUrl=%s (%s) は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractRelativeCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// プロトコル相対URL攻撃
	test.each([
		['//evil.com/malicious', 'プロトコル相対URL'],
		['///evil.com/malicious', 'トリプルスラッシュ'],
		['////evil.com/malicious', '4つのスラッシュ']
	])('プロトコル相対URL攻撃: callbackUrl=%s (%s) は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractRelativeCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// URLエンコード攻撃（相対パス専用）
	test.each([
		['%2e%2e/evil', 'エンコードされたパストラバーサル'],
		['%2f%2fexample.com', 'エンコードされたプロトコル相対URL'],
		['path%40evil.com', 'エンコードされた@'],
		['/path%00evil', 'エンコードされたヌルバイト'],
		['%2e%2e%2fevil', '複数エンコードされたパストラバーサル'],
		['%2f%2f%2fexample.com', '複数エンコードされたプロトコル相対URL']
	])('URLエンコード攻撃: callbackUrl=%s (%s) は拒否する', (callbackUrl) => {
		// エンコード済みのURLをそのまま使用（二重エンコードを避ける）
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${callbackUrl}`);
		const result = extractRelativeCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// パストラバーサル攻撃
	test.each([
		['../evil', 'シンプルなパストラバーサル'],
		['../../evil', '2レベルのパストラバーサル'],
		['../../../evil', '3レベルのパストラバーサル'],
		['/legitimate/../evil', '正当パス内のパストラバーサル'],
		['./../../evil', 'カレントディレクトリを含むパストラバーサル'],
		['admin/../../evil', 'ディレクトリ経由のパストラバーサル']
	])('パストラバーサル攻撃: callbackUrl=%s (%s) は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractRelativeCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// バックスラッシュ攻撃（Windows形式）
	test.each([
		['\\evil\\path', 'Windowsパス形式'],
		['/path\\evil', '混在スラッシュ1'],
		['\\\\evil\\malicious', 'UNCパス形式'],
		['path/to\\evil', '混在スラッシュ2']
	])('バックスラッシュ攻撃: callbackUrl=%s (%s) は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractRelativeCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// ユーザー情報攻撃
	test.each([
		['user@evil.com/path', 'ユーザー名付きURL'],
		['user:pass@evil.com', 'ユーザー名とパスワード付きURL'],
		['/path?param=user@evil.com', 'クエリパラメータ内のユーザー情報']
	])('ユーザー情報攻撃: callbackUrl=%s (%s) は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractRelativeCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// ヌルバイト攻撃
	test.each([
		['/path\0evil', 'ヌルバイト'],
		['/path%00evil', 'URLエンコードされたヌルバイト'],
		['/legitimate%00.evil.com', 'ヌルバイトによるドメイン偽装']
	])('ヌルバイト攻撃: callbackUrl=%s (%s) は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractRelativeCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// 制御文字攻撃
	test.each([
		['/path\x01evil', '制御文字SOH'],
		['/path\x1fevil', '制御文字US'],
		['/path\x7fevil', '制御文字DEL'],
		['/path\x80evil', '拡張ASCII制御文字']
	])('制御文字攻撃: callbackUrl=%s (%s) は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractRelativeCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// 特殊な開始文字攻撃
	test.each([
		[':evil', 'コロンから開始'],
		['?evil', 'クエスチョンマークから開始'],
		['#evil', 'ハッシュから開始'],
		['.evil', 'ドットから開始'],
		['-evil', 'ハイフンから開始']
	])('特殊開始文字攻撃: callbackUrl=%s (%s) は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractRelativeCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// DoS攻撃（長すぎるパス）
	test('長すぎるパスはDoS攻撃として拒否する', () => {
		const longPath = '/path' + 'a'.repeat(2050); // 2048文字を超える
		const encoded = encodeURIComponent(longPath);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractRelativeCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// 正常な長さのパスは許可
	test('正常な長さのパスは許可する', () => {
		const normalPath = '/path' + 'a'.repeat(100); // 正常な長さ
		const encoded = encodeURIComponent(normalPath);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractRelativeCallbackUrl(accessUrl);
		
		expect(result).toBe(normalPath);
	});

	// 正常な相対パスパターン
	test.each([
		['/admin/dashboard', '管理者ダッシュボード'],
		['/user/123/profile', 'ユーザープロファイル'],
		['/api/v1/data.json', 'API エンドポイント'],
		['search?q=term', '検索ページ'],
		['docs/guide.html', 'ドキュメント'],
		['images/logo.png', '画像ファイル'],
		['/reports/2024/01/summary', '深い階層のパス'],
		['/callback?state=abc123&code=xyz789', 'OAuth コールバック風']
	])('正常な相対パス: callbackUrl=%s (%s) は許可する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractRelativeCallbackUrl(accessUrl);
		
		expect(result).toBe(callbackUrl);
	});
});

describe('extractAllowedCallbackUrl', () => {
	// 許可されたパスのテスト
	test.each([
		['/protected', '/protected', '基本的な許可されたパス'],
		['/dashboard', '/dashboard', 'ダッシュボードパス'],
		['/profile', '/profile', 'プロファイルパス'],
		['/settings', '/settings', '設定パス']
	])('許可されたパス: callbackUrl=%s の場合、%s を返す (%s)', (callbackUrl, expected) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractAllowedCallbackUrl(accessUrl);
		
		expect(result).toBe(expected);
	});

	// クエリパラメータとフラグメント付きの許可されたパス
	test.each([
		['/protected?token=abc123', '/protected?token=abc123', 'クエリパラメータ付き'],
		['/dashboard#section1', '/dashboard#section1', 'フラグメント付き'],
		['/profile?id=123&edit=true', '/profile?id=123&edit=true', '複数クエリパラメータ'],
		['/settings?tab=security#password', '/settings?tab=security#password', 'クエリ＋フラグメント']
	])('許可されたパス（パラメータ付き）: callbackUrl=%s の場合、%s を返す (%s)', (callbackUrl, expected) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractAllowedCallbackUrl(accessUrl);
		
		expect(result).toBe(expected);
	});

	// 許可されていないパス
	test.each([
		['/admin', '許可されていない管理者パス'],
		['/secret', '許可されていない秘密パス'],
		['/protected/admin', '許可されたパスのサブパス'],
		['/dashboard/evil', 'ダッシュボードの悪意あるサブパス'],
		['/profileedit', '許可されたパスに似た文字列'],
		['protected', 'スラッシュなしの許可されたパス風'],
		['/settings/delete', '設定の危険なサブパス']
	])('許可されていないパス: callbackUrl=%s (%s) は拒否する', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractAllowedCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// 全ての攻撃パターンが拒否されることを確認（自動的に拒否される）
	test.each([
		['//evil.com/malicious', 'プロトコル相対URL攻撃'],
		['../../../etc/passwd', 'パストラバーサル攻撃'],
		['javascript:alert("XSS")', 'JavaScript擬似プロトコル'],
		['https://evil.com/malicious', '絶対URL攻撃'],
		['/protected/../admin', 'パストラバーサル経由の攻撃'],
		['%2e%2e/evil', 'URLエンコード攻撃'],
		['/protected@evil.com', 'ユーザー情報攻撃']
	])('攻撃パターン: callbackUrl=%s (%s) は自動的に拒否される', (callbackUrl) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractAllowedCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// エッジケース
	test.each([
		['', '空文字列'],
		['   ', '空白のみ'],
		['/protected ', '末尾に空白（trimで除去されて一致）']
	])('エッジケース: callbackUrl=%s (%s)', (callbackUrl, description) => {
		const encoded = encodeURIComponent(callbackUrl);
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractAllowedCallbackUrl(accessUrl);
		
		if (description.includes('末尾に空白')) {
			expect(result).toBe('/protected'); // trimされて一致
		} else {
			expect(result).toBe(null);
		}
	});

	// カスタム許可リストのテスト
	test('カスタム許可リストを使用した場合', () => {
		const customAllowedPaths = ['/custom1', '/custom2'];
		const encoded = encodeURIComponent('/custom1');
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractAllowedCallbackUrl(accessUrl, customAllowedPaths);
		
		expect(result).toBe('/custom1');
	});

	test('デフォルトパスがカスタムリストで拒否される', () => {
		const customAllowedPaths = ['/custom1', '/custom2'];
		const encoded = encodeURIComponent('/protected');
		const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
		const result = extractAllowedCallbackUrl(accessUrl, customAllowedPaths);
		
		expect(result).toBe(null);
	});

	test('コールバックURLパラメータが存在しない場合はnullを返す', () => {
		const accessUrl = new URL("https://myapp.com");
		const result = extractAllowedCallbackUrl(accessUrl);
		
		expect(result).toBe(null);
	});

	// 絶対パス（絶対URL）のテストケースを追加
	describe('絶対URL形式のテスト', () => {
		// 許可リストを絶対URL形式に変更してテスト
		const absoluteAllowedPaths = [
			'https://myapp.com/protected',
			'https://myapp.com/dashboard',
			'https://myapp.com/profile',
			'https://myapp.com/settings'
		];

		test.each([
			['https://myapp.com/protected', 'https://myapp.com/protected', '基本的な許可された絶対URL'],
			['https://myapp.com/dashboard', 'https://myapp.com/dashboard', 'ダッシュボード絶対URL'],
			['https://myapp.com/profile', 'https://myapp.com/profile', 'プロファイル絶対URL'],
			['https://myapp.com/settings', 'https://myapp.com/settings', '設定絶対URL']
		])('許可された絶対URL: callbackUrl=%s の場合、%s を返す (%s)', (callbackUrl, expected) => {
			const encoded = encodeURIComponent(callbackUrl);
			const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
			const result = extractAllowedCallbackUrl(accessUrl, absoluteAllowedPaths);
			
			expect(result).toBe(expected);
		});

		// クエリパラメータとフラグメント付きの絶対URL
		test.each([
			['https://myapp.com/protected?token=abc123', 'https://myapp.com/protected?token=abc123', '絶対URLクエリパラメータ付き'],
			['https://myapp.com/dashboard#section1', 'https://myapp.com/dashboard#section1', '絶対URLフラグメント付き'],
			['https://myapp.com/profile?id=123&edit=true', 'https://myapp.com/profile?id=123&edit=true', '絶対URL複数クエリパラメータ'],
			['https://myapp.com/settings?tab=security#password', 'https://myapp.com/settings?tab=security#password', '絶対URLクエリ＋フラグメント']
		])('許可された絶対URL（パラメータ付き）: callbackUrl=%s の場合、%s を返す (%s)', (callbackUrl, expected) => {
			const encoded = encodeURIComponent(callbackUrl);
			const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
			const result = extractAllowedCallbackUrl(accessUrl, absoluteAllowedPaths);
			
			expect(result).toBe(expected);
		});

		// 許可されていない絶対URL
		test.each([
			['https://myapp.com/admin', '許可されていない管理者絶対URL'],
			['https://evil.com/protected', '悪意あるドメインの絶対URL'],
			['https://myapp.com/protected/admin', '許可された絶対URLのサブパス'],
			['https://myapp.evil.com/protected', 'サブドメイン攻撃'],
			['http://myapp.com/protected', '異なるプロトコル'],
			['https://myapp.com:8080/protected', '異なるポート'],
			['https://MYAPP.COM/protected', '大文字ドメイン']
		])('許可されていない絶対URL: callbackUrl=%s (%s) は拒否する', (callbackUrl) => {
			const encoded = encodeURIComponent(callbackUrl);
			const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
			const result = extractAllowedCallbackUrl(accessUrl, absoluteAllowedPaths);
			
			expect(result).toBe(null);
		});

		// 絶対URLでの攻撃パターン
		test.each([
			['https://evil.com/malicious', '完全に異なるドメイン'],
			['https://myapp.com/protected/../admin', '絶対URLパストラバーサル'],
			['https://myapp.com@evil.com/protected', '絶対URLユーザー情報攻撃'],
			['https://myapp.com/protected%00evil', '絶対URLヌルバイト攻撃']
		])('絶対URL攻撃パターン: callbackUrl=%s (%s) は拒否される', (callbackUrl) => {
			const encoded = encodeURIComponent(callbackUrl);
			const accessUrl = new URL(`https://myapp.com?callbackUrl=${encoded}`);
			const result = extractAllowedCallbackUrl(accessUrl, absoluteAllowedPaths);
			
			expect(result).toBe(null);
		});
	});
});

