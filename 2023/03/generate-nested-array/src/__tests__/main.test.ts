import { generateNestedArray } from "../main";
describe("", () => {
  test.each([
    {
      name: "子のデータが1つネストしている",
      headings: [{ depth: 2 }, { depth: 3 }],
      expected: [{ depth: 2 }, [{ depth: 3 }]],
    },
    {
      name: "孫に当たるデータは、子のデータにネストする",
      headings: [{ depth: 2 }, { depth: 3 }, { depth: 4 }],
      expected: [{ depth: 2 }, [{ depth: 3 }, [{ depth: 4 }]]],
    },
    {
      name: "depthが全て同じである場合、データはネストしない",
      headings: [{ depth: 2 }, { depth: 2 }, { depth: 2 }],
      expected: [{ depth: 2 }, { depth: 2 }, { depth: 2 }],
    },
    {
      name: "子が2つある場合、ネストした配列に2つ入る",
      headings: [{ depth: 2 }, { depth: 3 }, { depth: 3 }],
      expected: [{ depth: 2 }, [{ depth: 3 }, { depth: 3 }]],
    },
  ])("$name", ({ headings, expected }) => {
    expect(generateNestedArray(headings)).toEqual(expected);
  });
});
