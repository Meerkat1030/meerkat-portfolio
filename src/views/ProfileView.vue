<template>
  <div class="profile-view">
    <div class="profile-view__content">

      <div class="profile-view__header">
        <h1 class="profile-view__title">Profile</h1>
        <button v-if="!isEditing" class="profile-view__edit-btn" @click="startEdit">편집</button>
        <div v-else class="profile-view__edit-actions">
          <button class="btn btn--secondary" @click="cancelEdit">취소</button>
          <button class="btn btn--primary" @click="saveEdit">저장</button>
        </div>
      </div>

      <div class="profile-view__card">
        <!-- 사진 -->
        <div class="profile-view__photo-wrapper">
          <img
            :src="profileImage"
            alt="프로필 사진"
            class="profile-view__photo"
          />
          <button v-if="isEditing" class="profile-view__photo-edit-btn" @click="triggerPhotoUpload">편집</button>
          <input ref="photoInputRef" type="file" accept="image/*" class="profile-view__photo-input" @change="handlePhotoChange" />
        </div>

        <!-- 정보 -->
        <div class="profile-view__info">
          <div v-for="field in profileFields" :key="field.key" class="profile-view__info-row">
            <span class="profile-view__info-label">{{ field.label }}</span>
            <span v-if="!isEditing" class="profile-view__info-value" :class="{ 'profile-view__name': field.key === 'name' }">
              {{ displayProfile[field.key] }}
              <span v-if="field.key === 'birthDate' && calculatedAge !== null" class="profile-view__age">({{ calculatedAge }}세)</span>
            </span>
            <a v-else-if="false" />
            <input
              v-else
              v-model="editableProfile[field.key]"
              class="profile-view__info-input"
              :type="field.inputType || 'text'"
              :placeholder="field.placeholder || ''"
            />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import SvgIcon from '@/components/common/SvgIcon.vue'
import defaultProfile from '@/assets/images/profile.png'

const PROFILE_FIELDS = [
  { key: 'name',      label: '이름',    placeholder: '' },
  { key: 'birthDate', label: '생년월일', placeholder: 'YYYY.MM.DD' },
  { key: 'phone',     label: '연락처',  placeholder: '' },
  { key: 'address',   label: '주소지',  placeholder: '' },
  { key: 'education', label: '학력',    placeholder: '' },
  { key: 'email',     label: '이메일',  inputType: 'email' },
  { key: 'github',    label: 'GitHub',  placeholder: 'https://github.com/...' },
]

export default {
  name: 'ProfileView',
  components: { SvgIcon },

  setup() {
    const { state, updateProfile } = usePortfolioStore()
    const photoInputRef = ref(null)
    const isEditing = ref(false)
    const editableProfile = reactive({ ...state.profile })

    const displayProfile = computed(() => state.profile)

    const calculatedAge = computed(() => {
      const raw = state.profile.birthDate
      if (!raw) return null
      const normalized = raw.replace(/[.\-/]/g, '')
      if (normalized.length < 8) return null
      const year  = parseInt(normalized.slice(0, 4), 10)
      const month = parseInt(normalized.slice(4, 6), 10)
      const day   = parseInt(normalized.slice(6, 8), 10)
      if (isNaN(year) || isNaN(month) || isNaN(day)) return null
      const today = new Date()
      const birth = new Date(year, month - 1, day)
      if (birth > today) return null
      let age = today.getFullYear() - birth.getFullYear()
      const notYet = today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
      if (notYet) age -= 1
      return age
    })

    function startEdit() {
      Object.assign(editableProfile, state.profile)
      isEditing.value = true
    }

    function saveEdit() {
      updateProfile({ ...editableProfile })
      isEditing.value = false
    }

    function cancelEdit() {
      Object.assign(editableProfile, state.profile)
      isEditing.value = false
    }

    function triggerPhotoUpload() { photoInputRef.value?.click() }

    function handlePhotoChange(event) {
      const file = event.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        editableProfile.photo = e.target.result
        updateProfile({ photo: e.target.result })
      }
      reader.readAsDataURL(file)
    }

    const profileImage = computed(() => {
      return state.profile.photo || defaultProfile
    })

    return {
      state,
      displayProfile,
      editableProfile,
      isEditing,
      photoInputRef,
      calculatedAge,
      profileFields: PROFILE_FIELDS,
      profileImage,
      startEdit,
      saveEdit,
      cancelEdit,
      triggerPhotoUpload,
      handlePhotoChange,
    }
  },
}
</script>

<style scoped>
.profile-view { background-color: var(--bg-page); }

.profile-view__content {
  width: 100%;
  padding: 2.5vh var(--page-padding-x) 8vh;
  display: flex;
  flex-direction: column;
  gap: 2vh;
}

.profile-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-view__title {
  font-size: clamp(16px, 1.6vw, 28px);
  font-weight: 700;
  color: var(--text-primary);
}

.profile-view__edit-btn {
  height: var(--btn-height);
  padding: var(--btn-padding);
  border-radius: 0.5vw;
  background-color: var(--accent);
  color: #fff;
  font-size: var(--font-body);
  font-weight: 500;
  transition: background-color 0.2s;
}

.profile-view__edit-btn:hover { background-color: var(--accent-hover); }

.profile-view__edit-actions {
  display: flex;
  gap: 0.5vw;
}

.profile-view__card {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  box-shadow: var(--shadow);
  display: flex;
  gap: 2vw;
  align-items: flex-start;
}

.profile-view__photo-wrapper {
  position: relative;
  flex-shrink: 0;
}

.profile-view__photo,
.profile-view__photo-placeholder {
  width: clamp(80px, 10vw, 160px);
  height: clamp(107px, 13.3vw, 213px);
  border-radius: 0.5vw;
  object-fit: cover;
  border: 1px solid var(--border);
}

.profile-view__photo-placeholder {
  background-color: var(--bg-card-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.profile-view__photo-edit-btn {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2.5vh;
  background-color: rgba(0,0,0,0.5);
  color: #fff;
  font-size: var(--font-label);
  border-radius: 0 0 0.5vw 0.5vw;
  transition: background-color 0.2s;
}

.profile-view__photo-edit-btn:hover { background-color: rgba(0,0,0,0.7); }
.profile-view__photo-input { display: none; }

.profile-view__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.2vh;
}

.profile-view__info-row {
  display: flex;
  align-items: center;
  gap: 1vw;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1vh;
}

.profile-view__info-row:last-child { border-bottom: none; padding-bottom: 0; }

.profile-view__info-label {
  font-size: var(--font-label);
  color: var(--text-secondary);
  min-width: 4.5vw;
  flex-shrink: 0;
}

.profile-view__info-value {
  font-size: var(--font-body);
  color: var(--text-primary);
}

.profile-view__name {
  font-size: clamp(14px, 1.3vw, 22px);
  font-weight: 700;
}

.profile-view__age {
  font-size: var(--font-label);
  color: var(--text-secondary);
  margin-left: 0.3vw;
}

.profile-view__info-input {
  flex: 1;
  height: 3vh;
  padding: 0 0.6vw;
  border-radius: 0.3vw;
  border: 1px solid var(--border);
  background-color: var(--bg-card-secondary);
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.profile-view__info-input:focus {
  outline: none;
  border-color: var(--accent);
}

.btn {
  height: var(--btn-height);
  padding: var(--btn-padding);
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
