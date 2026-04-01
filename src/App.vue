<template>
  <div id="app">
    <AppHeader />
    <main class="main-content">
      <div v-if="portfolioState.isLoading" class="app-loading">
        <div class="app-loading__spinner"></div>
        <p class="app-loading__text">불러오는 중...</p>
      </div>
      <RouterView v-else />
    </main>
    <AppFooter />
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'App',
  components: { AppHeader, AppFooter },
  setup() {
    const { state: portfolioState, loadAllData, subscribeRealtime, unsubscribeRealtime } = usePortfolioStore()
    const { initAuth } = useAuthStore()

    onMounted(async () => {
      initAuth()
      await loadAllData()
      subscribeRealtime()
    })

    onUnmounted(() => { unsubscribeRealtime() })

    return { portfolioState }
  },
}
</script>

<style>
.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 2vh;
}
.app-loading__spinner {
  width: clamp(32px, 3vw, 48px);
  height: clamp(32px, 3vw, 48px);
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.app-loading__text { font-size: var(--font-body); color: var(--text-secondary); }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
