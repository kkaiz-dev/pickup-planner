<script lang="ts">
  import { onMount } from "svelte";
  import { addPickupPoint, getPlan, removePickupPoint, type PlanView as PlanViewType } from "./api";

  let { planId }: { planId: string } = $props();

  let plan = $state<PlanViewType | null>(null);
  let newLocation = $state("");
  let error = $state("");
  let loading = $state(true);

  async function refresh() {
    try {
      plan = await getPlan(planId);
      error = "";
    } catch (e) {
      error = e instanceof Error ? e.message : "計画を取得できなかった";
    } finally {
      loading = false;
    }
  }

  onMount(refresh);

  async function handleAddPoint(event: SubmitEvent) {
    event.preventDefault();
    if (!newLocation.trim()) return;
    try {
      plan = await addPickupPoint(planId, newLocation);
      newLocation = "";
    } catch (e) {
      error = e instanceof Error ? e.message : "地点を追加できなかった";
    }
  }

  async function handleRemovePoint(pointId: string) {
    try {
      plan = await removePickupPoint(planId, pointId);
    } catch (e) {
      error = e instanceof Error ? e.message : "地点を取り消せなかった";
    }
  }

  let shareUrl = $derived(`${location.origin}${location.pathname}?plan=${planId}`);
</script>

{#if loading}
  <p>読み込み中...</p>
{:else if plan}
  <h1>送迎計画</h1>
  <p class="share">共有リンク: <code>{shareUrl}</code></p>

  <h2>行程</h2>
  <table>
    <thead>
      <tr>
        <th>地点</th>
        <th>到着</th>
        <th>出発</th>
      </tr>
    </thead>
    <tbody>
      {#each plan.itinerary as stop}
        <tr>
          <td>{stop.location}</td>
          <td>{stop.arrival ?? "—"}</td>
          <td>{stop.departure}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <h2>拾ってもらう地点</h2>
  {#if plan.pickupPoints.length === 0}
    <p>まだ誰も追加していない。</p>
  {:else}
    <ul>
      {#each plan.pickupPoints as point (point.id)}
        <li>
          {point.location}
          <button onclick={() => handleRemovePoint(point.id)}>取り消す</button>
        </li>
      {/each}
    </ul>
  {/if}

  <form onsubmit={handleAddPoint}>
    <label>
      拾ってもらう場所
      <input bind:value={newLocation} placeholder="例: 〇〇駅" required />
    </label>
    <button type="submit">追加する</button>
  </form>
{/if}

{#if error}
  <p class="error">{error}</p>
{/if}
