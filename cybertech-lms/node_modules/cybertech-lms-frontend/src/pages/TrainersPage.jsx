import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Users, Award } from 'lucide-react'
import { trainersAPI, getError } from '../utils/api'
import { SAMPLE_TRAINERS } from '../data/sampleData'
import { Spinner } from '../components/shared'
import toast from 'react-hot-toast'

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    trainersAPI.getAll()
      .then(r => setTrainers(r.data.trainers || []))
      .catch(err => {
        console.warn('Using sample trainers:', getError(err))
        setTrainers(SAMPLE_TRAINERS)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-dark pt-16">
      <div className="bg-dark-50 border-b border-dark-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cyber-badge mb-3">👨‍🏫 Expert Faculty</div>
          <h1 className="text-4xl md:text-5xl font-display text-white tracking-wide mb-3">
            Our <span className="text-primary">Trainers</span>
          </h1>
          <p className="text-gray-400 max-w-2xl">Industry veterans with hands-on enterprise experience and 10+ years expertise.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg"/></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trainers.map((trainer, i) => (
              <motion.div key={trainer._id || i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-6 hover:border-primary/30 transition-all">
                <div className="flex items-start gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center text-3xl font-display text-primary flex-shrink-0">
                    {trainer.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-white font-bold text-xl">{trainer.name}</h2>
                        <p className="text-primary text-sm font-medium">{trainer.designation}</p>
                        <p className="text-gray-500 text-sm mt-0.5">{trainer.experience} Experience</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm flex-shrink-0">
                        <Star size={13} className="text-primary fill-primary"/>
                        <span className="text-white font-bold">{trainer.rating || 4.8}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><Users size={13}/> {(trainer.studentsCount || 0).toLocaleString()}+ students</span>
                      <span className="flex items-center gap-1"><Award size={13} className="text-green-400"/> {trainer.certifications?.length || 0} certifications</span>
                    </div>
                  </div>
                </div>

                {trainer.bio && <p className="text-gray-400 text-sm leading-relaxed mt-4 mb-4">{trainer.bio}</p>}

                {trainer.certifications?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {trainer.certifications.map(cert => (
                        <span key={cert} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/15 text-primary border border-primary/25">{cert}</span>
                      ))}
                    </div>
                  </div>
                )}

                {trainer.specializations?.length > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2">Specializations</p>
                    <div className="flex flex-wrap gap-2">
                      {trainer.specializations.map(s => <span key={s} className="tag-pill">{s}</span>)}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-16 glass-card p-10 text-center">
          <h3 className="text-2xl font-display text-white tracking-wide mb-3">Learn From The Best</h3>
          <p className="text-gray-400 mb-6">All trainers have worked at top MNCs and bring real-world scenarios into every class.</p>
          <a href="/contact" className="btn-primary inline-flex items-center gap-2">Book a Free Demo Class</a>
        </motion.div>
      </div>
    </div>
  )
}
