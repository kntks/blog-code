const intervals = [
  {start: new Date("2023-01-10T00:00:00Z"), end: new Date("2023-01-10T09:00:00Z")}, 
  {start: new Date("2023-01-10T06:00:00Z"), end: new Date("2023-01-10T13:00:00Z")},
  {start: new Date("2023-01-10T03:00:00Z"), end: new Date("2023-01-10T05:00:00Z")},
  {start: new Date("2023-01-10T18:00:00Z"), end: new Date("2023-01-10T20:00:00Z")},
]

function mergeInterval(intervals: {start: Date, end: Date}[]) {
  const stack: {start: Date, end: Date}[] = []
  intervals
      .map((x) => ({...x}))  // sortは破壊的変更なので、mapでcopyする
      .sort((x, y) => x.start.getTime() - y.start.getTime())
      .forEach((curr) => {
          const top = stack[stack.length -1]
          if(!top || top.end < curr.start) {
              stack.push(curr)
              return
          }
          
          // 上のif文で top.end < interval.startを確認しているので、
          // ここに到達した時点で既に top.end >= interval.startであり、期間の重複が確定
          // ここでは topで取得したintervalが、crrを内包しているか確認する
          if(top.end < curr.end) top.end = curr.end
      })

 return stack
}

console.log(mergeInterval(intervals))
