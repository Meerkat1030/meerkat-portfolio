import { reactive, readonly } from 'vue'
import defaultProfileImage from '@/assets/images/profile.png'

const SECTION_FIELD_MAP = {
  skills:      ['title', 'context', 'images'],
  myHistory:   ['title', 'subtitle', 'context', 'startDate', 'endDate'],
  projects:    ['title', 'subtitle', 'context', 'startDate', 'endDate', 'tags', 'images'],
  workHistory: ['title', 'subtitle', 'context', 'startDate', 'endDate', 'tags'],
  contactMe:   ['title', 'context'],
}

const state = reactive({
  isDarkMode: false,
  isEditMode: false,

  profile: {
    photo:     defaultProfileImage,
    name:      '이재홍',
    birthDate: '1999.10.30',
    phone:     '010-2321-6926',
    address:   '경상남도 양산시',
    education: '경성대학교 소프트웨어학과 (2017.03 ~ 휴학중)',
    email:     'meerkat991030@gmail.com',
    github:    'https://github.com/Meerkat1030',
  },

  sections: [
    { id: 'profile',     title: 'Profile',      subtitle: '프로필',    routePath: '/profile',      type: 'profile' },
    { id: 'skills',      title: 'Skills',       subtitle: '기술 스택', routePath: '/skills',       type: 'skills' },
    { id: 'myHistory',   title: 'My History',   subtitle: '개인 이력', routePath: '/my-history',   type: 'myHistory' },
    { id: 'projects',    title: 'Projects',     subtitle: '프로젝트',  routePath: '/projects',     type: 'projects' },
    { id: 'workHistory', title: 'Work History', subtitle: '경력 사항', routePath: '/work-history', type: 'workHistory' },
    { id: 'contactMe',   title: 'Contact Me',   subtitle: '연락처',    routePath: '/contact',      type: 'contactMe' },
  ],

  sectionItems: {
    skills: [
      { id: 1,  title: 'JavaScript',   context: 'ES6+ 문법, 비동기 처리, DOM 조작 등 활용 (레벨: 상)',   createdAt: '' },
      { id: 2,  title: 'Java',         context: 'Spring Framework 기반 백엔드 개발 및 JSP 연동 (레벨: 상)', createdAt: '' },
      { id: 3,  title: 'HTML5 / CSS3', context: '시맨틱 마크업 및 반응형 레이아웃 구현 (레벨: 상)',       createdAt: '' },
      { id: 4,  title: 'JSP / Servlet',context: 'MVC 패턴 기반 웹 애플리케이션 개발 (레벨: 상)',          createdAt: '' },
      { id: 5,  title: 'Spring Boot',  context: 'REST API 및 Thymeleaf 기반 웹 개발 (레벨: 상)',           createdAt: '' },
      { id: 6,  title: 'Oracle DB',    context: 'SQL 쿼리 작성 및 DB 설계 (레벨: 상)',                      createdAt: '' },
      { id: 7,  title: 'Tibero DB',    context: '마이스터넷 실무 환경에서 사용한 DB (레벨: 상)',            createdAt: '' },
      { id: 8,  title: 'Firebase',     context: 'Realtime Database, Hosting, Authentication 활용 (레벨: 상)', createdAt: '' },
      { id: 9,  title: 'Vue.js',       context: 'Vue 3 기반 SPA 개발, Composition API 활용 (레벨: 중)',    createdAt: '' },
      { id: 10, title: 'Kotlin',       context: 'Android 앱 개발, ROOM, TMDB API 연동 (레벨: 중)',          createdAt: '' },
      { id: 11, title: 'React.js',     context: '국비과정에서 학습한 프론트엔드 라이브러리 (레벨: 중)',     createdAt: '' },
      { id: 12, title: 'MariaDB',      context: 'SpringBoot 프로젝트 연동 경험 (레벨: 중)',                  createdAt: '' },
      { id: 13, title: 'Bootstrap',    context: '반응형 UI 구성에 활용 (레벨: 중)',                          createdAt: '' },
      { id: 14, title: 'GitHub / SVN', context: '버전 관리 및 협업 도구 사용 (레벨: 중)',                    createdAt: '' },
    ],

    myHistory: [
      {
        id: 1,
        title: '경성대학교 소프트웨어학과',
        subtitle: '재학 (휴학중)',
        startDate: '2017.03', endDate: '',
        context: '17학번으로 입학하여 C, Java, Spring Boot, Oracle SQL, 컴퓨터 구조, 정보 보안, 정보검색 등 전공 지식을 쌓았습니다.',
        createdAt: '',
      },
      {
        id: 2,
        title: '한국스카우트 연맹',
        subtitle: '로버 스카우트 활동',
        startDate: '2008.03', endDate: '',
        context: '단체생활 및 리더십 함양.\n2012 13회 한국잼버리 / 2014 4회 국제패트롤잼버리 / 2016 14회 한국잼버리 / 2017 부산캠퍼리 운영요원 / 2018 5회 국제패트롤잼버리 운영요원 / 2019 18회 로버무트 참가',
        createdAt: '',
      },
      {
        id: 3,
        title: '공공데이터 인턴 (행정안전부)',
        subtitle: '인턴십',
        startDate: '2020.09', endDate: '2020.12',
        context: '공공데이터 개방, 기관 보유 데이터 품질 진단 및 개선, 위치 데이터 확보·개선 업무 수행. 데이터 표준화와 일관성 있는 처리의 중요성을 경험했습니다.',
        createdAt: '',
      },
      {
        id: 4,
        title: '부산 IT 교육센터',
        subtitle: '스마트웹&콘텐츠개발 / 자바&코틀린 기반 풀스택 개발(C)',
        startDate: '2023.10', endDate: '2024.04',
        context: 'SpringBoot, 코틀린, React.js 등 심화 학습을 위해 지원. JAVA, HTML, JSP/Servlet, Oracle 11c, SpringFramework, Kotlin, React, JavaScript 등 수료.',
        createdAt: '',
      },
    ],

    projects: [
      {
        id: 1,
        title: 'LoL-WEB Project',
        subtitle: '4인 팀 프로젝트 (팀원)',
        startDate: '2024.03', endDate: '2024.04',
        context: '부산 IT 교육센터 3차 프로젝트. 비회원 IP 기반 CRUD 게시판과 투표, 룰렛, 시뮬레이션 공유 기능.\n\n담당 파트:\n- 댓글 CRUD 기능 전체\n- 게시글 검색 기능\n- 게시글 좋아요/싫어요 기능\n- 시뮬레이션 공유 기능\n- 키워드 검색 후 정렬 기능\n- Firebase 연동\n\nGitHub: https://github.com/Meerkat1030/lolWeb_Main',
        tags: ['Java', 'Spring Boot', 'MariaDB', 'Firebase', 'JavaScript', 'HTML', 'CSS', 'Cloudtype'],
        images: [], createdAt: '',
      },
      {
        id: 2,
        title: 'whereOTT Project',
        subtitle: '4인 팀 프로젝트 (팀장)',
        startDate: '2024.02', endDate: '2024.02',
        context: '부산IT교육센터 2차 프로젝트. 로그인과 영화·TV시리즈·배우 검색이 가능한 Android 앱.\n\n담당 파트:\n- 일정 조율 및 총괄 (팀장)\n- 회원가입, 로그인, 로그아웃 기능 구현\n- 프로필 수정 기능 구현\n\nGitHub: https://github.com/Meerkat1030/whereOTT',
        tags: ['Kotlin', 'TMDB API', 'ROOM', 'Android'],
        images: [], createdAt: '',
      },
      {
        id: 3,
        title: 'SpringBoot Board Project',
        subtitle: '개인 프로젝트',
        startDate: '2024.01', endDate: '2024.01',
        context: 'SpringBoot 팀 프로젝트 시작 전 연습용으로 만든 간단한 CRUD Board 웹 페이지.\n\nGitHub: https://github.com/Meerkat1030/SpringBoardProject',
        tags: ['Spring Boot', 'H2', 'Java', 'HTML', 'CSS', 'JavaScript'],
        images: [], createdAt: '',
      },
      {
        id: 4,
        title: 'LoL Item Simulation Project',
        subtitle: '4인 팀 프로젝트 (팀원)',
        startDate: '2023.12', endDate: '2023.12',
        context: '부산IT교육센터 1차 프로젝트. Riot Game Data Dragon 데이터 기반 아이템 시뮬레이션 웹사이트.\n\n담당 파트:\n- Riot API 데이터 기반 챔피언 선택·검색\n- 스테이터스 공식 반영 및 수치 계산\n- HP/MP 구현\n\nURL: https://meerkat1030.github.io/LoL-Item-Simulation/\nGitHub: https://github.com/Meerkat1030/LoL-Item-Simulation',
        tags: ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'Riot Game Data Dragon API'],
        images: [], createdAt: '',
      },
      {
        id: 5,
        title: 'Portfolio Website',
        subtitle: '개인 프로젝트',
        startDate: '2023.11', endDate: '',
        context: '부산IT교육센터에서 배운 HTML, CSS, JS를 활용한 개인 포트폴리오 웹사이트. 지속적으로 업데이트 중.\n\nURL: https://meerkat1030.github.io/portfolio/src/index.html\nGitHub: https://github.com/Meerkat1030/portfolio',
        tags: ['HTML', 'CSS', 'JavaScript'],
        images: [], createdAt: '',
      },
      {
        id: 6,
        title: 'WFive Project',
        subtitle: '3인 팀 프로젝트 (팀장)',
        startDate: '2020.04', endDate: '2020.06',
        context: '학교 프로젝트 과목. 구글맵 핀 기반으로 하루 지나온 장소를 기록하는 다이어리 웹사이트.\n\n담당 파트:\n- 일정 조율 및 총괄 (팀장)\n- Firebase 호스팅 및 동기 DB 관리\n- Google API / GoogleMap API 관련 기능 전담\n- 게시글 CRUD 기능\n- 해시태그·날짜·키워드 검색 기능\n\nURL: https://wfive-79380.web.app/login.html\nGitHub: https://github.com/Meerkat1030/Wfive',
        tags: ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'Firebase', 'Google API', 'GoogleMap API'],
        images: [], createdAt: '',
      },
    ],

    workHistory: [
      {
        id: 1,
        title: '엔 정보기술 (산업인력공단 상주)',
        subtitle: '마이스터넷 유지보수 및 신규개발',
        startDate: '2024.06', endDate: '2025.01',
        context: '산업인력공단에 상주 근무하며 마이스터넷 사용자·관리자 페이지 및 기능경기 대회 채점 관리 시스템의 신규 기능 개발 및 유지보수 업무를 수행하며 실무경력을 쌓았습니다.',
        tags: ['Java', 'JSP', 'Spring', 'TiberoSQL', 'JavaScript', 'HTML'],
        createdAt: '',
      },
    ],

    contactMe: [
      { id: 1, title: '이메일',    context: 'meerkat991030@gmail.com',        createdAt: '' },
      { id: 2, title: 'GitHub',    context: 'https://github.com/Meerkat1030', createdAt: '' },
      { id: 3, title: '연락처',    context: '010-2321-6926',                   createdAt: '' },
      { id: 4, title: '위치',      context: '경상남도 양산시',                  createdAt: '' },
      { id: 5, title: 'Instagram', context: 'https://www.instagram.com/meer_._kat/', createdAt: '' },
    ],
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

function updateSectionItem(sectionId, itemId, itemData) {
  if (!state.sectionItems[sectionId]) return
  const index = state.sectionItems[sectionId].findIndex((item) => item.id === itemId)
  if (index === -1) return
  Object.assign(state.sectionItems[sectionId][index], itemData)
}

function removeSectionItem(sectionId, itemId) {
  if (!state.sectionItems[sectionId]) return
  state.sectionItems[sectionId] = state.sectionItems[sectionId].filter((item) => item.id !== itemId)
}

function updateProfile(profileData) {
  Object.assign(state.profile, profileData)
}

function getSectionFields(sectionType) {
  return SECTION_FIELD_MAP[sectionType] ?? ['title', 'subtitle', 'context', 'startDate', 'endDate', 'tags', 'images']
}

export function usePortfolioStore() {
  return {
    state: readonly(state),
    toggleDarkMode,
    toggleEditMode,
    reorderSections,
    addSection,
    addSectionItem,
    updateSectionItem,
    removeSectionItem,
    updateProfile,
    getSectionFields,
  }
}
