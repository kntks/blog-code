package main

import (
	"fmt"
	"time"

	"golang.org/x/time/rate"
)

func tokenBucket_Allow() {
	l := rate.NewLimiter(1.0, 5)
	start := time.Now()
	fmt.Println("リミッター設定: 毎秒1トークン補充、バースト上限5トークン")
	fmt.Println("開始時点でのトークン数:", l.Tokens())

	for x := range 10 {
		allowed := l.Allow()

		if allowed {
			fmt.Printf("リクエスト %d: 許可 (残りトークン: %.2f)\n", x+1, l.Tokens())
		} else {
			fmt.Printf("リクエスト %d: 拒否 (残りトークン: %.2f)\n", x+1, l.Tokens())
		}

		time.Sleep(200 * time.Millisecond)
		fmt.Printf("  待機後のトークン数: %.2f\n", l.Tokens())
	}

	fmt.Printf("経過時間: %s\n", time.Since(start).Round(time.Millisecond))
}

// 複数トークンを一度に要求するAllowNの例
func tokenBucket_AllowN() {
	l := rate.NewLimiter(5.0, 10) // 毎秒5トークン補充、バースト上限10トークン
	start := time.Now()
	fmt.Println("リミッター設定: 毎秒5トークン補充、バースト上限10トークン")
	fmt.Println("開始時点でのトークン数:", l.Tokens())

	// 異なるトークン数でリクエスト
	tokensNeeded := []int{2, 3, 4, 5, 1, 2, 3}

	for i, n := range tokensNeeded {
		allowed := l.AllowN(time.Now(), n)

		if allowed {
			fmt.Printf("リクエスト %d: %dトークン要求 - 許可 (残りトークン: %.2f)\n", i+1, n, l.Tokens())
		} else {
			fmt.Printf("リクエスト %d: %dトークン要求 - 拒否 (残りトークン: %.2f)\n", i+1, n, l.Tokens())
		}

		time.Sleep(300 * time.Millisecond)
		fmt.Printf("  待機後のトークン数: %.2f\n", l.Tokens())
	}

	fmt.Printf("経過時間: %s\n", time.Since(start).Round(time.Millisecond))
}

func main() {
	fmt.Println("Allowの例")
	tokenBucket_Allow()

	fmt.Println("===================================")

	fmt.Println("AllowNの例")
	tokenBucket_AllowN()
}
