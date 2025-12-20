export const functions = {};

Object.getOwnPropertyNames(Math)
  .filter((n) => typeof Math[n] === "function")
  .forEach(
    (n) =>
      (functions[n] = (...args) => {
        if (args.some((s) => typeof s == "string")) {
          return Math[n](...args.map((arg) => arg ?? ""));
        } else {
          return Math[n](...args.map((arg) => arg ?? 0));
        }
      }),
  );

functions.sum = (...args) =>
  args.flat(Infinity).reduce((a, x) => a + (x ?? 0), 0);

functions.prod = (...args) =>
  args.flat(Infinity).reduce((a, x) => a * (x ?? 1), 1);

functions.tick = function (ms) {
  setInterval(() => this.update((ticks) => ticks + 1), ms);
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
functions.rand = functions.random;

functions.sparkbars = (...args) => {
  args = args.flat(Infinity).map((x) => x ?? 0);
  const lines = "▁▂▃▄▅▆▇█";
  const min = Math.min(...args),
    max = Math.max(...args);
  const bucketSize = (max - min) / (lines.length - 1);
  return args.map((x) => lines[Math.floor((x - min) / bucketSize)]).join("");
};
