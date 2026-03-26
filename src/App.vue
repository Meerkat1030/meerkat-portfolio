<template>
  <div class="min-h-screen bg-surface-50 flex items-center justify-center">
    <div class="text-center space-y-4">
      <h1 class="font-display font-bold text-3xl text-surface-900">
        <span class="text-gradient">&lt;</span>
        meerkat-portfolio
        <span class="text-gradient">/&gt;</span>
      </h1>

      <!-- Supabase 연결 상태 표시 -->
      <div class="flex items-center justify-center gap-2 text-sm font-mono">
        <span
          class="w-2 h-2 rounded-full"
          :class="status === 'ok' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-yellow-400 animate-pulse'"
        ></span>
        <span class="text-surface-500">
          Supabase {{ statusText }}
        </span>
      </div>

      <p class="text-surface-400 text-sm">기초 세팅 완료</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase }       from './lib/supabase.js'

const status     = ref('connecting')  // 'connecting' | 'ok' | 'error'
const statusText = ref('연결 중...')

// 앱 로드 시 Supabase 연결 확인
onMounted(async () => {
  try {
    // section_types 테이블 조회로 DB 연결 확인
    const { error } = await supabase.from('section_types').select('id').limit(1)
    if (error) throw error
    status.value     = 'ok'
    statusText.value = '연결됨'
  } catch (e) {
    status.value     = 'error'
    statusText.value = '연결 실패 — .env.local 확인'
    console.error('Supabase 연결 오류:', e.message)
  }
})
</script>
