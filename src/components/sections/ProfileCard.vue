<template>
  <div class="profile-card">
    <div class="profile-card__header">
      <h3 class="profile-card__title">Profile</h3>
      <router-link to="/profile" class="profile-card__more-btn">더보기</router-link>
    </div>

    <div class="profile-card__top">
      <img
        :src="profileImage"
        alt="프로필 사진"
        class="profile-card__photo"
      />

      <div class="profile-card__info">
        <div class="profile-card__info-row">
          <span class="profile-card__info-label">이름</span>
          <span class="profile-card__info-value profile-card__name">
            {{ state.profile.name }}
          </span>
        </div>

        <div class="profile-card__info-row">
          <span class="profile-card__info-label">생년월일</span>
          <span class="profile-card__info-value">
            {{ state.profile.birthDate }}
            <span v-if="calculatedAge !== null" class="profile-card__age">
              ({{ calculatedAge }}세)
            </span>
          </span>
        </div>

        <div class="profile-card__info-row">
          <span class="profile-card__info-label">연락처</span>
          <span class="profile-card__info-value">
            {{ state.profile.phone }}
          </span>
        </div>

        <div class="profile-card__info-row">
          <span class="profile-card__info-label">주소지</span>
          <span class="profile-card__info-value">
            {{ state.profile.address }}
          </span>
        </div>

        <div class="profile-card__info-row">
          <span class="profile-card__info-label">학력</span>
          <span class="profile-card__info-value">
            {{ state.profile.education }}
          </span>
        </div>

        <div class="profile-card__info-row">
          <span class="profile-card__info-label">이메일</span>
          <a
            :href="`mailto:${state.profile.email}`"
            class="profile-card__info-link profile-card__info-link--truncate"
          >
            {{ state.profile.email }}
          </a>
        </div>

        <div class="profile-card__info-row">
          <span class="profile-card__info-label">GitHub</span>
          <a
            :href="state.profile.github"
            target="_blank"
            class="profile-card__info-link profile-card__info-link--truncate"
          >
            {{ state.profile.github }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import SvgIcon from '@/components/common/SvgIcon.vue'
import defaultProfile from '@/assets/images/profile.png'

export default {
  name: 'ProfileCard',
  components: { SvgIcon },

  setup() {
    const { state } = usePortfolioStore()
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

      const notYet =
        today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() &&
          today.getDate() < birth.getDate())

      if (notYet) age -= 1

      return age
    })

    const profileImage = computed(() => {
      return state.profile.photo || defaultProfile
    })

    return {
      state,
      calculatedAge,
      profileImage,
    }
  },
}
</script>

<style scoped>
.profile-card {
  height: 100%;
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

.profile-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-card__title {
  font-size: var(--font-heading);
  font-weight: 700;
  color: var(--text-primary);
}

.profile-card__more-btn {
  font-size: var(--font-label);
  color: var(--accent);
  transition: opacity 0.2s;
}

.profile-card__more-btn:hover { opacity: 0.7; }

.profile-card__top {
  display: flex;
  gap: 0.8vw;
  align-items: flex-start;
  flex: 1;
}

.profile-card__photo,
.profile-card__photo-placeholder {
  width: var(--photo-width);
  height: var(--photo-height);
  border-radius: 0.4vw;
  object-fit: cover;
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.profile-card__photo-placeholder {
  background-color: var(--bg-card-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.profile-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5vh;
  min-width: 0;
}

.profile-card__info-row {
  display: flex;
  align-items: center;
  gap: 0.4vw;
  min-width: 0;
}

.profile-card__info-label {
  font-size: var(--font-label);
  color: var(--text-secondary);
  min-width: 3.2vw;
  flex-shrink: 0;
  white-space: nowrap;
}

.profile-card__info-value {
  font-size: var(--font-body);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-card__name {
  font-size: var(--font-name);
  font-weight: 700;
}

.profile-card__age {
  font-size: var(--font-label);
  color: var(--text-secondary);
  margin-left: 0.2vw;
}

.profile-card__info-link {
  font-size: var(--font-body);
  color: var(--accent);
  transition: opacity 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.profile-card__info-link--truncate {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-card__info-link:hover { opacity: 0.8; }
</style>
