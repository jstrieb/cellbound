import { str, alt, num, forwardDeclaration, EOF } from "./lib/parsers.js";

const expression = forwardDeclaration();
expression.become(num);
export const formula = alt(str("=").then(expression), num).skip(EOF);
