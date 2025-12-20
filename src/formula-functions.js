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
