<script setup lang="ts">
import { onMounted, ref } from "vue";

// In production the SPA is served by the Express server itself, so fetches
// are same-origin (relative paths like "/api/counter"). In dev, set
// VITE_API_URL=http://localhost:3000 in client/.env to talk to the API on
// its own port instead of going through Vite's dev server.
const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";
const value = ref<number | null>(null);
const loading = ref(false);
const error = ref("");

async function loadCounter() {
  loading.value = true;
  error.value = "";
  try {
    const response = await fetch(`${apiBaseUrl}/api/counter`);
    if (!response.ok) {
      throw new Error("Counter konnte nicht geladen werden.");
    }
    const data: { value: number } = await response.json();
    value.value = data.value;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Unbekannter Fehler";
  } finally {
    loading.value = false;
  }
}

async function updateCounter(action: "increment" | "decrement") {
  loading.value = true;
  error.value = "";
  try {
    const response = await fetch(`${apiBaseUrl}/api/counter/${action}`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Counter konnte nicht aktualisiert werden.");
    }
    const data: { value: number } = await response.json();
    value.value = data.value;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Unbekannter Fehler";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadCounter();
});
</script>

<template>
  <main class="page">
    <h1>Simple Counter</h1>
    <p class="counter-value" v-if="value !== null">{{ value }}</p>
    <p v-else>Lade Counter...</p>
    <p class="error" v-if="error">{{ error }}</p>

    <div class="actions">
      <button :disabled="loading" @click="updateCounter('decrement')">-</button>
      <button :disabled="loading" @click="updateCounter('increment')">+</button>
    </div>
  </main>
</template>
