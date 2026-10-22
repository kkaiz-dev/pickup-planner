<script lang="ts">
  // Google Maps Embed API（directions）。Maps Embed APIだけに制限した鍵を使う。
  // 中継地点（拾ってもらう地点）は、お迎えの順番どおりに渡す。
  let { origin, destination, waypoints }: {
    origin: string;
    destination: string;
    waypoints: string[];
  } = $props();

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY;

  let src = $derived.by(() => {
    if (!apiKey) return null;
    const params = new URLSearchParams({
      key: apiKey,
      origin,
      destination,
      mode: "driving",
    });
    if (waypoints.length > 0) {
      params.set("waypoints", waypoints.join("|"));
    }
    return `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
  });
</script>

{#if src}
  <iframe
    class="route-map"
    title="ルートの地図"
    src={src}
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"
  ></iframe>
{:else}
  <p class="map-unavailable">地図のプレビューは設定されていない。</p>
{/if}

<style>
  .route-map {
    width: 100%;
    height: 100%;
    min-height: 260px;
    border: 0;
  }
  .map-unavailable {
    font-size: 0.85rem;
    color: var(--ink-faint, #888);
  }
</style>
