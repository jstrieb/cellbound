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
  }

  input[type="text"] {
    border: none;
    padding: 0.25rem;
    font-family: monospace, monospace;
  }

  .error {
    border: 2px solid red;
  }
</style>

<script>
  let { cell, value } = $props();
</script>

<td>
  <div>
    <input
      type="text"
      style="border-bottom: 1px dashed lightgray;"
      bind:value={cell.formula}
    />
    <p
      class:error={cell.error}
      style="
        padding: 0.25rem; 
        min-height: 1.5rem; 
        white-space: pre;
      "
    >
      {typeof $value == "string" ? $value : JSON.stringify($value)}
    </p>
  </div>
</td>
