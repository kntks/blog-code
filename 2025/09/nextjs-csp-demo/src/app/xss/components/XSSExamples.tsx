import React from 'react';

interface XSSExamplesProps {
  isSecure: boolean;
}

export default function XSSExamples({ isSecure }: XSSExamplesProps) {
  const bgColor = isSecure ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200';
  const titleColor = isSecure ? 'text-green-800' : 'text-yellow-800';
  const textColor = isSecure ? 'text-green-700' : 'text-yellow-700';
  const title = isSecure ? 'CSPによる保護：' : '攻撃のテスト方法：';
  const description = isSecure 
    ? '以下の悪意のあるペイロードを入力しても、CSPにより実行がブロックされます：'
    : '以下のような悪意のあるペイロードを入力してテストします：';

  const examples = [
    {
      title: '1. イメージタグの onerror イベント (動作確認済み):',
      code: `<img src="invalid" onerror="alert('XSS攻撃成功！')">`
    },
    {
      title: '2. リンクの onclick イベント (動作確認済み):',
      code: `<a href="#" onclick="alert('クリックXSS攻撃！')">無害なリンク</a>`
    },
    {
      title: '3. フォームの onsubmit イベント (動作確認済み):',
      code: `<form onsubmit="alert('フォームXSS攻撃！');return false;"><input type="submit" value="送信"></form>`
    },
    {
      title: '4. input の onfocus イベント (動作確認済み):',
      code: `<input type="text" onfocus="alert('フォーカスXSS攻撃！')" autofocus>`
    },
    {
      title: '5. マウスオーバーでの攻撃 (動作確認済み):',
      code: `<div onmouseover="alert('マウスオーバーXSS攻撃！')" style="background:lightblue;padding:10px;">マウスを乗せてください</div>`
    },
    {
      title: '6. Cookie盗取のシミュレーション (動作確認済み):',
      code: `<img src="x" onerror="alert('Cookie: ' + document.cookie)">`
    }
  ];

  if (!isSecure) {
    examples.push({
      title: '7. 偽のログインフォーム (動作確認済み):',
      code: `<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;" onclick="this.style.display='none'"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:20px;border-radius:5px;">セッションが期限切れです<br><input type="text" placeholder="ユーザー名"><br><input type="password" placeholder="パスワード"><br><button onclick="alert('認証情報が盗まれました！')">ログイン</button></div></div>`
    });
  }

  return (
    <div className={`${bgColor} border rounded-lg p-4`}>
      <h3 className={`font-semibold ${titleColor} mb-2`}>{title}</h3>
      <p className={`${textColor} mb-2`}>{description}</p>
      
      <div className="space-y-2">
        {examples.map((example, index) => (
          <div key={index} className="bg-gray-100 p-2 rounded text-sm font-mono">
            <div className="text-gray-600 text-xs mb-1">{example.title}</div>
            {example.code}
          </div>
        ))}
      </div>
      
      <p className={`${textColor} mt-3 text-sm`}>
        {isSecure 
          ? 'これらの攻撃はCSPによりブロックされます。ブラウザの開発者ツール（Console）でCSP違反エラーを確認できます。'
          : '注: 最新のブラウザでは、dangerouslySetInnerHTML経由で挿入された<script>タグやSVGの onload は実行されませんが、HTMLイベントハンドラー（onclick、onerror、onmouseover等）は実行されます。'
        }
      </p>
    </div>
  );
}
