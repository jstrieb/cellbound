import {
  lex,
  str,
  alt,
  forwardDeclaration,
  EOF,
  num,
  whitespace,
  anyChar,
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
  lex(
    str('"')
      .then(stringChar.until(str('"')).optional([]).concat())
      .skip(str('"')),
  ),
  lex(
    str("'")
      .then(stringChar.until(str("'")).optional([]).concat())
      .skip(str("'")),
  ),
);

const bool = alt(
  lex("true").map(() => true),
  lex("false").map(() => false),
);

const expression = forwardDeclaration();
expression.become(alt(num, string, bool));

export const formula = alt(str("=").then(expression), num).skip(EOF);
