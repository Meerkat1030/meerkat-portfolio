<template>
  <BaseModal title="새 섹션 추가" @close="$emit('close')">
    <div class="form-group">
      <label class="form-label">섹션 제목 *</label>
      <input v-model="formData.title" class="form-input" type="text" placeholder="ex) Certifications" @keyup.enter="handleSubmit" />
    </div>
    <div class="form-group">
      <label class="form-label">부제목</label>
      <input v-model="formData.subtitle" class="form-input" type="text" placeholder="ex) 자격증 및 수료" @keyup.enter="handleSubmit" />
    </div>
    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

    <template #footer>
      <button class="btn btn--secondary" @click="$emit('close')">취소</button>
      <button class="btn btn--primary" @click="handleSubmit">추가</button>
    </template>
  </BaseModal>
</template>

<script>
import { reactive, ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { usePortfolioStore } from '@/stores/portfolioStore'

export default {
  name: 'SectionAddModal',
  components: { BaseModal },
  emits: ['close', 'added'],

  setup(_, { emit }) {
    const { addSection } = usePortfolioStore()
    const errorMessage = ref('')
    const formData = reactive({ title: '', subtitle: '' })

    function handleSubmit() {
      if (!formData.title.trim()) { errorMessage.value = '섹션 제목을 입력해주세요.'; return }
      const newSection = addSection(formData.title.trim(), formData.subtitle.trim())
      emit('added', newSection)
      emit('close')
    }

    return { formData, errorMessage, handleSubmit }
  },
}
</script>

<style scoped>
.form-group { display: flex; flex-direction: column; gap: 0.5vh; }

.form-label {
  font-size: var(--font-label);
  font-weight: 500;
  color: var(--text-secondary);
}

.form-input {
  height: clamp(28px, 3.5vh, 44px);
  padding: 0 0.8vw;
  border-radius: 0.4vw;
  border: 1px solid var(--border);
  background-color: var(--bg-card-secondary);
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.form-input:focus { outline: none; border-color: var(--accent); }
.form-error { font-size: var(--font-label); color: #EF4444; }

.btn {
  height: clamp(28px, 3.5vh, 44px);
  padding: 0 1.2vw;
  border-radius: 0.4vw;
  font-size: var(--font-body);
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn--primary { background-color: var(--accent); color: #fff; }
.btn--primary:hover { background-color: var(--accent-hover); }
.btn--secondary { border: 1px solid var(--border); color: var(--text-secondary); }
.btn--secondary:hover { background-color: var(--bg-card-secondary); }
</style>
