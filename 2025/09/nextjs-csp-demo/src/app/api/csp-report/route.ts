import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // CSP違反レポートをログに出力
    console.log('CSP Violation Report:', JSON.stringify(body, null, 2));
    
    // 本来はここでログファイルやデータベースに保存
    
    return NextResponse.json({ status: 'received' }, { status: 200 });
  } catch (error) {
    console.error('Error processing CSP report:', error);
    return NextResponse.json({ error: 'Invalid report format' }, { status: 400 });
  }
}
