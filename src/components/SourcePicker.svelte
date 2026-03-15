<script>
    import { SOURCE_CHOICES, CATEGORY_SWITCH } from "./ethos_constants.js";

    // Emits the selected source object reactively via bind:source
    export let source = Object.values(SOURCE_CHOICES)[0];
    export let initialKey = null;
    export let onkeychange = undefined;

    let selectedKey =
        initialKey && SOURCE_CHOICES[initialKey]
            ? initialKey
            : Object.keys(SOURCE_CHOICES)[0];
    let sliderValue = source.value ?? 0;

    // When the key changes, reset to the source defaults
    function onKeyChange() {
        const s = SOURCE_CHOICES[selectedKey];
        sliderValue = s.value ?? 0;
        trackedMin = sliderValue;
        trackedMax = sliderValue;
        source = { ...s, minValue: trackedMin, maxValue: trackedMax };
        onkeychange?.({ source });
    }

    // When the key changes, also reset tracked min/max
    let trackedMin = source.value ?? 0;
    let trackedMax = source.value ?? 0;

    function _applyValue(v) {
        trackedMin = Math.min(trackedMin, v);
        trackedMax = Math.max(trackedMax, v);
        source = {
            ...source,
            value: v,
            minValue: trackedMin,
            maxValue: trackedMax,
        };
    }

    // When the slider moves, patch source.value reactively
    function onSliderInput() {
        _applyValue(sliderValue);
    }

    function onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? step : -step;
        sliderValue = Math.min(
            maximum,
            Math.max(minimum, Number((sliderValue + delta).toFixed(decimals))),
        );
        _applyValue(sliderValue);
    }

    $: decimals = source.decimals ?? 0;
    $: step =
        source.category === CATEGORY_SWITCH ? 100 : Math.pow(10, -decimals);
    $: minimum = source.minimum ?? -1024;
    $: maximum = source.maximum ?? 1024;
    $: unit = source.unit ?? "";

    $: displayValue = `${Number(sliderValue).toFixed(decimals)}`;
</script>

<div class="source-picker">
    <div class="row">
        <label class="pick-label" for="src-select">Source</label>
        <select
            id="src-select"
            class="src-select"
            bind:value={selectedKey}
            on:change={onKeyChange}
        >
            {#each Object.keys(SOURCE_CHOICES) as key}
                <option value={key}>{key}</option>
            {/each}
        </select>
    </div>

    <div class="value-display">{displayValue}</div>

    <div class="row slider-row">
        <span class="range-bound">{Number(minimum).toFixed(decimals)}</span>
        <input
            type="range"
            class="slider"
            min={minimum}
            max={maximum}
            {step}
            bind:value={sliderValue}
            on:input={onSliderInput}
            on:wheel={onWheel}
        />
        <span class="range-bound">{Number(maximum).toFixed(decimals)}</span>
    </div>
</div>

<style>
    * {
        margin-top: 0;
    }

    .source-picker {
        width: 300px;
        background: var(--sl-color-bg-sidebar, #1b1b1f);
        border: 1px solid var(--sl-color-hairline, #3a3a3c);
        border-radius: 8px;
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-family: var(--sl-font, system-ui, sans-serif);
        font-size: 18px;
        color: var(--sl-color-text, #f0f0f0);
        box-sizing: border-box;
        margin-top: 0px;
    }

    .row {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .pick-label {
        flex-shrink: 0;
        font-size: 13px;
        color: var(--sl-color-text-accent, #8e8e93);
    }

    .src-select {
        flex: 1;
        background: var(--sl-color-bg, #23262f);
        border: 1px solid var(--sl-color-hairline, #3a3a3c);
        border-radius: 6px;
        color: var(--sl-color-text, #f0f0f0);
        font-size: 18px;
        height: 32px;
        padding: 0 8px;
        cursor: pointer;
        outline: none;
        margin-top: 0px;
    }
    .src-select:focus {
        border-color: var(--sl-color-accent, #0a84ff);
    }

    .value-display {
        text-align: center;
        font-size: 18px;
        font-weight: 700;
        color: var(--sl-color-white, #ffffff);
        letter-spacing: 0.02em;
        line-height: 1.2;
        min-height: 28px;
        margin-top: 10px;
    }

    .slider-row {
        gap: 8px;
    }

    .range-bound {
        font-size: 11px;
        color: var(--sl-color-text-accent, #8e8e93);
        flex-shrink: 0;
        min-width: 28px;
        text-align: center;
    }

    .slider {
        flex: 1;
        accent-color: var(--sl-color-accent, #0a84ff);
        cursor: pointer;
        height: 4px;
    }
</style>
