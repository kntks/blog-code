import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger.server';

// ダミーのユーザーデータ
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    logger.info('ユーザー一覧取得開始', {
      page,
      limit,
    });

    // ページネーション処理をシミュレート
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    // 処理時間をシミュレート
    await new Promise(resolve => setTimeout(resolve, 100));

    logger.info('ユーザー一覧取得完了', {
      total_users: users.length,
      returned_users: paginatedUsers.length,
      page,
      limit,
    });

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: users.length,
        has_next: endIndex < users.length,
      },
    });
  } catch (error) {
    logger.error('ユーザー一覧取得でエラーが発生', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'ユーザー一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
