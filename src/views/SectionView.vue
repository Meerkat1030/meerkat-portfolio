<template>
  <div class="section-view">
    <div class="section-view__content">

      <div class="section-view__header">
        <div>
          <h1 class="section-view__title">{{ currentSection?.title }}</h1>
          <p class="section-view__subtitle">{{ currentSection?.subtitle }}</p>
        </div>
        <div class="section-view__header-actions">
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
        <p>우측 상단 버튼으로 항목을 추가해보세요</p>
      </div>

      <div v-else class="section-view__item-grid">
        <div
          v-for="(item, index) in displayItems"
          :key="item.id"
          class="section-item-card"
          :class="{ 'section-item-card--dragging': dragIndex === index, 'section-item-card--edit': isEditMode }"
          :draggable="isEditMode && isSkillsSection"
          @dragstart="onDragStart(index)"
          @dragover.prevent="onDragOver(index)"
          @dragend="onDragEnd"
        >
          <!-- 편집 모드 상단 툴바 -->
          <div v-if="isEditMode" class="section-item-card__edit-toolbar">
            <div v-if="isSkillsSection" class="section-item-card__drag-handle">
              <SvgIcon name="menu" />
              <span>드래그</span>
            </div>
            <div class="section-item-card__edit-actions">
              <button class="section-item-card__edit-btn" @click="openEditModal(item)" title="수정">
                <SvgIcon name="edit" />
                <span>수정</span>
              </button>
              <button class="section-item-card__delete-btn" @click="removeSectionItem(sectionId, item.id)" title="삭제">
                <SvgIcon name="close" />
                <span>삭제</span>
              </button>
            </div>
          </div>

          <div v-if="item.images?.length" class="section-item-card__images">
            <img
              v-for="(image, imgIdx) in item.images"
              :key="imgIdx"
              :src="image"
              :alt="item.title"
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
              <span v-if="item.startDate && item.endDate"> ~ </span>
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
import { ref, computed, reactive, watch } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import SectionItemAddModal from '@/components/common/SectionItemAddModal.vue'
import SvgIcon from '@/components/common/SvgIcon.vue'

function parseDateToNumber(dateStr) {
  if (!dateStr) return 0
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
    const isModalOpen = ref(false)
    const editingItem = ref(null)
    const isEditMode  = ref(false)
    const dragIndex   = ref(null)

    const currentSection = computed(() =>
      state.sections.find((s) => s.id === props.sectionId)
    )

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

    // 화면에 표시할 아이템 계산
    const displayItems = computed(() => {
      const rawItems = state.sectionItems[props.sectionId] ?? []

      if (isSkillsSection.value) {
        return localSkillItems
      }

      // Skills 외 섹션: 편집 모드 여부 무관하게 최신순 정렬
      return [...rawItems].sort((a, b) =>
        parseDateToNumber(b.startDate) - parseDateToNumber(a.startDate)
      )
    })

    function toggleEditMode() {
      if (isEditMode.value && isSkillsSection.value) {
        // 편집 완료: Skills 순서 store에 반영
        reorderSectionItems('skills', [...localSkillItems])
      } else if (!isEditMode.value && isSkillsSection.value) {
        // 편집 시작: 최신 store 데이터 동기화
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

    function onDragEnd() {
      dragIndex.value = null
    }

    function openAddModal() {
      editingItem.value = null
      isModalOpen.value = true
    }

    function openEditModal(item) {
      editingItem.value = item
      isModalOpen.value = true
    }

    function closeModal() {
      isModalOpen.value = false
      editingItem.value = null
    }

    return {
      state,
      currentSection,
      displayItems,
      isSkillsSection,
      isEditMode,
      isModalOpen,
      editingItem,
      dragIndex,
      toggleEditMode,
      onDragStart,
      onDragOver,
      onDragEnd,
      openAddModal,
      openEditModal,
      closeModal,
      removeSectionItem,
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

.section-view__title {
  font-size: clamp(16px, 1.6vw, 28px);
  font-weight: 700;
  color: var(--text-primary);
}

.section-view__subtitle {
  font-size: var(--font-body);
  color: var(--text-secondary);
  margin-top: 0.4vh;
}

.section-view__header-actions {
  display: flex;
  align-items: center;
  gap: 0.5vw;
  flex-shrink: 0;
}

/* 편집 버튼 - 완료 시 accent 색상 */
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

.section-view__edit-mode-btn:hover {
  background-color: var(--accent);
  color: #fff;
}

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
  grid-template-columns: repeat(auto-fill, minmax(22vw, 1fr));
  gap: var(--card-gap);
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
  transition: background-color 0.3s, opacity 0.2s;
}

/* 편집 모드 카드 테두리 강조 */
.section-item-card--edit {
  border-color: var(--accent);
  border-style: dashed;
}

.section-item-card--dragging {
  opacity: 0.45;
}

.section-item-card[draggable="true"] {
  cursor: grab;
  user-select: none;
}

.section-item-card[draggable="true"]:active {
  cursor: grabbing;
}

/* 편집 모드 툴바 */
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

.section-item-card__edit-actions {
  display: flex;
  gap: 0.3vw;
  margin-left: auto;
}

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

.section-item-card__edit-btn:hover {
  background-color: #EFF6FF;
  color: var(--accent);
  border-color: #BFDBFE;
}

.section-item-card__delete-btn:hover {
  background-color: #FEE2E2;
  color: #EF4444;
  border-color: #FCA5A5;
}

.section-item-card__images {
  display: flex;
  gap: 0.5vw;
  flex-wrap: wrap;
}

.section-item-card__image {
  width: 100%;
  max-height: 20vh;
  object-fit: cover;
  border-radius: 0.4vw;
  border: 1px solid var(--border);
}

.section-item-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.6vh;
}

.section-item-card__title {
  font-size: var(--font-heading);
  font-weight: 700;
  color: var(--text-primary);
}

.section-item-card__subtitle {
  font-size: var(--font-label);
  color: var(--text-secondary);
}

.section-item-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3vw;
}

.section-item-card__tag {
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

[data-theme="dark"] .section-item-card__tag {
  background-color: #1E3A5F;
  color: #93C5FD;
  border-color: #2563EB;
}

.section-item-card__context {
  font-size: var(--font-body);
  color: var(--text-primary);
  line-height: 1.6;
  white-space: pre-wrap;
}

.section-item-card__date {
  font-size: var(--font-label);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .section-view__content { padding: 2vh 4vw 8vh; }
  .section-view__item-grid { grid-template-columns: 1fr; }
  .section-view__header-actions { flex-direction: column; gap: 0.8vh; }
}
</style>
