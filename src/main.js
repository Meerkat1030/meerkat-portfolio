// Day 1: 앱 진입점 — 의존성 연결 확인용 최소 구성
// Day 2에서 본격적으로 확장
import { createApp }   from 'vue'
import { createPinia } from 'pinia'
import App             from './App.vue'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
