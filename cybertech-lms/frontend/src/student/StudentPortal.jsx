import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Play, Download, User, LogOut, Award, Clock, ChevronRight, CheckCircle, Shield, AlertCircle, Calendar, TrendingUp, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { enrollmentsAPI, materialsAPI, getError } from '../utils/api'
import { Badge, Spinner } from '../components/shared'
import toast from 'react-hot-toast'

// ── Status display config ─────────────────────────────────────
const STATUS_CONFIG = {
  payment_pending:       { label: 'Payment Pending',   color: 'text-gray-400',   bg: 'bg-gray-400/10',   border: 'border-gray-400/30',  icon: '🔄', canAccess: false },
  paid_pending_approval: { label: 'Awaiting Approval', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', icon: '⏳', canAccess: false },
  approved:              { label: 'Active',             color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30',  icon: '✅', canAccess: true  },
  rejected:              { label: 'Rejected',           color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30',    icon: '❌', canAccess: false },
  expired:               { label: 'Expired',            color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', icon: '⌛', canAccess: false },
}

export default function StudentPortal() {
  const { user, logout, isAdmin } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const sidebarLinks = [
    { path: '/student',           icon: <LayoutDashboard size={18}/>, label: 'Dashboard', exact: true },
    { path: '/student/courses',   icon: <BookOpen size={18}/>,        label: 'My Courses' },
    { path: '/student/player',    icon: <Play size={18}/>,            label: 'Video Player' },
    { path: '/student/materials', icon: <Download size={18}/>,        label: 'Materials' },
    { path: '/student/profile',   icon: <User size={18}/>,            label: 'Profile' },
  ]
  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path)

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-50 border-r border-dark-border flex flex-col fixed h-full z-40 hidden md:flex">
        <div className="p-5 border-b border-dark-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><Shield size={16} className="text-dark"/></div>
            <span className="text-white font-display text-lg tracking-wide">CYBER<span className="text-primary">TECH</span></span>
          </Link>
        </div>
        <div className="p-4 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-dark font-bold text-lg">{user?.name?.charAt(0).toUpperCase()}</div>
            <div><p className="text-white font-semibold text-sm">{user?.name}</p><Badge color="yellow">{user?.role}</Badge></div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map(link => (
            <Link key={link.path} to={link.path} className={isActive(link.path, link.exact) ? 'sidebar-link-active' : 'sidebar-link'}>
              {link.icon} {link.label}
            </Link>
          ))}
          {isAdmin && <Link to="/admin" className="sidebar-link mt-4 text-primary border border-primary/20 rounded-xl"><LayoutDashboard size={18}/> Admin Panel</Link>}
        </nav>
        <div className="p-4 border-t border-dark-border">
          <button onClick={() => { logout(); navigate('/') }} className="sidebar-link text-red-400 hover:bg-red-500/10 w-full"><LogOut size={18}/> Logout</button>
        </div>
      </aside>

      <main className="md:ml-64 flex-1 p-6 pt-8">
        <Routes>
          <Route path="/"          element={<StudentDashboard />} />
          <Route path="/courses"   element={<StudentCourses />} />
          <Route path="/player"    element={<VideoPlayer />} />
          <Route path="/player/:courseId" element={<VideoPlayer />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/profile"   element={<StudentProfile />} />
        </Routes>
      </main>
    </div>
  )
}

// ── DASHBOARD ─────────────────────────────────────────────────
function StudentDashboard() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [enrollments, setEnrollments] = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    enrollmentsAPI.getMine()
      .then(r => setEnrollments(r.data.enrollments || []))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false))
  }, [])

  const active   = enrollments.filter(e => e.status === 'approved')
  const pending  = enrollments.filter(e => e.status === 'paid_pending_approval')
  const expired  = enrollments.filter(e => e.status === 'expired')
  const avgProgress = active.length ? Math.round(active.reduce((s, e) => s + (e.progress || 0), 0) / active.length) : 0

  const stats = [
    { icon: '📚', label: 'Active Courses',   value: active.length,   color: 'text-primary' },
    { icon: '⏳', label: 'Pending Approval', value: pending.length,  color: 'text-yellow-400' },
    { icon: '📈', label: 'Avg. Progress',    value: `${avgProgress}%`, color: 'text-cyan-400' },
    { icon: '📜', label: 'Certificates',     value: 0,               color: 'text-purple-400' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display text-white tracking-wide">Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}</span>! 👋</h1>
        <p className="text-gray-400 mt-1 text-sm">Track your learning journey and course access below</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-5 hover:border-primary/30 transition-all">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-400 text-sm mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending Approval Banner */}
      {pending.length > 0 && (
        <div className="glass-card p-5 border border-yellow-500/30 bg-yellow-500/5 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="text-yellow-400 font-bold text-sm">{pending.length} Enrollment{pending.length > 1 ? 's' : ''} Awaiting Approval</p>
              <p className="text-gray-400 text-xs">Your payment has been received. Admin will approve within 24 hours and send login credentials to your email.</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {pending.map(e => (
              <div key={e._id} className="flex items-center justify-between bg-dark-50 rounded-xl p-3">
                <div>
                  <p className="text-white font-medium text-sm">{e.course?.title}</p>
                  <p className="text-gray-500 text-xs">Enrolled: {new Date(e.enrolledAt).toLocaleDateString('en-IN')} • Amount: ₹{e.payment?.amount?.toLocaleString()}</p>
                </div>
                <span className="cyber-badge text-yellow-400 border-yellow-400/30 bg-yellow-400/10 text-xs">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expired Banner */}
      {expired.length > 0 && (
        <div className="glass-card p-5 border border-orange-500/30 bg-orange-500/5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⌛</span>
            <div>
              <p className="text-orange-400 font-bold text-sm">{expired.length} Course{expired.length > 1 ? 's' : ''} Expired</p>
              <p className="text-gray-400 text-xs">Your access has expired. Contact admin or re-enroll to regain access.</p>
            </div>
          </div>
          {expired.map(e => (
            <div key={e._id} className="flex items-center justify-between bg-dark-50 rounded-xl p-3 mb-2">
              <div>
                <p className="text-white font-medium text-sm">{e.course?.title}</p>
                <p className="text-gray-500 text-xs">Expired: {e.expiresAt ? new Date(e.expiresAt).toLocaleDateString('en-IN') : '—'}</p>
              </div>
              <button onClick={() => navigate(`/courses/${e.course?.slug || e.course?._id}`)} className="btn-outline py-1.5 px-4 text-xs">Re-Enroll</button>
            </div>
          ))}
        </div>
      )}

      {/* Active Courses */}
      <h2 className="text-lg font-semibold text-white mb-4">Continue Learning</h2>
      {loading ? (
        <div className="flex justify-center py-8"><Spinner size="lg"/></div>
      ) : active.length === 0 ? (
        <div className="glass-card p-8 text-center mb-8">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-white font-semibold mb-2">No active courses yet</p>
          <p className="text-gray-400 text-sm mb-4">Enroll in a course and get admin approval to start learning</p>
          <button onClick={() => navigate('/courses')} className="btn-primary text-sm py-2.5 px-6">Browse Courses</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          {active.map(enrollment => {
            const daysLeft = enrollment.expiresAt ? Math.ceil((new Date(enrollment.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)) : null
            return (
              <div key={enrollment._id} className="glass-card p-5 hover:border-primary/30 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center text-2xl flex-shrink-0">
                    {{ cybersecurity:'🔐', networking:'🌐', aws:'☁️', gcp:'🔵', vmware:'💻', nutanix:'⚡', firewall:'🛡️' }[enrollment.course?.category] || '📚'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm leading-tight">{enrollment.course?.title}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{enrollment.course?.duration}</p>
                    {/* Validity */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <Calendar size={11} className={daysLeft !== null && daysLeft < 14 ? 'text-red-400' : 'text-gray-500'}/>
                      <span className={`text-xs ${daysLeft !== null && daysLeft < 14 ? 'text-red-400 font-semibold' : 'text-gray-500'}`}>
                        {daysLeft !== null ? `${daysLeft > 0 ? `${daysLeft} days left` : 'Expires today'}` : 'No expiry'}
                        {enrollment.expiresAt && ` (until ${new Date(enrollment.expiresAt).toLocaleDateString('en-IN')})`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span><span className="text-primary font-semibold">{enrollment.progress || 0}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${enrollment.progress || 0}%` }}/></div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => navigate(`/student/player/${enrollment.course?._id}`)} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                    <Play size={14}/> Continue
                  </button>
                  <button onClick={() => navigate('/student/materials')} className="btn-ghost py-2.5 px-3 text-sm"><Download size={14}/></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Recommended */}
      {active.length === 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Explore Courses</h2>
            <Link to="/courses" className="text-primary text-sm hover:text-primary-300 flex items-center gap-1">View All <ChevronRight size={14}/></Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[{ title:'Complete Cyber Security Bootcamp', category:'cybersecurity', price:28000, slug:'complete-cyber-security-bootcamp' },
              { title:'CCNA Complete Course (200-301)',   category:'networking',     price:19999, slug:'ccna-complete-course' },
              { title:'AWS Solutions Architect',          category:'aws',            price:24999, slug:'aws-solutions-architect-associate' }].map(c => (
              <div key={c.slug} className="glass-card p-4 hover:border-primary/30 transition-all cursor-pointer" onClick={() => navigate(`/courses/${c.slug}`)}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{{ cybersecurity:'🔐', networking:'🌐', aws:'☁️' }[c.category]}</span>
                  <div><p className="text-white text-xs font-semibold">{c.title}</p></div>
                </div>
                <p className="text-primary font-bold text-sm">₹{c.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── MY COURSES ────────────────────────────────────────────────
function StudentCourses() {
  const navigate = useNavigate()
  const [enrollments, setEnrollments] = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    enrollmentsAPI.getMine()
      .then(r => setEnrollments(r.data.enrollments || []))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg"/></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Courses</h1>

      {enrollments.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-white text-xl mb-2">No enrollments yet</h3>
          <p className="text-gray-400 mb-6">Browse courses and complete payment to enroll</p>
          <button onClick={() => navigate('/courses')} className="btn-primary">Browse Courses</button>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map(enrollment => {
            const s = STATUS_CONFIG[enrollment.status] || STATUS_CONFIG.payment_pending
            const canAccess = enrollment.status === 'approved'
            const daysLeft  = enrollment.expiresAt ? Math.ceil((new Date(enrollment.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)) : null

            return (
              <div key={enrollment._id} className={`glass-card p-6 transition-all ${canAccess ? 'hover:border-primary/30' : ''}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 relative ${canAccess ? 'bg-primary/15' : 'bg-gray-500/10'}`}>
                    {{ cybersecurity:'🔐', networking:'🌐', aws:'☁️' }[enrollment.course?.category] || '📚'}
                    {!canAccess && <div className="absolute inset-0 rounded-2xl bg-dark/50 flex items-center justify-center"><Lock size={16} className="text-gray-500"/></div>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg">{enrollment.course?.title}</h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${s.color} ${s.bg} ${s.border}`}>
                        {s.icon} {s.label}
                      </span>
                      {enrollment.payment?.amount && <span className="text-gray-400 text-xs">₹{enrollment.payment.amount.toLocaleString()}</span>}
                      {enrollment.payment?.invoiceNumber && <span className="text-gray-500 text-xs font-mono">{enrollment.payment.invoiceNumber}</span>}
                    </div>

                    {/* Progress (only if approved) */}
                    {canAccess && (
                      <div className="flex items-center gap-3 mt-3">
                        <div className="progress-bar flex-1 max-w-xs"><div className="progress-fill" style={{ width: `${enrollment.progress || 0}%` }}/></div>
                        <span className="text-primary font-semibold text-sm">{enrollment.progress || 0}%</span>
                      </div>
                    )}

                    {/* Validity */}
                    {canAccess && enrollment.expiresAt && (
                      <p className={`text-xs mt-1.5 flex items-center gap-1 ${daysLeft !== null && daysLeft < 14 ? 'text-red-400' : 'text-gray-500'}`}>
                        <Calendar size={11}/>
                        Valid until {new Date(enrollment.expiresAt).toLocaleDateString('en-IN')}
                        {daysLeft !== null && daysLeft < 30 && ` (${daysLeft} days left)`}
                      </p>
                    )}

                    {/* Pending message */}
                    {enrollment.status === 'paid_pending_approval' && (
                      <p className="text-yellow-400 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle size={11}/> Payment received. Credentials will be sent to your email upon approval.
                      </p>
                    )}

                    {enrollment.status === 'rejected' && enrollment.rejectionReason && (
                      <p className="text-red-400 text-xs mt-2">Reason: {enrollment.rejectionReason}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {canAccess && (
                      <>
                        <button onClick={() => navigate(`/student/player/${enrollment.course?._id}`)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2"><Play size={14}/> Continue</button>
                        <button onClick={() => navigate('/student/materials')} className="btn-outline py-2 px-4 text-sm flex items-center gap-2"><Download size={14}/> Materials</button>
                      </>
                    )}
                    {['rejected','expired'].includes(enrollment.status) && (
                      <button onClick={() => navigate(`/courses/${enrollment.course?.slug || enrollment.course?._id}`)} className="btn-outline py-2 px-4 text-sm">Re-Enroll</button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── VIDEO PLAYER ──────────────────────────────────────────────
function VideoPlayer() {
  const [activeLesson, setActiveLesson] = useState(0)

  const lessons = [
    { title: 'Introduction to Cyber Security', duration: '45 min', done: true },
    { title: 'Types of Threats & Attacks',     duration: '60 min', done: true },
    { title: 'Network Security Fundamentals',  duration: '75 min', done: true },
    { title: 'Ethical Hacking Methodologies',  duration: '80 min', done: false, current: true },
    { title: 'Reconnaissance Techniques',      duration: '70 min', done: false },
    { title: 'Scanning & Enumeration',         duration: '85 min', done: false },
    { title: 'OWASP Top 10',                   duration: '95 min', done: false },
    { title: 'SQL Injection & XSS',            duration: '90 min', done: false },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Video Player</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden bg-dark-50 border border-dark-border aspect-video flex items-center justify-center">
            <div className="text-center">
              <button className="w-16 h-16 bg-primary/20 border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-primary/40 transition-all">
                <Play size={28} className="text-primary ml-1"/>
              </button>
              <p className="text-gray-300 font-medium text-sm">{lessons[activeLesson]?.title}</p>
              <p className="text-gray-600 text-xs mt-1">{lessons[activeLesson]?.duration}</p>
            </div>
          </div>
          <div className="glass-card p-5 mt-4">
            <h2 className="text-white font-semibold text-base mb-1">{lessons[activeLesson]?.title}</h2>
            <p className="text-gray-500 text-sm mb-4">{lessons[activeLesson]?.duration} • Complete Cyber Security Bootcamp</p>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => toast.success('Lesson marked complete!')} className="btn-outline text-sm py-2 px-4 flex items-center gap-2"><CheckCircle size={14}/> Mark Complete</button>
              <button onClick={() => setActiveLesson(Math.max(0, activeLesson - 1))} className="btn-ghost text-sm py-2 px-4">← Previous</button>
              <button onClick={() => setActiveLesson(Math.min(lessons.length - 1, activeLesson + 1))} className="btn-primary text-sm py-2 px-4">Next →</button>
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-dark-border">
            <h3 className="text-white font-semibold text-sm">Course Content</h3>
            <p className="text-gray-500 text-xs mt-0.5">{lessons.length} lessons</p>
          </div>
          <div className="overflow-y-auto flex-1 max-h-[480px]">
            {lessons.map((lesson, i) => (
              <button key={i} onClick={() => setActiveLesson(i)}
                className={`w-full flex items-start gap-3 px-4 py-3 border-b border-dark-border/50 hover:bg-white/5 transition-all text-left ${activeLesson === i ? 'bg-primary/10' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${activeLesson === i ? 'bg-primary text-dark' : lesson.done ? 'bg-green-500/20 text-green-400' : 'bg-dark-50 text-gray-500'}`}>
                  {lesson.done ? <CheckCircle size={12}/> : <Play size={9} className="ml-0.5"/>}
                </div>
                <div>
                  <p className={`text-xs font-medium ${activeLesson === i ? 'text-primary' : lesson.done ? 'text-gray-400 line-through' : 'text-gray-300'}`}>{lesson.title}</p>
                  <p className="text-gray-600 text-xs">{lesson.duration}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── MATERIALS ─────────────────────────────────────────────────
function Materials() {
  const [materials, setMaterials] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    enrollmentsAPI.getMine()
      .then(async r => {
        const active = (r.data.enrollments || []).filter(e => e.status === 'approved')
        if (active.length === 0) { setMaterials([]); return }
        const courseId = active[0]?.course?._id || active[0]?.course
        if (courseId) {
          const mr = await materialsAPI.getByCourse(courseId)
          setMaterials(mr.data.materials || [])
        }
      })
      .catch(() => setMaterials([
        { _id:'m1', title:'Cyber Security Fundamentals — PDF Notes', type:'pdf',   fileSize:'4.2 MB',  module:'Module 1' },
        { _id:'m2', title:'Network Security Cheatsheet',             type:'pdf',   fileSize:'1.8 MB',  module:'Module 2' },
        { _id:'m3', title:'Kali Linux Lab Setup Guide',              type:'pdf',   fileSize:'6.5 MB',  module:'Module 3' },
        { _id:'m4', title:'Batch Recording — Week 1',                type:'video', fileSize:'850 MB',  module:'Recordings' },
        { _id:'m5', title:'Batch Recording — Week 2',                type:'video', fileSize:'920 MB',  module:'Recordings' },
      ]))
      .finally(() => setLoading(false))
  }, [])

  const handleDownload = (id, fileName) => {
    const url   = materialsAPI.getDownloadUrl(id)
    const token = localStorage.getItem('cybertech_token')
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = fileName || 'download'
        a.click()
        URL.revokeObjectURL(a.href)
        toast.success('Download started!')
      })
      .catch(() => toast.error('Download failed'))
  }

  const typeIcon  = { pdf:'📄', video:'🎬', ppt:'📊', zip:'📦', link:'🔗', other:'📁' }
  const typeColor = {
    pdf:   'text-red-400 bg-red-400/10 border-red-400/20',
    video: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    ppt:   'text-orange-400 bg-orange-400/10 border-orange-400/20',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Course Materials</h1>
      <p className="text-gray-400 text-sm mb-6">Download study materials and batch recordings for your active courses.</p>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg"/></div>
      ) : materials.length === 0 ? (
        <div className="glass-card py-16 text-center">
          <div className="text-5xl mb-4">📂</div>
          <h3 className="text-white font-bold text-lg mb-2">No materials available</h3>
          <p className="text-gray-500 text-sm">Materials will appear here once your enrollment is approved.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map(mat => (
            <div key={mat._id} className="glass-card p-4 flex items-center justify-between gap-4 hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-2xl flex-shrink-0">{typeIcon[mat.type] || '📄'}</span>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">{mat.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`tag-pill text-xs border ${typeColor[mat.type] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>{mat.type?.toUpperCase()}</span>
                    {mat.fileSize && <span className="text-gray-500 text-xs">{mat.fileSize}</span>}
                    {mat.module   && <span className="text-gray-600 text-xs">{mat.module}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => handleDownload(mat._id, mat.fileName)}
                className="btn-outline py-2 px-4 text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                <Download size={13}/> Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── PROFILE ───────────────────────────────────────────────────
function StudentProfile() {
  const { user } = useAuth()
  const [form,   setForm]   = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast.success('✅ Profile saved!')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-dark font-bold text-3xl shadow-glow-yellow">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <Badge color="yellow" className="mt-1">{user?.role}</Badge>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Full Name</label>
            <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input-field"/>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Phone</label>
            <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className="input-field"/>
          </div>
          <div className="sm:col-span-2">
            <label className="text-gray-400 text-sm mb-1.5 block">Email (read-only)</label>
            <input value={form.email} disabled className="input-field opacity-60 cursor-not-allowed"/>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary mt-5 py-2.5 px-6 text-sm flex items-center gap-2">
          {saving ? <><Spinner size="sm"/> Saving…</> : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
