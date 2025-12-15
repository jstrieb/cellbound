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
} from "./lib/parsers.js";

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

const expression = forwardDeclaration();
const value = lex(
  alt(num, string, bool, lex("(").then(expression).skip(lex(")"))),
);

const operations = {
  unary: {
    "!": (x) => !x,
    "~": (x) => ~x,
    "-": (x) => -x,
  },
  binary: {
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
  },
};

const unary = forwardDeclaration();
unary.become(
  alt(seq(alt(...Object.keys(operations.unary).map(lex)), unary), value),
);
const power = infixR(unary, ["**"]);
const product = infixL(power, ["*", "/", "%"]);
const sum = infixL(product, ["+", "-"]);
const relational = infixL(sum, ["<=", "<", ">=", ">"]);
const equality = infixL(relational, ["==", "!=", "=", "<>"]);
const logicalAnd = infixL(equality, ["&&"]);
const logicalOr = infixL(logicalAnd, ["||"]);

expression.become(logicalOr);

export const formula = alt(str("=").then(expression), num).skip(EOF);
