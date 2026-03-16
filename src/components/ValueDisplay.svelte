<script>
    import { CATEGORY_TELEMETRY_SENSOR } from "./ethos_constants.js";

    // Adjustable dimensions
    let {
        width = "320px",
        height = "120px",
        source = {},
        options = {},
    } = $props();

    // --- Source defaults ---
    let _unit = $derived(source.unit ?? "");
    let _name = $derived(source.name ?? "---");
    let _value = $derived(source.value ?? 0);
    let _isSensor = $derived(source.category === CATEGORY_TELEMETRY_SENSOR);
    let _minValue = $derived(source.minValue ?? _value);
    let _maxValue = $derived(source.maxValue ?? _value);
    let _minimum = $derived(source.minimum ?? -1024);
    let _maximum = $derived(source.maximum ?? 1024);
    let decimals = $derived(source.decimals ?? 0);
    // title: array | string | null | undefined → falls back to name
    let _title = $derived(source.title !== undefined ? source.title : _name);

    // --- Option defaults ---
    let _showTitle = $derived(options.showTitle ?? true);
    let _showMinMax = $derived(options.showMinMax ?? _isSensor === true);
    let _useBackground = $derived(options.useBackground ?? false);
    let _textColor = $derived(options.textColor ?? "#ffffff");
    let _backgroundColor = $derived(options.backgroundColor ?? "#333333");
    // Title size is intentionally fixed; value / min-max sizes are adjustable
    let _titleFontSize = $derived(options.titleFontSize ?? "18px");
    let _valueFontSize = $derived(options.valueFontSize ?? "48px");
    let _minMaxFontSize = $derived(options.minMaxFontSize ?? "24px");

    // --- Display lines ---
    let _displayLines = $derived.by(() => {
        if (source.stringValue) {
            const result = source.stringValue(_value);
            return Array.isArray(result) ? result : [result];
        }
        const fmt = (v) => `${Number(v).toFixed(decimals)}${_unit}`;
        if (Array.isArray(_value)) return _value.map(fmt);
        if (_value != null) return [fmt(_value)];
        return [];
    });
    let _maxDisplay = $derived(Number(_maxValue).toFixed(decimals));
    let _minDisplay = $derived(Number(_minValue).toFixed(decimals));

    // --- Title lines ---
    let _titleLines = $derived.by(() => {
        if (!_showTitle) return [];
        if (Array.isArray(_title)) return _title.map(String);
        if (_title != null && _title !== "") return [String(_title)];
        return [];
    });

    // --- Resolved colors ---
    let _bgColor = $derived(_useBackground ? _backgroundColor : "#292829");
    let _titleColor = $derived(_useBackground ? _textColor : "#888888");
    let _valueColor = $derived(_textColor);
    let _minMaxColor = $derived(_useBackground ? _textColor : "#ffffff");
    let _dividerColor = $derived(
        _useBackground ? _textColor + "55" : "#ffffff",
    );

    // Auto-shrink value font size on overflow (client-only, null = not measured yet)
    let valueArea = $state(null);
    let _shrunkFontSize = $state(null);
    const _fontSizeCandidates = [48, 36, 30, 24];

    $effect(() => {
        _shrunkFontSize = null; // reset when valueFontSize changes
        _valueFontSize;
    });

    $effect(() => {
        if (!valueArea) return;
        _displayLines; // track content changes
        const base = parseInt(_valueFontSize) || 48;
        const candidates = _fontSizeCandidates.filter((s) => s <= base);
        for (const size of candidates) {
            const candidate = size + "px";
            _shrunkFontSize = candidate;
            // Check all lines for overflow after applying this size
            const lines = valueArea.querySelectorAll(".value-line");
            const overflows = Array.from(lines).some(
                (el) => el.scrollWidth > valueArea.clientWidth + 1,
            );
            if (!overflows) return;
        }
    });
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
    --value-font-size: {_shrunkFontSize ?? _valueFontSize};
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
