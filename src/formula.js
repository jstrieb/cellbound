import { functions } from "./formula-functions.js";
import {
  alt,
  str,
  anyChar,
  lex,
  num,
  forwardDeclaration,
  seq,
  EOF,
  infixR,
  infixL,
  regex,
} from "./lib/parsers.js";
import { reshape } from "./lib/helpers.js";
import { derived, readable } from "svelte/store";

///////////////////////////////////////////////////////////////////////////////
// Classes
///////////////////////////////////////////////////////////////////////////////

class Expression {}

class Variable extends Expression {
  name;

  constructor(name) {
    super();
    this.name = name;
  }

  compute(cells, row, col, variables) {
    return variables[this.name];
  }
}

class Function extends Expression {
  name;
  args;

  constructor(name, args) {
    super();
    if (!(name.toLowerCase() in functions))
      throw new Error(`Unknown function "${name}"`);
    this.name = name;
    this.args = Array.from(args);
  }

  compute(cells, row, col, variables) {
    const computed = this.args.map((arg) =>
      arg?.compute ? arg.compute(cells, row, col, variables) : arg,
    );
    if (computed.some((x) => x?.subscribe)) {
      return derived(
        computed.filter((x) => x?.subscribe),
        (updated, set, update) => {
          const _this = {
            set,
            update,
            cells,
            row,
            col,
            variables,
          };
          // Mutating the updated array causes hard-to-debug problems with this
          // store later on
          updated = [...updated];
          set(
            functions[this.name.toLowerCase()].apply(
              _this,
              computed.map((x) => (x?.subscribe ? updated.shift() : x)),
            ),
          );
          return _this.cleanup;
        },
      );
    } else {
      return readable(null, (set, update) => {
        const _this = { set, update, cells, row, col, variables };
        set(functions[this.name.toLowerCase()].apply(_this, computed));
        return _this.cleanup;
      });
    }
  }
}

class UnaryOp extends Expression {
  operator;
  operand;

  static operations = {
    "!": (x) => !x,
    "~": (x) => ~x,
    "-": (x) => -x,
  };

  constructor(operator, operand) {
    super();
    this.operator = operator;
    this.operand = operand;
  }

  compute(...args) {
    const { operand, operator } = this;
    const computed = operand?.compute ? operand.compute(...args) : operand;
    if (computed.subscribe) {
      return derived([computed], (x, set) =>
        set(UnaryOp.operations[operator](x ?? 0)),
      );
    } else {
      return UnaryOp.operations[operator](computed);
    }
  }
}

class BinaryOp extends Expression {
  ast;

  static operations = {
    // Arithmetic
    "+": (x, y) => x + y,
    "-": (x, y) => x - y,
    "*": (x, y) => x * y,
    "/": (x, y) => x / y,
    "%": (x, y) => x % y,
    "**": Math.pow,
    "^": Math.pow,

    // Logical
    "!=": (x, y) => x !== y,
    "==": (x, y) => x === y,
    ">=": (x, y) => x >= y,
    ">": (x, y) => x > y,
    "<=": (x, y) => x <= y,
    "<": (x, y) => x < y,
    "&&": (x, y) => x && y,
    "||": (x, y) => x || y,
    "??": (x, y) => x ?? y,
    "<>": (x, y) => x !== y,
    "=": (x, y) => x === y,

    // Bitwise
    "&": (x, y) => (x >>> 0) & (y >>> 0),
    "|": (x, y) => (x >>> 0) | (y >>> 0),
    "^": (x, y) => (x >>> 0) ^ (y >>> 0),
    ">>": (x, y) => x >> y,
    ">>>": (x, y) => x >>> y,
    "<<": (x, y) => x << y,
  };

  constructor(ast) {
    super();
    this.ast = Array.from(ast);
  }

  compute(...args) {
    const ast = [...this.ast];
    if (ast.length < 3) {
      console.log(ast);
      throw new Error("Binary operation AST has incorrect length");
    }

    while (ast.length > 1) {
      if (ast.length % 2 != 1) {
        console.log(ast);
        throw new Error("Binary operation AST length not odd");
      }
      const _x = ast.shift();
      const x = _x?.compute ? _x.compute(...args) : _x;
      const op = ast.shift();
      const _y = ast.shift();
      const y = _y?.compute ? _y.compute(...args) : _y;
      const isXStore = x?.subscribe;
      const isYStore = y?.subscribe;

      if (isXStore && isYStore) {
        ast.unshift(
          derived([x, y], ([a, b], set) =>
            set(BinaryOp.operations[op](a ?? 0, b ?? 0)),
          ),
        );
      } else if (isXStore) {
        ast.unshift(
          derived([x], ([a], set) =>
            set(BinaryOp.operations[op](a ?? 0, y ?? 0)),
          ),
        );
      } else if (isYStore) {
        ast.unshift(
          derived([y], ([b], set) =>
            set(BinaryOp.operations[op](x ?? 0, b ?? 0)),
          ),
        );
      } else {
        ast.unshift(BinaryOp.operations[op](x ?? 0, y ?? 0));
      }
    }

    const [computed] = ast;
    return computed;
  }
}

class Reference extends Expression {
  row;
  col;

  constructor(row, col) {
    super();
    this.row = row;
    this.col = col;
  }

  compute(cells, row, col, variables) {
    let i;
    if (this.row == null) {
      i = row;
    } else if (this.row.absolute != null) {
      const r = this.row.absolute;
      if (r < 0) {
        i = (r + cells.length) % cells.length;
      } else {
        i = r;
      }
    } else if (this.row.relative != null) {
      i = row + this.row.relative;
    } else {
      throw new Error("Unreachable");
    }

    let j;
    if (this.col == null) {
      j = col;
    } else if (this.col.absolute != null) {
      const c = this.col.absolute;
      if (c < 0) {
        j = (c + cells[0].length) % cells[0].length;
      } else {
        j = c;
      }
    } else if (this.col.relative != null) {
      j = col + this.col.relative;
    } else {
      throw new Error("Unreachable");
    }

    try {
      return cells[i][j].value;
    } catch {
      throw new Error(`Invalid cell R${i}C${j}`);
    }
  }
}

class Range extends Expression {
  startRow;
  startCol;
  endRow;
  endCol;

  constructor([startRow, startCol], [endRow, endCol]) {
    super();
    this.startRow = startRow;
    this.startCol = startCol;
    this.endRow = endRow;
    this.endCol = endCol;
  }

  compute(cells, row, col, variables) {
    let startRow, endRow;
    let startCol, endCol;

    if (this.startRow == null) {
      startRow = row;
    } else if (this.startRow.absolute != null) {
      const r = this.startRow.absolute;
      if (r < 0) {
        startRow = (r + cells.length) % cells.length;
      } else {
        startRow = r;
      }
    } else if (this.startRow.relative != null) {
      startRow = row + this.startRow.relative;
    } else {
      throw new Error("Unreachable");
    }

    if (this.startCol == null) {
      startCol = col;
    } else if (this.startCol.absolute != null) {
      const c = this.startCol.absolute;
      if (c < 0) {
        startCol = (c + cells[0].length) % cells[0].length;
      } else {
        startCol = c;
      }
    } else if (this.startCol.relative != null) {
      startCol = col + this.startCol.relative;
    } else {
      throw new Error("Unreachable");
    }

    if (this.endRow == null) {
      endRow = row;
    } else if (this.endRow.absolute != null) {
      const r = this.endRow.absolute;
      if (r < 0) {
        endRow = (r + cells.length) % cells.length;
      } else {
        endRow = r;
      }
    } else if (this.endRow.relative != null) {
      endRow = row + this.endRow.relative;
    } else {
      throw new Error("Unreachable");
    }

    if (this.endCol == null) {
      endCol = col;
    } else if (this.endCol.absolute != null) {
      const c = this.endCol.absolute;
      if (c < 0) {
        endCol = (c + cells[0].length) % cells[0].length;
      } else {
        endCol = c;
      }
    } else if (this.endCol.relative != null) {
      endCol = col + this.endCol.relative;
    } else {
      throw new Error("Unreachable");
    }

    return derived(
      cells
        .slice(startRow, endRow + 1)
        .map((r) => r.slice(startCol, endCol + 1))
        .flat()
        .map(({ value }) => value),
      (values, set) => {
        return set(
          reshape(values, endRow - startRow + 1, endCol - startCol + 1),
        );
      },
    );
  }
}

function init(cls) {
  return (args) => new cls(...args);
}

///////////////////////////////////////////////////////////////////////////////
// Parsers
///////////////////////////////////////////////////////////////////////////////

const expression = forwardDeclaration();

const stringChar = alt(
  str("\\\\").map(() => "\\"),
  str('\\"').map(() => '"'),
  str("\\'").map(() => "'"),
  str("\\t").map(() => "\t"),
  str("\\n").map(() => "\n"),
  anyChar,
);
const string = alt(
  str('"')
    .then(stringChar.until(str('"')).optional([]).concat())
    .skip(str('"')),
  str("'")
    .then(stringChar.until(str("'")).optional([]).concat())
    .skip(str("'")),
);

const bool = alt(
  regex(/true/i).map(() => true),
  regex(/false/i).map(() => false),
);

const identifier = regex(/[a-zA-Z_][a-zA-Z0-9_]*/);
const fun = seq(
  identifier,
  str("(")
    .then(expression.sep_by(lex(",")).optional([]))
    .skip(str(")")),
).map(init(Function));

const cellIndex = regex(/-?\d[_\d]*/).map((x) =>
  parseInt(x.replaceAll("_", "")),
);
const relNum = str("[")
  .then(cellIndex)
  .skip(str("]"))
  .map((n) => ({ relative: n }));
const absNum = cellIndex.map((n) => ({ absolute: n }));
const cellNum = alt(relNum, absNum).optional();
const ref = seq(regex(/[rR]/).then(cellNum), regex(/[cC]/).then(cellNum)).map(
  init(Reference),
);
const range = seq(
  seq(regex(/[rR]/).then(cellNum), regex(/[cC]/).then(cellNum)).skip(lex(":")),
  seq(regex(/[rR]/).then(cellNum), regex(/[cC]/).then(cellNum)),
).map(init(Range));

const value = lex(
  alt(
    num,
    string,
    bool,
    range,
    ref,
    fun,
    // identifier.map(init(Variable)),
    lex("(").then(expression).skip(lex(")")),
  ),
);

const unary = forwardDeclaration();
unary.become(
  alt(
    seq(alt(...Object.keys(UnaryOp.operations).map(lex)), unary).map(
      init(UnaryOp),
    ),
    value,
  ),
);
const power = infixR(unary, ["**"], BinaryOp);
const product = infixL(power, ["*", "/", "%"], BinaryOp);
const sum = infixL(product, ["+", "-"], BinaryOp);
const shift = infixL(sum, ["<<", ">>>", ">>"], BinaryOp);
const relational = infixL(shift, ["<=", "<", ">=", ">"], BinaryOp);
const equality = infixL(relational, ["==", "!=", "=", "<>"], BinaryOp);
const bitwiseAnd = infixL(equality, ["&"], BinaryOp);
const bitwiseXor = infixL(bitwiseAnd, ["^"], BinaryOp);
const bitwiseOr = infixL(bitwiseXor, ["|"], BinaryOp);
const logicalAnd = infixL(bitwiseOr, ["&&"], BinaryOp);
const logicalOr = infixL(logicalAnd, ["||", "??"], BinaryOp);
expression.become(logicalOr);

export const formula = alt(str("=").then(expression), num).skip(EOF);
