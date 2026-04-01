<template>
  <header class="header">
    <div class="header__inner">
      <div class="header__spacer" />

      <router-link to="/" class="header__logo" @click="handleLogoClick">
        MEERKAT <span class="header__logo-accent">PORTFOLIO</span>
      </router-link>

      <div class="header__actions">
        <button class="header__icon-btn" @click="toggleDarkMode" :title="portfolioState.isDarkMode ? '라이트 모드' : '다크 모드'">
          <SvgIcon :name="portfolioState.isDarkMode ? 'sun' : 'moon'" />
        </button>
        <router-link to="/" class="header__icon-btn" title="홈">
          <SvgIcon name="home" />
        </router-link>

        <button
          v-if="authState.isAdmin"
          class="header__icon-btn header__icon-btn--admin"
          @click="handleSignOut"
          title="로그아웃"
        >
          <SvgIcon name="logout" />
        </button>

        <button class="header__icon-btn" @click="toggleMenu" title="메뉴">
          <SvgIcon name="menu" />
        </button>
      </div>
    </div>

    <div class="header__dropdown" v-if="isMenuOpen">
      <router-link
        v-for="section in portfolioState.sections"
        :key="section.id"
        :to="section.routePath"
        class="header__dropdown-link"
        @click="isMenuOpen = false"
      >
        {{ section.title }}
      </router-link>
    </div>

    <Teleport to="body">
      <div v-if="isLoginModalOpen" class="login-modal-overlay" @click.self="isLoginModalOpen = false">
        <div class="login-modal">
          <h2 class="login-modal__title">관리자 로그인</h2>
          <p class="login-modal__desc">포트폴리오 관리자 계정으로 로그인하세요.</p>
          <button class="login-modal__google-btn" @click="handleGoogleLogin">
            <svg class="login-modal__google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 계정으로 로그인
          </button>
          <button class="login-modal__cancel-btn" @click="isLoginModalOpen = false">취소</button>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<script>
import { ref } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useAuthStore } from '@/stores/authStore'
import SvgIcon from '@/components/common/SvgIcon.vue'

const LOGO_CLICK_THRESHOLD = 7   
const CLICK_RESET_DELAY_MS = 2000  

export default {
  name: 'AppHeader',
  components: { SvgIcon },

  setup() {
    const { state: portfolioState, toggleDarkMode } = usePortfolioStore()
    const { state: authState, signInWithGoogle, signOut } = useAuthStore()
    const isMenuOpen       = ref(false)
    const isLoginModalOpen = ref(false)

    let clickCount   = 0
    let clickResetTimer = null

    function handleLogoClick() {
      if (authState.isAdmin) return  

      clickCount++
      clearTimeout(clickResetTimer)
      clickResetTimer = setTimeout(() => { clickCount = 0 }, CLICK_RESET_DELAY_MS)

      if (clickCount >= LOGO_CLICK_THRESHOLD) {
        clickCount = 0
        isLoginModalOpen.value = true
      }
    }

    async function handleGoogleLogin() {
      isLoginModalOpen.value = false
      await signInWithGoogle()
    }

    function toggleMenu() { isMenuOpen.value = !isMenuOpen.value }

    async function handleSignOut() {
      await signOut()
      isMenuOpen.value = false
    }

    return {
      portfolioState, authState, toggleDarkMode,
      isMenuOpen, isLoginModalOpen,
      handleLogoClick, handleGoogleLogin, toggleMenu, handleSignOut,
    }
  },
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0; left: 0; right: 0;
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
  user-select: none;
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

.header__icon-btn:hover { background-color: var(--bg-card-secondary); color: var(--accent); }

.header__icon-btn--admin {
  border-color: var(--accent);
  color: var(--accent);
}

.header__icon-btn--admin:hover {
  background-color: #FEE2E2;
  color: #EF4444;
  border-color: #FCA5A5;
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
.header__dropdown-link:hover { background-color: var(--bg-card-secondary); color: var(--accent); }

/* 로그인 모달 */
.login-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.login-modal {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  padding: clamp(24px, 4vh, 48px) clamp(24px, 3vw, 48px);
  width: clamp(280px, 30vw, 400px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5vh;
  box-shadow: 0 2vh 4vh rgba(0,0,0,0.15);
}

.login-modal__title {
  font-size: clamp(14px, 1.2vw, 20px);
  font-weight: 700;
  color: var(--text-primary);
}

.login-modal__desc {
  font-size: var(--font-body);
  color: var(--text-secondary);
  text-align: center;
}

.login-modal__google-btn {
  display: flex;
  align-items: center;
  gap: 0.8vw;
  width: 100%;
  height: clamp(36px, 4.5vh, 52px);
  padding: 0 1.5vw;
  border-radius: 0.5vw;
  border: 1px solid var(--border);
  background-color: var(--bg-card);
  color: var(--text-primary);
  font-size: var(--font-body);
  font-weight: 500;
  justify-content: center;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.login-modal__google-btn:hover {
  background-color: var(--bg-card-secondary);
  box-shadow: 0 0.2vh 0.8vh rgba(0,0,0,0.1);
}

.login-modal__google-icon { width: 18px; height: 18px; flex-shrink: 0; }

.login-modal__cancel-btn {
  font-size: var(--font-label);
  color: var(--text-secondary);
  padding: 0.5vh 1vw;
  transition: color 0.2s;
}

.login-modal__cancel-btn:hover { color: var(--text-primary); }
</style>
