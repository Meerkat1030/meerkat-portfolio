<template>
  <BaseModal
    :title="isEditMode ? `${sectionTitle} 항목 편집` : `${sectionTitle} 항목 추가`"
    @close="$emit('close')"
  >
    <div v-for="field in visibleFields" :key="field" class="form-group">
      <label class="form-label">{{ fieldLabelMap[field] }}</label>

      <div v-if="field === 'images'" class="image-upload-area">
        <button class="image-upload-btn" @click="triggerImageUpload">
          <SvgIcon name="plus" />
          이미지 추가
        </button>
        <input ref="imageInputRef" type="file" accept="image/*" multiple class="image-upload-input" @change="handleImageUpload" />
        <div v-if="formData.images.length" class="image-preview-list">
          <div v-for="(image, index) in formData.images" :key="index" class="image-preview-item">
            <img :src="image" alt="미리보기" class="image-preview-thumb" />
            <button class="image-preview-remove" @click="removeImage(index)">
              <SvgIcon name="close" />
            </button>
          </div>
        </div>
      </div>

      <textarea
        v-else-if="field === 'context'"
        v-model="formData[field]"
        class="form-textarea"
        rows="4"
        :placeholder="fieldPlaceholderMap[field]"
      />
      <input
        v-else
        v-model="formData[field]"
        class="form-input"
        type="text"
        :placeholder="fieldPlaceholderMap[field]"
      />
    </div>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

    <template #footer>
      <button class="btn btn--secondary" @click="$emit('close')">취소</button>
      <button class="btn btn--primary" @click="handleSubmit">
        {{ isEditMode ? '저장' : '추가' }}
      </button>
    </template>
  </BaseModal>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import SvgIcon from '@/components/common/SvgIcon.vue'
import { usePortfolioStore } from '@/stores/portfolioStore'

const FIELD_LABEL_MAP = {
  title:     '제목 *',
  subtitle:  '부제목',
  context:   '내용',
  startDate: '시작일',
  endDate:   '종료일',
  images:    '이미지',
}

const FIELD_PLACEHOLDER_MAP = {
  title:     '제목을 입력하세요',
  subtitle:  '부제목을 입력하세요',
  context:   '내용을 입력하세요',
  startDate: 'YYYY.MM',
  endDate:   'YYYY.MM (미입력 시 현재)',
  images:    '',
}

export default {
  name: 'SectionItemAddModal',
  components: { BaseModal, SvgIcon },
  props: {
    sectionId:   { type: String,  required: true },
    sectionType: { type: String,  required: true },
    // 편집 시 기존 아이템 전달, 없으면 추가 모드
    editItem:    { type: Object,  default: null },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const { state, addSectionItem, updateSectionItem, getSectionFields } = usePortfolioStore()
    const imageInputRef = ref(null)
    const errorMessage  = ref('')

    const isEditMode = computed(() => props.editItem !== null)

    // 편집 모드면 기존 데이터로 초기화, 추가 모드면 빈 값
    const formData = reactive({
      title:     props.editItem?.title     ?? '',
      subtitle:  props.editItem?.subtitle  ?? '',
      context:   props.editItem?.context   ?? '',
      startDate: props.editItem?.startDate ?? '',
      endDate:   props.editItem?.endDate   ?? '',
      images:    props.editItem?.images    ? [...props.editItem.images] : [],
    })

    const visibleFields = computed(() => getSectionFields(props.sectionType))
    const sectionTitle  = computed(() => state.sections.find((s) => s.id === props.sectionId)?.title ?? '')

    function triggerImageUpload() { imageInputRef.value?.click() }

    function handleImageUpload(event) {
      Array.from(event.target.files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => formData.images.push(e.target.result)
        reader.readAsDataURL(file)
      })
    }

    function removeImage(index) { formData.images.splice(index, 1) }

    function handleSubmit() {
      if (!formData.title.trim()) {
        errorMessage.value = '제목을 입력해주세요.'
        return
      }

      const itemData = {}
      visibleFields.value.forEach((field) => {
        itemData[field] = field === 'images' ? [...formData.images] : formData[field]
      })

      if (isEditMode.value) {
        updateSectionItem(props.sectionId, props.editItem.id, itemData)
      } else {
        addSectionItem(props.sectionId, itemData)
      }

      emit('close')
    }

    return {
      formData,
      visibleFields,
      sectionTitle,
      errorMessage,
      isEditMode,
      imageInputRef,
      fieldLabelMap: FIELD_LABEL_MAP,
      fieldPlaceholderMap: FIELD_PLACEHOLDER_MAP,
      triggerImageUpload,
      handleImageUpload,
      removeImage,
      handleSubmit,
    }
  },
}
</script>

<style scoped>
.form-group { display: flex; flex-direction: column; gap: 0.5vh; }
.form-label { font-size: var(--font-label); font-weight: 500; color: var(--text-secondary); }

.form-input {
  height: clamp(28px, 3.5vh, 44px);
  padding: 0 0.8vw;
  border-radius: 0.4vw;
  border: 1px solid var(--border);
  background-color: var(--bg-card-secondary);
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus { outline: none; border-color: var(--accent); }

.form-textarea {
  padding: 0.8vh 0.8vw;
  border-radius: 0.4vw;
  border: 1px solid var(--border);
  background-color: var(--bg-card-secondary);
  color: var(--text-primary);
  resize: vertical;
  line-height: 1.6;
  transition: border-color 0.2s;
}

.form-error { font-size: var(--font-label); color: #EF4444; }

.image-upload-area { display: flex; flex-direction: column; gap: 0.8vh; }

.image-upload-btn {
  display: flex;
  align-items: center;
  gap: 0.4vw;
  height: clamp(28px, 3.5vh, 44px);
  padding: 0 0.8vw;
  border-radius: 0.4vw;
  border: 1px dashed var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--font-body);
  align-self: flex-start;
  transition: border-color 0.2s, color 0.2s;
}

.image-upload-btn:hover { border-color: var(--accent); color: var(--accent); }
.image-upload-input { display: none; }

.image-preview-list { display: flex; gap: 0.5vw; flex-wrap: wrap; }
.image-preview-item { position: relative; }

.image-preview-thumb {
  width: clamp(50px, 5vw, 80px);
  height: clamp(50px, 5vw, 80px);
  object-fit: cover;
  border-radius: 0.4vw;
  border: 1px solid var(--border);
}

.image-preview-remove {
  position: absolute;
  top: -0.5vh;
  right: -0.3vw;
  width: clamp(16px, 1.5vh, 22px);
  height: clamp(16px, 1.5vh, 22px);
  border-radius: 50%;
  background-color: #EF4444;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: background-color 0.2s;
}

.image-preview-remove:hover { background-color: #DC2626; }

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
