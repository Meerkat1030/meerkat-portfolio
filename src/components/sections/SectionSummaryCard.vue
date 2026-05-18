<template>
  <div class="section-summary-card" ref="cardRef">

    <div class="section-summary-card__header" ref="headerRef">
      <div class="section-summary-card__header-text">
        <h3 class="section-summary-card__title">{{ section.title }}</h3>
        <p class="section-summary-card__subtitle">{{ section.subtitle }}</p>
      </div>
      <router-link :to="section.routePath" class="section-summary-card__more-btn">
        더보기
      </router-link>
    </div>

    <div v-if="items.length === 0" class="section-summary-card__empty">
      <span>등록된 항목이 없어요</span>
    </div>

    <template v-else>
      <!-- 항목 + +n개 더를 같은 flex 컨테이너에 → gap 동일 적용 -->
      <div class="section-summary-card__preview">
        <div
          v-for="item in slicedItems"
          :key="item.id"
          class="section-summary-card__preview-item"
        >
          <span class="section-summary-card__preview-dot"></span>
          <span class="section-summary-card__preview-text">{{ item.title }}</span>
        </div>

        <span v-if="hiddenCount > 0" class="section-summary-card__overflow-text">
          +{{ hiddenCount }}개 더
        </span>
      </div>
    </template>

  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const ITEM_H_PX     = 22   // 항목 1줄 높이 (CSS height와 동일)
const ITEM_GAP_PX   = 6    // 항목 간 gap (CSS gap: 6px와 동일)
const OVERFLOW_H_PX = 22   // +n개 더 줄 높이 (항목과 동일)
const CARD_GAP_PX   = 10   // 카드 내부 gap(1vh) 추정

export default {
  name: 'SectionSummaryCard',
  props: {
    section:  { type: Object, required: true },
    items:    { type: Array,  default: () => [] },
    maxItems: { type: Number, default: 3 },
  },

  setup(props) {
    const cardRef    = ref(null)
    const headerRef  = ref(null)
    const maxVisible = ref(props.maxItems)
    let   observer   = null

    function recalc() {
      const card   = cardRef.value
      const header = headerRef.value
      if (!card || !header) return

      const cardH   = card.offsetHeight
      const headerH = header.offsetHeight
      if (cardH === 0 || headerH === 0) return

      // 사용 가능한 높이
      // = 전체 카드 - 헤더 - 헤더↔preview gap - +n개 더 줄(+gap)
      const available = cardH - headerH - CARD_GAP_PX - (OVERFLOW_H_PX + ITEM_GAP_PX)

      // 항목 1개 = ITEM_H_PX + gap (마지막 제외)
      // n개일 때 총 높이 = n * ITEM_H_PX + (n-1) * ITEM_GAP_PX
      // n = (available + ITEM_GAP_PX) / (ITEM_H_PX + ITEM_GAP_PX)
      const n = Math.floor((available + ITEM_GAP_PX) / (ITEM_H_PX + ITEM_GAP_PX))

      // 계산값에서 1 추가 여유 확보
      maxVisible.value = Math.max(1, n - 1)
    }

    onMounted(() => {
      observer = new ResizeObserver(() => { recalc() })
      if (cardRef.value)   observer.observe(cardRef.value)
      if (headerRef.value) observer.observe(headerRef.value)
    })

    onBeforeUnmount(() => { observer?.disconnect() })
    watch(() => props.items.length, () => { recalc() })

    const slicedItems = computed(() => props.items.slice(0, maxVisible.value))
    const hiddenCount = computed(() => Math.max(0, props.items.length - maxVisible.value))

    return { cardRef, headerRef, slicedItems, hiddenCount }
  },
}
</script>

<style scoped>
.section-summary-card {
  height: 100%;
  width: 100%;
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 1vh;
  overflow: hidden;
  box-sizing: border-box;
  transition: background-color 0.3s;
}

.section-summary-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5vw;
  flex-shrink: 0;
}

.section-summary-card__header-text { min-width: 0; flex: 1; }

.section-summary-card__title {
  font-size: var(--font-heading);
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.section-summary-card__subtitle {
  font-size: var(--font-label);
  color: var(--text-secondary);
  margin-top: 0.2vh;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.section-summary-card__more-btn {
  font-size: var(--font-label);
  color: var(--accent);
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.2s;
}
.section-summary-card__more-btn:hover { opacity: 0.7; }

.section-summary-card__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.section-summary-card__empty span {
  font-size: var(--font-label);
  color: var(--text-secondary);
}

.section-summary-card__preview {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
  overflow: hidden;
}

.section-summary-card__preview-item {
  display: flex;
  align-items: center;
  gap: 0.4vw;
  min-width: 0;
  flex-shrink: 0;
  height: 22px;  
}

.section-summary-card__preview-dot {
  width: clamp(4px, 0.35vw, 6px);
  height: clamp(4px, 0.35vw, 6px);
  border-radius: 50%;
  background-color: var(--accent);
  flex-shrink: 0;
}

.section-summary-card__preview-text {
  font-size: var(--font-body);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  line-height: 22px;
}

.section-summary-card__overflow-text {
  font-size: var(--font-label);
  color: var(--text-secondary);
  padding-left: calc(clamp(4px, 0.35vw, 6px) + 0.4vw);
  flex-shrink: 0;
  height: 22px;
  line-height: 22px;
}
</style>