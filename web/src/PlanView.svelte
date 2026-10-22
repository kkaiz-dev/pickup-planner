<script lang="ts">
  import { onMount } from "svelte";
  import { addPickupPoint, getPlan, removePickupPoint, type PlanView as PlanViewType } from "./api";
  import RouteMap from "./RouteMap.svelte";

  let { planId }: { planId: string } = $props();

  let plan = $state<PlanViewType | null>(null);
  let newName = $state("");
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
    if (!newName.trim() || !newLocation.trim()) return;
    try {
      plan = await addPickupPoint(planId, newName, newLocation);
      newName = "";
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
  // 地図の中継地点は、行程の順番どおり（出発地・目的地を除く）。
  let waypointLabels = $derived(
    plan ? plan.itinerary.slice(1, -1).map((s) => s.location) : [],
  );
</script>

{#if loading}
  <p>読み込み中...</p>
{:else if plan}
  <div class="layout">
    <div class="panel">
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
              <td>{stop.name ? `${stop.name}（${stop.location}）` : stop.location}</td>
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
              {point.name}（{point.location}）
              <button onclick={() => handleRemovePoint(point.id)}>取り消す</button>
            </li>
          {/each}
        </ul>
      {/if}

      <form onsubmit={handleAddPoint}>
        <label>
          名前
          <input bind:value={newName} placeholder="例: Aさん" required />
        </label>
        <label>
          拾ってもらう場所
          <input bind:value={newLocation} placeholder="例: 〇〇駅" required />
        </label>
        <button type="submit">追加する</button>
      </form>
    </div>

    <div class="panel map-panel">
      <h2>地図</h2>
      <RouteMap origin={plan.origin} destination={plan.destination} waypoints={waypointLabels} />
    </div>
  </div>
{/if}

{#if error}
  <p class="error">{error}</p>
{/if}

<style>
  .layout {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .map-panel {
    display: flex;
    flex-direction: column;
  }
  @media (min-width: 860px) {
    .layout {
      flex-direction: row;
      align-items: flex-start;
    }
    .panel {
      flex: 1;
      min-width: 0;
    }
    .map-panel {
      position: sticky;
      top: 24px;
      height: 420px;
    }
  }
</style>
