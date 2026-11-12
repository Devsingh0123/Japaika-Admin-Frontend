import { useEffect, lazy, Suspense } from 'react'
import { useDispatch } from 'react-redux'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'
import { fetchAdminMeThunk } from '@/features/auth/authApi'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { LoginPage } from '@/pages/LoginPage'

const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
)
const UsersPage = lazy(() =>
  import('@/pages/UsersPage').then((m) => ({ default: m.UsersPage }))
)
const OrdersPage = lazy(() =>
  import('@/pages/OrdersPage').then((m) => ({ default: m.OrdersPage }))
)
const CouponsPage = lazy(() =>
  import('@/pages/CouponsPage').then((m) => ({ default: m.CouponsPage }))
)
const QuestionPacksPage = lazy(() =>
  import('@/pages/QuestionPacksPage').then((m) => ({
    default: m.QuestionPacksPage,
  }))
)
const ReportPacksPage = lazy(() =>
  import('@/pages/ReportPacksPage').then((m) => ({
    default: m.ReportPacksPage,
  }))
)
const BlogsPage = lazy(() =>
  import('@/pages/BlogsPage').then((m) => ({ default: m.BlogsPage }))
)
const BlogEditorPage = lazy(() =>
  import('@/pages/BlogEditorPage').then((m) => ({ default: m.BlogEditorPage }))
)
const DoshasPage = lazy(() =>
  import('@/pages/DoshasPage').then((m) => ({ default: m.DoshasPage }))
)
const DoshaEditorPage = lazy(() =>
  import('@/pages/DoshaEditorPage').then((m) => ({
    default: m.DoshaEditorPage,
  }))
)
const FaqsPage = lazy(() =>
  import('@/pages/FaqsPage').then((m) => ({ default: m.FaqsPage }))
)
const LegalPagesPage = lazy(() =>
  import('@/pages/LegalPagesPage').then((m) => ({ default: m.LegalPagesPage }))
)
const ChatsPage = lazy(() =>
  import('@/pages/ChatsPage').then((m) => ({ default: m.ChatsPage }))
)
const AdminsPage = lazy(() =>
  import('@/pages/AdminsPage').then((m) => ({ default: m.AdminsPage }))
)
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
)

function FullScreenFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background text-muted-foreground">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  )
}

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchAdminMeThunk())
  }, [dispatch])

  return (
    <>
      <ErrorBoundary standalone>
        <BrowserRouter>
          <Suspense fallback={<FullScreenFallback />}>
            <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <ProtectedRoute permission="dashboard:read">
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute permission="users:read">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute permission="orders:read">
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="coupons"
                element={
                  <ProtectedRoute permission="coupons:read">
                    <CouponsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="question-packs"
                element={
                  <ProtectedRoute permission="question_packs:read">
                    <QuestionPacksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="report-packs"
                element={
                  <ProtectedRoute permission="report_packs:read">
                    <ReportPacksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="blogs"
                element={
                  <ProtectedRoute permission="blogs:read">
                    <BlogsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="blogs/new"
                element={
                  <ProtectedRoute permission="blogs:write">
                    <BlogEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="blogs/edit/:id"
                element={
                  <ProtectedRoute permission="blogs:write">
                    <BlogEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doshas"
                element={
                  <ProtectedRoute permission="doshas:read">
                    <DoshasPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doshas/new"
                element={
                  <ProtectedRoute permission="doshas:write">
                    <DoshaEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doshas/edit/:id"
                element={
                  <ProtectedRoute permission="doshas:write">
                    <DoshaEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="faqs"
                element={
                  <ProtectedRoute permission="faqs:read">
                    <FaqsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="legal-pages"
                element={
                  <ProtectedRoute permission="legal_pages:read">
                    <LegalPagesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="chats"
                element={
                  <ProtectedRoute permission="chats:read">
                    <ChatsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admins"
                element={
                  <ProtectedRoute permission="admins:read">
                    <AdminsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="/404" element={<NotFoundPage standalone />} />
            <Route path="*" element={<NotFoundPage standalone />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}
