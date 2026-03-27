import { reactive, readonly } from 'vue'

const SECTION_FIELD_MAP = {
  skills:      ['title', 'context', 'images'],
  myHistory:   ['title', 'subtitle', 'context', 'startDate', 'endDate'],
  projects:    ['title', 'subtitle', 'context', 'startDate', 'endDate', 'images'],
  workHistory: ['title', 'subtitle', 'context', 'startDate', 'endDate'],
  contactMe:   ['title', 'context'],
}

const state = reactive({
  isDarkMode: false,
  isEditMode: false,

  profile: {
    photo:     null,
    name:      '이재홍',
    birthDate: '1999.10.30',
    phone:     '010-2321-6926',
    address:   '경상남도 양산시 서들로 179',
    education: '경성대학교 소프트웨어학과 졸업(학사)',
    email:     'meerkat991030@gmail.com',
    github:    'https://github.com/Meerkat1030',
  },

  // sections 배열 순서 = 홈 카드 순서 = 드롭다운 메뉴 순서
  sections: [
    { id: 'profile',     title: 'Profile',      subtitle: '프로필',    routePath: '/profile',      type: 'profile' },
    { id: 'skills',      title: 'Skills',       subtitle: '기술 스택', routePath: '/skills',       type: 'skills' },
    { id: 'myHistory',   title: 'My History',   subtitle: '개인 이력', routePath: '/my-history',   type: 'myHistory' },
    { id: 'projects',    title: 'Projects',     subtitle: '프로젝트',  routePath: '/projects',     type: 'projects' },
    { id: 'workHistory', title: 'Work History', subtitle: '경력 사항', routePath: '/work-history', type: 'workHistory' },
    { id: 'contactMe',   title: 'Contact Me',   subtitle: '연락처',    routePath: '/contact',      type: 'contactMe' },
  ],

  sectionItems: {
    skills:      [],
    myHistory:   [],
    projects:    [],
    workHistory: [],
    contactMe:   [],
  },
})

function toggleDarkMode() {
  state.isDarkMode = !state.isDarkMode
  document.documentElement.setAttribute('data-theme', state.isDarkMode ? 'dark' : 'light')
}

function toggleEditMode() {
  state.isEditMode = !state.isEditMode
}

function reorderSections(newOrder) {
  state.sections.splice(0, state.sections.length, ...newOrder)
}

function addSection(title, subtitle) {
  const id = title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
  const newSection = { id, title, subtitle, routePath: '/' + id, type: 'custom' }
  state.sections.push(newSection)
  state.sectionItems[id] = []
  return newSection
}

function addSectionItem(sectionId, itemData) {
  if (!state.sectionItems[sectionId]) state.sectionItems[sectionId] = []
  state.sectionItems[sectionId].push({
    id: Date.now(),
    ...itemData,
    createdAt: new Date().toISOString(),
  })
}

function removeSectionItem(sectionId, itemId) {
  if (!state.sectionItems[sectionId]) return
  state.sectionItems[sectionId] = state.sectionItems[sectionId].filter((item) => item.id !== itemId)
}

function updateProfile(profileData) {
  Object.assign(state.profile, profileData)
}

function getSectionFields(sectionType) {
  return SECTION_FIELD_MAP[sectionType] ?? ['title', 'subtitle', 'context', 'startDate', 'endDate', 'images']
}

export function usePortfolioStore() {
  return {
    state: readonly(state),
    toggleDarkMode,
    toggleEditMode,
    reorderSections,
    addSection,
    addSectionItem,
    removeSectionItem,
    updateProfile,
    getSectionFields,
  }
}
