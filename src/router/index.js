import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const baseRoutes = [
  { path: '/',             name: 'home',        component: HomeView },
  { path: '/profile',      name: 'profile',     component: () => import('@/views/ProfileView.vue') },
  { path: '/skills',       name: 'skills',      component: () => import('@/views/SectionView.vue'), props: { sectionId: 'skills' } },
  { path: '/my-history',   name: 'myHistory',   component: () => import('@/views/SectionView.vue'), props: { sectionId: 'myHistory' } },
  { path: '/projects',     name: 'projects',    component: () => import('@/views/SectionView.vue'), props: { sectionId: 'projects' } },
  { path: '/work-history', name: 'workHistory', component: () => import('@/views/SectionView.vue'), props: { sectionId: 'workHistory' } },
  { path: '/contact',      name: 'contactMe',   component: () => import('@/views/SectionView.vue'), props: { sectionId: 'contactMe' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: baseRoutes,
})

export default router
