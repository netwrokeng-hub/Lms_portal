import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Search, RefreshCw, Eye, Send, Calendar, AlertTriangle, X, ChevronDown, Filter } from 'lucide-react'
import { enrollmentsAPI, getError } from '../utils/api'
import { Spinner, Badge } from '../components/shared'
import toast from 'react-hot-toast'

// ── Status config ─────────────────────────────────────────────
const STATUS_CONFIG = {
  payment_pending:       { label: 'Payment Pending',   color: 'text-gray-400',   bg: 'bg-gray-400/10',   border: 'border-gray-400/30',  icon: '🔄' },
  paid_pending_approval: { label: 'Awaiting Approval', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', icon: '⏳' },
  approved:              { label: 'Approved',           color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30',  icon: '✅' },
  rejected:              { label: 'Rejected',           color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30',    icon: '❌' },
  expired:               { label: 'Expired',            color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', icon: '⌛' },
  cancelled:             { label: 'Cancelled',          color: 'text-gray-500',   bg: 'bg-gray-500/10',   border: 'border-gray-500/30',   icon: '🚫' },
}

// ── Confirm dialog ────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, confirmClass, onConfirm, onCancel, children }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-card border border-dark-border p-6 max-w-md w-full">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={22} className="text-yellow-400 flex-shrink-0 mt-0.5"/>
          <div>
            <h3 className="text-white font-bold">{title}</h3>
            <p className="text-gray-400 text-sm mt-1">{message}</p>
          </div>
        </div>
        {children}
        <div className="flex gap-3 mt-4 justify-end">
          <button onClick={onCancel} className="btn-ghost text-sm py-2 px-4">Cancel</button>
          <button onClick={onConfirm} className={`${confirmClass} text-sm py-2 px-5 rounded-xl font-bold transition-all`}>{confirmLabel}</button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Detail Drawer ─────────────────────────────────────────────
function EnrollmentDetail({ enrollment, onClose, onApprove, onReject, onExtend, onResend }) {
  const s  = STATUS_CONFIG[enrollment.status] || STATUS_CONFIG.payment_pending
  const e  = enrollment
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const daysLeft = e.expiresAt ? Math.ceil((new Date(e.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)) : null

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-end bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
        className="w-full max-w-md h-full bg-dark-50 border-l border-dark-border overflow-y-auto">
        <div className="p-5 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-50 z-10">
          <h2 className="text-white font-bold">Enrollment Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"><X size={20}/></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status */}
          <div className={`flex items-center gap-2 p-3 rounded-xl border ${s.border} ${s.bg}`}>
            <span className="text-xl">{s.icon}</span>
            <div><p className={`font-bold text-sm ${s.color}`}>{s.label}</p>
              {e.status === 'approved' && daysLeft !== null && (
                <p className={`text-xs ${daysLeft < 7 ? 'text-red-400' : 'text-gray-500'}`}>
                  {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}
                </p>
              )}
            </div>
          </div>

          {/* Student */}
          <div className="glass-card p-4">
            <p className="text-gray-500 text-xs uppercase font-semibold mb-3">Student</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary font-bold flex items-center justify-center">{e.user?.name?.charAt(0)}</div>
              <div><p className="text-white font-semibold text-sm">{e.user?.name}</p><p className="text-gray-400 text-xs">{e.user?.email}</p></div>
            </div>
            {e.user?.phone && <p className="text-gray-400 text-sm">📞 {e.user.phone}</p>}
          </div>

          {/* Course */}
          <div className="glass-card p-4">
            <p className="text-gray-500 text-xs uppercase font-semibold mb-3">Course</p>
            <p className="text-white font-semibold text-sm mb-1">{e.course?.title}</p>
            <p className="text-gray-400 text-xs capitalize">{e.course?.category} • {e.course?.duration}</p>
          </div>

          {/* Payment */}
          {e.payment && (
            <div className="glass-card p-4">
              <p className="text-gray-500 text-xs uppercase font-semibold mb-3">Payment</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="text-primary font-bold">₹{e.payment?.amount?.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Method</span><span className="text-white capitalize">{e.payment?.paymentMethod}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Invoice</span><span className="text-white font-mono text-xs">{e.payment?.invoiceNumber || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Paid On</span><span className="text-white">{fmtDate(e.payment?.paidAt)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Tx ID</span><span className="text-gray-400 font-mono text-xs truncate max-w-[140px]">{e.payment?.transactionId || '—'}</span></div>
              </div>
            </div>
          )}

          {/* Validity */}
          {e.status === 'approved' && (
            <div className="glass-card p-4">
              <p className="text-gray-500 text-xs uppercase font-semibold mb-3">Course Access</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Start Date</span><span className="text-white">{fmtDate(e.startDate)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Expiry Date</span><span className={daysLeft !== null && daysLeft < 7 ? 'text-red-400 font-bold' : 'text-white'}>{fmtDate(e.expiresAt)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Validity</span><span className="text-white">{e.validityMonths} months</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Progress</span>
                  <div className="flex items-center gap-2">
                    <div className="progress-bar w-20"><div className="progress-fill" style={{ width: `${e.progress || 0}%` }}/></div>
                    <span className="text-primary text-xs font-bold">{e.progress || 0}%</span>
                  </div>
                </div>
                {e.approvedBy && <div className="flex justify-between"><span className="text-gray-400">Approved By</span><span className="text-white">{e.approvedBy?.name || '—'}</span></div>}
                {e.adminNotes && <div><span className="text-gray-400">Notes</span><p className="text-gray-300 text-xs mt-1">{e.adminNotes}</p></div>}
              </div>
            </div>
          )}

          {e.status === 'rejected' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-xs font-semibold mb-1">Rejection Reason</p>
              <p className="text-gray-300 text-sm">{e.rejectionReason || '—'}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-dark-border">
            {e.status === 'paid_pending_approval' && (
              <>
                <button onClick={() => onApprove(e)} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  <CheckCircle size={16}/> Approve Enrollment
                </button>
                <button onClick={() => onReject(e)} className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  <XCircle size={16}/> Reject Enrollment
                </button>
              </>
            )}
            {e.status === 'approved' && (
              <>
                <button onClick={() => onResend(e)} className="w-full btn-outline py-2.5 text-sm flex items-center justify-center gap-2">
                  <Send size={14}/> Resend Credentials
                </button>
                <button onClick={() => onExtend(e)} className="w-full btn-ghost py-2.5 text-sm flex items-center justify-center gap-2">
                  <Calendar size={14}/> Extend Validity
                </button>
              </>
            )}
            {e.status === 'expired' && (
              <button onClick={() => onExtend(e)} className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
                <Calendar size={14}/> Renew Access
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export default function EnrollmentManager() {
  const [enrollments,   setEnrollments]   = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState('all')
  const [statusCounts,  setStatusCounts]  = useState({})
  const [selected,      setSelected]      = useState(null)   // detail drawer
  const [confirmAction, setConfirmAction] = useState(null)   // { type, enrollment, extra }
  const [actionLoading, setActionLoading] = useState(false)
  const [credResult,    setCredResult]    = useState(null)   // credentials after approval
  const [rejectForm,    setRejectForm]    = useState({ reason: '', refundInfo: '' })
  const [approveForm,   setApproveForm]   = useState({ validityMonths: 6, adminNotes: '' })
  const [extendForm,    setExtendForm]    = useState({ additionalMonths: 3 })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await enrollmentsAPI.getAllAdmin({ status: statusFilter })
      setEnrollments(r.data.enrollments || [])
      setStatusCounts(r.data.statusCounts || {})
    } catch (err) {
      toast.error(getError(err))
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const filtered = enrollments.filter(e => {
    if (!search) return true
    const q = search.toLowerCase()
    return e.user?.name?.toLowerCase().includes(q) || e.user?.email?.toLowerCase().includes(q) || e.course?.title?.toLowerCase().includes(q)
  })

  // ── Action handlers ─────────────────────────────────────
  const handleApprove = async () => {
    setActionLoading(true)
    try {
      const r = await enrollmentsAPI.approve(confirmAction.enrollment._id, {
        validityMonths: approveForm.validityMonths,
        adminNotes:     approveForm.adminNotes,
      })
      setEnrollments(prev => prev.map(e => e._id === confirmAction.enrollment._id ? r.data.enrollment : e))
      setStatusCounts(prev => ({ ...prev, paid_pending_approval: (prev.paid_pending_approval || 1) - 1, approved: (prev.approved || 0) + 1 }))
      setCredResult(r.data.credentials)
      setConfirmAction(null)
      setSelected(null)
      toast.success(`✅ Enrollment approved! Credentials emailed.`)
    } catch (err) {
      toast.error(getError(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    setActionLoading(true)
    try {
      const r = await enrollmentsAPI.reject(confirmAction.enrollment._id, rejectForm)
      setEnrollments(prev => prev.map(e => e._id === confirmAction.enrollment._id ? r.data.enrollment : e))
      setStatusCounts(prev => ({ ...prev, paid_pending_approval: (prev.paid_pending_approval || 1) - 1, rejected: (prev.rejected || 0) + 1 }))
      setConfirmAction(null); setSelected(null)
      toast.success('Enrollment rejected. Email sent.')
    } catch (err) {
      toast.error(getError(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleExtend = async () => {
    setActionLoading(true)
    try {
      const r = await enrollmentsAPI.extend(confirmAction.enrollment._id, extendForm.additionalMonths)
      setEnrollments(prev => prev.map(e => e._id === confirmAction.enrollment._id ? r.data.enrollment : e))
      setConfirmAction(null); setSelected(null)
      toast.success(`Extended by ${extendForm.additionalMonths} months!`)
    } catch (err) {
      toast.error(getError(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleResend = async (enrollment) => {
    try {
      const r = await enrollmentsAPI.resendCredentials(enrollment._id)
      toast.success(`Credentials resent to ${r.data.credentials.email}`)
    } catch (err) {
      toast.error(getError(err))
    }
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  // ── Status filter tabs ──────────────────────────────────
  const tabs = [
    { key: 'all',                   label: 'All',      count: Object.values(statusCounts).reduce((a, b) => a + b, 0) },
    { key: 'paid_pending_approval', label: 'Pending',  count: statusCounts.paid_pending_approval || 0 },
    { key: 'approved',              label: 'Approved', count: statusCounts.approved || 0 },
    { key: 'rejected',              label: 'Rejected', count: statusCounts.rejected || 0 },
    { key: 'expired',               label: 'Expired',  count: statusCounts.expired  || 0 },
  ]

  return (
    <div>
      {/* Credentials Success Overlay */}
      <AnimatePresence>
        {credResult && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="glass-card border border-green-500/40 p-8 max-w-md w-full text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-white font-bold text-xl mb-2">Approval Successful!</h2>
              <p className="text-gray-400 text-sm mb-6">Credentials have been emailed to the student. You can also share them directly:</p>
              <div className="bg-dark-50 border-2 border-primary/30 rounded-xl p-5 text-left mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Email:</span><span className="text-primary font-mono font-bold">{credResult.email}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Password:</span><span className="text-primary font-mono font-bold">{credResult.tempPassword}</span></div>
                </div>
              </div>
              <p className="text-yellow-400 text-xs mb-4">⚠️ Student should change password after first login</p>
              <button onClick={() => setCredResult(null)} className="btn-primary py-2.5 px-8 text-sm">Done</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Modals */}
      {confirmAction?.type === 'approve' && (
        <ConfirmModal
          title="Approve Enrollment"
          message={`Approving enrollment for ${confirmAction.enrollment.user?.name}. This will send login credentials to their email.`}
          confirmLabel={actionLoading ? 'Approving…' : 'Approve & Send Credentials'}
          confirmClass="bg-green-500 hover:bg-green-600 text-white"
          onConfirm={handleApprove}
          onCancel={() => setConfirmAction(null)}>
          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Course Validity</label>
              <select value={approveForm.validityMonths} onChange={e => setApproveForm(p => ({ ...p, validityMonths: Number(e.target.value) }))} className="input-field text-sm">
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
                <option value={12}>1 Year (12 Months)</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Admin Notes (optional)</label>
              <input value={approveForm.adminNotes} onChange={e => setApproveForm(p => ({ ...p, adminNotes: e.target.value }))} className="input-field text-sm" placeholder="Internal notes…"/>
            </div>
          </div>
        </ConfirmModal>
      )}

      {confirmAction?.type === 'reject' && (
        <ConfirmModal
          title="Reject Enrollment"
          message={`Rejecting enrollment for ${confirmAction.enrollment.user?.name}. A rejection email will be sent.`}
          confirmLabel={actionLoading ? 'Rejecting…' : 'Reject Enrollment'}
          confirmClass="bg-red-500 hover:bg-red-600 text-white"
          onConfirm={handleReject}
          onCancel={() => setConfirmAction(null)}>
          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Reason for Rejection *</label>
              <textarea value={rejectForm.reason} onChange={e => setRejectForm(p => ({ ...p, reason: e.target.value }))} rows={2} className="input-field text-sm resize-none" placeholder="e.g. Payment verification failed, duplicate enrollment…"/>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Refund Information</label>
              <input value={rejectForm.refundInfo} onChange={e => setRejectForm(p => ({ ...p, refundInfo: e.target.value }))} className="input-field text-sm" placeholder="e.g. Refund will be processed in 5-7 business days"/>
            </div>
          </div>
        </ConfirmModal>
      )}

      {confirmAction?.type === 'extend' && (
        <ConfirmModal
          title="Extend Course Access"
          message={`Extend access for ${confirmAction.enrollment.user?.name}`}
          confirmLabel={actionLoading ? 'Extending…' : 'Extend Access'}
          confirmClass="btn-primary"
          onConfirm={handleExtend}
          onCancel={() => setConfirmAction(null)}>
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Additional Months</label>
            <select value={extendForm.additionalMonths} onChange={e => setExtendForm({ additionalMonths: Number(e.target.value) })} className="input-field text-sm">
              <option value={1}>1 Month</option><option value={3}>3 Months</option>
              <option value={6}>6 Months</option><option value={12}>1 Year</option>
            </select>
          </div>
        </ConfirmModal>
      )}

      {/* Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <EnrollmentDetail
            enrollment={selected}
            onClose={() => setSelected(null)}
            onApprove={(e) => { setApproveForm({ validityMonths: e.validityMonths || 6, adminNotes: '' }); setConfirmAction({ type: 'approve', enrollment: e }) }}
            onReject={(e) => { setRejectForm({ reason: '', refundInfo: '' }); setConfirmAction({ type: 'reject', enrollment: e }) }}
            onExtend={(e) => { setExtendForm({ additionalMonths: 3 }); setConfirmAction({ type: 'extend', enrollment: e }) }}
            onResend={handleResend}
          />
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Enrollment Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} enrollments • {statusCounts.paid_pending_approval || 0} awaiting approval</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost text-sm py-2.5 px-3"><RefreshCw size={15}/></button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${statusFilter === tab.key ? 'bg-primary text-dark' : 'glass-card text-gray-400 hover:text-white hover:border-primary/30'}`}>
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${statusFilter === tab.key ? 'bg-dark/30 text-dark' : tab.key === 'paid_pending_approval' && tab.count > 0 ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/10 text-gray-300'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student name, email, or course…" className="input-field pl-11 text-sm"/>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg"/></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card py-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-white font-bold text-lg mb-2">No enrollments found</h3>
          <p className="text-gray-500 text-sm">{search ? 'Try a different search' : 'No enrollments in this status'}</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Amount</th>
                  <th>Validity</th>
                  <th>Enrolled</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((e) => {
                    const s = STATUS_CONFIG[e.status] || STATUS_CONFIG.payment_pending
                    const daysLeft = e.expiresAt ? Math.ceil((new Date(e.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)) : null

                    return (
                      <motion.tr key={e._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">{e.user?.name?.charAt(0)}</div>
                            <div>
                              <p className="text-white font-semibold text-sm leading-tight">{e.user?.name}</p>
                              <p className="text-gray-500 text-xs">{e.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p className="text-gray-200 text-sm font-medium leading-tight max-w-[160px]">{e.course?.title}</p>
                          <p className="text-gray-500 text-xs capitalize">{e.course?.category}</p>
                        </td>
                        <td className="text-primary font-bold text-sm">
                          {e.payment?.amount ? `₹${e.payment.amount.toLocaleString()}` : '—'}
                        </td>
                        <td className="text-gray-300 text-sm">{e.validityMonths ? `${e.validityMonths}m` : '—'}</td>
                        <td className="text-gray-500 text-xs">{fmtDate(e.enrolledAt)}</td>
                        <td>
                          {e.expiresAt ? (
                            <span className={`text-xs font-medium ${daysLeft !== null && daysLeft < 7 ? 'text-red-400' : daysLeft !== null && daysLeft < 30 ? 'text-yellow-400' : 'text-gray-400'}`}>
                              {fmtDate(e.expiresAt)}
                              {daysLeft !== null && daysLeft > 0 && daysLeft < 30 && <span className="block text-xs">{daysLeft}d left</span>}
                              {daysLeft !== null && daysLeft <= 0 && <span className="block text-red-400">Expired</span>}
                            </span>
                          ) : <span className="text-gray-600 text-xs">—</span>}
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${s.color} ${s.bg} ${s.border}`}>
                            {s.icon} {s.label}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setSelected(e)} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all" title="View Details">
                              <Eye size={14}/>
                            </button>
                            {e.status === 'paid_pending_approval' && (
                              <>
                                <button onClick={() => { setApproveForm({ validityMonths: e.validityMonths || 6, adminNotes: '' }); setConfirmAction({ type: 'approve', enrollment: e }) }}
                                  className="p-1.5 hover:bg-green-500/20 rounded-lg text-green-400 transition-all" title="Approve">
                                  <CheckCircle size={14}/>
                                </button>
                                <button onClick={() => { setRejectForm({ reason: '', refundInfo: '' }); setConfirmAction({ type: 'reject', enrollment: e }) }}
                                  className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-all" title="Reject">
                                  <XCircle size={14}/>
                                </button>
                              </>
                            )}
                            {e.status === 'approved' && (
                              <button onClick={() => handleResend(e)}
                                className="p-1.5 hover:bg-cyan-500/20 rounded-lg text-cyan-400 transition-all" title="Resend Credentials">
                                <Send size={14}/>
                              </button>
                            )}
                            {['approved', 'expired'].includes(e.status) && (
                              <button onClick={() => { setExtendForm({ additionalMonths: 3 }); setConfirmAction({ type: 'extend', enrollment: e }) }}
                                className="p-1.5 hover:bg-primary/20 rounded-lg text-primary transition-all" title="Extend Access">
                                <Calendar size={14}/>
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
