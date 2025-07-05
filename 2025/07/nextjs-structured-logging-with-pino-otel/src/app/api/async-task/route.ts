import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger.server';

// 非同期処理のシミュレーション
async function simulateAsyncWork(taskName: string, duration: number) {
  try {
    logger.info(`${taskName} 開始`, {
      task_name: taskName,
      duration_ms: duration,
    });

    // 処理時間をシミュレート
    await new Promise(resolve => setTimeout(resolve, duration));

    // ランダムにエラーを発生させる（10%の確率）
    if (Math.random() < 0.1) {
      throw new Error(`${taskName} でランダムエラーが発生しました`);
    }

    logger.info(`${taskName} 完了`, {
      task_name: taskName,
      duration_ms: duration,
    });

    return { task: taskName, status: 'completed', duration };
  } catch (error) {
    logger.error(`${taskName} でエラーが発生`, {
      task_name: taskName,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tasks = [], parallel = false } = body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      logger.warn('無効なタスク設定', {
        provided_tasks: tasks,
      });
      
      return NextResponse.json(
        { error: 'タスクの配列が必要です' },
        { status: 400 }
      );
    }

    logger.info('非同期タスク実行開始', {
      task_count: tasks.length,
      execution_mode: parallel ? 'parallel' : 'sequential',
      tasks: tasks.map(t => ({ name: t.name, duration: t.duration })),
    });

    const startTime = Date.now();
    let results = [];

    if (parallel) {
      // 並列実行
      logger.info('並列実行モードで開始', {
        task_count: tasks.length,
      });

      const promises = tasks.map(task => 
        simulateAsyncWork(task.name, task.duration || 1000)
          .catch(error => ({ task: task.name, status: 'failed', error: error.message }))
      );

      results = await Promise.all(promises);
    } else {
      // 順次実行
      logger.info('順次実行モードで開始', {
        task_count: tasks.length,
      });

      for (const task of tasks) {
        try {
          const result = await simulateAsyncWork(task.name, task.duration || 1000);
          results.push(result);
        } catch (error) {
          results.push({ 
            task: task.name, 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }
    }

    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'completed').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    logger.info('非同期タスク実行完了', {
      total_time_ms: totalTime,
      success_count: successCount,
      failed_count: failedCount,
      execution_mode: parallel ? 'parallel' : 'sequential',
    });

    return NextResponse.json({
      execution_mode: parallel ? 'parallel' : 'sequential',
      total_time_ms: totalTime,
      statistics: {
        total: tasks.length,
        successful: successCount,
        failed: failedCount,
      },
      results,
    });
  } catch (error) {
    logger.error('非同期タスク実行でエラーが発生', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: '非同期タスクの実行に失敗しました' },
      { status: 500 }
    );
  }
}
