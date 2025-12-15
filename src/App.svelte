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
</style>

<script>
  import { formula } from "./formula.js";

  const rows = $state(
    new Array(3).fill().map(() => new Array(3).fill().map(() => null)),
  );
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
                  bind:value={rows[i][j]}
                />
                <p
                  style="padding: 0.25rem; min-height: 1.5rem; white-space: pre;"
                >
                  {#if rows[i][j]}
                    {(() => {
                      try {
                        return JSON.stringify(formula.parse(rows[i][j]));
                      } catch {
                        return rows[i][j];
                      }
                    })()}
                  {/if}
                </p>
              </div>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
