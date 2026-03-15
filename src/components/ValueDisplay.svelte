<script>
    import { CATEGORY_TELEMETRY_SENSOR } from "./ethos_constants.js";
    import { afterUpdate } from "svelte";

    // Adjustable dimensions
    export let width = "320px"; //"430px";
    export let height = "120px"; // "180px";

    // Data source object
    export let source = {};

    // Display options object
    export let options = {};

    // --- Source defaults ---
    $: _unit = source.unit ?? "";
    $: _name = source.name ?? "---";
    $: _value = source.value ?? 0;
    $: _isSensor = source.category === CATEGORY_TELEMETRY_SENSOR;
    $: _minValue = source.minValue ?? _value;
    $: _maxValue = source.maxValue ?? _value;
    $: _minimum = source.minimum ?? -1024;
    $: _maximum = source.maximum ?? 1024;
    $: decimals = source.decimals ?? 0;
    // title: array | string | null | undefined → falls back to name
    $: _title = source.title !== undefined ? source.title : _name;

    // --- Option defaults ---
    $: _showTitle = options.showTitle ?? true;
    $: _showMinMax = options.showMinMax ?? _isSensor === true;
    $: _useBackground = options.useBackground ?? false;
    $: _textColor = options.textColor ?? "#ffffff";
    $: _backgroundColor = options.backgroundColor ?? "#333333";
    // Title size is intentionally fixed; value / min-max sizes are adjustable
    $: _titleFontSize = options.titleFontSize ?? "18px";
    $: _valueFontSize = options.valueFontSize ?? "48px";
    $: _minMaxFontSize = options.minMaxFontSize ?? "24px";

    // Auto-shrink value font size on overflow
    let valueArea;
    let _autoValueFontSize = _valueFontSize;
    $: _autoValueFontSize = _valueFontSize; // reset when prop changes
    const _fontSizeCandidates = [48, 36, 24, 18, 14];
    afterUpdate(() => {
        if (!valueArea) return;
        // Find the numeric base size from configured font
        const base = parseInt(_valueFontSize) || 48;
        const candidates = _fontSizeCandidates.filter((s) => s <= base);
        for (const size of candidates) {
            const candidate = size + "px";
            if (candidate !== _autoValueFontSize)
                _autoValueFontSize = candidate;
            // Check all lines for overflow after applying this size
            const lines = valueArea.querySelectorAll(".value-line");
            const overflows = Array.from(lines).some(
                (el) => el.scrollWidth > valueArea.clientWidth + 1,
            );
            if (!overflows) return;
        }
    });

    // --- Resolved colors ---
    $: _bgColor = _useBackground ? _backgroundColor : "#292829";
    $: _titleColor = _useBackground ? _textColor : "#888888";
    $: _valueColor = _textColor;
    $: _minMaxColor = _useBackground ? _textColor : "#ffffff";
    $: _dividerColor = _useBackground ? _textColor + "55" : "#ffffff";

    $: _displayLines = (() => {
        if (source.stringValue) {
            const result = source.stringValue(_value);
            return Array.isArray(result) ? result : [result];
        }
        const fmt = (v) => `${Number(v).toFixed(decimals)}${_unit}`;
        if (Array.isArray(_value)) return _value.map(fmt);
        if (_value != null) return [fmt(_value)];
        return [];
    })();
    $: _maxDisplay = Number(_maxValue).toFixed(decimals);
    $: _minDisplay = Number(_minValue).toFixed(decimals);

    // --- Title lines ---
    $: _titleLines = (() => {
        if (!_showTitle) return [];
        if (Array.isArray(_title)) return _title.map(String);
        if (_title != null && _title !== "") return [String(_title)];
        return [];
    })();
</script>

<div
    class="gauge"
    style="
    width: {width};
    height: {height};
    --bg-color: {_bgColor};
    --title-color: {_titleColor};
    --value-color: {_valueColor};
    --minmax-color: {_minMaxColor};
    --divider-color: {_dividerColor};
    --title-font-size: {_titleFontSize};
    --value-font-size: {_autoValueFontSize};
    --minmax-font-size: {_minMaxFontSize};
  "
>
    <!-- Main area: title (top) + value (centered in remaining space) -->
    <div class="main">
        {#if _titleLines.length > 0}
            <div class="title-area">
                {#each _titleLines as line}
                    <span class="title-line">{line}</span>
                {/each}
            </div>
        {/if}

        <div class="value-area" bind:this={valueArea}>
            {#each _displayLines as line}
                <span class="value-line">{line}</span>
            {/each}
        </div>
    </div>

    <!-- Absolute top-right: max / divider / min -->
    {#if _showMinMax}
        <div class="minmax-area">
            <span class="limit-text">{_maxDisplay}↑</span>
            <div class="minmax-divider"></div>
            <span class="limit-text">{_minDisplay}↓</span>
        </div>
    {/if}
</div>

<style>
    * {
        margin-top: 0;
    }

    .gauge {
        position: relative;
        display: flex;
        flex-direction: row;
        background-color: var(--bg-color);
        border-radius: 8px;
        padding: 4px 14px;
        box-sizing: border-box;
        font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;
        overflow: hidden;
    }

    /* ── Main column ── */
    .main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
    }

    .title-area {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 1px;
    }

    .title-line {
        display: block;
        font-size: var(--title-font-size);
        color: var(--title-color);
        font-weight: 600;
        letter-spacing: 0.07em;
        /* text-transform: uppercase; */
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
    }

    .value-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 0;
        margin-top: 0px;
    }

    .value-line {
        display: block;
        font-size: var(--value-font-size);
        color: var(--value-color);
        font-weight: 700;
        line-height: 1.1;
        text-align: center;
        white-space: nowrap;
    }

    /* ── Min/Max absolute top-right ── */
    .minmax-area {
        position: absolute;
        top: 4px;
        right: 12px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;
        margin-top: 0px;
    }

    .limit-text {
        display: block;
        width: 100%;
        font-size: var(--minmax-font-size);
        color: var(--minmax-color);
        font-weight: 500;
        text-align: right;
        white-space: nowrap;
        line-height: 1.2;
    }

    .minmax-divider {
        width: 100%;
        min-width: 28px;
        height: 1px;
        background-color: var(--divider-color);
    }
</style>
