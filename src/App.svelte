<style>
  .side-by-side {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin: auto;
    max-width: 100%;
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
  import Table from "./Table.svelte";
  import { levels } from "./levels.js";
  import { functions } from "./formula-functions.js";
  import { rederivable } from "./lib/store.js";
  import { derived } from "svelte/store";

  class Cell {
    formula;
    locked;
    hidden;
    style;
    nocheck;
    valueHidden;
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
      this.valueHidden = $state(cell?.valueHidden ?? false);

      this.value = rederivable();
      this.error = $state();
    }

    toString() {
      return JSON.stringify(this.value);
    }
  }

  let currentLevel = $state(
    parseInt(window.localStorage.getItem("level") ?? 0),
  );
  let maxLevel = $state(currentLevel);
  // Derived runes cannot self-reference :(
  $effect(() => (maxLevel = Math.max(maxLevel, currentLevel)));
  $effect(() => window.localStorage.setItem("level", maxLevel));
  let level = $derived(levels[currentLevel]);
  $effect(() => {
    level;
    window.scrollTo(0, 0);
  });

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

  let solved = $derived(
    derived(
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
    ),
  );
</script>

<div class="button-bar">
  {#if 0 < currentLevel}
    <button onclick={() => currentLevel--}> &larr; Previous </button>
  {:else}
    <span></span>
  {/if}
  <h1 style="text-align: center;">Level {currentLevel + 1}</h1>
  {#if currentLevel < levels.length - 1}
    <button
      onclick={() => currentLevel++}
      disabled={!($solved || currentLevel < maxLevel)}
    >
      Next &rarr;
    </button>
  {:else}
    <span></span>
  {/if}
</div>

<p style="white-space: pre-wrap; hyphens: auto;">
  {@html level.text.trim()}
</p>

<div class="side-by-side wide">
  {#each [solution, levelData] as rows, sheet}
    <Table {rows} {sheet} {solution} />
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
  <div style="padding-left: 1rem;">
    <ul>
      {#each Object.entries(functions) as [name, f]}
        {#if f.toString().match(/native code/i)}
          <li><code style="background: none;">{name}</code></li>
        {:else}
          <li style="list-style: none; margin: 0 -0.9rem;">
            <details>
              <summary><code style="background: none;">{name}</code></summary>
              <div
                style="
                  border-left: 1px solid var(--fg-color); 
                  margin-left: 0.3rem; 
                  padding-left: 0.7rem;
                "
              >
                <pre>{f.toString()}</pre>
              </div>
            </details>
          </li>
        {/if}
      {/each}
    </ul>
  </div>
</details>

<div style="min-height: 50vh">
  <!-- Padding for mobile keyboard convenience -->
</div>
