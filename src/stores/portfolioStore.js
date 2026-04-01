import { reactive, readonly } from 'vue'
import { supabase } from '@/lib/supabase'
import defaultProfileImage from '@/assets/images/profile.png'

const SECTION_FIELD_MAP = {
  skills:      ['title', 'context'],
  myHistory:   ['title', 'subtitle', 'context', 'startDate', 'endDate'],
  projects:    ['title', 'subtitle', 'context', 'startDate', 'endDate', 'tags'],
  workHistory: ['title', 'subtitle', 'context', 'startDate', 'endDate', 'tags'],
  contactMe:   ['title', 'context'],
}

const state = reactive({
  isDarkMode: false,
  isEditMode: false,
  isLoading:  false,
  profile: {
    photo: defaultProfileImage, name: '', birthDate: '',
    phone: '', address: '', education: '', email: '', github: '',
  },
  sections: [],
  sectionItems: {
    skills: [], myHistory: [], projects: [], workHistory: [], contactMe: [],
  },
})

function dbItemToLocal(row) {
  return {
    id:        row.id,
    title:     row.title      ?? '',
    subtitle:  row.subtitle   ?? '',
    context:   row.context    ?? '',
    startDate: row.start_date ?? '',
    endDate:   row.end_date   ?? '',
    tags:      row.tags       ?? [],
    images:    row.image_urls ?? [],
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at ?? '',
  }
}

function localItemToDb(sectionId, itemData) {
  return {
    section_id: sectionId,
    title:      itemData.title,
    subtitle:   itemData.subtitle  || '',
    context:    itemData.context   || '',
    start_date: itemData.startDate || '',
    end_date:   itemData.endDate   || '',
    tags:       itemData.tags      ?? [],
    image_urls: itemData.images    ?? [],
  }
}

async function loadAllData() {
  state.isLoading = true
  await Promise.all([loadProfile(), loadSections(), loadAllSectionItems()])
  state.isLoading = false
}

async function loadProfile() {
  const { data, error } = await supabase.from('profile').select('*').eq('id', 1).single()
  if (error || !data) return
  Object.assign(state.profile, {
    photo:     data.photo_url  || defaultProfileImage,
    name:      data.name       || '',
    birthDate: data.birth_date || '',
    phone:     data.phone      || '',
    address:   data.address    || '',
    education: data.education  || '',
    email:     data.email      || '',
    github:    data.github     || '',
  })
}

async function loadSections() {
  const { data, error } = await supabase.from('sections').select('*').order('sort_order', { ascending: true })
  if (error || !data) return
  state.sections.splice(0, state.sections.length, ...data.map((row) => ({
    id: row.id, title: row.title, subtitle: row.subtitle, routePath: row.route_path, type: row.type,
  })))
}

async function loadAllSectionItems() {
  const { data, error } = await supabase
    .from('section_items').select('*').eq('is_visible', true).order('sort_order', { ascending: true })
  if (error || !data) return
  const grouped = { skills: [], myHistory: [], projects: [], workHistory: [], contactMe: [] }
  data.forEach((row) => {
    if (grouped[row.section_id] !== undefined) grouped[row.section_id].push(dbItemToLocal(row))
  })
  Object.assign(state.sectionItems, grouped)
}

let realtimeChannel = null

function subscribeRealtime() {
  realtimeChannel = supabase
    .channel('portfolio-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'section_items' }, loadAllSectionItems)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profile' },       loadProfile)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sections' },      loadSections)
    .subscribe()
}

function unsubscribeRealtime() {
  if (realtimeChannel) { supabase.removeChannel(realtimeChannel); realtimeChannel = null }
}

async function updateProfile(profileData) {
  Object.assign(state.profile, profileData)
  await supabase.from('profile').update({
    name:       profileData.name,
    birth_date: profileData.birthDate,
    phone:      profileData.phone,
    address:    profileData.address,
    education:  profileData.education,
    email:      profileData.email,
    github:     profileData.github,
    photo_url:  profileData.photo !== defaultProfileImage ? profileData.photo : null,
  }).eq('id', 1)
}

async function addSectionItem(sectionId, itemData) {
  const dbData = { ...localItemToDb(sectionId, itemData), sort_order: state.sectionItems[sectionId]?.length ?? 0 }
  const { data, error } = await supabase.from('section_items').insert(dbData).select().single()
  if (error) { console.error('추가 실패:', error.message); return }
  if (!state.sectionItems[sectionId]) state.sectionItems[sectionId] = []
  state.sectionItems[sectionId].push(dbItemToLocal(data))
}

async function updateSectionItem(sectionId, itemId, itemData) {
  const index = state.sectionItems[sectionId]?.findIndex((i) => i.id === itemId)
  if (index !== -1 && index !== undefined) Object.assign(state.sectionItems[sectionId][index], itemData)
  await supabase.from('section_items').update(localItemToDb(sectionId, itemData)).eq('id', itemId)
}

async function removeSectionItem(sectionId, itemId) {
  if (!state.sectionItems[sectionId]) return
  state.sectionItems[sectionId] = state.sectionItems[sectionId].filter((i) => i.id !== itemId)
  await supabase.from('section_items').update({ is_visible: false }).eq('id', itemId)
}

async function reorderSectionItems(sectionId, newOrder) {
  state.sectionItems[sectionId].splice(0, state.sectionItems[sectionId].length, ...newOrder)
  await Promise.all(newOrder.map((item, index) =>
    supabase.from('section_items').update({ sort_order: index }).eq('id', item.id)
  ))
}

async function reorderSections(newOrder) {
  state.sections.splice(0, state.sections.length, ...newOrder)
  await Promise.all(newOrder.map((section, index) =>
    supabase.from('sections').update({ sort_order: index }).eq('id', section.id)
  ))
}

function toggleDarkMode() {
  state.isDarkMode = !state.isDarkMode
  document.documentElement.setAttribute('data-theme', state.isDarkMode ? 'dark' : 'light')
}

function toggleEditMode() { state.isEditMode = !state.isEditMode }

function addSection(title, subtitle) {
  const id        = title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
  const newSection = { id, title, subtitle, routePath: '/' + id, type: 'custom' }
  state.sections.push(newSection)
  state.sectionItems[id] = []
  supabase.from('sections').insert({ id, title, subtitle, route_path: '/' + id, type: 'custom', sort_order: state.sections.length - 1 })
  return newSection
}

function getSectionFields(sectionType) {
  return SECTION_FIELD_MAP[sectionType] ?? ['title', 'subtitle', 'context', 'startDate', 'endDate', 'tags']
}

export function usePortfolioStore() {
  return {
    state: readonly(state),
    loadAllData, subscribeRealtime, unsubscribeRealtime,
    toggleDarkMode, toggleEditMode,
    reorderSections, reorderSectionItems,
    addSection, addSectionItem, updateSectionItem, removeSectionItem,
    updateProfile, getSectionFields,
  }
}
