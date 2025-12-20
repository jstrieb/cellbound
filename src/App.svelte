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

  .side-by-side {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 1rem;
    margin: 1rem 0;
  }

  button {
    margin: 1rem 0;
    padding: 0.25rem;
    cursor: pointer;
  }
</style>

<script>
  import TableCell from "./Cell.svelte";
  import { levels } from "./levels.js";
  import { formula } from "./formula.js";
  import { debounce } from "./lib/helpers.js";
  import { ParseError } from "./lib/parsers.js";
  import { rederivable } from "./lib/store.js";

  class Cell {
    formula;
    value;
    error;
    locked;
    hidden;

    constructor(formula, locked = false, hidden = false) {
      if (typeof formula != "string") {
        locked = formula?.locked ?? locked;
        hidden = formula?.hidden ?? hidden;
        formula = formula?.formula ?? formula;
      }

      this.formula = $state(formula);
      this.error = $state();
      this.value = rederivable(undefined);
      this.locked = $state(locked);
      this.hidden = $state(hidden);
    }

    toString() {
      return JSON.stringify(this.value);
    }
  }

  // new Array(3).fill().map(() => new Array(3).fill().map(() => new Cell()))
  const levelData = $derived(
    level.level.map((row) => row.map((cell) => new Cell(cell))),
  );
  const solution = $derived(
    level.solution.map((row) =>
      row.map(
        (cell) =>
          new Cell(
            typeof cell == "string"
              ? { locked: true, hidden: true, formula: cell }
              : { locked: true, hidden: true, ...cell },
          ),
      ),
    ),
  );
  const variables = $state({});

  let currentLevel = $state(0);
  let level = $derived(levels[currentLevel]);

  for (const rows of [levelData, solution]) {
    $effect(() => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        for (let j = 0; j < row.length; j++) {
          const cell = row[j];
          $effect(() => {
            try {
              const parsed = formula.parse(cell.formula);
              const computed = parsed?.compute
                ? parsed.compute(rows, i, j, variables)
                : parsed;
              if (computed?.subscribe) {
                let count = 0;
                const resetCount = debounce(() => (count = 0), 10);
                cell.value.rederive([computed], ([x], set) => {
                  // Prevent infinite loop from self-reference
                  if (count++ < 10) {
                    resetCount();
                    return set(x);
                  }
                });
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
  }
</script>

<p style="white-space: pre-wrap; hyphens: auto;">
  {@html levels[currentLevel].text.trim()}
</p>
<div class="side-by-side">
  {#each [solution, levelData] as rows, sheet}
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
                <TableCell
                  cell={rows[i][j]}
                  value={rows[i][j].value}
                  solution={solution[i][j].value}
                  input={sheet == 1}
                />
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/each}
</div>
