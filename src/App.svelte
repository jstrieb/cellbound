<style>
  .container {
    max-width: 100%;
    max-height: 100%;
    overflow: auto;
  }

  table {
    border-collapse: collapse;
  }

  td {
    border: 1px solid var(--fg-color);
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
  const rows = $state(
    new Array(3).fill().map(() => new Array(3).fill().map(() => null)),
  );
</script>

<div class="container">
  <table>
    <tbody>
      {#each rows as row, i}
        <tr>
          {#each row as col, j}
            <td>
              <div>
                <input
                  type="text"
                  style="border-bottom: 1px dashed var(--fg-color)"
                  placeholder="Formula"
                  bind:value={rows[i][j]}
                />
                <p style="padding: 0.25rem; min-height: 1.5rem;">
                  {#if rows[i][j]}
                    {rows[i][j]}
                  {:else}
                    <span style="color: darkgray;">Calculated Value</span>
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
<pre>
{JSON.stringify(rows, "", 2)}
</pre>
