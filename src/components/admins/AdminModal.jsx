import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  createAdminThunk,
  updateAdminPermissionsThunk,
} from '@/features/admins/adminsApi'
import { clearAdminsError } from '@/features/admins/adminsSlice'
import { PERMISSION_MODULES, parseArray } from '@/lib/constants'
import {
  ShieldAlert,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react'
import { toast } from 'sonner'

const ALL_PERMISSION_KEYS = PERMISSION_MODULES.flatMap((m) =>
  m.actions.map((action) => `${m.key}:${action}`)
)

export function AdminModal({ open, onOpenChange, adminToEdit = null }) {
  const dispatch = useDispatch()
  const { submitting, error } = useSelector((state) => state.admins)

  const isEditMode = Boolean(adminToEdit?.id)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('admin')
  const [permissions, setPermissions] = useState(() =>
    parseArray(adminToEdit?.permissions)
  )
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState('')

  const handleClose = () => {
    if (submitting) return
    setValidationError('')
    dispatch(clearAdminsError())
    onOpenChange(false)
  }

  const togglePermission = (modKey, action) => {
    const perm = `${modKey}:${action}`
    setPermissions((prev) => {
      const exists = prev.includes(perm)
      if (exists) {
        if (action === 'read') {
          return prev.filter(
            (p) => p !== `${modKey}:read` && p !== `${modKey}:write`
          )
        }
        return prev.filter((p) => p !== perm)
      }

      if (action === 'write' && !prev.includes(`${modKey}:read`)) {
        return [...prev, `${modKey}:read`, `${modKey}:write`]
      }
      return [...prev, perm]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (isEditMode) {
      const result = await dispatch(
        updateAdminPermissionsThunk({
          id: adminToEdit.id,
          permissions,
        })
      )
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success(`Permissions updated for ${adminToEdit.email}.`)
        handleClose()
      } else {
        toast.error(result.payload)
      }
      return
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError('Please provide a valid email address.')
      return
    }

    if (!password || password.length < 6) {
      setValidationError('Password must be at least 6 characters long.')
      return
    }

    const payload = {
      name: name.trim() || 'Administrator',
      email: email.trim().toLowerCase(),
      password,
      role,
      permissions: role === 'super_admin' ? [] : permissions,
    }

    const result = await dispatch(createAdminThunk(payload))
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(
        `Staff administrator "${payload.email}" created successfully!`
      )
      handleClose()
    } else {
      toast.error(result.payload)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl w-full max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/60 shadow-2xl bg-card">
        {/* Header */}
        <div className="p-6 border-b border-border/40 bg-muted/20">
          <DialogHeader className="gap-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-semibold border border-purple-500/20">
                {isEditMode ? (
                  <KeyRound className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  {isEditMode
                    ? `Manage Permissions (${adminToEdit.name})`
                    : 'Invite Administrator'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isEditMode
                    ? `Configure module-level read and write access for ${adminToEdit.email}.`
                    : 'Grant administrative console access and define RBAC permissions.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {(validationError || error) && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}

          {!isEditMode && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="admin-name"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="admin-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acharya Sharma"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="admin-email"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@japaika.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-password"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Initial Password * (min 6 characters)
                </Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="pr-10 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Role *
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === 'admin'
                        ? 'border-primary/50 bg-primary/10 text-primary shadow-xs'
                        : 'border-border/60 bg-card/40 hover:bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <ShieldCheck className="size-4" />
                      <span className="text-xs font-bold text-foreground">
                        Standard Admin
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Granular module read &amp; write permissions.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('super_admin')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === 'super_admin'
                        ? 'border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-xs'
                        : 'border-border/60 bg-card/40 hover:bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <ShieldAlert className="size-4 text-purple-500" />
                      <span className="text-xs font-bold text-foreground">
                        Super Admin
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Unrestricted access to all modules &amp; staff.
                    </p>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Granular Module Permissions Matrix */}
          {(isEditMode || role === 'admin') && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Module Permissions ({permissions.length} selected)
                </Label>
                <div className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setPermissions(ALL_PERMISSION_KEYS)}
                    className="text-primary hover:underline font-medium"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermissions([])}
                    className="text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 divide-y divide-border/40 max-h-64 overflow-y-auto">
                {PERMISSION_MODULES.map((mod) => (
                  <div
                    key={mod.key}
                    className="flex items-center justify-between px-3.5 py-2.5 text-xs hover:bg-muted/20"
                  >
                    <span className="font-medium text-foreground">
                      {mod.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {mod.actions.map((action) => {
                        const permKey = `${mod.key}:${action}`
                        const isChecked = permissions.includes(permKey)
                        return (
                          <button
                            type="button"
                            key={permKey}
                            onClick={() => togglePermission(mod.key, action)}
                            aria-pressed={isChecked}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium capitalize transition-colors ${
                              isChecked
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border/60 bg-background text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {action}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border/40 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="rounded-xl gap-2 font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{isEditMode ? 'Saving...' : 'Creating...'}</span>
                </>
              ) : (
                <span>
                  {isEditMode ? 'Save Permissions' : 'Create Administrator'}
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
