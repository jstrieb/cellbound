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

  td {
    border: 1px solid var(--fg-color);
  }

  td:has(input:focus) {
    outline: 1.5px solid var(--fg-color);
  }

  td > div {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
  }

  input[type="text"] {
    border: none;
    padding: 0.25rem;
    font-family: monospace, monospace;
  }

  button {
    margin: 1rem 0;
    padding: 0.25rem;
    cursor: pointer;
  }
</style>

<script>
  import { formula } from "./formula.js";
  import { ParseError } from "./lib/parsers.js";

  class Cell {
    constructor(formula) {
      this.formula = $state(formula);
      this.value = $state(undefined);
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
            cell.value = formula.parse(cell.formula);
          } catch (e) {
            if (e instanceof ParseError) {
              cell.value = cell.formula;
            } else {
              console.error(e);
              cell.value = e;
            }
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
            <td>
              <div>
                <input
                  type="text"
                  style="border-bottom: 1px dashed lightgray;"
                  bind:value={rows[i][j].formula}
                />
                <p
                  style="padding: 0.25rem; min-height: 1.5rem; white-space: pre;"
                >
                  {(rows[i][j].value && rows[i][j]) || ""}
                </p>
              </div>
            </td>
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
