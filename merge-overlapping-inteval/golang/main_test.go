package main

import (
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
)

func Test_mergeIntervals(t *testing.T) {

	local := time.FixedZone("Asia/Tokyo", 9*60*60)

	type args struct {
		intervals []Interval
	}
	tests := []struct {
		name string
		args args
		want []Interval
	}{
		{
			name: "期間が重複していないとき、マージされない",
			args: args{
				intervals: []Interval{
					{Start: time.Date(2023, 1, 10, 0, 0, 0, 0, local), End: time.Date(2023, 1, 10, 1, 0, 0, 0, local)},
					{Start: time.Date(2023, 1, 10, 2, 0, 0, 0, local), End: time.Date(2023, 1, 10, 3, 0, 0, 0, local)},
				},
			},
			want: []Interval{
				{Start: time.Date(2023, 1, 10, 0, 0, 0, 0, local), End: time.Date(2023, 1, 10, 1, 0, 0, 0, local)},
				{Start: time.Date(2023, 1, 10, 2, 0, 0, 0, local), End: time.Date(2023, 1, 10, 3, 0, 0, 0, local)},
			},
		},
		{
			name: "期間が重複しているとき、マージされる",
			args: args{
				intervals: []Interval{
					{Start: time.Date(2023, 1, 10, 0, 0, 0, 0, local), End: time.Date(2023, 1, 10, 9, 0, 0, 0, local)},
					{Start: time.Date(2023, 1, 10, 6, 0, 0, 0, local), End: time.Date(2023, 1, 10, 13, 0, 0, 0, local)},
				},
			},
			want: []Interval{
				{Start: time.Date(2023, 1, 10, 0, 0, 0, 0, local), End: time.Date(2023, 1, 10, 13, 0, 0, 0, local)},
			},
		},
		{
			name: "一つ目の終了時間と二つ目の開始時間が同じとき、マージされる",
			args: args{
				intervals: []Interval{
					{Start: time.Date(2023, 1, 10, 0, 0, 0, 0, local), End: time.Date(2023, 1, 10, 9, 0, 0, 0, local)},
					{Start: time.Date(2023, 1, 10, 9, 0, 0, 0, local), End: time.Date(2023, 1, 10, 13, 0, 0, 0, local)},
				},
			},
			want: []Interval{
				{Start: time.Date(2023, 1, 10, 0, 0, 0, 0, local), End: time.Date(2023, 1, 10, 13, 0, 0, 0, local)},
			},
		},
		{
			name: "二つ目の期間が一つ目の期間内のとき、マージされる",
			args: args{
				intervals: []Interval{
					{Start: time.Date(2023, 1, 10, 0, 0, 0, 0, local), End: time.Date(2023, 1, 10, 9, 0, 0, 0, local)},
					{Start: time.Date(2023, 1, 10, 1, 0, 0, 0, local), End: time.Date(2023, 1, 10, 5, 0, 0, 0, local)},
				},
			},
			want: []Interval{
				{Start: time.Date(2023, 1, 10, 0, 0, 0, 0, local), End: time.Date(2023, 1, 10, 9, 0, 0, 0, local)},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := mergeIntervals(tt.args.intervals)
			if diff := cmp.Diff(tt.want, got); diff != "" {
				t.Errorf("mergeIntervals() mismatch (-want +got):\n%s", diff)
			}
		})
	}
}
