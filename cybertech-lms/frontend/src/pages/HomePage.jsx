import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import CountUp from 'react-countup'
import {
  Shield, ChevronRight, Play, Star, Users, Award, Clock,
  Zap, ArrowRight, CheckCircle, BookOpen, MessageSquare, Phone
} from 'lucide-react'
import { SAMPLE_COURSES, SAMPLE_TRAINERS, TESTIMONIALS, CATEGORIES } from '../data/sampleData'
import { CourseCard, SectionHeader } from '../components/shared'

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

export default function HomePage() {
  const navigate = useNavigate()
  const featuredCourses = SAMPLE_COURSES.filter(c => c.isFeatured)

  return (
    <div className="bg-dark">
      <HeroSection />
      <StatsSection />
      <CategoriesSection />
      <PopularCoursesSection courses={featuredCourses} navigate={navigate} />
      <AboutSection />
      <TrainersSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}

/* ── HERO ───────────────────────────────────────────────── */
function HeroSection() {
  const navigate = useNavigate()
  const [typed, setTyped] = useState('')
  const words = ['Cyber Security', 'Cloud Computing', 'CCNA / CCNP', 'VMware', 'AWS & GCP']
  const [wordIdx, setWordIdx] = useState(0)

  useEffect(() => {
    let i = 0, timeout
    const type = () => {
      const word = words[wordIdx]
      if (i <= word.length) { setTyped(word.slice(0, i++)); timeout = setTimeout(type, 80) }
      else { setTimeout(() => { i = 0; setWordIdx(p => (p + 1) % words.length) }, 2000) }
    }
    timeout = setTimeout(type, 300)
    return () => clearTimeout(timeout)
  }, [wordIdx])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-cyber-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      {/* Floating blobs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent-cyan/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-purple/5 rounded-full blur-3xl animate-float" />

      {/* Floating tech badges */}
      {[
        { icon: '🔐', label: 'CEH', x: '8%', y: '20%', delay: 0 },
        { icon: '☁️', label: 'AWS', x: '88%', y: '25%', delay: 0.5 },
        { icon: '🌐', label: 'CCNA', x: '5%', y: '70%', delay: 1 },
        { icon: '💻', label: 'VMware', x: '85%', y: '65%', delay: 1.5 },
        { icon: '🛡️', label: 'Palo Alto', x: '45%', y: '88%', delay: 2 },
      ].map((b, i) => (
        <motion.div key={i} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: b.delay + 0.8, duration: 0.5 }}
          className="absolute hidden md:flex items-center gap-2 glass-card px-3 py-2 animate-float"
          style={{ left: b.x, top: b.y, animationDelay: `${i * 0.8}s` }}>
          <span>{b.icon}</span>
          <span className="text-xs text-white font-medium">{b.label}</span>
        </motion.div>
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="mb-6">
            <span className="cyber-badge text-sm px-4 py-2">
              🏆 #1 IT Training Institute in Chennai
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-display tracking-wider text-white mb-4 leading-none">
            MASTER
          </motion.h1>
          <motion.div variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-display tracking-wider mb-4 min-h-[1.2em]">
            <span className="text-primary text-glow">{typed}</span>
            <span className="text-primary animate-pulse ml-1">|</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-display tracking-wider text-white/60 mb-8">
            GET CERTIFIED
          </motion.h2>

          <motion.p variants={fadeUp} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Professional IT training with hands-on labs, industry experts, and
            <span className="text-primary font-semibold"> 100% placement support</span>.
            Join 15,000+ certified professionals.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button onClick={() => navigate('/courses')} className="btn-primary text-lg px-8 py-4 group">
              Explore Courses <ArrowRight size={18} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/contact')}
              className="flex items-center justify-center gap-3 glass-card border border-white/20 hover:border-primary/40 text-white px-8 py-4 rounded-xl transition-all hover:bg-white/10 text-lg font-semibold">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Play size={14} className="text-primary ml-0.5" />
              </div>
              Book Free Demo
            </button>
          </motion.div>

          {/* Quick stats */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            {[['15,000+', 'Students Trained'], ['98%', 'Placement Rate'], ['50+', 'Certifications'], ['10+', 'Years Experience']].map(([n, l]) => (
              <div key={l} className="flex items-center gap-2">
                <CheckCircle size={15} className="text-primary" />
                <span className="text-white font-semibold">{n}</span>
                <span>{l}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-gray-500 text-xs">Scroll to explore</span>
        <div className="w-5 h-8 border border-gray-600 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-primary rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}

/* ── STATS ──────────────────────────────────────────────── */
function StatItem({ end, suffix, label, icon }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="stat-card">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-4xl font-display text-primary text-glow">
        {inView ? <CountUp end={end} duration={2.5} separator="," suffix={suffix} /> : '0'}
      </div>
      <div className="text-gray-400 text-sm mt-1 font-medium">{label}</div>
    </div>
  )
}

function StatsSection() {
  return (
    <section className="py-16 bg-dark-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem end={15000} suffix="+" label="Students Trained" icon="🎓" />
          <StatItem end={98} suffix="%" label="Placement Rate" icon="🏆" />
          <StatItem end={50} suffix="+" label="Certifications Offered" icon="📜" />
          <StatItem end={10} suffix="+" label="Years Experience" icon="⭐" />
        </div>
      </div>
    </section>
  )
}

/* ── CATEGORIES ─────────────────────────────────────────── */
function CategoriesSection() {
  const navigate = useNavigate()
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="🎯 What We Teach" title="Course Categories" subtitle="Industry-leading certifications taught by experts with real-world experience" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.button key={cat.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/courses?category=${cat.id}`)}
              className="glass-card-hover p-5 flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110"
                style={{ background: `${cat.color}22`, border: `1px solid ${cat.color}44` }}>
                {cat.icon}
              </div>
              <span className="text-gray-300 text-sm font-medium text-center group-hover:text-white transition-colors">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── POPULAR COURSES ────────────────────────────────────── */
function PopularCoursesSection({ courses, navigate }) {
  return (
    <section className="py-20 bg-dark-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <SectionHeader badge="🔥 Hot Courses" title="Popular Courses" subtitle="Industry-recognized programs with highest placement rates" center={false} />
          <Link to="/courses" className="hidden md:flex items-center gap-2 text-primary hover:text-primary-300 transition-colors font-semibold">
            View All <ChevronRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, i) => (
            <motion.div key={course._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <CourseCard course={course} onClick={() => navigate(`/courses/${course.slug}`)} />
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8 md:hidden">
          <Link to="/courses" className="btn-outline inline-flex items-center gap-2">
            View All Courses <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── ABOUT ──────────────────────────────────────────────── */
function AboutSection() {
  const features = [
    { icon: '🔬', title: 'Hands-on Labs', desc: 'Real enterprise lab environments with Cisco, VMware, AWS, and more.' },
    { icon: '👨‍🏫', title: 'Expert Trainers', desc: 'Industry professionals with 10+ years of real-world experience.' },
    { icon: '📜', title: 'Certifications', desc: 'Globally recognized certification preparation and exam support.' },
    { icon: '💼', title: 'Placement Support', desc: '100% placement assistance with our 500+ hiring partners network.' },
    { icon: '🔄', title: 'Lifetime Access', desc: 'Lifetime access to recorded sessions and course materials.' },
    { icon: '🎯', title: 'Small Batches', desc: 'Limited batch sizes for personalized attention and better learning.' },
  ]
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="cyber-badge mb-4">🏢 About Us</div>
            <h2 className="section-title mb-6">Why <span className="text-primary">CyberTech</span> is Different</h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Founded in 2014, CyberTech Institute has been the leading IT training center in Chennai,
              transforming 15,000+ careers through practical, industry-aligned training programs.
              Our hands-on approach ensures you're job-ready from day one.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              We offer training in the most in-demand IT domains — Cyber Security, Networking,
              Cloud (AWS & GCP), Virtualization (VMware & Nutanix), and enterprise infrastructure.
            </p>
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              Book Free Demo <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-5 hover:border-primary/30 transition-all">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ── TRAINERS ───────────────────────────────────────────── */
function TrainersSection() {
  const navigate = useNavigate()
  return (
    <section className="py-20 bg-dark-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <SectionHeader badge="👨‍🏫 Expert Faculty" title="Meet Our Trainers" subtitle="Industry veterans who have worked at top MNCs" center={false} />
          <Link to="/trainers" className="hidden md:flex items-center gap-2 text-primary hover:text-primary-300 transition-colors font-semibold">
            All Trainers <ChevronRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SAMPLE_TRAINERS.map((trainer, i) => (
            <motion.div key={trainer._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center hover:border-primary/30 transition-all group cursor-pointer"
              onClick={() => navigate('/trainers')}>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center text-3xl font-display text-primary mx-auto mb-4 group-hover:shadow-glow-yellow transition-all">
                {trainer.name.charAt(0)}
              </div>
              <h3 className="text-white font-semibold mb-1">{trainer.name}</h3>
              <p className="text-primary text-xs font-medium mb-2">{trainer.designation}</p>
              <p className="text-gray-500 text-xs mb-3">{trainer.experience} Experience</p>
              <div className="flex items-center justify-center gap-3 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1"><Star size={11} className="text-primary fill-primary" />{trainer.rating}</span>
                <span className="flex items-center gap-1"><Users size={11} />{trainer.studentsCount?.toLocaleString()}+ students</span>
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {trainer.specializations.slice(0, 2).map(s => (
                  <span key={s} className="tag-pill text-xs">{s}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── TESTIMONIALS ───────────────────────────────────────── */
function TestimonialsSection() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % TESTIMONIALS.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="💬 Success Stories" title="Student Testimonials" subtitle="Real stories from our graduates who landed their dream jobs" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card p-6 hover:border-primary/30 transition-all">
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} className="text-primary fill-primary" />)}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-primary text-xs">{t.role}</p>
                  <p className="text-gray-500 text-xs">{t.course} • {t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA ────────────────────────────────────────────────── */
function CTASection() {
  const navigate = useNavigate()
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="gradient-border p-10 md:p-16">
          <div className="text-5xl mb-6">🚀</div>
          <h2 className="section-title mb-4">Ready to Level Up Your Career?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Book a FREE demo class today. No commitment, no credit card required.
            Talk to our experts and design your learning path.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/contact')} className="btn-primary text-lg px-10 py-4">
              Book Free Demo Class
            </button>
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500/20 border border-green-500/40 text-green-400 px-8 py-4 rounded-xl hover:bg-green-500/30 transition-all text-lg font-semibold">
              <span>💬</span> WhatsApp Us
            </a>
          </div>
          <p className="text-gray-500 text-sm mt-6 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> Free Counselling</span>
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> No Spam Calls</span>
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> Instant Response</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
