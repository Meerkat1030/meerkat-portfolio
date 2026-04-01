<template>
  <div class="section-summary-card">
    <div class="section-summary-card__header">
      <div>
        <h3 class="section-summary-card__title">{{ section.title }}</h3>
        <p class="section-summary-card__subtitle">{{ section.subtitle }}</p>
      </div>
      <router-link :to="section.routePath" class="section-summary-card__more-btn">더보기</router-link>
    </div>

    <div v-if="items.length === 0" class="section-summary-card__empty">
      <span>등록된 항목이 없어요</span>
    </div>

    <div v-else class="section-summary-card__preview">
      <div v-for="item in previewItems" :key="item.id" class="section-summary-card__preview-item">
        <span class="section-summary-card__preview-dot"></span>
        <span class="section-summary-card__preview-text">{{ item.title }}</span>
      </div>
      <span v-if="hasMoreItems" class="section-summary-card__preview-more">+{{ items.length - maxItems }}개 더</span>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'SectionSummaryCard',
  props: {
    section:  { type: Object, required: true },
    items:    { type: Array,  default: () => [] },
    maxItems: { type: Number, default: 3 },
  },
  setup(props) {
    const previewItems = computed(() => props.items.slice(0, props.maxItems))
    const hasMoreItems = computed(() => props.items.length > props.maxItems)
    return { previewItems, hasMoreItems }
  },
}
</script>

<style scoped>
.section-summary-card {
  height: 100%; width: 100%;
  background-color: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--card-radius); padding: var(--card-padding);
  box-shadow: var(--shadow); display: flex; flex-direction: column;
  gap: 1vh; transition: background-color 0.3s; overflow: hidden; box-sizing: border-box;
}

.section-summary-card__header { display: flex; align-items: flex-start; justify-content: space-between; flex-shrink: 0; min-width: 0; }
.section-summary-card__title  { font-size: var(--font-heading); font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.section-summary-card__subtitle { font-size: var(--font-label); color: var(--text-secondary); margin-top: 0.2vh; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.section-summary-card__more-btn { font-size: var(--font-label); color: var(--accent); white-space: nowrap; flex-shrink: 0; margin-left: 0.4vw; transition: opacity 0.2s; }
.section-summary-card__more-btn:hover { opacity: 0.7; }

.section-summary-card__empty { flex: 1; display: flex; align-items: center; justify-content: center; }
.section-summary-card__empty span { font-size: var(--font-label); color: var(--text-secondary); }

.section-summary-card__preview { display: flex; flex-direction: column; gap: 0.5vh; overflow: hidden; flex: 1; }

.section-summary-card__preview-item { display: flex; align-items: center; gap: 0.4vw; min-width: 0; flex-shrink: 0; }

.section-summary-card__preview-dot {
  width: clamp(4px, 0.35vw, 7px); height: clamp(4px, 0.35vw, 7px);
  border-radius: 50%; background-color: var(--accent); flex-shrink: 0;
}

.section-summary-card__preview-text { font-size: var(--font-body); color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.section-summary-card__preview-more { font-size: var(--font-label); color: var(--text-secondary); padding-left: 0.75vw; flex-shrink: 0; }
</style>
