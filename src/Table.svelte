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
</style>

<script>
  import TableCell from "./Cell.svelte";
  import { ParseError } from "./lib/parsers.js";
  import { formula } from "./formula.js";
  import { debounce } from "./lib/helpers.js";

  let { rows, sheet, solution } = $props();

  $effect(() => {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        $effect(() => {
          try {
            if (cell.reference) {
              cell.formula =
                rows[cell.reference.row ?? i][cell.reference.col ?? j].formula;
            }
            const parsed = formula.parse(cell.formula);
            const computed = parsed?.compute
              ? parsed.compute(rows, i, j)
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
          // Hack to force unsubscribing and cleaning up
          return () => cell.value.rederive([], () => {});
        });
      }
    }
  });
</script>

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
