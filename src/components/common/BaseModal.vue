<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal__header">
          <h2 class="modal__title">{{ title }}</h2>
          <button class="modal__close-btn" @click="$emit('close')">
            <SvgIcon name="close" />
          </button>
        </div>
        <div class="modal__body">
          <slot />
        </div>
        <div class="modal__footer" v-if="$slots.footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import SvgIcon from '@/components/common/SvgIcon.vue'

export default {
  name: 'BaseModal',
  components: { SvgIcon },
  props: { title: { type: String, required: true } },
  emits: ['close'],
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  width: clamp(300px, 35vw, 520px);
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2.5vh 2vw 0;
}

.modal__title {
  font-size: clamp(13px, 1.1vw, 19px);
  font-weight: 700;
  color: var(--text-primary);
}

.modal__close-btn {
  width: clamp(26px, 2.5vh, 36px);
  height: clamp(26px, 2.5vh, 36px);
  border-radius: 0.4vw;
  border: 1px solid var(--border);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: background-color 0.2s, color 0.2s;
}

.modal__close-btn:hover {
  background-color: var(--bg-card-secondary);
  color: var(--text-primary);
}

.modal__body {
  padding: 2vh 2vw;
  display: flex;
  flex-direction: column;
  gap: 1.5vh;
}

.modal__footer {
  padding: 0 2vw 2.5vh;
  display: flex;
  justify-content: flex-end;
  gap: 0.5vw;
}
</style>
