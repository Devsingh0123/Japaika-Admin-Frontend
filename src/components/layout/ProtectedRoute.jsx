import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2, ShieldAlert } from 'lucide-react'
import { NAV_ITEMS, hasPermission } from '@/lib/constants'

export function ProtectedRoute({ children, permission }) {
  const { isAuthenticated, isLoading, admin } = useSelector(
    (state) => state.auth
  )
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Verifying administrator session...
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (permission && !hasPermission(admin, permission)) {
    if (location.pathname === '/') {
      const fallbackRoute =
        NAV_ITEMS.find(
          (item) => item.path !== '/' && hasPermission(admin, item.permission)
        )?.path || '/settings'
      return <Navigate to={fallbackRoute} replace />
    }

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center p-6">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
          <ShieldAlert className="size-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
        <p className="max-w-md text-xs text-muted-foreground">
          Your account does not have the required permission (
          <code className="font-mono text-foreground">{permission}</code>) to
          access this module. Contact a Super Admin to request access.
        </p>
      </div>
    )
  }

  return children
}
