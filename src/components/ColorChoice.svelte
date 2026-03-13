<script>
  export let value = "#34c759";
  export let colors = [
    "#ff3b30",
    "#ff9500",
    "#ffcc00",
    "#34c759",
    "#007aff",
    "#af52de"
  ];

  let isOpen = false;

  function toggleMenu() {
    isOpen = !isOpen;
  }

  function selectColor(color) {
    value = color;
    isOpen = false;
  }

  function handleClickOutside(e) {
    if (!e.target.closest(".color-choice")) {
      isOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="color-choice" data-value={value}>
  <button class="select" on:click={toggleMenu}>
    <span class="square" style={`background:${value}`}></span>
    <svg class="arrow" viewBox="0 0 24 24">
      <path d="M7 10l5 5 5-5" />
    </svg>
  </button>

  <div class="menu" class:open={isOpen}>
    {#each colors as color}
      <div class="option" data-color={color} on:click={() => selectColor(color)}>
        <span class="square" style={`background:${color}`}></span>
      </div>
    {/each}
  </div>
</div>

<style>
  .color-choice {
    position: relative;
    width: 60px;
    margin-top: 0;
  }

  .select {
    width: 100%;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #111;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 0 8px;
    cursor: pointer;
    color: #ddd;
  }

  .arrow {
    width: 16px;
    height: 16px;
    stroke: #ddd;
    stroke-width: 2.5;
    fill: none;
    margin-left: 6px;
    flex-shrink: 0;
  }

  .square {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    border: 1px solid #555;
  }

  .menu {
    display: none;
    position: absolute;
    top: 16px;
    width: 100%;
    background: #222;
    border: 1px solid #444;
    border-radius: 4px;
    overflow: hidden;
  }

  .menu.open {
    display: block;
  }

  .option {
    height: 28px;
    display: flex;
    align-items: center;
    padding-left: 8px;
    cursor: pointer;
    margin-top: 0;
  }

  .option:hover {
    background: #333;
  }
</style>
