import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateUserStatusThunk } from '@/features/users/usersApi'
import { clearSelectedUser } from '@/features/users/usersSlice'
import {
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  FileText,
  User,
  Compass,
  CheckCircle2,
  XCircle,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'

function formatAccountDate(dateValue) {
  if (!dateValue) return '—'
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function UserDetailsModal({ open, onOpenChange, onAdjustCredits }) {
  const dispatch = useDispatch()
  const { selectedUser, loadingDetails, updatingStatusId, lastAdjustment } = useSelector(
    (state) => state.users
  )
  const [copiedId, setCopiedId] = useState(null)

  const handleClose = () => {
    onOpenChange(false)
    dispatch(clearSelectedUser())
  }

  const handleCopyText = (text, label = 'ID') => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleToggleStatus = async () => {
    if (!selectedUser) return
    const nextStatus = !selectedUser.is_blocked
    const resultAction = await dispatch(
      updateUserStatusThunk({ id: selectedUser.id, is_blocked: nextStatus })
    )
    if (updateUserStatusThunk.fulfilled.match(resultAction)) {
      toast.success(
        nextStatus
          ? `User ${selectedUser.email} has been suspended.`
          : `User ${selectedUser.email} has been unblocked.`
      )
    } else {
      toast.error(resultAction.payload || 'Failed to update user status.')
    }
  }

  const isUpdatingThisUser = updatingStatusId === selectedUser?.id
  const avatarInitial = selectedUser?.email?.[0]?.toUpperCase() || 'U'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-2xl sm:max-w-2xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
        {/* Fixed Header */}
        <DialogHeader className="border-b border-border/60 bg-muted/20 px-5 py-3.5 pr-14">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                User Account Details
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                Complete account metadata, credit balances, and bound Vedic birth charts.
              </DialogDescription>
            </div>

            {selectedUser && (
              <Badge
                variant="outline"
                className={`gap-1.5 px-2.5 py-0.5 text-xs font-medium ${
                  selectedUser.is_blocked
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-500'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                }`}
              >
                {selectedUser.is_blocked ? (
                  <>
                    <ShieldAlert className="size-3.5" /> Suspended
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-3.5" /> Active
                  </>
                )}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        {loadingDetails ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 px-6 py-10">
            <Loader2 className="size-7 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading user profile & birth details...</p>
          </div>
        ) : !selectedUser ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            No user information loaded.
          </div>
        ) : (
          <>
            <div className="max-h-[calc(92vh-7.5rem)] space-y-3.5 overflow-y-auto px-5 py-4 [scrollbar-width:thin]">
              {/* Identity & Metadata Card */}
              <div className="rounded-xl border border-border/70 bg-muted/15 p-3.5">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-sm font-bold text-primary">
                      {avatarInitial}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {selectedUser.email}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="truncate font-mono text-[11px] text-muted-foreground">
                          {selectedUser.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(selectedUser.id, 'User ID')}
                          className="inline-flex shrink-0 items-center justify-center rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Copy User ID"
                        >
                          {copiedId === selectedUser.id ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary"
                    >
                      {selectedUser.tier || 'free'} Tier
                    </Badge>
                    <Badge
                      variant="outline"
                      className="px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground"
                    >
                      Role: {selectedUser.role}
                    </Badge>
                  </div>
                </div>

                {/* 3-Column Account Status Strip */}
                <div className="mt-3 grid grid-cols-1 gap-2 border-t border-border/50 pt-3 sm:grid-cols-3">
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-2.5 py-1.5 sm:flex-col sm:items-start sm:justify-center">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Email Verification
                    </span>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium">
                      {selectedUser.is_email_verified ? (
                        <span className="flex items-center gap-1 text-emerald-500">
                          <CheckCircle2 className="size-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <XCircle className="size-3.5" /> Pending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-2.5 py-1.5 sm:flex-col sm:items-start sm:justify-center">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Onboarding Status
                    </span>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium">
                      {selectedUser.onboarding_completed ? (
                        <span className="flex items-center gap-1 text-emerald-500">
                          <CheckCircle2 className="size-3.5" /> Complete
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500">
                          <Clock className="size-3.5" /> Incomplete
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-2.5 py-1.5 sm:flex-col sm:items-start sm:justify-center">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Joined Date
                    </span>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      <span className="truncate">
                        {formatAccountDate(selectedUser.created_at || selectedUser.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2-Column Credit Balances Section */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Question Credits Card */}
                <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 px-3.5 py-2.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Sparkles className="size-3.5 text-primary" />
                      <span>Question Credits</span>
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      credit_balance
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xl font-bold tracking-tight text-foreground">
                      {selectedUser.credit_balance ?? 0}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => onAdjustCredits?.(selectedUser, 'questions')}
                      className="gap-1 border-primary/35 bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      <SlidersHorizontal className="size-3" />
                      <span>Adjust</span>
                    </Button>
                  </div>
                </div>

                {/* Report Credits Card */}
                <div className="flex items-center justify-between gap-3 rounded-xl border border-sky-500/25 bg-sky-500/5 px-3.5 py-2.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <FileText className="size-3.5 text-sky-500" />
                      <span>Report Credits</span>
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      report_credits
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xl font-bold tracking-tight text-foreground">
                      {selectedUser.report_credits ?? 0}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => onAdjustCredits?.(selectedUser, 'reports')}
                      className="gap-1 border-sky-500/35 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20"
                    >
                      <SlidersHorizontal className="size-3" />
                      <span>Adjust</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Recent Credit Adjustment Audit Note (if adjusted during session) */}
              {lastAdjustment && lastAdjustment.userId === selectedUser.id && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                    <span>
                      Last adjusted{' '}
                      <strong>
                        {lastAdjustment.credit_type === 'reports'
                          ? 'Report Credits'
                          : 'Question Credits'}
                      </strong>
                      :{' '}
                      <span className="font-mono font-semibold">
                        {lastAdjustment.previous_balance} → {lastAdjustment.new_balance}
                      </span>
                      {lastAdjustment.reason && (
                        <span className="text-muted-foreground">
                          {' '}
                          • &ldquo;{lastAdjustment.reason}&rdquo;
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    by {lastAdjustment.adjusted_by}
                  </span>
                </div>
              )}

              {/* Bound Birth Details Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Compass className="size-3.5 text-primary" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Bound Birth Details ({selectedUser.birth_details?.length || 0})
                    </h3>
                  </div>
                </div>

                {!selectedUser.birth_details || selectedUser.birth_details.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/15 p-5 text-center text-xs text-muted-foreground">
                    No Vedic birth details bound to this user yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedUser.birth_details.map((bd) => (
                      <div
                        key={bd.id}
                        className="rounded-xl border border-border/70 bg-muted/10 p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <User className="size-3.5" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">
                              {bd.full_name || 'Unnamed Profile'}
                            </span>
                            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] capitalize text-muted-foreground">
                              {bd.gender || 'Unknown'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {bd.is_primary && (
                              <Badge
                                variant="outline"
                                className="border-primary/35 bg-primary/10 text-[10px] text-primary"
                              >
                                Primary Chart
                              </Badge>
                            )}
                            <span className="rounded-md border border-border/60 bg-card px-2 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                              {bd.profile_type || 'self'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2.5 grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
                          <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/50 px-2.5 py-1.5">
                            <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                            <span className="text-muted-foreground">DOB:</span>
                            <strong className="font-medium text-foreground">
                              {bd.date_of_birth || '—'}
                            </strong>
                          </div>

                          <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/50 px-2.5 py-1.5">
                            <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                            <span className="text-muted-foreground">TOB:</span>
                            <strong className="font-medium text-foreground">
                              {bd.time_of_birth || 'Unknown'}
                            </strong>
                            {bd.is_time_unknown && (
                              <span className="ml-auto rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500">
                                Unverified
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/40 bg-card/50 px-2.5 py-1.5 sm:col-span-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                              <span className="text-muted-foreground">Location:</span>
                              <strong className="font-medium text-foreground">
                                {bd.birth_city || '—'}
                              </strong>
                            </div>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              ({bd.latitude}, {bd.longitude}) • TZ: {bd.timezone}
                            </span>
                          </div>
                        </div>

                        {bd.chart_id && (
                          <div className="mt-2 flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
                            <span className="truncate">Chart ID: {bd.chart_id}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(bd.chart_id, 'Chart ID')}
                              className="ml-2 inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] hover:bg-muted hover:text-foreground"
                            >
                              {copiedId === bd.chart_id ? (
                                <Check className="size-2.5 text-emerald-500" />
                              ) : (
                                <Copy className="size-2.5" />
                              )}
                              <span>Copy</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-muted/20 px-5 py-3">
              <Button
                variant={selectedUser.is_blocked ? 'default' : 'destructive'}
                size="sm"
                disabled={isUpdatingThisUser}
                onClick={handleToggleStatus}
                className="gap-1.5"
              >
                {isUpdatingThisUser ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : selectedUser.is_blocked ? (
                  <ShieldCheck className="size-3.5" />
                ) : (
                  <ShieldAlert className="size-3.5" />
                )}
                {selectedUser.is_blocked ? 'Unblock User' : 'Suspend User'}
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
