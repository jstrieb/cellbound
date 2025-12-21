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
Formulas can contain references. References have the form <code>R0C0</code> where <code>0</code> can be replaced with a row or column number. Indices start at 0. Negative indices go from the final row or column.

The row and/or column can be omitted to refer to the current row or column. <code>RC</code> can be used for self-reference.
`,
    level: empty(3, 2),
    solution: [
      [
        { formula: "1", hidden: false },
        { formula: "2", hidden: false },
      ],
      [
        { formula: "=R0C-1", hidden: false },
        { formula: "=R0C0", hidden: false },
      ],
      [
        { formula: "=R0C0 * R0C1", hidden: false },
        { formula: "=RC0 * R0C1 + 1", hidden: false },
      ],
    ],
  },
  {
    text: `
The previous level introduced absolute references like <code>R10C2</code>. 

Formula references can also be relative, rather than absolute. Relative references are encosed in square brackets. So one cell to the right in the same row is <code>RC[1]</code> and one cell in the current column and row above is <code>R[-1]C</code>.
`,
    level: empty(3, 2),
    solution: [
      [
        { formula: "1", hidden: false },
        { formula: "2", hidden: false },
      ],
      [
        { formula: "=R[-1]C1", hidden: false },
        { formula: "=R[-1]C[-1]", hidden: false },
      ],
      [
        { formula: "=R[-2]C * R[-2]C[1]", hidden: false },
        { formula: "=RC[-1] ** R-1C-2 + 1", hidden: false },
      ],
    ],
  },
  {
    text: `
Now that you know how basic formulas and references work, it's time for the first challenge.

Guess the mystery function based on its outputs.

<details><summary>Hint</summary>
Does the shape of the curve remind you of anything? Perhaps a common trigonometric function?
</details>
`,
    level: [
      [{ formula: "=TICK(100) / 10", locked: true }],
      [undefined],
      [
        {
          formula: "=SPARKBARS(CACHE(20, R[-1]C))",
          style: "font-family: monospace, monospace",
          locked: true,
          nocheck: true,
        },
      ],
    ],
    solution: [
      [{ formula: "=TICK(100) / 10", hidden: false }],
      ["=SIN(R[-1]C)"],
      [
        {
          formula: "=SPARKBARS(CACHE(20, R[-1]C))",
          hidden: false,
          style: "font-family: monospace, monospace",
          nocheck: true,
        },
      ],
    ],
    endText: `
Amaing job! This one may have been tricky if you don't remember trigonometry.
`,
  },
];
