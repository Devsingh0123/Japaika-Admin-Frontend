import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { fetchAdminMeThunk } from '@/features/auth/authApi'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { UsersPage } from '@/pages/UsersPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { CouponsPage } from '@/pages/CouponsPage'
import { QuestionPacksPage } from '@/pages/QuestionPacksPage'
import { ReportPacksPage } from '@/pages/ReportPacksPage'
import { BlogsPage } from '@/pages/BlogsPage'
import { BlogEditorPage } from '@/pages/BlogEditorPage'
import { DoshasPage } from '@/pages/DoshasPage'
import { DoshaEditorPage } from '@/pages/DoshaEditorPage'
import { FaqsPage } from '@/pages/FaqsPage'
import { LegalPagesPage } from '@/pages/LegalPagesPage'
import { ChatsPage } from '@/pages/ChatsPage'
import { AdminsPage } from '@/pages/AdminsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchAdminMeThunk())
  }, [dispatch])

  return (
    <>
      <ErrorBoundary standalone>
        <BrowserRouter>
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
        </BrowserRouter>
      </ErrorBoundary>
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}
