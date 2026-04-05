import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, Users, Star, Award, ChevronDown, ChevronRight, Play, Calendar, Monitor, MapPin, Lock, AlertCircle } from 'lucide-react'
import { coursesAPI, enrollmentsAPI, getError } from '../utils/api'
import { SAMPLE_COURSES } from '../data/sampleData'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/shared'
import toast from 'react-hot-toast'

const STATUS_MESSAGES = {
  payment_pending:       { icon: '🔄', text: 'Payment Pending',   sub: 'Please complete payment to continue', color: 'text-gray-400',   bg: 'bg-gray-400/10',   border: 'border-gray-400/30' },
  paid_pending_approval: { icon: '⏳', text: 'Under Review',       sub: 'Admin will approve within 24 hours', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  approved:              { icon: '✅', text: 'Enrolled & Active',  sub: 'You have full access to this course',color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30' },
  rejected:              { icon: '❌', text: 'Enrollment Rejected',sub: 'Contact support or re-enroll',       color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30' },
  expired:               { icon: '⌛', text: 'Access Expired',     sub: 'Your course validity has ended',     color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
}

export default function CourseDetailPage() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const { isLoggedIn, user } = useAuth()

  const [course,       setCourse]       = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [enrollment,   setEnrollment]   = useState(null)
  const [openSyllabus, setOpenSyllabus] = useState(null)
  const [openModule,   setOpenModule]   = useState(0)
  const [selectedBatch,setSelectedBatch]= useState(0)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const r = await coursesAPI.getById(slug)
        setCourse(r.data.course)
        if (isLoggedIn) {
          try {
            const ec = await enrollmentsAPI.checkCourse(r.data.course._id)
            if (ec.data.enrolled) setEnrollment(ec.data.enrollment)
          } catch {}
        }
      } catch {
        const found = SAMPLE_COURSES.find(c => c.slug === slug || c._id === slug)
        if (found) setCourse(found)
        else { toast.error('Course not found'); navigate('/courses') }
      } finally { setLoading(false) }
    }
    load()
  }, [slug, isLoggedIn])

  if (loading) return <div className="min-h-screen bg-dark pt-16 flex items-center justify-center"><Spinner size="lg"/></div>
  if (!course)  return null

  const discount = course.discountPrice ? Math.round(((course.price - course.discountPrice) / course.price) * 100) : 0
  const catIcons = { cybersecurity:'🔐', networking:'🌐', aws:'☁️', gcp:'🔵', vmware:'💻', nutanix:'⚡', firewall:'🛡️', datacenter:'🏢', hardware:'🔧' }

  const handleCTA = () => {
    if (!isLoggedIn) { navigate('/login'); return }
    if (enrollment?.status === 'approved') { navigate('/student'); return }
    if (enrollment?.status === 'paid_pending_approval') {
      toast('⏳ Your enrollment is under review. Please wait for admin approval.')
      return
    }
    // Go to dedicated enrollment/payment page
    navigate(`/enroll/${course.slug || course._id}`)
  }

  const ctaLabel = () => {
    if (!isLoggedIn) return '🔐 Login to Enroll'
    if (!enrollment) return '🎓 Enroll Now'
    if (enrollment.status === 'approved') return '▶️ Go to Course'
    if (enrollment.status === 'paid_pending_approval') return '⏳ Awaiting Approval'
    if (enrollment.status === 'rejected') return '🔄 Re-Enroll'
    if (enrollment.status === 'expired') return '🔄 Renew Access'
    return '🎓 Enroll Now'
  }

  const enrollmentStatus = enrollment ? STATUS_MESSAGES[enrollment.status] : null

  return (
    <div className="min-h-screen bg-dark pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-r from-dark-50 to-dark border-b border-dark-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="cyber-badge capitalize">{course.category}</span>
                <span className="cyber-badge">{course.level}</span>
                {course.certificationIncluded && <span className="cyber-badge text-green-400 border-green-400/30 bg-green-400/10">✅ Cert Included</span>}
              </div>
              <h1 className="text-3xl md:text-4xl font-display text-white tracking-wide mb-4">{course.title}</h1>
              <p className="text-gray-300 text-base mb-5 leading-relaxed">{course.shortDescription || course.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <span className="text-primary font-bold text-lg">{course.rating || 4.8} ★★★★★</span>
                <span className="text-gray-400">({(course.totalReviews || 0).toLocaleString()} reviews)</span>
                <span className="text-gray-400 flex items-center gap-1"><Users size={14}/> {(course.enrolledCount || 0).toLocaleString()} students</span>
                <span className="text-gray-400 flex items-center gap-1"><Clock size={14}/> {course.duration}</span>
              </div>
              <p className="text-gray-400 text-sm">Taught by <span className="text-primary font-semibold">{course.trainerName || course.trainer?.name || 'Expert Trainer'}</span></p>
              <div className="flex flex-wrap gap-2 mt-4">{course.tags?.map(t => <span key={t} className="tag-pill text-xs">{t}</span>)}</div>
            </div>
            <div className="hidden lg:block">
              <PricingCard course={course} onCTA={handleCTA} ctaLabel={ctaLabel()} discount={discount} catIcons={catIcons} enrollment={enrollment} enrollmentStatus={enrollmentStatus}/>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">

            {/* Enrollment Status Banner */}
            {enrollmentStatus && (
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${enrollmentStatus.border} ${enrollmentStatus.bg}`}>
                <span className="text-2xl">{enrollmentStatus.icon}</span>
                <div>
                  <p className={`font-bold text-sm ${enrollmentStatus.color}`}>{enrollmentStatus.text}</p>
                  <p className="text-gray-400 text-xs">{enrollmentStatus.sub}</p>
                  {enrollment.expiresAt && enrollment.status === 'approved' && (
                    <p className="text-gray-500 text-xs mt-0.5">Valid until: {new Date(enrollment.expiresAt).toLocaleDateString('en-IN')}</p>
                  )}
                </div>
                {enrollment.status === 'approved' && (
                  <button onClick={() => navigate('/student')} className="ml-auto btn-primary py-2 px-4 text-xs">Go to Dashboard</button>
                )}
              </div>
            )}

            {/* What You'll Learn */}
            {course.whatYouLearn?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><CheckCircle size={18} className="text-primary"/> What You'll Learn</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.whatYouLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <CheckCircle size={14} className="text-primary flex-shrink-0 mt-0.5"/><span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Syllabus */}
            {course.syllabus?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">📋 Course Syllabus</h2>
                <div className="space-y-2">
                  {course.syllabus.map((item, i) => (
                    <div key={i} className="border border-dark-border rounded-xl overflow-hidden">
                      <button onClick={() => setOpenSyllabus(openSyllabus === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-all">
                        <span className="text-white font-medium text-sm text-left">{item.topic}</span>
                        <ChevronDown size={15} className={`text-gray-400 flex-shrink-0 transition-transform ${openSyllabus === i ? 'rotate-180' : ''}`}/>
                      </button>
                      {openSyllabus === i && (
                        <div className="px-4 pb-4 pt-3 border-t border-dark-border bg-dark/50">
                          {item.subtopics?.map((sub, j) => (
                            <div key={j} className="flex items-center gap-2 text-sm text-gray-400 py-1"><ChevronRight size={12} className="text-primary flex-shrink-0"/>{sub}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Batch Schedule */}
            {course.batchTimings?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">📅 Batch Schedule</h2>
                <div className="space-y-3">
                  {course.batchTimings.map((batch, i) => (
                    <div key={i} onClick={() => setSelectedBatch(i)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedBatch === i ? 'border-primary bg-primary/10' : 'border-dark-border hover:border-primary/40'}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Calendar size={15} className="text-primary flex-shrink-0"/>
                          <div><p className="text-white font-medium text-sm">{batch.day}</p><p className="text-gray-400 text-xs">{batch.time}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`tag-pill text-xs ${batch.mode === 'Online' ? 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10' : 'text-orange-400 border-orange-400/30 bg-orange-400/10'}`}>
                            {batch.mode === 'Online' ? <Monitor size={10} className="inline mr-1"/> : <MapPin size={10} className="inline mr-1"/>}{batch.mode}
                          </span>
                          {batch.availableSeats !== undefined && <span className={`text-xs ${batch.availableSeats < 5 ? 'text-red-400' : 'text-green-400'}`}>{batch.availableSeats} seats left</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {course.requirements?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">⚙️ Requirements</h2>
                <ul className="space-y-2">{course.requirements.map((req, i) => (<li key={i} className="flex items-start gap-2.5 text-sm text-gray-300"><span className="text-primary mt-0.5 flex-shrink-0">•</span>{req}</li>))}</ul>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <div className="glass-card p-5">
                <h3 className="text-white font-semibold mb-3 text-sm">👨‍🏫 Your Trainer</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-lg font-bold">{(course.trainerName || course.trainer?.name || 'T').charAt(0)}</div>
                  <div><p className="text-white font-semibold text-sm">{course.trainerName || course.trainer?.name || 'Expert Trainer'}</p><p className="text-gray-400 text-xs">{course.trainer?.designation || 'Industry Expert'}</p></div>
                </div>
              </div>
              <div className="glass-card p-5">
                <h3 className="text-white font-semibold mb-3 text-sm">📦 Includes</h3>
                <ul className="space-y-2">{[['🎬','Recorded sessions'],['📄','Study materials'],['🔬','Lab access'],['📜','Certificate'],['💬','WhatsApp support'],['♾️','Lifetime access']].map(([icon,label]) => (<li key={label} className="flex items-center gap-2 text-xs text-gray-400"><span>{icon}</span>{label}</li>))}</ul>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden mt-8">
          <PricingCard course={course} onCTA={handleCTA} ctaLabel={ctaLabel()} discount={discount} catIcons={catIcons} enrollment={enrollment} enrollmentStatus={enrollmentStatus}/>
        </div>
      </div>
    </div>
  )
}

function PricingCard({ course, onCTA, ctaLabel, discount, catIcons, enrollment, enrollmentStatus }) {
  const isDisabled = enrollment?.status === 'paid_pending_approval'
  return (
    <div className="glass-card overflow-hidden">
      <div className="h-40 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(245,197,24,0.15), rgba(245,197,24,0.05))' }}>
        <span className="text-7xl opacity-60">{catIcons[course.category] || '📚'}</span>
      </div>
      <div className="p-5">
        <div className="flex items-end gap-3 mb-1">
          <span className="text-3xl font-bold text-white">₹{(course.discountPrice || course.price)?.toLocaleString()}</span>
          {course.discountPrice && <span className="text-gray-500 line-through text-lg">₹{course.price?.toLocaleString()}</span>}
        </div>
        {discount > 0 && <p className="text-red-400 text-sm font-semibold mb-3">{discount}% off — Limited time!</p>}

        {enrollmentStatus && (
          <div className={`flex items-center gap-2 p-3 rounded-xl border mb-4 ${enrollmentStatus.border} ${enrollmentStatus.bg}`}>
            <span>{enrollmentStatus.icon}</span>
            <p className={`text-xs font-semibold ${enrollmentStatus.color}`}>{enrollmentStatus.text}</p>
          </div>
        )}

        <button onClick={onCTA} disabled={isDisabled}
          className={`w-full py-4 rounded-xl font-bold text-base transition-all mb-3 ${isDisabled ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 cursor-not-allowed' : 'btn-primary'}`}>
          {ctaLabel}
        </button>

        {!enrollment && <p className="text-center text-gray-500 text-xs mb-4 flex items-center justify-center gap-1"><AlertCircle size={11}/> Admin approval required after payment</p>}

        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center gap-2"><Clock size={13}/><span>Duration: <span className="text-white">{course.duration}</span></span></div>
          <div className="flex items-center gap-2"><Star size={13} className="text-primary"/><span>Rating: <span className="text-white">{course.rating || 4.8}/5</span></span></div>
          <div className="flex items-center gap-2"><Users size={13}/><span><span className="text-white">{(course.enrolledCount || 0).toLocaleString()}+</span> students</span></div>
          <div className="flex items-center gap-2"><Award size={13} className="text-green-400"/><span><span className="text-green-400">Certificate</span> included</span></div>
          {enrollment?.expiresAt && enrollment.status === 'approved' && (
            <div className="flex items-center gap-2"><Calendar size={13} className="text-primary"/><span>Valid until: <span className="text-primary">{new Date(enrollment.expiresAt).toLocaleDateString('en-IN')}</span></span></div>
          )}
        </div>
      </div>
    </div>
  )
}
