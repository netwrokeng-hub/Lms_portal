import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, CheckCircle } from 'lucide-react'
import { CATEGORIES } from '../data/sampleData'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', course: '', message: '', type: 'demo' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone) { toast.error('Please fill in all required fields'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500)) // Simulate API call
    setLoading(false)
    setSubmitted(true)
    toast.success('🎉 Your request has been received! We\'ll call you within 2 hours.')
  }

  const contactInfo = [
    { icon: <Phone size={20} />, title: 'Phone / WhatsApp', value: '+91 98765 43210', href: 'tel:+919876543210', color: 'text-green-400' },
    { icon: <Mail size={20} />, title: 'Email', value: 'info@cybertech.com', href: 'mailto:info@cybertech.com', color: 'text-cyan-400' },
    { icon: <MapPin size={20} />, title: 'Location', value: 'No. 42, IT Park Road, Tidel Park, Chennai - 600113', href: '#map', color: 'text-primary' },
    { icon: <Clock size={20} />, title: 'Working Hours', value: 'Monday to Saturday: 9:00 AM – 8:00 PM', color: 'text-purple-400' },
  ]

  return (
    <div className="min-h-screen bg-dark pt-16">
      {/* Header */}
      <div className="bg-dark-50 border-b border-dark-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cyber-badge mb-3">📞 Get In Touch</div>
          <h1 className="text-4xl md:text-5xl font-display text-white tracking-wide mb-3">
            Book a <span className="text-primary">Free Demo</span>
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Not sure which course is right for you? Book a free demo class or counselling session with our experts.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            {submitted ? (
              <div className="glass-card p-10 text-center h-full flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-6">
                  <CheckCircle size={40} className="text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Thank You, {form.name}!</h2>
                <p className="text-gray-400 mb-2">Your demo request has been received.</p>
                <p className="text-gray-400 mb-6">Our team will contact you at <span className="text-primary">{form.phone}</span> within 2 hours.</p>
                <div className="space-y-3 w-full max-w-xs">
                  <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-xl hover:bg-green-500/30 transition-all w-full font-medium">
                    <MessageCircle size={18} /> Continue on WhatsApp
                  </a>
                  <button onClick={() => setSubmitted(false)} className="btn-outline w-full text-sm py-2.5">
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card p-8">
                <h2 className="text-2xl font-semibold text-white mb-2">Book Your Free Demo</h2>
                <p className="text-gray-400 text-sm mb-6">Fill in your details and we'll get back to you within 2 hours.</p>

                {/* Type Toggle */}
                <div className="flex gap-3 mb-6">
                  {[['demo', '🎯 Free Demo Class'], ['counselling', '💬 Course Counselling'], ['enroll', '✅ Enroll Now']].map(([val, label]) => (
                    <button key={val} onClick={() => setForm(p => ({ ...p, type: val }))}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${form.type === val ? 'bg-primary text-dark' : 'glass-card text-gray-300 hover:text-white hover:border-primary/30'}`}>
                      {label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">Full Name *</label>
                      <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Your full name" className="input-field" required />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-1.5 block">Phone Number *</label>
                      <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+91 98765 43210" className="input-field" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">Email Address *</label>
                    <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      type="email" placeholder="your@email.com" className="input-field" required />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">Interested Course</label>
                    <select value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} className="input-field">
                      <option value="">— Select a course —</option>
                      {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">Message (Optional)</label>
                    <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Any specific queries or requirements..."
                      rows={3} className="input-field resize-none" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
                    {loading ? '⏳ Submitting...' : <><Send size={18} /> Submit Request</>}
                  </button>
                </form>
              </div>
            )}
          </motion.div>

          {/* Right Side Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 gap-4">
              {contactInfo.map((info, i) => (
                <div key={i} className="glass-card p-5 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-dark-50 flex items-center justify-center ${info.color} flex-shrink-0`}>
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{info.title}</p>
                    {info.href ? (
                      <a href={info.href} className={`font-medium text-sm hover:underline ${info.color}`}>{info.value}</a>
                    ) : (
                      <p className={`font-medium text-sm ${info.color}`}>{info.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a href="https://wa.me/919876543210?text=Hi%2C%20I%27m%20interested%20in%20your%20IT%20courses.%20Can%20you%20please%20share%20more%20details%3F"
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-3 bg-green-500/15 border border-green-500/30 text-green-400 p-5 rounded-2xl hover:bg-green-500/25 transition-all text-lg font-semibold w-full">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-xl">💬</div>
              <div>
                <p className="font-bold">Chat on WhatsApp</p>
                <p className="text-green-500/70 text-xs font-normal">Get instant response</p>
              </div>
            </a>

            {/* Map */}
            <div id="map" className="glass-card overflow-hidden rounded-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.3893!2d80.2264!3d13.0569!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDAzJzI0LjkiTiA4MMKwMTMnMzUuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%" height="250" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy"
                title="CyberTech Institute Location"
              />
              <div className="p-4">
                <p className="text-white font-medium text-sm">CyberTech Institute</p>
                <p className="text-gray-400 text-xs">No. 42, IT Park Road, Tidel Park, Chennai - 600113</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
