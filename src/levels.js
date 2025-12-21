function empty(rows, cols) {
  return new Array(rows).fill().map(() => new Array(cols).fill());
}

export const levels = [
  {
    text: `
Welcome!

<b>Cellbound</b> is a logic puzzle game that takes place entirely within a spreadsheet.

Your goal is to edit each formula so that the cell values match the output. 

For the first few levels, the formula for the output will be shown. For the actual puzzles, the formulas will be hidden.

You will learn the spreadsheet formula language as you go.

<hr />
Cells can contain numbers. They can be in decimal, hexadecimal (<code>0x</code> prefix), or binary (<code>0b</code> prefix).
`,
    level: [["3"], ["2"], ["1"], [undefined]],
    solution: [
      [{ formula: "-1", hidden: false }],
      [{ formula: "0x10", hidden: false }],
      [{ formula: "0b101", hidden: false }],
      ["=256 ** 2"],
    ],
    endText: `
When everything matches, you can proceed to the next level...
`,
  },
  {
    text: `
Cells may contain formulas. 

Formulas begin with the <code>=</code> symbol. They can contain math, numbers, and functions. Any of the standard JavaScript <code>Math</code> functions will work.
`,
    level: empty(4, 1),
    solution: [
      [{ formula: "=1 + 1", hidden: false }],
      [{ formula: "=2 * 3 + 4", hidden: false }],
      [{ formula: "=(1+2) * (3 + 2**2)", hidden: false }],
      [{ formula: "=LOG(2 ** 16) / LOG(2)", hidden: false }],
    ],
  },
  {
    text: `
Formulas can operate on numbers, booleans, and strings.
`,
    level: empty(3, 1),
    solution: [
      [{ formula: "=!true || !false && !!true", hidden: false }],
      [{ formula: `="Cat sat on " + "hat"`, hidden: false }],
      [{ formula: `=IF(!true, "hat", "mat")`, hidden: false }],
    ],
  },
  {
    text: `
Formulas can contain references. References have the form <code>R0C0</code> where <code>0</code> can be replaced with a row or column number. 

The row and/or column can be omitted to refer to the current row or column. <code>RC</code> can be used for self-reference.
`,
    level: empty(3, 2),
    solution: [
      [
        { formula: "1", hidden: false },
        { formula: "2", hidden: false },
      ],
      [
        { formula: "=R0C1", hidden: false },
        { formula: "=R0C0", hidden: false },
      ],
      [
        { formula: "=R0C0 * R0C1", hidden: false },
        { formula: "=RC0 * R1C1", hidden: false },
      ],
    ],
  },
];
