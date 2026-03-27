<template>
  <div class="section-view">
    <div class="section-view__content">

      <div class="section-view__header">
        <div>
          <h1 class="section-view__title">{{ currentSection?.title }}</h1>
          <p class="section-view__subtitle">{{ currentSection?.subtitle }}</p>
        </div>
        <button
          v-if="state.isEditMode"
          class="section-view__add-btn"
          @click="isItemAddModalOpen = true"
        >
          <SvgIcon name="plus" />
          항목 추가
        </button>
      </div>

      <div v-if="sectionItems.length === 0" class="section-view__empty">
        <p>등록된 항목이 없어요</p>
        <p v-if="state.isEditMode">우측 하단 편집 버튼을 눌러 항목을 추가해보세요</p>
      </div>

      <div v-else class="section-view__item-grid">
        <div
          v-for="item in sectionItems"
          :key="item.id"
          class="section-item-card"
        >
          <div v-if="item.images?.length" class="section-item-card__images">
            <img
              v-for="(image, index) in item.images"
              :key="index"
              :src="image"
              :alt="item.title"
              class="section-item-card__image"
            />
          </div>

          <div class="section-item-card__body">
            <div class="section-item-card__title-row">
              <h3 class="section-item-card__title">{{ item.title }}</h3>
              <button
                v-if="state.isEditMode"
                class="section-item-card__delete-btn"
                @click="removeSectionItem(sectionId, item.id)"
              >
                <SvgIcon name="close" />
              </button>
            </div>
            <p v-if="item.subtitle" class="section-item-card__subtitle">{{ item.subtitle }}</p>
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
      v-if="isItemAddModalOpen"
      :section-id="sectionId"
      :section-type="currentSection?.type"
      @close="isItemAddModalOpen = false"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import SectionItemAddModal from '@/components/common/SectionItemAddModal.vue'
import SvgIcon from '@/components/common/SvgIcon.vue'

export default {
  name: 'SectionView',
  components: { SectionItemAddModal, SvgIcon },
  props: {
    sectionId: { type: String, required: true },
  },

  setup(props) {
    const { state, removeSectionItem } = usePortfolioStore()
    const isItemAddModalOpen = ref(false)

    const currentSection = computed(() =>
      state.sections.find((s) => s.id === props.sectionId)
    )
    const sectionItems = computed(() =>
      state.sectionItems[props.sectionId] ?? []
    )

    return { state, currentSection, sectionItems, isItemAddModalOpen, removeSectionItem }
  },
}
</script>

<style scoped>
.section-view { background-color: var(--bg-page); }

.section-view__content {
  width: 100%;
  padding: 2.5vh var(--page-padding-x) 4vh;
  display: flex;
  flex-direction: column;
  gap: 2.5vh;
}

.section-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
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
  gap: 1vh;
  transition: background-color 0.3s;
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

.section-item-card__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5vw;
}

.section-item-card__title {
  font-size: var(--font-heading);
  font-weight: 700;
  color: var(--text-primary);
}

.section-item-card__delete-btn {
  width: clamp(22px, 2vh, 32px);
  height: clamp(22px, 2vh, 32px);
  border-radius: 0.3vw;
  border: 1px solid var(--border);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.section-item-card__delete-btn:hover {
  background-color: #FEE2E2;
  color: #EF4444;
  border-color: #FCA5A5;
}

.section-item-card__subtitle {
  font-size: var(--font-label);
  color: var(--text-secondary);
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
  margin-top: 0.3vh;
}

@media (max-width: 768px) {
  .section-view__content { padding: 2vh 4vw 4vh; }
  .section-view__item-grid { grid-template-columns: 1fr; }
}
</style>
