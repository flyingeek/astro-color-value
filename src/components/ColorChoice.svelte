<script>
    import { COLOR_CHOICES } from "./ethos_constants.js";

    export let value = "#34c759";
    export let colors = COLOR_CHOICES;

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
            <div
                class="option"
                data-color={color}
                on:click={() => selectColor(color)}
            >
                <span class="square" style={`background:${color}`}></span>
            </div>
        {/each}
    </div>
</div>

<style>
    .color-choice {
        position: relative;
        width: 50px;
        margin-top: 0;
    }

    .select {
        width: 100%;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #3a3a3c;
        border: 1px solid #545456;
        border-radius: 6px;
        padding: 0 4px;
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
        border: 1px solid #ffffff;
    }

    .menu {
        display: none;
        position: absolute;
        top: calc(100% + 2px);
        right: 0;
        grid-template-columns: repeat(3, 1fr);
        gap: 3px;
        padding: 4px;
        background: #3a3a3c;
        border: 1px solid #545456;
        border-radius: 6px;
        z-index: 10;
    }

    .menu.open {
        display: grid;
    }

    .option {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 3px;
        margin-top: 0;
    }

    .option:hover {
        background: #48484a;
    }

    .option .square {
        width: 18px;
        height: 18px;
    }
</style>
