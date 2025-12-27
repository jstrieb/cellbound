<style>
  .buttons {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    transform: translateY(var(--bottom));
    padding: 0.25em 0.5em;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5ch;
    overflow: auto;
  }

  button {
    aspect-ratio: 1 / 1;
    font-family: monospace, monospace;
    text-align: center;
    padding: 0.25em;
    min-width: 2.5em;
  }
</style>

<script>
  let innerWidth = $state(window.innerWidth),
    innerHeight = $state(window.innerHeight);

  let width = $state(innerWidth),
    height = $state(innerHeight),
    offsetTop = $state(0);
  function update(e) {
    const viewport = e.target;
    width = viewport.width;
    height = viewport.height;
    offsetTop = viewport.offsetTop;
  }
  window.visualViewport.addEventListener("resize", update);
  window.visualViewport.addEventListener("scroll", update);

  let bottom = $derived(innerHeight - height - offsetTop);

  let scrolled = $state(false);

  const keys = [
    "=",
    "R",
    "C",
    ":",
    "[",
    "]",
    "-",
    "+",
    "*",
    "/",
    "(",
    ")",
    '"',
    "\\",
  ];
</script>

<svelte:window bind:innerWidth bind:innerHeight />

{#if innerHeight - height > 128}
  <div
    class="buttons wide"
    style:--bottom="{-1 * bottom}px"
    on:scroll={() => (scrolled = true)}
  >
    {#each keys as key}
      <button
        on:touchstart={() => {
          scrolled = false;
        }}
        on:touchend|nonpassive={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }}
        on:pointerup={(e) => {
          if (scrolled) return;
          const input = document.activeElement;
          if (!input) return;
          input?.setRangeText?.(
            key,
            input.selectionStart,
            input.selectionEnd,
            "end",
          );
          // Event (with bubbling) is necessary for Svelte reactive variables to
          // update to match the textarea value
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }}>{key}</button
      >
    {/each}
  </div>
{/if}
