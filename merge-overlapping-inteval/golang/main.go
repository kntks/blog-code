package main

import (
	"container/list"
	"fmt"
	"sort"
	"time"
)

type Interval struct {
	Start time.Time
	End   time.Time
}

func main() {
	local := time.FixedZone("Asia/Tokyo", 9*60*60)

	intervals := []Interval{
		{Start: time.Date(2023, 1, 10, 0, 0, 0, 0, local), End: time.Date(2023, 1, 10, 9, 0, 0, 0, local)},
		{Start: time.Date(2023, 1, 10, 6, 0, 0, 0, local), End: time.Date(2023, 1, 10, 13, 0, 0, 0, local)},
		{Start: time.Date(2023, 1, 10, 3, 0, 0, 0, local), End: time.Date(2023, 1, 10, 5, 0, 0, 0, local)},
		{Start: time.Date(2023, 1, 10, 18, 0, 0, 0, local), End: time.Date(2023, 1, 10, 20, 0, 0, 0, local)},
	}

	for _, interval := range mergeIntervals(intervals) {
		fmt.Println(interval)
	}
}

func mergeIntervals(intervals []Interval) []Interval {
	copied := make([]Interval, len(intervals))
	copy(copied, intervals)
	sort.Slice(copied, func(i, j int) bool { return intervals[i].Start.Before(intervals[j].Start) })

	l := list.New()
	for _, curr := range copied {
		top := l.Back()
		if top == nil || top.Value.(Interval).End.Before(curr.Start) {
			l.PushBack(curr)
			continue
		}
		if top.Value.(Interval).End.Before(curr.End) {
			merged := top.Value.(Interval)
			merged.End = curr.End
			l.Remove(top)
			l.PushBack(merged)
		}
	}

	results := make([]Interval, 0, len(intervals))
	for e := l.Front(); e != nil; e = e.Next() {
		results = append(results, e.Value.(Interval))
	}
	return results
}
