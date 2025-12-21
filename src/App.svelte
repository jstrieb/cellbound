<style>
  .container {
    max-width: 100%;
    max-height: 100%;
    overflow: auto;
    flex-grow: 1;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  th {
    border: 1px solid var(--fg-color);
    background: lightgrey;
    padding: 0.25rem;
  }

  td {
    border: 1px solid var(--fg-color);
    padding: 0.5rem;
    text-align: center;
    vertical-align: middle;
  }

  .side-by-side {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
  }

  button {
    padding: 0.25rem;
    cursor: pointer;
    white-space: pre;
    min-width: max-content;
  }

  button:disabled {
    cursor: not-allowed;
    background: #f0f0f0;
  }

  .button-bar {
    width: 100%;
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(3, 1fr);
    align-items: center;
    margin-bottom: 1rem;
  }
</style>

<script>
  import TableCell from "./Cell.svelte";
  import { levels } from "./levels.js";
  import { formula } from "./formula.js";
  import { functions } from "./formula-functions.js";
  import { debounce } from "./lib/helpers.js";
  import { ParseError } from "./lib/parsers.js";
  import { rederivable } from "./lib/store.js";
  import { derived } from "svelte/store";

  class Cell {
    formula;
    locked;
    hidden;
    style;
    nocheck;
    value;
    error;

    constructor(cell) {
      if (typeof cell == "string") {
        cell = { formula: cell };
      }
      this.formula = $state(cell?.formula);
      this.locked = $state(cell?.locked ?? false);
      this.hidden = $state(cell?.hidden ?? false);
      this.style = $state(cell?.style ?? "");
      this.nocheck = $state(cell?.nocheck ?? false);

      this.value = rederivable();
      this.error = $state();
    }

    toString() {
      return JSON.stringify(this.value);
    }
  }

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

  let currentLevel = $state(
    parseInt(window.localStorage.getItem("level") ?? 0),
  );
  let maxLevel = $state(currentLevel);
  // Derived runes cannot self-reference :(
  $effect(() => (maxLevel = Math.max(maxLevel, currentLevel)));
  $effect(() => window.localStorage.setItem("level", maxLevel));
  $effect(() => {
    level;
    window.scrollTo(0, 0);
  });
  let level = $derived(levels[currentLevel]);

  $effect(() => {
    for (const rows of [levelData, solution]) {
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
    }
  });

  let solved = derived(
    [levelData, solution]
      .flat(2)
      .filter(({ nocheck }) => !nocheck)
      .map(({ value }) => value)
      .filter((x) => x),
    (values, set) => {
      if (values.length % 2 != 0) throw new Error("Incorrect data length");
      const length = values.length / 2;
      set(values.slice(length).every((x, i) => x == values[i]));
    },
  );
</script>

<div class="button-bar">
  {#if 0 < currentLevel}
    <button onclick={() => currentLevel--}> &larr; Previous Level </button>
  {:else}
    <span></span>
  {/if}
  <h1 style="text-align: center;">Level {currentLevel + 1}</h1>
  {#if currentLevel < levels.length - 1}
    <button
      onclick={() => currentLevel++}
      disabled={!($solved || currentLevel < maxLevel)}
    >
      Next Level &rarr;
    </button>
  {:else}
    <span></span>
  {/if}
</div>
<p style="white-space: pre-wrap; hyphens: auto;">
  {@html level.text.trim()}
</p>
<div class="side-by-side">
  {#each [solution, levelData] as rows, sheet}
    <div class="container">
      <table>
        <thead>
          <tr
            ><td colspan="999999">
              {#if sheet == 0}
                Desired output
              {:else if sheet == 1}
                Your input
              {/if}
            </td></tr
          >
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
{#if $solved}
  <p style="white-space: pre-wrap; hyphens: auto;">
    {#if level.endText}
      {@html level.endText.trim()}
    {/if}
  </p>
  {#if currentLevel < levels.length - 1}
    <button onclick={() => currentLevel++}>Next level &rarr;</button>
  {/if}
{/if}

<details style="margin-top: 1rem;">
  <summary>Formula Function Reference</summary>
  {#each Object.entries(functions) as [name, f]}
    <details>
      <summary>{name}</summary>
      <pre>{f.toString()}</pre>
    </details>
  {/each}
</details>

<div style="min-height: 90vh">
  <!-- Padding for mobile keyboard convenience -->
</div>
