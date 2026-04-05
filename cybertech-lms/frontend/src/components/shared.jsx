import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  Shield, Menu, X, ChevronDown, User, LogOut, LayoutDashboard,
  Settings, Bell, Star, Clock, Users, Award, BookOpen, Play
} from 'lucide-react'

/* ─── NAVBAR ─────────────────────────────────────────────── */
export function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/courses', label: 'Courses' },
    { to: '/trainers', label: 'Trainers' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark/95 backdrop-blur-md shadow-lg border-b border-dark-border' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:shadow-glow-yellow transition-all duration-300">
              <Shield size={20} className="text-dark" />
            </div>
            <div>
              <span className="text-white font-display text-xl tracking-wide">CYBER</span>
              <span className="text-primary font-display text-xl tracking-wide">TECH</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`nav-link text-sm ${location.pathname === link.to ? 'text-primary font-semibold' : ''}`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative">
                <button onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-all text-sm text-white">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-dark font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-52 glass-card border border-dark-border shadow-card-hover rounded-xl overflow-hidden">
                      <div className="p-3 border-b border-dark-border">
                        <p className="text-white font-semibold text-sm">{user?.name}</p>
                        <p className="text-gray-400 text-xs">{user?.email}</p>
                        <span className="cyber-badge mt-1 text-xs">{user?.role}</span>
                      </div>
                      <div className="p-2 space-y-0.5">
                        <DropItem icon={<LayoutDashboard size={15} />} label={isAdmin ? 'Admin Panel' : 'My Dashboard'}
                          onClick={() => { navigate(isAdmin ? '/admin' : '/student'); setDropOpen(false) }} />
                        <DropItem icon={<User size={15} />} label="Profile"
                          onClick={() => { navigate('/student/profile'); setDropOpen(false) }} />
                        <div className="border-t border-dark-border my-1" />
                        <DropItem icon={<LogOut size={15} />} label="Logout" danger
                          onClick={() => { logout(); setDropOpen(false) }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm py-2 px-4">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-50/95 backdrop-blur-lg border-b border-dark-border">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className="block py-3 px-4 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-dark-border space-y-2">
                {isLoggedIn ? (
                  <>
                    <button onClick={() => navigate(isAdmin ? '/admin' : '/student')} className="w-full btn-outline text-sm py-2.5">Dashboard</button>
                    <button onClick={logout} className="w-full btn-ghost text-sm py-2.5 text-red-400">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block text-center btn-outline py-2.5 text-sm">Login</Link>
                    <Link to="/register" className="block text-center btn-primary py-2.5 text-sm">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

function DropItem({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${danger ? 'text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
      {icon} {label}
    </button>
  )
}

/* ─── FOOTER ─────────────────────────────────────────────── */
export function Footer() {
  return (
    <footer className="bg-dark-50 border-t border-dark-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <Shield size={20} className="text-dark" />
              </div>
              <span className="text-white font-display text-xl tracking-wide">CYBER<span className="text-primary">TECH</span></span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Professional IT training institute specializing in Cyber Security, Cloud, Networking & Infrastructure certifications.
            </p>
            <div className="flex gap-3">
              {['📘', '📸', '💼', '▶️'].map((icon, i) => (
                <a key={i} href="#" className="w-9 h-9 glass-card rounded-lg flex items-center justify-center hover:border-primary/40 transition-all text-sm">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[['Home', '/'], ['Courses', '/courses'], ['Trainers', '/trainers'], ['Contact', '/contact'], ['Book Demo', '/contact']].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-gray-400 hover:text-primary text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Courses</h3>
            <ul className="space-y-2.5">
              {['Cyber Security', 'CCNA / CCNP', 'AWS Cloud', 'Google Cloud', 'VMware', 'Nutanix', 'Firewall', 'Data Center'].map(c => (
                <li key={c}><Link to="/courses" className="text-gray-400 hover:text-primary text-sm transition-colors">{c}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2"><span>📍</span><span>No. 42, IT Park Road, Tidel Park, Chennai - 600113</span></li>
              <li className="flex items-center gap-2"><span>📞</span><a href="tel:+919876543210" className="hover:text-primary">+91 98765 43210</a></li>
              <li className="flex items-center gap-2"><span>✉️</span><a href="mailto:info@cybertech.com" className="hover:text-primary">info@cybertech.com</a></li>
              <li className="flex items-center gap-2"><span>⏰</span><span>Mon–Sat: 9AM – 8PM</span></li>
            </ul>
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-xl text-sm hover:bg-green-500/30 transition-all">
              <span>💬</span> WhatsApp Us
            </a>
          </div>
        </div>

        <div className="border-t border-dark-border mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-sm">© 2025 CyberTech Institute. All rights reserved.</p>
          <div className="flex gap-4 text-gray-500 text-xs">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
            <a href="#" className="hover:text-gray-300">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── COURSE CARD ─────────────────────────────────────────── */
export function CourseCard({ course, onClick }) {
  const categoryColors = {
    cybersecurity: '#FF3366', networking: '#00D4FF', aws: '#FF9900',
    gcp: '#4285F4', vmware: '#607D8B', nutanix: '#024DA1',
    firewall: '#E91E63', datacenter: '#9C27B0', hardware: '#795548'
  }
  const categoryIcons = {
    cybersecurity: '🔐', networking: '🌐', aws: '☁️', gcp: '🔵',
    vmware: '💻', nutanix: '⚡', firewall: '🛡️', datacenter: '🏢', hardware: '🔧'
  }
  const color = categoryColors[course.category] || '#F5C518'
  const icon = categoryIcons[course.category] || '📚'
  const discount = course.discountPrice ? Math.round(((course.price - course.discountPrice) / course.price) * 100) : 0

  return (
    <motion.div whileHover={{ y: -4 }} className="course-card group" onClick={onClick}>
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}22, ${color}11)` }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-7xl opacity-30">{icon}</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
            style={{ background: `${color}22`, border: `2px solid ${color}44` }}>
            {icon}
          </div>
        </div>
        {course.isFeatured && (
          <div className="absolute top-3 left-3 bg-primary text-dark text-xs font-bold px-2.5 py-1 rounded-lg">⭐ FEATURED</div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">{discount}% OFF</div>
        )}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-gray-200 text-xs px-2 py-1 rounded-lg flex items-center gap-1">
          <Clock size={11} /> {course.duration}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="tag-pill capitalize">{course.category}</span>
          <span className="tag-pill">{course.level}</span>
        </div>
        <h3 className="text-white font-semibold text-sm leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-gray-500 text-xs mb-3 line-clamp-2">{course.shortDescription}</p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex text-primary text-xs">{'★'.repeat(Math.floor(course.rating))}</div>
          <span className="text-primary font-semibold text-xs">{course.rating}</span>
          <span className="text-gray-500 text-xs">({course.totalReviews?.toLocaleString()})</span>
          <span className="text-gray-600 text-xs ml-auto flex items-center gap-1"><Users size={11} />{course.enrolledCount?.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-dark-border">
          <div>
            <span className="text-white font-bold text-lg">₹{(course.discountPrice || course.price)?.toLocaleString()}</span>
            {course.discountPrice && (
              <span className="text-gray-500 line-through text-xs ml-2">₹{course.price?.toLocaleString()}</span>
            )}
          </div>
          {course.certificationIncluded && (
            <span className="flex items-center gap-1 text-xs text-green-400"><Award size={12} /> Cert</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── SECTION HEADER ─────────────────────────────────────── */
export function SectionHeader({ badge, title, subtitle, center = true }) {
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      {badge && <div className="cyber-badge mb-4 inline-flex">{badge}</div>}
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className={`section-subtitle ${center ? 'mx-auto' : ''}`}>{subtitle}</p>}
    </div>
  )
}

/* ─── LOADING SPINNER ─────────────────────────────────────── */
export function Spinner({ size = 'md' }) {
  const s = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`${s[size]} border-2 border-primary/30 border-t-primary rounded-full animate-spin`} />
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="text-gray-400 mt-4 text-sm">Loading...</p>
      </div>
    </div>
  )
}

/* ─── PROTECTED ROUTE ─────────────────────────────────────── */
export function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    if (adminOnly && !isAdmin) { navigate('/student'); return }
  }, [isLoggedIn, isAdmin])

  if (!isLoggedIn) return null
  if (adminOnly && !isAdmin) return null
  return children
}

/* ─── STAR RATING ─────────────────────────────────────────── */
export function StarRating({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} className={i <= Math.floor(rating) ? 'text-primary fill-primary' : 'text-gray-600'} />
      ))}
    </div>
  )
}

/* ─── BADGE ───────────────────────────────────────────────── */
export function Badge({ children, color = 'yellow' }) {
  const colors = {
    yellow: 'bg-primary/20 text-primary border-primary/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color]}`}>
      {children}
    </span>
  )
}
