import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ .env.local에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 입력하세요')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken:   true,
    persistSession:     true,   // 새로고침 후 로그인 유지
    detectSessionInUrl: true,   // OAuth 콜백 URL 자동 처리
  },
})
