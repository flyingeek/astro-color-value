<script>
  import ColorChoice from "./ColorChoice.svelte";

  export let title = "Color to use";
  export let sensor = "RxBatt";

  const operators = [" ≤ ", " < ", " = ", " > ", " ≥ "];
  let cases = [
    { id: 0, op: "=", value: "0", color1: "#34c759", color2: "#34c759" }
  ];
  let nextId = 1;

  function addCase() {
    cases = [
      ...cases,
      { id: nextId++, op: "=", value: "0", color1: "#34c759", color2: "#34c759" }
    ];
  }

  function removeCase(id) {
    cases = cases.filter(c => c.id !== id);
  }
</script>

<div class="panel">
  <div class="header">
    <span>{title}</span>
    <span>▾</span>
  </div>

  <hr />

  <div class="cases">
    {#each cases as caseItem, i (caseItem.id)}
      <div class="case-row">
        <span class="case-label">Case {i + 1}</span>

        <button class="delete" on:click={() => removeCase(caseItem.id)}>🗑</button>

        <span class="text-right">If {sensor}</span>

        <select class="op" bind:value={caseItem.op}>
          {#each operators as op}
            <option value={op}>{op}</option>
          {/each}
        </select>

        <input type="text" class="value" bind:value={caseItem.value} />

        <ColorChoice bind:value={caseItem.color1} />
        <ColorChoice bind:value={caseItem.color2} />
      </div>
    {/each}
  </div>

  <button class="add" on:click={addCase}>＋ Add case</button>
</div>

<style>
    .text-right {
        text-align: right;
        display: block;
    }
  .panel {
    background: #1f1f1f;
    padding: 16px;
    border-radius: 8px;
    max-width: 580px;
    color: #eee;
    font-family: system-ui;
  }

  .header {
    display: flex;
    justify-content: space-between;
    font-weight: 600;
  }

  hr {
    border: none;
    border-top: 1px solid #444;
    margin: 10px 0 16px;
  }

  .cases {
    margin-bottom: 10px;
  }

  .case-row {
    display: grid;
    grid-template-columns: 70px 28px 120px 50px 110px 60px 60px;
    gap: 8px;
    align-items: center;
    margin-bottom: 10px;
    margin-top: 0;
  }

  .case-label {
    font-weight: 500;
  }

  .delete {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 4px;
    cursor: pointer;
    padding: 0;
  }

  select,
  input {
    background: #111;
    border: 1px solid #444;
    color: white;
    padding: 0 6px;
    border-radius: 4px;
    height: 28px;
    box-sizing: border-box;
  }
  select.op {
    width: 50px;
  }
  .add {
    margin-top: 10px;
    background: #2a2a2a;
    border: 1px solid #555;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    color: #eee;
  }
</style>
