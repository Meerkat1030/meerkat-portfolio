<template>
  <div class="home">
    <div class="home__content">

      <div class="home__grid" ref="gridRef">
        <div
          v-for="(section, index) in localSections"
          :key="section.id"
          class="home__card-wrapper"
          :class="{ 'home__card-wrapper--dragging': dragIndex === index }"
          :draggable="state.isEditMode"
          @dragstart="onDragStart(index)"
          @dragover.prevent="onDragOver(index)"
          @dragend="onDragEnd"
        >
          <div v-if="state.isEditMode" class="home__drag-overlay">
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
            :items="state.sectionItems[section.id]"
            :max-items="maxPreviewItems"
            class="home__section-card"
          />
        </div>

        <button
          v-if="state.isEditMode"
          class="home__add-section-btn"
          @click="isSectionAddModalOpen = true"
        >
          <SvgIcon name="plus" />
          <span>섹션 추가</span>
        </button>
      </div>

      <div class="home__edit-bar">
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
import ProfileCard from '@/components/sections/ProfileCard.vue'
import SectionSummaryCard from '@/components/sections/SectionSummaryCard.vue'
import SectionAddModal from '@/components/common/SectionAddModal.vue'
import SvgIcon from '@/components/common/SvgIcon.vue'

// 카드 높이에서 헤더 영역을 뺀 나머지 높이로 보여줄 수 있는 항목 수 계산
// 항목 1개 높이: font-body(약 13px) + gap(약 0.5vh) ≈ 24px 기준
const ITEM_HEIGHT_PX  = 24
const HEADER_HEIGHT_PX = 52  // 타이틀 + 서브타이틀 + 여백

export default {
  name: 'HomeView',
  components: { ProfileCard, SectionSummaryCard, SectionAddModal, SvgIcon },

  setup() {
    const { state, toggleEditMode, reorderSections } = usePortfolioStore()
    const router = useRouter()
    const isSectionAddModalOpen = ref(false)
    const profileCardRef = ref(null)
    const localSections = reactive([...state.sections])
    const dragIndex = ref(null)
    const profileCardHeight = ref(0)
    const profileCardWidth  = ref(0)

    // 프로필 카드 크기 측정 → CSS 변수 + 계산값으로 전달
    function syncCardSize() {
      const cardEl = Array.isArray(profileCardRef.value)
        ? profileCardRef.value[0]?.$el
        : profileCardRef.value?.$el
      if (!cardEl) return

      const h = cardEl.offsetHeight
      const w = cardEl.offsetWidth

      if (h > 0) {
        profileCardHeight.value = h
        document.documentElement.style.setProperty('--profile-card-height', `${h}px`)
      }
      if (w > 0) {
        profileCardWidth.value = w
        document.documentElement.style.setProperty('--profile-card-width', `${w}px`)
      }
    }

    // 카드 높이 기준으로 보여줄 수 있는 최대 항목 수 계산
    const maxPreviewItems = computed(() => {
      if (profileCardHeight.value === 0) return 3
      const availableHeight = profileCardHeight.value - HEADER_HEIGHT_PX
      const count = Math.floor(availableHeight / ITEM_HEIGHT_PX)
      return Math.max(1, count)
    })

    onMounted(() => {
      nextTick(syncCardSize)
      window.addEventListener('resize', syncCardSize)
    })

    onUpdated(() => {
      nextTick(syncCardSize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', syncCardSize)
    })

    function onDragStart(index) {
      dragIndex.value = index
    }

    function onDragOver(targetIndex) {
      if (dragIndex.value === null || dragIndex.value === targetIndex) return
      const moved = localSections.splice(dragIndex.value, 1)[0]
      localSections.splice(targetIndex, 0, moved)
      dragIndex.value = targetIndex
    }

    function onDragEnd() {
      dragIndex.value = null
    }

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
      state,
      localSections,
      dragIndex,
      profileCardRef,
      isSectionAddModalOpen,
      maxPreviewItems,
      onDragStart,
      onDragOver,
      onDragEnd,
      toggleEditModeWithSave,
      handleSectionAdded,
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
  /* minmax(0, 1fr): 컨텐츠가 넘쳐도 칸 너비가 깨지지 않음 */
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: var(--profile-card-height, auto);
  gap: var(--card-gap);
}

.home__card-wrapper {
  position: relative;
  /* 칸 너비 = 프로필 카드 너비와 동일하게 */
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
  top: 0.5vh;
  right: 0.5vw;
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

.home__card-wrapper[draggable="true"] .home__section-card {
  cursor: grab;
  user-select: none;
}

.home__card-wrapper[draggable="true"] .home__section-card:active {
  cursor: grabbing;
}

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

.home__add-section-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.home__edit-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 2vh;
}

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

.home__edit-toggle-btn:hover {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
}

@media (max-width: 1024px) {
  .home__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: auto;
  }
}

@media (max-width: 768px) {
  .home__content { padding: 2vh 4vw 8vh; }
  .home__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: auto;
  }
}

@media (max-width: 480px) {
  .home__grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }
}
</style>
