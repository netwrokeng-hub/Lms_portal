import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Navbar, Footer, PageLoader, ProtectedRoute } from './components/shared'

const HomePage          = lazy(() => import('./pages/HomePage'))
const CoursesPage       = lazy(() => import('./pages/CoursesPage'))
const CourseDetailPage  = lazy(() => import('./pages/CourseDetailPage'))
const TrainersPage      = lazy(() => import('./pages/TrainersPage'))
const ContactPage       = lazy(() => import('./pages/ContactPage'))
const EnrollPage        = lazy(() => import('./pages/EnrollPage'))
const LoginPage         = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.LoginPage })))
const RegisterPage      = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.RegisterPage })))
const StudentPortal     = lazy(() => import('./student/StudentPortal'))
const AdminPanel        = lazy(() => import('./admin/AdminPanel'))

function PublicLayout({ children }) {
  return <><Navbar />{children}<Footer /></>
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/"              element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/courses"       element={<PublicLayout><CoursesPage /></PublicLayout>} />
          <Route path="/courses/:slug" element={<PublicLayout><CourseDetailPage /></PublicLayout>} />
          <Route path="/trainers"      element={<PublicLayout><TrainersPage /></PublicLayout>} />
          <Route path="/contact"       element={<PublicLayout><ContactPage /></PublicLayout>} />

          {/* Enrollment flow — needs auth */}
          <Route path="/enroll/:slug" element={<ProtectedRoute><EnrollPage /></ProtectedRoute>} />

          {/* Auth */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Portal */}
          <Route path="/student/*" element={<ProtectedRoute><StudentPortal /></ProtectedRoute>} />

          {/* Admin Panel */}
          <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen bg-dark flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-4 font-display text-primary">404</div>
                <h2 className="text-white text-2xl font-semibold mb-3">Page Not Found</h2>
                <a href="/" className="btn-primary inline-block">Back to Home</a>
              </div>
            </div>
          }/>
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
