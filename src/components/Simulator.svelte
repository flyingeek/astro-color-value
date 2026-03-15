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

    // Shared source — updated by SourcePicker, consumed by ValueDisplay & ConfigPanel
    let source = Object.values(SOURCE_CHOICES)[0];

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
        if (!useState || (matchedTitle === null && matchedText === null))
            return source;
        const overrides = {};
        if (matchedTitle !== null)
            overrides.title = parseTags(matchedTitle, source);
        if (matchedText !== null)
            overrides.stringValue = () => parseTags(matchedText, source);
        return { ...source, ...overrides };
    })();
</script>

<div class="simulator">
    <div class="top-row">
        <div class="value-wrapper">
            <ValueDisplay
                source={liveSource}
                options={liveOptions}
                width="100%"
                height="100%"
            />
        </div>
        <SourcePicker bind:source />
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
        max-width: 800px;
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
