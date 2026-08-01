package main

import (
	"fmt"
	"time"

	"golang.org/x/time/rate"
)

func tokenBucket_Reserve() {
	l := rate.NewLimiter(2.0, 5)
	fmt.Println("リミッター設定: 毎秒2トークン補充、バースト上限5トークン")
	fmt.Println("開始時点でのトークン数:", l.Tokens())

	for x := range 10 {
		r := l.Reserve()
		delay := r.Delay()

		if delay == 0 {
			fmt.Printf("リクエスト %d: 許可 (遅延: %v, 残りトークン: %.2f)\n", x, delay, l.Tokens())
		} else {
			fmt.Printf("リクエスト %d: 遅延発生 (遅延: %v, 残りトークン: %.2f)\n", x, delay, l.Tokens())
			// 実際には以下のようにしてdelayを待つことも可能
			// time.Sleep(delay)
		}
	}
}

func tokenBucket_ReserveN() {
	l := rate.NewLimiter(5.0, 10) // 毎秒5トークン補充、バースト上限10トークン
	fmt.Println("リミッター設定: 毎秒5トークン補充、バースト上限10トークン")
	fmt.Println("開始時点でのトークン数:", l.Tokens())

	// 異なるトークン数でリクエスト
	tokensNeeded := []int{2, 3, 4, 5, 1, 2, 3}

	for i, n := range tokensNeeded {
		r := l.ReserveN(time.Now(), n)
		delay := r.Delay()

		if !r.OK() {
			fmt.Printf("リクエスト %d: %dトークン要求 - 予約不可 (残りトークン: %.2f)\n", i, n, l.Tokens())
		} else if delay == 0 {
			fmt.Printf("リクエスト %d: %dトークン要求 - 即時実行可能 (残りトークン: %.2f)\n", i, n, l.Tokens())
		} else {
			fmt.Printf("リクエスト %d: %dトークン要求 - %v後に実行可能 (残りトークン: %.2f)\n", i, n, delay, l.Tokens())
			// 実際には以下のようにしてdelayを待つことも可能
			// time.Sleep(delay)
		}

	}
}

func main() {
	fmt.Println("Reserveの例")
	tokenBucket_Reserve()

	fmt.Println("===================================")

	fmt.Println("ReserveNの例")
	tokenBucket_ReserveN()
}
