type Depth = {
  depth: number;
};

type NestedDepth = Depth | NestedDepth[];

export function generateNestedArray(arr: Depth[]): NestedDepth[] {
  type DepthWithVisited = Depth & { visited: boolean };

  const recursive = (arr: DepthWithVisited[], depth: number): NestedDepth[] => {
    const results: NestedDepth[] = [];
    for (let index = 0; index < arr.length; index++) {
      const current = arr[index];
      if (current.visited) continue;
      if (current.depth < depth) break;
      if (current.depth === depth) {
        const { depth } = current;
        results.push({ depth });
        current.visited = true;
      }
      if (current.depth > depth)
        results.push(recursive(arr.slice(index), depth + 1));
    }
    return results;
  };

  return recursive(
    arr.map((x) => ({ ...x, visited: false })),
    2
  );
}
