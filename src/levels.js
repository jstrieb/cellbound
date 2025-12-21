export const levels = [
  {
    text: `
Welcome!

<b>Cellbound</b> is a logic puzzle game that takes place entirely within a spreadsheet.

Your goal is to edit each formula so that the cell values match the output.

You will learn the spreadsheet formula language as you go.
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
];
