package main

import (
	"context"
	"fmt"
	"time"

	"golang.org/x/time/rate"
)

func tokenBucket_Wait() {
	l := rate.NewLimiter(2.0, 5)
	fmt.Println("リミッター設定: 毎秒2トークン補充、バースト上限5トークン")
	fmt.Println("開始時点でのトークン数:", l.Tokens())

	ctx := context.Background()

	for x := range 10 {
		err := l.Wait(ctx)

		if err == nil {
			fmt.Printf("リクエスト %d: 許可 (残りトークン: %.2f)\n", x, l.Tokens())
		} else {
			fmt.Printf("リクエスト %d: エラー %v (残りトークン: %.2f)\n", x, err, l.Tokens())
		}
	}
}

// 複数トークンを一度に要求するWaitNの例
func tokenBucket_WaitN() {
	l := rate.NewLimiter(5.0, 10) // 毎秒5トークン補充、バースト上限10トークン
	fmt.Println("リミッター設定: 毎秒5トークン補充、バースト上限10トークン")
	fmt.Println("開始時点でのトークン数:", l.Tokens())

	// 異なるトークン数でリクエスト
	tokensNeeded := []int{2, 3, 4, 5, 1, 2, 3}

	for i, n := range tokensNeeded {
		fmt.Printf("リクエスト %d: %dトークン要求 (要求前のトークン: %.2f)\n", i, n, l.Tokens())

		// 5秒のタイムアウトでコンテキストを作成
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

		// リクエスト開始時刻を記録
		start := time.Now()

		// WaitNを呼び出し、必要に応じて待機
		err := l.WaitN(ctx, n)

		// 経過時間を計算
		elapsed := time.Since(start)

		if err == nil {
			fmt.Printf("リクエスト %d: %dトークン要求 - 許可 (待機時間: %v, 残りトークン: %.2f)\n", i, n, elapsed, l.Tokens())
		} else {
			fmt.Printf("リクエスト %d: %dトークン要求 - エラー: %v (待機時間: %v, 残りトークン: %.2f)\n", i, n, err, elapsed, l.Tokens())
		}

		cancel() // コンテキストをキャンセル
	}
}

func main() {
	fmt.Println("Waitの例")
	tokenBucket_Wait()

	fmt.Println("===================================")

	fmt.Println("WaitNの例")
	tokenBucket_WaitN()
}
