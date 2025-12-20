export function debounce(f, delay, max = undefined) {
  let t;
  let iterations = 0;
  return (...args) => {
    clearTimeout(t);
    if (max != null && iterations > max) {
      iterations = 0;
      f(...args);
    } else {
      iterations++;
      t = setTimeout(() => {
        iterations = 0;
        f(...args);
      }, delay);
    }
  };
}

export function reshape(l, rows, cols) {
  if (rows == 1 || cols == 1) return l;
  return new Array(rows)
    .fill()
    .map((_, i) => new Array(cols).fill().map((_, j) => l[i * cols + j]));
}
