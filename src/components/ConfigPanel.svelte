<script>
    import ColorChoice from "./ColorChoice.svelte";
    import {
        CATEGORY_TELEMETRY_SENSOR,
        resolveColor,
    } from "./ethos_constants.js";

    export let widgetName = "Color Value";

    // Data source object — same structure as ValueDisplay
    export let source = {};

    // Display options object — same structure as ValueDisplay
    export let options = {};

    // Initial logic cases array
    export let logics = [
        {
            op: " ≤ ",
            threshold: 3.5,
            color: "#ff3b30",
            bgcolor: "#ff3b30",
            title: "",
            text: "",
        },
        {
            op: " < ",
            threshold: 3.7,
            color: "#ff9500",
            bgcolor: "#ff9500",
            title: "",
            text: "",
        },
        {
            op: " < ",
            threshold: 3.9,
            color: "#ffcc00",
            bgcolor: "#ffcc00",
            title: "",
            text: "",
        },
    ];

    // --- Source reactives (matching ValueDisplay) ---
    $: _name = source.name ?? "---";
    $: _unit = source.unit ?? "";
    $: _value = source.value ?? 0;
    $: _isSensor = source.category === CATEGORY_TELEMETRY_SENSOR;
    $: _minimum = source.minimum ?? -1024;
    $: _maximum = source.maximum ?? 1024;
    $: _decimals = source.decimals ?? 0;
    $: _step = Math.pow(10, -_decimals);

    // Reset cases when source changes
    let _prevSourceName = source.name;
    $: if (source.name !== _prevSourceName) {
        _prevSourceName = source.name;
        cases = [];
        nextId = 0;
    }

    // --- Toggle states (bindable from parent, initialised from options) ---
    export let showMinMax =
        options.showMinMax ?? source.category === CATEGORY_TELEMETRY_SENSOR;
    export let useBackground = options.useBackground ?? false;
    export let useState = options.useState ?? false;
    export let showTitle = options.showTitle ?? true;
    let logicPanelOpen = true;
    let infoPanelOpen = false;

    const MAX_CONDITIONS = 5;
    const operators = [" ≤ ", " < ", " = ", " > ", " ≥ "];

    // Internal mutable copy of logics (keyed by _id)
    let cases = logics.map((l, i) => ({
        ...l,
        _id: i,
        color: resolveColor(l.color),
        bgcolor: resolveColor(l.bgcolor),
    }));
    let nextId = cases.length;

    function addCase() {
        if (cases.length >= MAX_CONDITIONS) return;
        const prev = cases[cases.length - 1];
        cases = [
            ...cases,
            {
                _id: nextId++,
                op: prev?.op ?? " = ",
                threshold: prev?.threshold ?? 0,
                color: "#34c759",
                bgcolor: "#34c759",
                title: "",
                text: "",
            },
        ];
    }

    function removeCase(id) {
        cases = cases.filter((c) => c._id !== id);
    }

    // Match logic: first case whose condition is satisfied by _value
    const epsilon = 1e-6;
    function computeMatchIndex(value, caseList) {
        const v = Number(value);
        for (let i = 0; i < caseList.length; i++) {
            const { op, threshold } = caseList[i];
            const t = Number(threshold);
            let m = false;
            if (op.includes("≤")) m = v <= t + epsilon;
            else if (op.trim() === "<") m = v < t;
            else if (op.includes("=")) m = Math.abs(v - t) <= epsilon;
            else if (op.trim() === ">") m = v > t;
            else if (op.includes("≥")) m = v >= t - epsilon;
            if (m) return i;
        }
        return -1;
    }
    $: matchedIndex = computeMatchIndex(_value, cases);
    export let matchedColor = null;
    export let matchedBgColor = null;
    export let matchedTitle = null;
    export let matchedText = null;
    $: matchedColor = matchedIndex >= 0 ? cases[matchedIndex].color : null;
    $: matchedBgColor = matchedIndex >= 0 ? cases[matchedIndex].bgcolor : null;
    $: matchedTitle =
        matchedIndex >= 0 && cases[matchedIndex].title
            ? cases[matchedIndex].title
            : null;
    $: matchedText =
        matchedIndex >= 0 && cases[matchedIndex].text
            ? cases[matchedIndex].text
            : null;

    // SVG trash bin matching Ethos mask_delete_icon style
    const deleteIconSvg = `<svg viewBox="0 0 20 22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 0a1 1 0 00-1 1v1H2a1 1 0 000 2h16a1 1 0 000-2h-4V1a1 1 0 00-1-1H7zm0 2h6v1H7V2z"/>
    <path d="M3.4 6a.5.5 0 00-.5.54l1.2 13A1 1 0 005.1 20h9.8a1 1 0 001-.46l1.2-13A.5.5 0 0016.6 6H3.4zm3.1 2h.5l.6 9h-1l-.1-9zm3 0h1v9h-1V8zm3 0h.5l-.1 9h-1l.6-9z"/>
  </svg>`;
</script>

<!-- Ethos screen: 800×480 px -->
<div class="ethos-screen">
    <!-- Title bar -->
    <div class="form-header">
        <span class="form-title">{widgetName}</span>
        <div class="header-actions">
            <button class="header-btn ok">✓</button>
            <button class="header-btn close">✕</button>
        </div>
    </div>

    <!-- Scrollable form -->
    <div class="form-content">
        <!-- Source row -->
        <div class="form-row">
            <span class="row-label">Source</span>
            <div class="row-ctrl">
                <div class="source-field">
                    <span class="source-name">{_name}</span>
                    <span class="dropdown-arrow">▾</span>
                </div>
            </div>
        </div>
        <div class="sep"></div>

        <!-- Logic expansion panel -->
        <button
            class="expansion-header"
            on:click={() => (logicPanelOpen = !logicPanelOpen)}
        >
            <span class="exp-icon">{logicPanelOpen ? "▾" : "▶"}</span>
            <span class="exp-title">Color to use (optional)</span>
        </button>

        {#if logicPanelOpen}
            <div class="expansion-body">
                {#if useBackground && cases.length > 0}
                    <div class="color-hint">Text color / Background Color</div>
                {/if}

                {#each cases as caseItem, i (caseItem._id)}
                    <div
                        class="case-block"
                        class:not-last={i < cases.length - 1}
                    >
                        <!-- Case condition row: two-column split at screen midpoint -->
                        <div class="case-row">
                            <!-- LEFT: Case label + delete + condition label -->
                            <div class="case-left">
                                <span
                                    class="case-lbl"
                                    class:matched={i === matchedIndex}
                                    >Case {i + 1}</span
                                >
                                <button
                                    class="del-btn"
                                    title="Delete"
                                    on:click={() => removeCase(caseItem._id)}
                                >
                                    {@html deleteIconSvg}
                                </button>
                                <span class="cond-lbl">If {_name}</span>
                            </div>
                            <!-- RIGHT: operator + threshold + color(s) -->
                            <div class="case-right">
                                <select class="op-sel" bind:value={caseItem.op}>
                                    {#each operators as op}
                                        <option value={op}>{op}</option>
                                    {/each}
                                </select>
                                <div class="thr-wrap">
                                    <input
                                        type="number"
                                        class="thr-inp"
                                        bind:value={caseItem.threshold}
                                        step={_step}
                                        min={_minimum}
                                        max={_maximum}
                                    />
                                    {#if _unit}<span class="thr-unit"
                                            >{_unit}</span
                                        >{/if}
                                </div>
                                <div class="colors">
                                    <ColorChoice bind:value={caseItem.color} />
                                    {#if useBackground}
                                        <ColorChoice
                                            bind:value={caseItem.bgcolor}
                                        />
                                    {/if}
                                </div>
                            </div>
                        </div>

                        <!-- State sub-rows (when useState is on) -->
                        {#if useState}
                            {#if showTitle}
                                <div class="sub-row">
                                    <span class="sub-lbl">Title (optional)</span
                                    >
                                    <div class="sub-right">
                                        <input
                                            type="text"
                                            class="sub-inp"
                                            bind:value={caseItem.title}
                                            on:input={() => (cases = cases)}
                                            placeholder="…"
                                        />
                                        <button class="tag-btn">···</button>
                                    </div>
                                </div>
                            {/if}
                            <div class="sub-row">
                                <span class="sub-lbl">State (optional)</span>
                                <div class="sub-right">
                                    <input
                                        type="text"
                                        class="sub-inp"
                                        bind:value={caseItem.text}
                                        on:input={() => (cases = cases)}
                                        placeholder="…"
                                    />
                                    <button class="tag-btn">···</button>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/each}

                <!-- Add row: right half holds info-btn + add-btn -->
                {#if cases.length < MAX_CONDITIONS}
                    <div class="add-row">
                        <div class="add-row-left"></div>
                        <div class="add-row-right">
                            <button class="info-btn" title="Help">i</button>
                            <button class="add-btn" on:click={addCase}>+</button
                            >
                        </div>
                    </div>
                {/if}
            </div>
        {/if}

        <div class="sep"></div>

        <!-- showMinMax toggle (sensors only) -->
        {#if _isSensor}
            <div class="form-row">
                <span class="row-label">Minimum and Maximum</span>
                <div class="row-ctrl">
                    <div
                        class="toggle-group"
                        on:click={() => (showMinMax = !showMinMax)}
                    >
                        <span class="tog-lbl" class:active={!showMinMax}
                            >OFF</span
                        >
                        <button
                            class="toggle"
                            class:on={showMinMax}
                            aria-pressed={showMinMax}
                        >
                            <span class="thumb"></span>
                        </button>
                        <span class="tog-lbl" class:active={showMinMax}>ON</span
                        >
                    </div>
                </div>
            </div>
            <div class="sep"></div>
        {/if}

        <!-- useBackground toggle -->
        <div class="form-row">
            <span class="row-label">Background Color</span>
            <div class="row-ctrl">
                <div
                    class="toggle-group"
                    on:click={() => (useBackground = !useBackground)}
                >
                    <span class="tog-lbl" class:active={!useBackground}
                        >OFF</span
                    >
                    <button
                        class="toggle"
                        class:on={useBackground}
                        aria-pressed={useBackground}
                    >
                        <span class="thumb"></span>
                    </button>
                    <span class="tog-lbl" class:active={useBackground}>ON</span>
                </div>
            </div>
        </div>
        <div class="sep"></div>

        <!-- useState toggle -->
        <div class="form-row">
            <span class="row-label">Custom States</span>
            <div class="row-ctrl">
                <div
                    class="toggle-group"
                    on:click={() => (useState = !useState)}
                >
                    <span class="tog-lbl" class:active={!useState}>OFF</span>
                    <button
                        class="toggle"
                        class:on={useState}
                        aria-pressed={useState}
                    >
                        <span class="thumb"></span>
                    </button>
                    <span class="tog-lbl" class:active={useState}>ON</span>
                </div>
            </div>
        </div>
        <div class="sep"></div>

        <!-- showTitle toggle -->
        <div class="form-row">
            <span class="row-label">Title</span>
            <div class="row-ctrl">
                <div
                    class="toggle-group"
                    on:click={() => (showTitle = !showTitle)}
                >
                    <span class="tog-lbl" class:active={!showTitle}>OFF</span>
                    <button
                        class="toggle"
                        class:on={showTitle}
                        aria-pressed={showTitle}
                    >
                        <span class="thumb"></span>
                    </button>
                    <span class="tog-lbl" class:active={showTitle}>ON</span>
                </div>
            </div>
        </div>
        <div class="sep"></div>

        <!-- Info expansion panel -->
        <button
            class="expansion-header"
            on:click={() => (infoPanelOpen = !infoPanelOpen)}
        >
            <span class="exp-icon">{infoPanelOpen ? "▾" : "▶"}</span>
            <span class="exp-title">Widget informations</span>
        </button>
        {#if infoPanelOpen}
            <div class="expansion-body info-body">
                <div class="form-row">
                    <span class="row-label muted">GitHub repository</span>
                    <div class="row-ctrl">
                        <span class="info-val">ethos-color-value</span>
                    </div>
                </div>
                <div class="sep"></div>
                <div class="form-row">
                    <span class="row-label muted">Version</span>
                    <div class="row-ctrl">
                        <span class="info-val">1.1.0-rc3</span>
                    </div>
                </div>
                <div class="sep"></div>
                <div class="form-row">
                    <span class="row-label muted">Author</span>
                    <div class="row-ctrl">
                        <span class="info-val">github.com/flyingeek</span>
                    </div>
                </div>
            </div>
        {/if}
        <div class="sep"></div>
    </div>
    <!-- /form-content -->
</div>

<!-- /ethos-screen -->

<style>
    /* ── Container ─────────────────────────────────── */
    * {
        margin-top: 0;
    }

    .ethos-screen {
        width: 800px;
        height: 480px;
        background: #292829;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue",
            system-ui, sans-serif;
        font-size: 15px;
        color: #f0f0f0;
        box-shadow: 0 4px 32px rgba(0, 0, 0, 0.6);
    }

    /* ── Title bar ──────────────────────────────────── */
    .form-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 46px;
        padding: 0 16px;
        background: #1e1d1e;
        border-bottom: 1px solid #3a3a3c;
        flex-shrink: 0;
    }
    .form-title {
        font-size: 17px;
        font-weight: 600;
    }
    .header-actions {
        display: flex;
        gap: 8px;
    }
    .header-btn {
        width: 34px;
        height: 34px;
        border-radius: 6px;
        border: 1px solid #48484a;
        background: #2c2c2e;
        color: #f0f0f0;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .header-btn.ok {
        color: #34c759;
        border-color: #2d6a3e;
    }
    .header-btn:hover {
        background: #3a3a3c;
    }

    /* ── Scrollable form area ───────────────────────── */
    .form-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
    }
    .form-content::-webkit-scrollbar {
        width: 4px;
    }
    .form-content::-webkit-scrollbar-track {
        background: transparent;
    }
    .form-content::-webkit-scrollbar-thumb {
        background: #48484a;
        border-radius: 2px;
    }

    /* ── Two-column form row (split at screen mid = 50%) ─ */
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        min-height: 44px;
        padding: 0 16px;
        box-sizing: border-box;
    }
    .row-label {
        font-size: 15px;
    }
    .row-label.muted {
        color: #8e8e93;
    }
    /* Right cell: flex container, right-aligned */
    .row-ctrl {
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    /* ── Separator ──────────────────────────────────── */
    .sep {
        height: 1px;
        background: #3a3a3c;
        margin: 0 16px;
    }

    /* ── Source field (fills right half) ───────────── */
    .source-field {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        background: #3a3a3c;
        border: 1px solid #545456;
        border-radius: 6px;
        padding: 0 10px;
        height: 34px;
        font-size: 15px;
        cursor: default;
        user-select: none;
        box-sizing: border-box;
    }
    .source-name {
        flex: 1;
    }
    .dropdown-arrow {
        color: #8e8e93;
        margin-left: 6px;
    }

    /* ── Toggle: OFF [switch] ON ────────────────────── */
    .toggle-group {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        user-select: none;
    }
    .tog-lbl {
        font-size: 13px;
        color: #636366;
        font-weight: 500;
        transition: color 0.15s;
    }
    .tog-lbl.active {
        color: #f0f0f0;
    }
    .toggle {
        position: relative;
        width: 51px;
        height: 31px;
        border-radius: 16px;
        border: none;
        cursor: pointer;
        padding: 0;
        background: #3a3a3c;
        pointer-events: none; /* click handled by parent toggle-group */
        flex-shrink: 0;
    }
    .thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 27px;
        height: 27px;
        background: #fff;
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.45);
        transition: left 0.15s;
    }
    .toggle.on .thumb {
        left: 22px;
    }

    /* ── Expansion panel header ─────────────────────── */
    .expansion-header {
        display: flex;
        align-items: center;
        width: 100%;
        min-height: 44px;
        padding: 0 16px;
        background: #1e1d1e;
        border: none;
        cursor: pointer;
        text-align: left;
        color: #f0f0f0;
        box-sizing: border-box;
    }
    .expansion-header:hover {
        background: #252425;
    }
    .exp-icon {
        font-size: 11px;
        color: #8e8e93;
        margin-right: 10px;
        width: 10px;
        text-align: center;
    }
    .exp-title {
        font-size: 15px;
        font-weight: 500;
    }

    /* ── Expansion body ─────────────────────────────── */
    .expansion-body {
        background: #292829;
    }
    .info-body {
        background: #232223;
    }

    /* ── Color hint ─────────────────────────────────── */
    .color-hint {
        padding: 5px 16px;
        font-size: 12px;
        color: #8e8e93;
        background: #232223;
        text-align: center;
        border-bottom: 1px solid #3a3a3c;
    }

    /* ── Case block ─────────────────────────────────── */
    .case-block {
        border-bottom: 1px solid #3a3a3c;
    }
    .case-block:not(.not-last) {
        border-bottom: none;
    }

    /* ── Case row: two-column at screen midpoint ────── */
    .case-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        min-height: 44px;
        padding: 4px 16px;
        box-sizing: border-box;
        gap: 0;
    }
    /* Left cell: case-lbl + del-btn + cond-lbl (right-aligned, 10px gap to mid) */
    .case-left {
        display: flex;
        align-items: center;
        min-width: 0;
    }
    .case-lbl {
        font-size: 14px;
        color: #8e8e93;
        flex-shrink: 0;
        width: 54px;
    }
    .case-lbl.matched {
        color: #ffffff;
    }
    .del-btn {
        width: 30px;
        height: 30px;
        background: #3a3a3c;
        border: 1px solid #545456;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        flex-shrink: 0;
        color: #d0d0d0;
        margin-left: auto; /* push delete + cond-lbl to the right of the left cell */
        margin-right: 10px;
    }
    .del-btn :global(svg) {
        width: 15px;
        height: 15px;
    }
    .del-btn:hover {
        background: #4a2a2a;
        color: #ff453a;
    }
    .cond-lbl {
        flex-shrink: 0;
        font-size: 14px;
        color: #8e8e93;
        white-space: nowrap;
        padding-right: 10px; /* 10px gap before the mid-line */
    }
    /* Right cell: op + threshold + colors */
    .case-right {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
    }
    .op-sel {
        background: #3a3a3c;
        border: 1px solid #545456;
        color: #f0f0f0;
        border-radius: 6px;
        height: 32px;
        font-size: 14px;
        width: 90px;
        flex-shrink: 0;
        box-sizing: border-box;
        padding: 0 4px;
        cursor: pointer;
    }
    .thr-wrap {
        position: relative;
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
    }
    .thr-unit {
        position: absolute;
        right: 26px; /* leave room for the native number spinner */
        pointer-events: none;
        font-size: 12px;
        color: #8e8e93;
        white-space: nowrap;
    }
    .thr-inp {
        width: 100%;
        min-width: 0;
        background: #3a3a3c;
        border: 1px solid #545456;
        color: #f0f0f0;
        border-radius: 6px;
        height: 32px;
        font-size: 14px;
        box-sizing: border-box;
        padding: 0 8px;
        padding-right: 46px; /* room for unit label + spinner */
        text-align: right;
    }
    .colors {
        display: flex;
        gap: 6px;
        flex-shrink: 0;
    }

    /* ── State sub-rows: two-column at screen midpoint ─ */
    .sub-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        min-height: 38px;
        padding: 4px 16px;
        border-top: 1px solid #3a3a3c;
        box-sizing: border-box;
        gap: 0;
    }
    .sub-lbl {
        font-size: 13px;
        color: #8e8e93;
        text-align: right;
        padding-right: 10px; /* 10px gap before the mid-line */
        white-space: nowrap;
    }
    .sub-right {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
    }
    .sub-inp {
        flex: 1;
        min-width: 0;
        background: #3a3a3c;
        border: 1px solid #545456;
        color: #f0f0f0;
        border-radius: 6px;
        height: 30px;
        font-size: 13px;
        padding: 0 8px;
        box-sizing: border-box;
    }
    .tag-btn {
        background: #3a3a3c;
        border: 1px solid #545456;
        color: #8e8e93;
        padding: 0 10px;
        border-radius: 6px;
        cursor: pointer;
        height: 30px;
        font-size: 13px;
        white-space: nowrap;
        flex-shrink: 0;
        letter-spacing: 2px;
    }
    .tag-btn:hover {
        background: #48484a;
    }

    /* ── Add row: two-column, right half holds info+add ─ */
    .add-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        min-height: 44px;
        padding: 0 16px;
        border-top: 1px solid #3a3a3c;
        box-sizing: border-box;
    }
    .add-row-right {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .info-btn {
        width: 30px;
        height: 30px;
        background: #3a3a3c;
        border: 1px solid #545456;
        border-radius: 6px;
        cursor: pointer;
        color: #8e8e93;
        font-size: 13px;
        font-style: italic;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    .info-btn:hover {
        background: #48484a;
    }
    .add-btn {
        flex: 1;
        height: 32px;
        background: #3a3a3c;
        border: 1px solid #545456;
        border-radius: 6px;
        cursor: pointer;
        color: #34c759;
        font-size: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        line-height: 1;
    }
    .add-btn:hover {
        background: #1d3a1d;
    }

    /* ── Info panel values ──────────────────────────── */
    .info-val {
        font-size: 14px;
        color: #8e8e93;
    }

    /* ── Input / select focus ───────────────────────── */
    input,
    select {
        outline: none;
    }
    input:focus,
    select:focus {
        border-color: #0a84ff;
    }
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        opacity: 0.4;
    }
</style>
