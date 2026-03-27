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
          <!-- 편집 모드 드래그 핸들 표시 -->
          <div v-if="state.isEditMode" class="home__drag-overlay">
            <SvgIcon name="menu" />
          </div>

          <ProfileCard v-if="section.id === 'profile'" class="home__section-card" />
          <SectionSummaryCard
            v-else
            :section="section"
            :items="state.sectionItems[section.id]"
            class="home__section-card"
          />
        </div>
      </div>

      <div class="home__edit-bar">
        <button class="home__edit-toggle-btn" @click="toggleEditModeWithSave">
          {{ state.isEditMode ? '완료' : '편집' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, reactive, toRaw } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import ProfileCard from '@/components/sections/ProfileCard.vue'
import SectionSummaryCard from '@/components/sections/SectionSummaryCard.vue'
import SvgIcon from '@/components/common/SvgIcon.vue'

export default {
  name: 'HomeView',
  components: { ProfileCard, SectionSummaryCard, SvgIcon },

  setup() {
    const { state, toggleEditMode, reorderSections } = usePortfolioStore()
    const localSections = reactive([...state.sections])
    const dragIndex = ref(null)

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
        // 편집 시작 시 최신 sections 동기화
        localSections.splice(0, localSections.length, ...state.sections)
      }
      toggleEditMode()
    }

    return {
      state,
      localSections,
      dragIndex,
      onDragStart,
      onDragOver,
      onDragEnd,
      toggleEditModeWithSave,
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
  grid-template-columns: repeat(4, 1fr);
  gap: var(--card-gap);
}

.home__card-wrapper {
  position: relative;
  min-height: 18vh;
}

.home__card-wrapper--dragging {
  opacity: 0.5;
  outline: 0.15vw dashed var(--accent);
  border-radius: var(--card-radius);
}

/* 편집 모드: 드래그 핸들 오버레이 */
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
  height: 100%;
  cursor: default;
}

/* 편집 모드일 때 카드에 드래그 커서 */
.home__card-wrapper[draggable="true"] .home__section-card {
  cursor: grab;
  user-select: none;
}

.home__card-wrapper[draggable="true"] .home__section-card:active {
  cursor: grabbing;
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
  .home__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .home__content { padding: 2vh 4vw 8vh; }
  .home__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .home__grid { grid-template-columns: 1fr; }
}
</style>
