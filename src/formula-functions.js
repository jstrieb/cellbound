import { get } from "svelte/store";

export const functions = {};

functions.sum = (...args) =>
  args.flat(Infinity).reduce((a, x) => a + (x ?? 0), 0);

functions.prod = (...args) =>
  args.flat(Infinity).reduce((a, x) => a * (x ?? 1), 1);

functions.tick = function (ms) {
  const id = setInterval(() => this.update((ticks) => ticks + 1), ms);
  this.cleanup = () => clearInterval(id);
  return 0;
};

functions.avg = (...args) =>
  args.flat(Infinity).reduce((a, x) => a + x ?? 0, 0) /
  args.flat(Infinity).length;

functions.randint = (n) => Math.floor(Math.random() * n);
functions.if = (x, yes, no) => (x ? yes : no);

// Aliases
functions.add = functions.sum;
functions.plus = functions.sum;
functions.times = functions.prod;
functions.product = functions.prod;
functions.mult = functions.prod;
functions.average = functions.avg;
functions.rand = Math.random;

functions.sparkbars = (...args) => {
  args = args.flat(Infinity).map((x) => x ?? 0);
  const lines = "▁▂▃▄▅▆▇█";
  const min = Math.min(...args),
    max = Math.max(...args);
  const bucketSize = (max - min) / (lines.length - 1);
  return args.map((x) => lines[Math.floor((x - min) / bucketSize)]).join("");
};

const cache = {};
functions.cache = function (n, x) {
  if (n == null || x == null) return;
  const k = `${this.row},${this.col}`;
  if (cache[k] == null) cache[k] = [];
  cache[k].push(x);
  while (cache[k].length > n) cache[k].shift();
  return cache[k];
};

functions.xorshift = (x) => {
  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  return x;
};

functions.row = function () {
  return this.row;
};

functions.col = function () {
  return this.col;
};

functions.delay = function (ms, x) {
  const id = setTimeout(() => this.set(x), ms);
  this.cleanup = () => clearTimeout(id);
  return get(this.cells[this.row][this.col].value);
};

functions.and = (...args) => !!args.reduce((a, x) => a && x, true);
functions.or = (...args) => !!args.reduce((a, x) => a || x, false);
functions.not = (x) => !x;

functions.mod = (x, y) => (x ?? 0) % (y ?? 0);

Object.getOwnPropertyNames(Math)
  .filter((n) => typeof Math[n] === "function")
  .forEach((n) => {
    functions[n] = (...args) =>
      Math[n](...args.map((arg) => (Number.isNaN(arg ?? NaN) ? 0 : arg)));
    functions[n].toString = () => Math[n].toString();
  });

functions.max = (...args) =>
  Math.max(
    ...args.flat(Infinity).map((arg) => (Number.isNaN(arg ?? NaN) ? 0 : arg)),
  );
functions.min = (...args) =>
  Math.min(
    ...args.flat(Infinity).map((arg) => (Number.isNaN(arg ?? NaN) ? 0 : arg)),
  );
