<script lang="ts">
  import CreatePlanForm from "./CreatePlanForm.svelte";
  import PlanView from "./PlanView.svelte";

  function getPlanIdFromUrl(): string | null {
    return new URLSearchParams(location.search).get("plan");
  }

  let planId = $state(getPlanIdFromUrl());

  function handleCreated(id: string) {
    planId = id;
    const url = new URL(location.href);
    url.searchParams.set("plan", id);
    history.pushState({}, "", url);
  }
</script>

<main>
  {#if planId}
    <PlanView {planId} />
  {:else}
    <CreatePlanForm onCreated={handleCreated} />
  {/if}
</main>
