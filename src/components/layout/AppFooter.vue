<template>
  <footer class="footer">
    <div class="footer__inner">
      <span class="footer__logo">MEERKAT <span class="footer__logo-accent">PORTFOLIO</span></span>
      <span class="footer__copy">© {{ currentYear }} 이재홍. All rights reserved.</span>
      <div class="footer__links">
        <a :href="state.profile.github" target="_blank" class="footer__link">GitHub</a>
        <a :href="`mailto:${state.profile.email}`" class="footer__link">Email</a>
      </div>
    </div>
  </footer>
</template>

<script>
import { usePortfolioStore } from '@/stores/portfolioStore'

export default {
  name: 'AppFooter',
  setup() {
    const { state } = usePortfolioStore()
    const currentYear = new Date().getFullYear()
    return { state, currentYear }
  },
}
</script>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  width: 100%;
  background-color: var(--bg-card);
  border-top: 1px solid var(--border);
  transition: background-color 0.3s;
}

.footer__inner {
  width: 100%;
  padding: 2vh var(--page-padding-x);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1vw;
}

.footer__logo {
  font-size: var(--font-body);
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.footer__logo-accent { color: var(--accent); }

.footer__copy {
  font-size: var(--font-label);
  color: var(--text-secondary);
  text-align: center;
}

.footer__links {
  display: flex;
  gap: 1.5vw;
  white-space: nowrap;
}

.footer__link {
  font-size: var(--font-label);
  color: var(--text-secondary);
  transition: color 0.2s;
}

.footer__link:hover { color: var(--accent); }
</style>
