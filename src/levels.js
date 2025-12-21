export const levels = [
  {
    text: `
Welcome!

<b>Cellbound</b> is a logic puzzle game that takes place entirely within a spreadsheet.

Your goal is to edit each formula so that the cell values match the output.

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
    level: [[undefined], [undefined], [undefined], [undefined]],
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
    level: [[undefined], [undefined], [undefined]],
    solution: [
      [{ formula: "=!true || !false && !!true", hidden: false }],
      [{ formula: `="Cat sat on " + "hat"`, hidden: false }],
      [{ formula: `=IF(!true, "hat", "mat")`, hidden: false }],
    ],
  },
];
