import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, Shield, Award, CreditCard, AlertCircle, ArrowLeft, Calendar, Star } from 'lucide-react'
import { coursesAPI, enrollmentsAPI, getError } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/shared'
import toast from 'react-hot-toast'

const VALIDITY_OPTIONS = [
  { months: 3,  label: '3 Months',  badge: '',        savings: 0 },
  { months: 6,  label: '6 Months',  badge: 'Popular', savings: 0 },
  { months: 12, label: '1 Year',    badge: 'Best Value', savings: 10 },
]

const PAYMENT_METHODS = [
  { id: 'demo',          label: 'Demo Payment',     icon: '🎯', desc: 'For testing only' },
  { id: 'upi',           label: 'UPI',              icon: '📱', desc: 'Google Pay, PhonePe, etc.' },
  { id: 'razorpay',      label: 'Credit / Debit',   icon: '💳', desc: 'Visa, Mastercard, RuPay' },
  { id: 'bank_transfer', label: 'Bank Transfer',    icon: '🏦', desc: 'NEFT / IMPS / RTGS' },
]

export default function EnrollPage() {
  const { slug }   = useParams()
  const navigate   = useNavigate()
  const { isLoggedIn, user } = useAuth()

  const [course,      setCourse]      = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [step,        setStep]        = useState(1)   // 1=details, 2=payment, 3=success
  const [validity,    setValidity]    = useState(6)
  const [payMethod,   setPayMethod]   = useState('demo')
  const [batchTiming, setBatchTiming] = useState('')
  const [processing,  setProcessing]  = useState(false)
  const [result,      setResult]      = useState(null)  // success data
  const [existing,    setExisting]    = useState(null)  // pre-existing enrollment

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    const load = async () => {
      try {
        const r = await coursesAPI.getById(slug)
        setCourse(r.data.course)
        // Check if already enrolled
        const ec = await enrollmentsAPI.checkCourse(r.data.course._id)
        if (ec.data.enrolled) setExisting(ec.data.enrollment)
      } catch {
        toast.error('Course not found')
        navigate('/courses')
      } finally { setLoading(false) }
    }
    load()
  }, [slug, isLoggedIn])

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center pt-16">
      <div className="text-center"><Spinner size="lg"/><p className="text-gray-400 mt-4">Loading course details...</p></div>
    </div>
  )

  if (!course) return null

  const price        = course.discountPrice || course.price
  const validityData = VALIDITY_OPTIONS.find(v => v.months === validity) || VALIDITY_OPTIONS[1]
  const finalPrice   = Math.round(price * (1 - (validityData.savings / 100)))
  const expiryDate   = new Date(); expiryDate.setMonth(expiryDate.getMonth() + validity)

  // Already enrolled states
  if (existing) {
    return (
      <div className="min-h-screen bg-dark pt-20 flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">
            {{ approved: '✅', paid_pending_approval: '⏳', rejected: '❌', expired: '⌛', payment_pending: '🔄' }[existing.status] || '📋'}
          </div>
          <h2 className="text-white text-xl font-bold mb-2">
            {{ approved: 'Already Enrolled!', paid_pending_approval: 'Awaiting Approval', rejected: 'Enrollment Rejected', expired: 'Access Expired', payment_pending: 'Payment Pending' }[existing.status]}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {{ approved: 'You already have active access to this course.',
               paid_pending_approval: 'Your payment was received. Admin will approve within 24 hours.',
               rejected: 'Your enrollment was rejected. Please contact support.',
               expired: 'Your course access has expired. Please re-enroll.',
               payment_pending: 'Please complete your payment to proceed.' }[existing.status]}
          </p>
          <div className="flex gap-3 justify-center">
            {existing.status === 'approved' && <button onClick={() => navigate('/student')} className="btn-primary py-2.5 px-6 text-sm">Go to Dashboard</button>}
            {existing.status === 'paid_pending_approval' && <button onClick={() => navigate('/student')} className="btn-outline py-2.5 px-6 text-sm">View Status</button>}
            {['rejected','expired'].includes(existing.status) && <button onClick={() => setExisting(null)} className="btn-primary py-2.5 px-6 text-sm">Re-Enroll</button>}
          </div>
        </div>
      </div>
    )
  }

  // Success screen
  if (step === 3 && result) {
    return (
      <div className="min-h-screen bg-dark pt-20 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 max-w-lg w-full text-center border border-green-500/30">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-400"/>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Successful! 🎉</h1>
          <p className="text-gray-400 text-sm mb-6">Your enrollment is now <span className="text-primary font-semibold">under review</span>. We'll send your login credentials to your email once approved.</p>

          <div className="glass-card p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between text-sm"><span className="text-gray-400">Course</span><span className="text-white font-semibold">{course.title}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Amount Paid</span><span className="text-primary font-bold">₹{finalPrice.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Invoice</span><span className="text-white font-mono text-xs">{result.payment?.invoiceNumber}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Status</span><span className="text-yellow-400 font-semibold">Pending Approval</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Email sent to</span><span className="text-white">{user?.email}</span></div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-sm text-yellow-300 text-left">
            <p className="font-semibold mb-1">📌 What happens next?</p>
            <ol className="space-y-1 text-xs text-yellow-300/80 list-decimal list-inside">
              <li>Admin reviews your payment (within 24 hours)</li>
              <li>Upon approval, login credentials are emailed to you</li>
              <li>Use credentials to access your course on the student portal</li>
            </ol>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/student')} className="btn-primary py-2.5 px-6 text-sm">View Dashboard</button>
            <button onClick={() => navigate('/courses')} className="btn-ghost py-2.5 px-6 text-sm">Browse More Courses</button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={16}/> Back to Course
        </button>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {[['1','Course Details'],['2','Payment'],['3','Confirmation']].map(([num, label], i) => (
            <div key={num} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${step >= Number(num) ? 'text-primary' : 'text-gray-600'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > Number(num) ? 'bg-primary text-dark' : step === Number(num) ? 'bg-primary/20 text-primary border border-primary' : 'bg-dark-50 text-gray-600 border border-dark-border'}`}>
                  {step > Number(num) ? <CheckCircle size={14}/> : num}
                </div>
                <span className="text-sm font-medium hidden sm:block">{label}</span>
              </div>
              {i < 2 && <div className={`w-12 h-0.5 ${step > Number(num) ? 'bg-primary' : 'bg-dark-border'} transition-all`}/>}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">

            {/* ── STEP 1: Course Details + Validity ── */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="glass-card p-6 mb-6">
                  <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Calendar size={18} className="text-primary"/> Course Details</h2>
                  <div className="flex items-start gap-4 p-4 bg-dark-50 rounded-xl mb-5">
                    <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center text-2xl flex-shrink-0">
                      {{ cybersecurity:'🔐',networking:'🌐',aws:'☁️',gcp:'🔵',vmware:'💻',nutanix:'⚡',firewall:'🛡️' }[course.category] || '📚'}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{course.title}</h3>
                      <p className="text-gray-400 text-sm capitalize">{course.category} • {course.level} • {course.duration}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star size={12} className="text-primary fill-primary"/>
                        <span className="text-primary text-xs font-semibold">{course.rating || 4.8}</span>
                        <span className="text-gray-500 text-xs">({course.totalReviews || 0} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Validity Selection */}
                  <h3 className="text-white font-semibold mb-3 text-sm">Select Course Validity</h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {VALIDITY_OPTIONS.map(opt => (
                      <button key={opt.months} onClick={() => setValidity(opt.months)}
                        className={`relative p-4 rounded-xl border-2 transition-all text-center ${validity === opt.months ? 'border-primary bg-primary/10' : 'border-dark-border hover:border-primary/40 bg-dark-50'}`}>
                        {opt.badge && (
                          <span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${opt.badge === 'Best Value' ? 'bg-green-500 text-white' : 'bg-primary text-dark'}`}>{opt.badge}</span>
                        )}
                        <p className={`font-bold text-sm ${validity === opt.months ? 'text-primary' : 'text-white'}`}>{opt.label}</p>
                        {opt.savings > 0 && <p className="text-green-400 text-xs mt-0.5">{opt.savings}% off</p>}
                      </button>
                    ))}
                  </div>

                  {/* Batch Timing */}
                  {course.batchTimings?.length > 0 && (
                    <>
                      <h3 className="text-white font-semibold mb-3 text-sm">Select Batch Timing</h3>
                      <div className="space-y-2 mb-4">
                        <button onClick={() => setBatchTiming('')}
                          className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${batchTiming === '' ? 'border-primary bg-primary/10 text-primary' : 'border-dark-border text-gray-300 hover:border-primary/40'}`}>
                          I'll select later
                        </button>
                        {course.batchTimings.map((b, i) => (
                          <button key={i} onClick={() => setBatchTiming(`${b.day} | ${b.time} | ${b.mode}`)}
                            className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${batchTiming === `${b.day} | ${b.time} | ${b.mode}` ? 'border-primary bg-primary/10' : 'border-dark-border text-gray-300 hover:border-primary/40'}`}>
                            <span className="text-white font-medium">{b.day}</span>
                            <span className="text-gray-400 ml-2">{b.time}</span>
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${b.mode === 'Online' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-orange-500/20 text-orange-400'}`}>{b.mode}</span>
                            {b.availableSeats !== undefined && <span className="ml-2 text-xs text-gray-500">{b.availableSeats} seats left</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <button onClick={() => setStep(2)} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
                    Proceed to Payment →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Payment ── */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="glass-card p-6 mb-6">
                  <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><CreditCard size={18} className="text-primary"/> Select Payment Method</h2>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {PAYMENT_METHODS.map(pm => (
                      <button key={pm.id} onClick={() => setPayMethod(pm.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${payMethod === pm.id ? 'border-primary bg-primary/10' : 'border-dark-border hover:border-primary/40 bg-dark-50'}`}>
                        <div className="text-2xl mb-2">{pm.icon}</div>
                        <p className={`font-semibold text-sm ${payMethod === pm.id ? 'text-primary' : 'text-white'}`}>{pm.label}</p>
                        <p className="text-gray-500 text-xs">{pm.desc}</p>
                      </button>
                    ))}
                  </div>

                  {/* Payment method details */}
                  {payMethod === 'upi' && (
                    <div className="glass-card p-5 mb-5 text-center">
                      <p className="text-gray-400 text-sm mb-3">Scan QR or pay to UPI ID</p>
                      <div className="w-32 h-32 bg-white rounded-xl mx-auto mb-3 flex items-center justify-center text-5xl">📱</div>
                      <p className="text-primary font-mono font-bold">cybertech@ybl</p>
                      <p className="text-gray-500 text-xs mt-1">After payment, enter transaction ID below</p>
                      <input className="input-field text-sm mt-3" placeholder="Enter UPI Transaction ID (e.g. 316xxxx)"/>
                    </div>
                  )}
                  {payMethod === 'bank_transfer' && (
                    <div className="glass-card p-5 mb-5">
                      <h3 className="text-white font-semibold mb-3 text-sm">Bank Account Details</h3>
                      <div className="space-y-2 text-sm">
                        {[['Account Name','CyberTech Institute Pvt. Ltd.'],['Account No.','1234 5678 9012 3456'],['IFSC Code','HDFC0001234'],['Bank','HDFC Bank, Chennai']].map(([k,v]) => (
                          <div key={k} className="flex justify-between"><span className="text-gray-400">{k}</span><span className="text-white font-mono font-semibold">{v}</span></div>
                        ))}
                      </div>
                      <input className="input-field text-sm mt-4" placeholder="Enter UTR / Reference Number after transfer"/>
                    </div>
                  )}
                  {payMethod === 'demo' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-5 text-sm text-yellow-300">
                      <p className="font-semibold">🎯 Demo Mode</p>
                      <p className="text-xs mt-1 text-yellow-300/80">This simulates a payment. No real money is charged. Used for testing the enrollment flow.</p>
                    </div>
                  )}

                  {/* Security badges */}
                  <div className="flex items-center justify-center gap-6 text-xs text-gray-500 border-t border-dark-border pt-4 mb-5">
                    <span className="flex items-center gap-1"><Shield size={12} className="text-green-400"/> SSL Secured</span>
                    <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-400"/> Safe & Encrypted</span>
                    <span className="flex items-center gap-1"><Award size={12} className="text-primary"/> Instant Confirmation</span>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn-ghost py-3.5 px-6 text-sm">← Back</button>
                    <button onClick={handlePayment} disabled={processing} className="btn-primary flex-1 py-3.5 text-base flex items-center justify-center gap-2">
                      {processing ? <><Spinner size="sm"/> Processing Payment…</> : <>Pay ₹{finalPrice.toLocaleString()} & Enroll</>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-5 sticky top-24">
              <h3 className="text-white font-semibold mb-4 text-sm">Order Summary</h3>
              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Course</span><span className="text-white font-medium text-right max-w-[140px] truncate">{course.title}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Original Price</span><span className="text-gray-400 line-through">₹{course.price?.toLocaleString()}</span></div>
                {course.discountPrice && <div className="flex justify-between"><span className="text-gray-400">Discount</span><span className="text-green-400">-₹{(course.price - course.discountPrice).toLocaleString()}</span></div>}
                <div className="flex justify-between"><span className="text-gray-400">Validity</span><span className="text-white">{validity} months</span></div>
                {validityData.savings > 0 && <div className="flex justify-between"><span className="text-gray-400">Validity Bonus</span><span className="text-green-400">-{validityData.savings}%</span></div>}
                <div className="border-t border-dark-border pt-3 flex justify-between"><span className="text-white font-bold">Total Amount</span><span className="text-primary font-bold text-lg">₹{finalPrice.toLocaleString()}</span></div>
              </div>

              <div className="space-y-2 text-xs text-gray-500 pt-3 border-t border-dark-border">
                <p className="flex items-center gap-1.5"><Calendar size={11} className="text-primary flex-shrink-0"/>Access valid until: <strong className="text-primary">{expiryDate.toLocaleDateString('en-IN')}</strong></p>
                <p className="flex items-center gap-1.5"><CheckCircle size={11} className="text-green-400 flex-shrink-0"/>Course certificate included</p>
                <p className="flex items-center gap-1.5"><Shield size={11} className="text-green-400 flex-shrink-0"/>30-day money-back guarantee</p>
                <p className="flex items-center gap-1.5"><AlertCircle size={11} className="text-yellow-400 flex-shrink-0"/>Admin approval required (≤24 hrs)</p>
              </div>

              {/* What's included */}
              <div className="mt-4 pt-4 border-t border-dark-border">
                <p className="text-gray-500 text-xs font-semibold uppercase mb-2">What's Included</p>
                <ul className="space-y-1.5">
                  {['Recorded video sessions','Study materials (PDF)','Hands-on lab access','WhatsApp support','Completion certificate','Lifetime access to recordings'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs text-gray-400">
                      <CheckCircle size={11} className="text-green-400 flex-shrink-0"/>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  async function handlePayment() {
    setProcessing(true)
    try {
      const r = await enrollmentsAPI.payDirect({
        courseId: course._id,
        validityMonths: validity,
        batchTiming,
        paymentMethod: payMethod,
      })
      setResult(r.data)
      setStep(3)
      toast.success('🎉 Payment successful!')
    } catch (err) {
      toast.error(getError(err))
    } finally {
      setProcessing(false)
    }
  }
}
