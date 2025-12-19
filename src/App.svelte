<style>
  .container {
    max-width: 100%;
    max-height: 100%;
    overflow: auto;
  }

  table {
    border-collapse: collapse;
  }

  th {
    border: 1px solid var(--fg-color);
    background: lightgrey;
    padding: 0.25rem;
  }

  button {
    margin: 1rem 0;
    padding: 0.25rem;
    cursor: pointer;
  }
</style>

<script>
  import TableCell from "./Cell.svelte";
  import { formula } from "./formula.js";
  import { ParseError } from "./lib/parsers.js";
  import { rederivable } from "./lib/store.js";

  class Cell {
    formula;
    value;
    error;

    constructor(formula) {
      this.formula = $state(formula);
      this.error = $state();
      this.value = rederivable(undefined);
    }

    toString() {
      return JSON.stringify(this.value);
    }
  }

  const rows = $state(
    new Array(3).fill().map(() => new Array(3).fill().map(() => new Cell())),
  );

  $effect(() => {
    for (const row of rows) {
      for (const cell of row) {
        $effect(() => {
          try {
            const parsed = formula.parse(cell.formula);
            const computed = parsed?.compute ? parsed.compute() : parsed;
            if (computed.subscribe) {
              cell.value.rederive([computed], ([x], _, set) => set(x));
            } else {
              cell.value.rederive([], (_, set) => set(computed));
            }
            cell.error = undefined;
          } catch (e) {
            if (!(e instanceof ParseError)) {
              cell.error = e;
              console.error(e);
            }
            cell.value.rederive([], (_, set) => set(cell.formula));
          }
        });
      }
    }
  });
</script>

<div class="container">
  <table>
    <thead>
      <tr>
        <th></th>
        {#each rows[0] as _, i}
          <th>C{i}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row, i}
        <tr>
          <th>R{i}</th>
          {#each row as col, j}
            <TableCell cell={rows[i][j]} value={rows[i][j].value} />
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
  <!-- TODO: Remove -->
  <button
    onclick={() => {
      rows.push(new Array(rows[0].length).fill().map(() => new Cell()));
    }}
  >
    Add row
  </button>
  <button
    onclick={() => {
      rows.map((row) => row.push(new Cell()));
    }}
  >
    Add col
  </button>
</div>
