import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { coursesAPI, getError } from '../utils/api'
import { SAMPLE_COURSES, CATEGORIES } from '../data/sampleData'
import { CourseCard, Spinner } from '../components/shared'
import toast from 'react-hot-toast'

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced']

export default function CoursesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [courses,      setCourses]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [selectedCat,  setSelectedCat]  = useState(searchParams.get('category') || 'all')
  const [selectedLevel,setSelectedLevel]= useState('All')
  const [sortBy,       setSortBy]       = useState('popular')
  const [showFilters,  setShowFilters]  = useState(false)

  // ── Fetch courses from API ────────────────────────────────
  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const r = await coursesAPI.getAll({ limit: 100 })
      setCourses(r.data.courses || [])
    } catch (err) {
      // Fallback to sample data if backend not running
      console.warn('API unavailable, using sample data:', getError(err))
      setCourses(SAMPLE_COURSES)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCourses() }, [fetchCourses])

  // Sync category from URL param
  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setSelectedCat(cat)
  }, [searchParams])

  // ── Filter + Sort ─────────────────────────────────────────
  const filtered = courses
    .filter(c => {
      const matchCat   = selectedCat === 'all' || c.category === selectedCat
      const matchLevel = selectedLevel === 'All' || c.level === selectedLevel
      const matchSearch = !search ||
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
        c.category?.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchLevel && matchSearch
    })
    .sort((a, b) => {
      if (sortBy === 'popular')    return (b.enrolledCount || 0) - (a.enrolledCount || 0)
      if (sortBy === 'rating')     return (b.rating || 0) - (a.rating || 0)
      if (sortBy === 'price-low')  return (a.discountPrice || a.price || 0) - (b.discountPrice || b.price || 0)
      if (sortBy === 'price-high') return (b.discountPrice || b.price || 0) - (a.discountPrice || a.price || 0)
      return 0
    })

  const resetFilters = () => {
    setSearch('')
    setSelectedCat('all')
    setSelectedLevel('All')
    setSortBy('popular')
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-dark pt-16">
      {/* Page Header */}
      <div className="bg-dark-50 border-b border-dark-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cyber-badge mb-3">📚 All Courses</div>
          <h1 className="text-4xl md:text-5xl font-display text-white tracking-wide mb-3">
            IT Training <span className="text-primary">Courses</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-sm">
            {loading ? 'Loading courses...' : `${filtered.length} courses available. Your certification journey starts here.`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search courses, certifications, skills..."
              className="input-field pl-12"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>
          {/* Mobile filter toggle */}
          <button onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center gap-2 glass-card px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:border-primary/30 transition-all">
            <SlidersHorizontal size={16} /> Filters
          </button>
          {/* Desktop sort */}
          <div className="relative hidden sm:block">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="input-field pr-10 appearance-none cursor-pointer min-w-[180px]">
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} sm:block w-full sm:w-56 flex-shrink-0`}>
            <div className="glass-card p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">Filters</h3>
                <button onClick={resetFilters} className="text-primary text-xs hover:text-primary-300 transition-colors">Reset All</button>
              </div>

              {/* Categories */}
              <div className="mb-5">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Category</p>
                <div className="space-y-0.5">
                  <button onClick={() => setSelectedCat('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${selectedCat === 'all' ? 'bg-primary text-dark font-bold' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
                    All Categories
                  </button>
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${selectedCat === cat.id ? 'bg-primary text-dark font-bold' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
                      <span>{cat.icon}</span>{cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Level</p>
                <div className="space-y-0.5">
                  {LEVELS.map(level => (
                    <button key={level} onClick={() => setSelectedLevel(level)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${selectedLevel === level ? 'bg-primary text-dark font-bold' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile sort */}
              <div className="sm:hidden mt-4">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Sort By</p>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field text-xs py-2">
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price ↑</option>
                  <option value="price-high">Price ↓</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Courses Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 text-sm">
                {loading ? (
                  <span className="flex items-center gap-2"><Spinner size="sm" /> Loading...</span>
                ) : (
                  <>Showing <span className="text-white font-semibold">{filtered.length}</span> courses
                  {selectedCat !== 'all' && <span> in <span className="text-primary capitalize">{selectedCat}</span></span>}</>
                )}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card h-80 animate-pulse">
                    <div className="h-44 bg-white/5 rounded-t-2xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-white/5 rounded w-3/4" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                      <div className="h-3 bg-white/5 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 glass-card">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-white text-xl font-semibold mb-2">No courses found</h3>
                <p className="text-gray-400 mb-4">Try adjusting your filters or search term</p>
                <button onClick={resetFilters} className="btn-outline text-sm py-2 px-5">Clear All Filters</button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((course, i) => (
                    <motion.div key={course._id || course.slug}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.04 }}>
                      <CourseCard
                        course={course}
                        onClick={() => navigate(`/courses/${course.slug || course._id}`)}
                      />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
