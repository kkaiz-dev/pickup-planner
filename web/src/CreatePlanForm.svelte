<script lang="ts">
  import { createPlan } from "./api";

  let { onCreated }: { onCreated: (planId: string) => void } = $props();

  let origin = $state("");
  let destination = $state("");
  let desiredArrivalTime = $state("");
  let submitting = $state(false);
  let error = $state("");

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    error = "";
    submitting = true;
    try {
      const plan = await createPlan({ origin, destination, desiredArrivalTime });
      onCreated(plan.id);
    } catch (e) {
      error = e instanceof Error ? e.message : "計画を作れなかった";
    } finally {
      submitting = false;
    }
  }
</script>

<form onsubmit={handleSubmit}>
  <h1>送迎計画を作る</h1>

  <label>
    出発地
    <input bind:value={origin} placeholder="例: 自宅" required />
  </label>

  <label>
    目的地
    <input bind:value={destination} placeholder="例: 〇〇カントリークラブ" required />
  </label>

  <label>
    到着希望時刻
    <input type="time" bind:value={desiredArrivalTime} required />
  </label>

  <button type="submit" disabled={submitting}>
    {submitting ? "作っています..." : "計画を作る"}
  </button>

  {#if error}
    <p class="error">{error}</p>
  {/if}
</form>
