<template>
  <div class="home">
    <div class="home__content">

      <div class="home__grid" ref="gridRef">
        <div
          v-for="(section, index) in localSections"
          :key="section.id"
          class="home__card-wrapper"
          :class="{ 'home__card-wrapper--dragging': dragIndex === index }"
          :draggable="state.isEditMode && authState.isAdmin"
          @dragstart="onDragStart(index)"
          @dragover.prevent="onDragOver(index)"
          @dragend="onDragEnd"
        >
          <div v-if="state.isEditMode && authState.isAdmin" class="home__drag-overlay">
            <SvgIcon name="menu" />
          </div>

          <ProfileCard
            v-if="section.id === 'profile'"
            ref="profileCardRef"
            class="home__section-card"
          />
          <SectionSummaryCard
            v-else
            :section="section"
            :items="sortedItems(section.id)"
            :max-items="maxPreviewItems"
            class="home__section-card"
          />
        </div>

        <button
          v-if="state.isEditMode && authState.isAdmin"
          class="home__add-section-btn"
          @click="isSectionAddModalOpen = true"
        >
          <SvgIcon name="plus" />
          <span>섹션 추가</span>
        </button>
      </div>

      <div v-if="authState.isAdmin" class="home__edit-bar">
        <button class="home__edit-toggle-btn" @click="toggleEditModeWithSave">
          {{ state.isEditMode ? '완료' : '편집' }}
        </button>
      </div>

    </div>

    <SectionAddModal
      v-if="isSectionAddModalOpen"
      @close="isSectionAddModalOpen = false"
      @added="handleSectionAdded"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, onUpdated, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useAuthStore } from '@/stores/authStore'
import ProfileCard from '@/components/sections/ProfileCard.vue'
import SectionSummaryCard from '@/components/sections/SectionSummaryCard.vue'
import SectionAddModal from '@/components/common/SectionAddModal.vue'
import SvgIcon from '@/components/common/SvgIcon.vue'

// SectionView와 동일한 정렬 기준
// endDate 없으면 현재 진행중 → 가장 최신으로 간주
function endDateToNumber(dateStr) {
  if (!dateStr) return 9999999
  return parseInt(dateStr.replace(/[.\-/]/g, ''), 10) || 0
}

// 카드 padding 상하 + 헤더(제목+서브+gap) 높이 추정
const CARD_PADDING_V_PX   = 20
const CARD_HEADER_V_PX    = 42
const CARD_OVERHEAD_PX    = CARD_PADDING_V_PX + CARD_HEADER_V_PX  // 62px
// 항목 1줄: font-body + gap
const ITEM_ROW_PX         = 22

export default {
  name: 'HomeView',
  components: { ProfileCard, SectionSummaryCard, SectionAddModal, SvgIcon },

  setup() {
    const { state, toggleEditMode, reorderSections } = usePortfolioStore()
    const { state: authState } = useAuthStore()
    const router = useRouter()

    const isSectionAddModalOpen = ref(false)
    const profileCardRef        = ref(null)
    const localSections         = reactive([...state.sections])
    const dragIndex             = ref(null)
    const profileCardHeight     = ref(0)

    // ── 카드 크기 측정 ────────────────────────────────────────────
    function syncCardSize() {
      // profileCardRef는 배열로 올 수 있음 (v-for 안이 아니지만 Vue가 배열로 줄 때 대응)
      const el = Array.isArray(profileCardRef.value)
        ? profileCardRef.value[0]?.$el
        : profileCardRef.value?.$el
      if (!el) return

      const h = el.offsetHeight
      const w = el.offsetWidth

      if (h > 0) {
        profileCardHeight.value = h
        document.documentElement.style.setProperty('--profile-card-height', `${h}px`)
      }
      if (w > 0) {
        document.documentElement.style.setProperty('--profile-card-width', `${w}px`)
      }
    }

    // 측정 재시도: 렌더 직후 + 200ms 후 한 번 더 (폰트 로드 등 대기)
    function scheduleSyncCardSize() {
      nextTick(() => {
        syncCardSize()
        setTimeout(syncCardSize, 200)
      })
    }

    onMounted(() => {
      scheduleSyncCardSize()
      window.addEventListener('resize', syncCardSize)
    })
    onUpdated(() => { scheduleSyncCardSize() })
    onUnmounted(() => { window.removeEventListener('resize', syncCardSize) })

    // ── 카드 높이 기반 최대 표시 항목 수 계산 ─────────────────────
    const maxPreviewItems = computed(() => {
      const h = profileCardHeight.value
      if (h === 0) return 3
      const available = h - CARD_OVERHEAD_PX
      // +n개 더 텍스트 1줄 여유분 확보를 위해 -1
      return Math.max(1, Math.floor(available / ITEM_ROW_PX) - 1)
    })

    // ── 각 섹션 정렬 (SectionView와 동일 기준) ────────────────────
    function sortedItems(sectionId) {
      const items = state.sectionItems[sectionId] ?? []

      if (sectionId === 'skills') {
        // 알파벳 오름차순
        return [...items].sort((a, b) => a.title.localeCompare(b.title, 'en'))
      }

      // myHistory / projects / workHistory / contactMe: endDate 내림차순
      return [...items].sort((a, b) => endDateToNumber(b.endDate) - endDateToNumber(a.endDate))
    }

    // ── 드래그 (관리자 + 편집모드일 때만) ────────────────────────
    function onDragStart(index) {
      if (!authState.isAdmin || !state.isEditMode) return
      dragIndex.value = index
    }

    function onDragOver(targetIndex) {
      if (!authState.isAdmin || !state.isEditMode) return
      if (dragIndex.value === null || dragIndex.value === targetIndex) return
      const moved = localSections.splice(dragIndex.value, 1)[0]
      localSections.splice(targetIndex, 0, moved)
      dragIndex.value = targetIndex
    }

    function onDragEnd() { dragIndex.value = null }

    function toggleEditModeWithSave() {
      if (state.isEditMode) {
        reorderSections([...localSections])
      } else {
        localSections.splice(0, localSections.length, ...state.sections)
      }
      toggleEditMode()
    }

    function handleSectionAdded(newSection) {
      router.addRoute({
        path: newSection.routePath,
        name: newSection.id,
        component: () => import('@/views/SectionView.vue'),
        props: { sectionId: newSection.id },
      })
      localSections.splice(0, localSections.length, ...state.sections)
    }

    return {
      state, authState, localSections, dragIndex,
      profileCardRef, isSectionAddModalOpen, maxPreviewItems,
      sortedItems,
      onDragStart, onDragOver, onDragEnd,
      toggleEditModeWithSave, handleSectionAdded,
    }
  },
}
</script>

<style scoped>
.home { background-color: var(--bg-page); }

.home__content {
  width: 100%;
  padding: 2.5vh var(--page-padding-x) 8vh;
}

.home__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: var(--profile-card-height, auto);
  gap: var(--card-gap);
}

.home__card-wrapper {
  position: relative;
  min-width: 0;
  overflow: hidden;
}

.home__card-wrapper--dragging {
  opacity: 0.5;
  outline: 0.15vw dashed var(--accent);
  border-radius: var(--card-radius);
}

.home__drag-overlay {
  position: absolute;
  top: 0.5vh; right: 0.5vw;
  z-index: 10;
  color: var(--text-secondary);
  opacity: 0.6;
  pointer-events: none;
  background-color: var(--bg-card);
  border-radius: 0.3vw;
  padding: 0.2vh 0.2vw;
}

.home__section-card {
  width: 100%;
  height: 100%;
  cursor: default;
  overflow: hidden;
}

.home__card-wrapper[draggable="true"] .home__section-card { cursor: grab; user-select: none; }
.home__card-wrapper[draggable="true"] .home__section-card:active { cursor: grabbing; }

.home__add-section-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8vh;
  border-radius: var(--card-radius);
  border: 0.12vw dashed var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--font-label);
  font-weight: 500;
  transition: border-color 0.2s, color 0.2s;
  cursor: pointer;
  min-width: 0;
}
.home__add-section-btn:hover { border-color: var(--accent); color: var(--accent); }

.home__edit-bar { display: flex; justify-content: flex-end; margin-top: 2vh; }

.home__edit-toggle-btn {
  height: var(--btn-height);
  padding: var(--btn-padding);
  border-radius: var(--btn-radius);
  background-color: var(--accent);
  color: #fff;
  font-size: var(--font-body);
  font-weight: 600;
  box-shadow: 0 0.4vh 1.2vh rgba(59,130,246,0.4);
  transition: background-color 0.2s, transform 0.1s;
}
.home__edit-toggle-btn:hover { background-color: var(--accent-hover); transform: translateY(-1px); }

@media (max-width: 1024px) {
  .home__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: auto; }
}
@media (max-width: 768px) {
  .home__content { padding: 2vh 4vw 8vh; }
  .home__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: auto; }
}
@media (max-width: 480px) {
  .home__grid { grid-template-columns: 1fr; grid-auto-rows: auto; }
}
</style>