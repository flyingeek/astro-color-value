<script>
    import SourcePicker from "./SourcePicker.svelte";
    import ValueDisplay from "./ValueDisplay.svelte";
    import ConfigPanel from "./ConfigPanel.svelte";
    import {
        SOURCE_CHOICES,
        CATEGORY_TELEMETRY_SENSOR,
        parseTags,
    } from "./ethos_constants.js";

    export let widgetName = "Color Value";
    export let logics = [];
    export let options = {};
    export let initialSource = null;

    // Shared source — updated by SourcePicker, consumed by ValueDisplay & ConfigPanel
    let source =
        initialSource && SOURCE_CHOICES[initialSource]
            ? {
                  ...SOURCE_CHOICES[initialSource],
                  minValue: SOURCE_CHOICES[initialSource].value ?? 0,
                  maxValue: SOURCE_CHOICES[initialSource].value ?? 0,
              }
            : Object.values(SOURCE_CHOICES)[0];

    // Toggle states — bound to ConfigPanel, forwarded to ValueDisplay
    let showMinMax =
        options.showMinMax ?? source.category === CATEGORY_TELEMETRY_SENSOR;
    let useBackground = options.useBackground ?? false;
    let useState = options.useState ?? false;
    let showTitle = options.showTitle ?? true;

    // Match values — bound from ConfigPanel
    let matchedColor = null;
    let matchedBgColor = null;
    let matchedTitle = null;
    let matchedText = null;

    $: liveOptions = {
        ...options,
        showMinMax,
        useBackground,
        useState,
        showTitle,
        ...(matchedColor !== null ? { textColor: matchedColor } : {}),
        ...(matchedBgColor !== null ? { backgroundColor: matchedBgColor } : {}),
    };

    // When useState is on, override source title and/or stringValue from matched case
    $: liveSource = (() => {
        // Always read these so Svelte tracks them as dependencies
        const mt = matchedTitle;
        const mx = matchedText;
        if (!useState) return source;
        const hasTitle = mt !== null;
        const hasText = mx !== null;
        if (!hasTitle && !hasText) return source;
        const overrides = {};
        if (hasTitle) overrides.title = parseTags(mt, source);
        if (hasText) overrides.stringValue = () => parseTags(mx, source);
        return { ...source, ...overrides };
    })();
</script>

<div class="simulator">
    <div class="top-row">
        <div class="value-wrapper">
            <ValueDisplay
                source={liveSource}
                options={liveOptions}
                width="300px"
                height="120px"
            />
        </div>
        <SourcePicker bind:source initialKey={initialSource} />
    </div>
    <ConfigPanel
        {source}
        {options}
        {logics}
        {widgetName}
        bind:showMinMax
        bind:useBackground
        bind:useState
        bind:showTitle
        bind:matchedColor
        bind:matchedBgColor
        bind:matchedTitle
        bind:matchedText
    />
</div>

<style>
    * {
        margin-top: 0;
    }

    .simulator {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        max-width: 720px;
    }

    .top-row {
        display: flex;
        gap: 8px;
        align-items: stretch;
        height: 120px;
    }

    .value-wrapper {
        flex: 1;
        min-width: 0;
    }
</style>
