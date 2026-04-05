import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 pt-16 pb-10">
      <div className="absolute inset-0 bg-cyber-grid opacity-20" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent-cyan/5 rounded-full blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-glow-yellow">
              <Shield size={22} className="text-dark" />
            </div>
            <span className="text-white font-display text-2xl tracking-wide">CYBER<span className="text-primary">TECH</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
          <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>
        <div className="glass-card p-8">{children}</div>
      </motion.div>
    </div>
  )
}

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const { login, loading, isLoggedIn, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn) navigate(isAdmin ? '/admin' : '/student')
  }, [isLoggedIn])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (result.success) navigate(result.user?.role === 'admin' ? '/admin' : '/student')
  }

  const demoLogin = (email, password) => setForm({ email, password })

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your student portal">
      {/* Demo credentials */}
      <div className="mb-5 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs">
        <p className="text-primary font-semibold mb-2">🎯 Demo Accounts:</p>
        <div className="flex flex-col gap-1.5">
          <button onClick={() => demoLogin('admin@cybertech.com', 'Admin@123')}
            className="text-left text-gray-300 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/10">
            <span className="font-semibold text-primary">Admin:</span> admin@cybertech.com / Admin@123
          </button>
          <button onClick={() => demoLogin('student@cybertech.com', 'Student@123')}
            className="text-left text-gray-300 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/10">
            <span className="font-semibold text-primary">Student:</span> student@cybertech.com / Student@123
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-gray-400 text-sm mb-1.5 block">Email Address</label>
          <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            type="email" placeholder="your@email.com" className="input-field" required />
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-1.5 block">Password</label>
          <div className="relative">
            <input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              type={showPass ? 'text' : 'password'} placeholder="Enter password" className="input-field pr-12" required />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2">
          {loading ? '⏳ Signing in...' : <><span>Sign In</span><ArrowRight size={18} /></>}
        </button>
      </form>
      <p className="text-center text-gray-400 text-sm mt-5">
        Don't have an account? <Link to="/register" className="text-primary hover:text-primary-300 font-semibold">Create Account</Link>
      </p>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const { register, loading, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { if (isLoggedIn) navigate('/student') }, [isLoggedIn])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { return }
    const result = await register(form.name, form.email, form.password, form.phone)
    if (result.success) navigate('/student')
  }

  return (
    <AuthLayout title="Create Account" subtitle="Join 15,000+ IT professionals today">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-gray-400 text-sm mb-1.5 block">Full Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Your full name" className="input-field" required />
          </div>
          <div className="col-span-2">
            <label className="text-gray-400 text-sm mb-1.5 block">Email</label>
            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              type="email" placeholder="your@email.com" className="input-field" required />
          </div>
          <div className="col-span-2">
            <label className="text-gray-400 text-sm mb-1.5 block">Phone</label>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="+91 98765 43210" className="input-field" />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Password</label>
            <div className="relative">
              <input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                type={showPass ? 'text' : 'password'} placeholder="Min. 6 chars" className="input-field pr-10" required minLength={6} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Confirm</label>
            <input value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
              type="password" placeholder="Re-enter" className={`input-field ${form.confirm && form.confirm !== form.password ? 'border-red-500' : ''}`} required />
            {form.confirm && form.confirm !== form.password && <p className="text-red-400 text-xs mt-1">Passwords don't match</p>}
          </div>
        </div>
        <button type="submit" disabled={loading || (form.confirm && form.confirm !== form.password)}
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base">
          {loading ? '⏳ Creating account...' : <><span>Create Account</span><ArrowRight size={18} /></>}
        </button>
        <p className="text-gray-500 text-xs text-center">
          By registering you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </p>
      </form>
      <p className="text-center text-gray-400 text-sm mt-4">
        Already have an account? <Link to="/login" className="text-primary hover:text-primary-300 font-semibold">Sign In</Link>
      </p>
    </AuthLayout>
  )
}
