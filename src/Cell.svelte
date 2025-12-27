<style>
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
    position: relative;
  }

  input {
    border: none;
    padding: 0.25rem;
    font-family: monospace, monospace;
    border-bottom: 1px dashed lightgray;
  }

  input:disabled {
    background: #f0f0f0;
  }

  .error {
    border: 2px solid red;
  }

  .correct {
    background: #e0ffe0;
  }

  .incorrect {
    background: #ffe0e0;
  }

  .star {
    position: absolute;
    top: 0.5rem;
    right: 0.5ch;
    background: none;
    opacity: 0.5;
  }
</style>

<script>
  import { debounce } from "./lib/helpers.js";

  let { cell, value, solution, input } = $props();

  let correct = $state(false);
  const setCorrect = debounce(
    (nocheck, x, y) => (correct = nocheck || x == y),
    50,
  );
  $effect(() => setCorrect(cell.nocheck, $value, $solution));
</script>

<td>
  <div>
    {#if cell.hidden}
      <input type="text" value="[HIDDEN]" disabled />
    {:else if cell.locked || cell.reference}
      <input type="text" bind:value={cell.formula} disabled />
      {#if cell.reference}
        <span class="star">*</span>
      {/if}
    {:else}
      <input
        type="text"
        inputmode="decmial"
        bind:value={cell.formula}
        onfocus={(e) => {
          e.target.select();
        }}
      />
    {/if}
    <p
      class:error={cell.error}
      style="
        padding: 0.25rem; 
        min-height: 1.5rem; 
        white-space: pre;
        {cell.style ?? ''}
      "
      class:correct={input && correct}
      class:incorrect={input && !correct}
    >
      {#if cell.error}
        {cell.error}
      {:else if cell.valueHidden}
        [HIDDEN]
      {:else if typeof $value == "string"}
        {$value || " "}
      {:else}
        {JSON.stringify($value)}
      {/if}
    </p>
  </div>
</td>
