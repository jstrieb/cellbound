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
import { derived } from "svelte/store";

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
    return variables[name];
  }
}

class Function extends Expression {
  name;
  args;

  constructor(name, args) {
    super();
    this.name = name;
    this.args = Array.from(args);
  }

  compute(cells, row, col, variables) {
    throw new Error("Not yet implemented");
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
    const computed = operand.compute ? operand.compute(...args) : operand;
    if (computed.subscribe) {
      return derived([computed], (x, set) =>
        set(UnaryOp.operations[operator](x)),
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
    "<>": (x, y) => x !== y,
    "=": (x, y) => x === y,
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
      const x = _x.compute ? _x.compute(...args) : _x;
      const op = ast.shift();
      const _y = ast.shift();
      const y = _y.compute ? _y.compute(...args) : _y;
      const isXStore = x?.subscribe;
      const isYStore = y?.subscribe;

      if (isXStore && isYStore) {
        ast.unshift(
          derived([x, y], ([a, b], set) => set(BinaryOp.operations[op](a, b))),
        );
      } else if (isXStore) {
        ast.unshift(
          derived([x], ([a], set) => set(BinaryOp.operations[op](a, y))),
        );
      } else if (isYStore) {
        ast.unshift(
          derived([y], ([b], set) => set(BinaryOp.operations[op](x, b))),
        );
      } else {
        ast.unshift(BinaryOp.operations[op](x, y));
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
    throw new Error("Not yet implemented");
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
    throw new Error("Not yet implemented");
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
  str("true").map(() => true),
  str("false").map(() => false),
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
const range = seq(ref.skip(lex(":")), ref).map(init(Range));

const value = lex(
  alt(
    num,
    string,
    bool,
    range,
    ref,
    fun,
    identifier,
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
const relational = infixL(sum, ["<=", "<", ">=", ">"], BinaryOp);
const equality = infixL(relational, ["==", "!=", "=", "<>"], BinaryOp);
const logicalAnd = infixL(equality, ["&&"], BinaryOp);
const logicalOr = infixL(logicalAnd, ["||"], BinaryOp);

expression.become(logicalOr);

export const formula = alt(str("=").then(expression), num).skip(EOF);
