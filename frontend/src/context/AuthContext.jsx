import { createContext, useContext, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

// ── Axios instance (used by AuthContext) ─────────────────────
const API = axios.create({ baseURL: '/api' })

API.interceptors.request.use(config => {
  const token = localStorage.getItem('cybertech_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cybertech_token')
      localStorage.removeItem('cybertech_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export { API }

// ── Auth Context ─────────────────────────────────────────────
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cybertech_user')) }
    catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await API.post('/auth/login', { email, password })
      localStorage.setItem('cybertech_token', data.token)
      localStorage.setItem('cybertech_user',  JSON.stringify(data.user))
      setUser(data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
      return { success: true, user: data.user }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      toast.error(msg)
      return { success: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password, phone) => {
    setLoading(true)
    try {
      const { data } = await API.post('/auth/register', { name, email, password, phone })
      localStorage.setItem('cybertech_token', data.token)
      localStorage.setItem('cybertech_user',  JSON.stringify(data.user))
      setUser(data.user)
      toast.success('Account created successfully!')
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      toast.error(msg)
      return { success: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('cybertech_token')
    localStorage.removeItem('cybertech_user')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const refreshUser = async () => {
    try {
      const { data } = await API.get('/auth/me')
      setUser(data.user)
      localStorage.setItem('cybertech_user', JSON.stringify(data.user))
    } catch {}
  }

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, refreshUser,
      isAdmin:    user?.role === 'admin',
      isStudent:  user?.role === 'student',
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
