<template>
  <header class="header">
    <div class="header__inner">
      <div class="header__spacer" />
      <router-link to="/" class="header__logo">
        MEERKAT <span class="header__logo-accent">PORTFOLIO</span>
      </router-link>
      <div class="header__actions">
        <button class="header__icon-btn" @click="toggleDarkMode" :title="state.isDarkMode ? '라이트 모드' : '다크 모드'">
          <SvgIcon :name="state.isDarkMode ? 'sun' : 'moon'" />
        </button>
        <router-link to="/" class="header__icon-btn" title="홈">
          <SvgIcon name="home" />
        </router-link>
        <button class="header__icon-btn" @click="toggleMenu" title="메뉴">
          <SvgIcon name="menu" />
        </button>
      </div>
    </div>

    <!-- 드롭다운: sections 배열 순서 그대로 표시 → 홈 카드 순서 변경 시 자동 반영 -->
    <div class="header__dropdown" v-if="isMenuOpen">
      <router-link
        v-for="section in state.sections"
        :key="section.id"
        :to="section.routePath"
        class="header__dropdown-link"
        @click="isMenuOpen = false"
      >
        {{ section.title }}
      </router-link>
    </div>
  </header>
</template>

<script>
import { ref } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import SvgIcon from '@/components/common/SvgIcon.vue'

export default {
  name: 'AppHeader',
  components: { SvgIcon },

  setup() {
    const { state, toggleDarkMode } = usePortfolioStore()
    const isMenuOpen = ref(false)

    function toggleMenu() {
      isMenuOpen.value = !isMenuOpen.value
    }

    return { state, toggleDarkMode, isMenuOpen, toggleMenu }
  },
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border);
  transition: background-color 0.3s;
}

.header__inner {
  width: 100%;
  padding: 0 var(--page-padding-x);
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header__spacer { flex: 1; }

.header__logo {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--font-logo);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.02em;
  white-space: nowrap;
  transition: opacity 0.2s;
}

.header__logo:hover { opacity: 0.8; }
.header__logo-accent { color: var(--accent); }

.header__actions {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5vw;
}

.header__icon-btn {
  width: var(--btn-height);
  height: var(--btn-height);
  border-radius: 0.5vw;
  border: 1px solid var(--border);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.header__icon-btn:hover {
  background-color: var(--bg-card-secondary);
  color: var(--accent);
}

.header__dropdown {
  border-top: 1px solid var(--border);
  background-color: var(--bg-card);
  display: flex;
  flex-direction: column;
  box-shadow: 0 0.8vh 1.5vh rgba(0,0,0,0.08);
}

.header__dropdown-link {
  padding: 1.6vh var(--page-padding-x);
  font-size: var(--font-body);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);
  transition: background-color 0.2s, color 0.2s;
}

.header__dropdown-link:last-child { border-bottom: none; }

.header__dropdown-link:hover {
  background-color: var(--bg-card-secondary);
  color: var(--accent);
}
</style>
