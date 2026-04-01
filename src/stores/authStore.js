import { reactive, readonly } from 'vue'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

const state = reactive({
  user:          null,
  isAdmin:       false,
  isAuthLoading: true,
})

async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  if (error) console.error('로그인 실패:', error.message)
}

async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('로그아웃 실패:', error.message)
}

function initAuth() {
  supabase.auth.getSession().then(({ data: { session } }) => {
    state.user          = session?.user ?? null
    state.isAdmin       = session?.user?.email === ADMIN_EMAIL
    state.isAuthLoading = false
  })

  supabase.auth.onAuthStateChange((_event, session) => {
    state.user          = session?.user ?? null
    state.isAdmin       = session?.user?.email === ADMIN_EMAIL
    state.isAuthLoading = false
  })
}

export function useAuthStore() {
  return {
    state: readonly(state),
    signInWithGoogle,
    signOut,
    initAuth,
  }
}
