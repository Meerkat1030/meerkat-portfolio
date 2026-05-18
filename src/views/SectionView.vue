<template>
  <div class="section-view">
    <div class="section-view__content">

      <div class="section-view__header">
        <div>
          <h1 class="section-view__title">{{ currentSection?.title }}</h1>
          <p class="section-view__subtitle">{{ currentSection?.subtitle }}</p>
        </div>
        <div v-if="authState.isAdmin" class="section-view__header-actions">
          <button class="section-view__edit-mode-btn" @click="toggleEditMode">
            {{ isEditMode ? '완료' : '편집' }}
          </button>
          <button v-if="!isEditMode" class="section-view__add-btn" @click="openAddModal">
            <SvgIcon name="plus" />
            항목 추가
          </button>
        </div>
      </div>

      <div v-if="displayItems.length === 0" class="section-view__empty">
        <p>등록된 항목이 없어요</p>
        <p v-if="authState.isAdmin">우측 상단 버튼으로 항목을 추가해보세요</p>
      </div>

      <!-- 카드 그리드: 가장 큰 카드 높이/너비를 CSS 변수로 공유 -->
      <div v-else class="section-view__item-grid" ref="gridRef">
        <div
          v-for="(item, index) in displayItems"
          :key="item.id"
          class="section-item-card"
          :class="{
            'section-item-card--edit':     isEditMode,
            'section-item-card--dragging': dragIndex === index,
          }"
          :draggable="isEditMode && isSkillsSection"
          @dragstart="onDragStart(index)"
          @dragover.prevent="onDragOver(index)"
          @dragend="onDragEnd"
        >
          <div v-if="isEditMode" class="section-item-card__edit-toolbar">
            <div v-if="isSkillsSection" class="section-item-card__drag-handle">
              <SvgIcon name="menu" />
              <span>드래그</span>
            </div>
            <div class="section-item-card__edit-actions">
              <button class="section-item-card__edit-btn" @click="openEditModal(item)" title="수정">
                <SvgIcon name="edit" /><span>수정</span>
              </button>
              <button class="section-item-card__delete-btn" @click="removeSectionItem(sectionId, item.id)" title="삭제">
                <SvgIcon name="close" /><span>삭제</span>
              </button>
            </div>
          </div>

          <div v-if="item.images?.length" class="section-item-card__images">
            <img
              v-for="(img, i) in item.images" :key="i"
              :src="img" :alt="item.title"
              class="section-item-card__image"
            />
          </div>

          <div class="section-item-card__body">
            <h3 class="section-item-card__title">{{ item.title }}</h3>
            <p v-if="item.subtitle" class="section-item-card__subtitle">{{ item.subtitle }}</p>
            <div v-if="item.tags?.length" class="section-item-card__tags">
              <span v-for="tag in item.tags" :key="tag" class="section-item-card__tag">{{ tag }}</span>
            </div>
            <p v-if="item.context" class="section-item-card__context">{{ item.context }}</p>
            <div v-if="item.startDate || item.endDate" class="section-item-card__date">
              <span>{{ item.startDate }}</span>
              <span v-if="item.startDate"> ~ </span>
              <span>{{ item.endDate || '현재' }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <SectionItemAddModal
      v-if="isModalOpen"
      :section-id="sectionId"
      :section-type="currentSection?.type"
      :edit-item="editingItem"
      @close="closeModal"
    />
  </div>
</template>

<script>
import { ref, computed, reactive, watch, onMounted, onUpdated, onUnmounted, nextTick } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useAuthStore } from '@/stores/authStore'
import SectionItemAddModal from '@/components/common/SectionItemAddModal.vue'
import SvgIcon from '@/components/common/SvgIcon.vue'

// endDate 기준 정렬용 숫자 변환
// endDate가 없으면(현재) 가장 최신으로 간주 → 9999999 반환
function endDateToNumber(dateStr) {
  if (!dateStr) return 9999999
  return parseInt(dateStr.replace(/[.\-/]/g, ''), 10) || 0
}

export default {
  name: 'SectionView',
  components: { SectionItemAddModal, SvgIcon },
  props: {
    sectionId: { type: String, required: true },
  },

  setup(props) {
    const { state, removeSectionItem, reorderSectionItems } = usePortfolioStore()
    const { state: authState } = useAuthStore()
    const isModalOpen = ref(false)
    const editingItem = ref(null)
    const isEditMode  = ref(false)
    const dragIndex   = ref(null)
    const gridRef     = ref(null)

    const currentSection  = computed(() => state.sections.find((s) => s.id === props.sectionId))
    const isSkillsSection = computed(() => props.sectionId === 'skills')

    // Skills 드래그용 로컬 복사본
    const localSkillItems = reactive([...(state.sectionItems['skills'] ?? [])])

    watch(
      () => state.sectionItems['skills'],
      (newItems) => {
        if (!isEditMode.value) {
          localSkillItems.splice(0, localSkillItems.length, ...(newItems ?? []))
        }
      },
      { deep: true }
    )

    // ── 정렬 로직 ────────────────────────────────────────────────
    const displayItems = computed(() => {
      const rawItems = state.sectionItems[props.sectionId] ?? []

      if (isSkillsSection.value) {
        // Skills: 제목 ABC 오름차순
        return [...localSkillItems].sort((a, b) => a.title.localeCompare(b.title, 'en'))
      }

      // myHistory / projects / workHistory: endDate 내림차순 (현재 진행중이면 맨 위)
      return [...rawItems].sort((a, b) => endDateToNumber(b.endDate) - endDateToNumber(a.endDate))
    })

    // ── 카드 크기 동기화 (홈과 동일한 방식) ─────────────────────
    // 가장 큰 카드의 height·width를 측정해서 CSS 변수로 전달
    // → grid-auto-rows 가 이 값을 사용해 모든 카드 동일 크기로
    function syncCardSize() {
      if (!gridRef.value) return
      const cards = Array.from(gridRef.value.querySelectorAll('.section-item-card'))
      if (!cards.length) return

      // 일단 auto로 풀어서 자연스러운 높이 측정
      gridRef.value.style.gridAutoRows = 'auto'

      let maxH = 0
      let maxW = 0
      cards.forEach((card) => {
        if (card.offsetHeight > maxH) maxH = card.offsetHeight
        if (card.offsetWidth  > maxW) maxW = card.offsetWidth
      })

      if (maxH > 0) gridRef.value.style.gridAutoRows = `${maxH}px`
    }

    onMounted(() => {
      nextTick(syncCardSize)
      window.addEventListener('resize', syncCardSize)
    })

    onUpdated(() => { nextTick(syncCardSize) })
    onUnmounted(() => { window.removeEventListener('resize', syncCardSize) })

    // ── 드래그 (Skills만) ────────────────────────────────────────
    function toggleEditMode() {
      if (isEditMode.value && isSkillsSection.value) {
        reorderSectionItems('skills', [...localSkillItems])
      } else if (!isEditMode.value && isSkillsSection.value) {
        localSkillItems.splice(0, localSkillItems.length, ...(state.sectionItems['skills'] ?? []))
      }
      isEditMode.value = !isEditMode.value
    }

    function onDragStart(index) {
      if (!isEditMode.value || !isSkillsSection.value) return
      dragIndex.value = index
    }

    function onDragOver(targetIndex) {
      if (!isEditMode.value || !isSkillsSection.value) return
      if (dragIndex.value === null || dragIndex.value === targetIndex) return
      const moved = localSkillItems.splice(dragIndex.value, 1)[0]
      localSkillItems.splice(targetIndex, 0, moved)
      dragIndex.value = targetIndex
    }

    function onDragEnd()        { dragIndex.value = null }
    function openAddModal()     { editingItem.value = null; isModalOpen.value = true }
    function openEditModal(item){ editingItem.value = item;  isModalOpen.value = true }
    function closeModal()       { isModalOpen.value = false; editingItem.value = null }

    return {
      authState, state, currentSection, displayItems,
      isSkillsSection, isEditMode, isModalOpen, editingItem, dragIndex, gridRef,
      toggleEditMode, onDragStart, onDragOver, onDragEnd,
      openAddModal, openEditModal, closeModal, removeSectionItem,
    }
  },
}
</script>

<style scoped>
.section-view { background-color: var(--bg-page); }

.section-view__content {
  width: 100%;
  padding: 2.5vh var(--page-padding-x) 8vh;
  display: flex;
  flex-direction: column;
  gap: 2.5vh;
}

.section-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1vw;
}

.section-view__title   { font-size: clamp(16px, 1.6vw, 28px); font-weight: 700; color: var(--text-primary); }
.section-view__subtitle { font-size: var(--font-body); color: var(--text-secondary); margin-top: 0.4vh; }

.section-view__header-actions { display: flex; align-items: center; gap: 0.5vw; flex-shrink: 0; }

.section-view__edit-mode-btn {
  display: flex;
  align-items: center;
  height: var(--btn-height);
  padding: var(--btn-padding);
  border-radius: 0.5vw;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-size: var(--font-body);
  font-weight: 600;
  white-space: nowrap;
  transition: background-color 0.2s, color 0.2s;
}
.section-view__edit-mode-btn:hover { background-color: var(--accent); color: #fff; }

.section-view__add-btn {
  display: flex;
  align-items: center;
  gap: 0.4vw;
  height: var(--btn-height);
  padding: var(--btn-padding);
  border-radius: 0.5vw;
  background-color: var(--accent);
  color: #fff;
  font-size: var(--font-body);
  font-weight: 500;
  white-space: nowrap;
  transition: background-color 0.2s;
}
.section-view__add-btn:hover { background-color: var(--accent-hover); }

.section-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1vh;
  min-height: 30vh;
  color: var(--text-secondary);
  font-size: var(--font-body);
}

.section-view__item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(0, 1fr));
  gap: var(--card-gap);
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.section-item-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 0.8vh;
  overflow: hidden;
  transition: background-color 0.3s, opacity 0.2s;
}

.section-item-card--edit     { border-color: var(--accent); border-style: dashed; }
.section-item-card--dragging { opacity: 0.45; }
.section-item-card[draggable="true"]        { cursor: grab;    user-select: none; }
.section-item-card[draggable="true"]:active { cursor: grabbing; }

.section-item-card__edit-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.6vh;
  border-bottom: 1px solid var(--border);
  gap: 0.5vw;
}

.section-item-card__drag-handle {
  display: flex;
  align-items: center;
  gap: 0.3vw;
  color: var(--text-secondary);
  font-size: var(--font-label);
}

.section-item-card__edit-actions { display: flex; gap: 0.3vw; margin-left: auto; }

.section-item-card__edit-btn,
.section-item-card__delete-btn {
  display: flex;
  align-items: center;
  gap: 0.2vw;
  height: clamp(22px, 2.2vh, 30px);
  padding: 0 0.5vw;
  border-radius: 0.3vw;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--font-label);
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}
.section-item-card__edit-btn:hover   { background-color: #EFF6FF; color: var(--accent); border-color: #BFDBFE; }
.section-item-card__delete-btn:hover { background-color: #FEE2E2; color: #EF4444;       border-color: #FCA5A5; }

.section-item-card__images { display: flex; gap: 0.5vw; flex-wrap: wrap; }
.section-item-card__image  { width: 100%; max-height: 20vh; object-fit: cover; border-radius: 0.4vw; border: 1px solid var(--border); }

.section-item-card__body    { display: flex; flex-direction: column; gap: 0.6vh; }
.section-item-card__title   { font-size: var(--font-heading); font-weight: 700; color: var(--text-primary); }
.section-item-card__subtitle { font-size: var(--font-label); color: var(--text-secondary); }

.section-item-card__tags { display: flex; flex-wrap: wrap; gap: 0.3vw; }
.section-item-card__tag  {
  display: inline-block;
  padding: 0.2vh 0.5vw;
  border-radius: 0.3vw;
  background-color: #EFF6FF;
  color: #1D4ED8;
  font-size: var(--font-label);
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid #BFDBFE;
}
[data-theme="dark"] .section-item-card__tag { background-color: #1E3A5F; color: #93C5FD; border-color: #2563EB; }

.section-item-card__context { font-size: var(--font-body); color: var(--text-primary); line-height: 1.6; white-space: pre-wrap; }
.section-item-card__date    { font-size: var(--font-label); color: var(--text-secondary); }

@media (max-width: 1024px) { .section-view__item-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 768px)  {
  .section-view__content { padding: 2vh 4vw 8vh; }
  .section-view__item-grid { grid-template-columns: 1fr; }
  .section-view__header-actions { flex-direction: column; gap: 0.8vh; }
}
</style>