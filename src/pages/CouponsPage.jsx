import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchCouponsThunk,
  toggleCouponStatusThunk,
} from '@/features/coupons/couponsApi'
import { fetchPacksThunk } from '@/features/packs/packsApi'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateCouponModal } from '@/components/coupons/CreateCouponModal'
import { DeleteCouponDialog } from '@/components/coupons/DeleteCouponDialog'
import { parseArray } from '@/lib/constants'
import {
  Tag,
  Plus,
  Search,
  RefreshCw,
  Copy,
  Check,
  Percent,
  IndianRupee,
  Gift,
  CheckCircle2,
  XCircle,
  Sparkles,
  Filter,
  Edit2,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

const STATUS_FILTERS = [
  { label: 'All Coupons', value: 'all' },
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
]

function formatDiscount(type, value) {
  const val = Number(value)
  if (type === 'percentage') return `${val}% OFF`
  if (type === 'flat') return `₹${val.toFixed(2)} OFF`
  return `Special Deal (${val})`
}

function formatExpiry(dateStr) {
  if (!dateStr) return 'Never'
  const expDate = new Date(dateStr)
  const isPast = expDate.getTime() < Date.now()
  return (
    <span className={isPast ? 'text-rose-500 font-medium' : ''}>
      {expDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}
      {isPast && ' (Expired)'}
    </span>
  )
}

export function CouponsPage() {
  const dispatch = useDispatch()
  const { coupons, loadingList, togglingId } = useSelector(
    (state) => state.coupons
  )
  const { packs } = useSelector((state) => state.packs)

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [couponToEdit, setCouponToEdit] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [couponToDelete, setCouponToDelete] = useState(null)
  const [copiedCode, setCopiedCode] = useState(null)

  const handleOpenCreate = () => {
    setCouponToEdit(null)
    setCreateModalOpen(true)
  }

  const handleOpenEdit = (coupon) => {
    setCouponToEdit(coupon)
    setCreateModalOpen(true)
  }

  const handleOpenDelete = (coupon) => {
    setCouponToDelete(coupon)
    setDeleteDialogOpen(true)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const loadCoupons = useCallback(() => {
    dispatch(
      fetchCouponsThunk({
        search: debouncedSearch,
        is_active: statusFilter,
      })
    )
    dispatch(fetchPacksThunk())
  }, [dispatch, debouncedSearch, statusFilter])

  useEffect(() => {
    loadCoupons()
  }, [loadCoupons])

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(`Coupon code "${code}" copied`)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleToggleStatus = async (coupon) => {
    const nextStatus = !coupon.is_active
    const result = await dispatch(
      toggleCouponStatusThunk({ id: coupon.id, is_active: nextStatus })
    )

    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(
        `Coupon "${coupon.code}" ${nextStatus ? 'activated' : 'deactivated'}.`
      )
    } else {
      toast.error(result.payload)
    }
  }

  const totalCoupons = coupons.length
  const activeCount = coupons.filter((c) => c.is_active).length
  const inactiveCount = totalCoupons - activeCount
  const totalRedemptions = coupons.reduce(
    (sum, c) => sum + (Number(c.used_count) || 0),
    0
  )

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Tag className="size-7 text-primary" />
            Coupons & Discounts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create promotional voucher codes, configure discounts, and manage active campaign vouchers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCoupons}
            disabled={loadingList}
            className="gap-2 h-9.5 px-4 rounded-xl border-border/70 hover:bg-muted font-medium"
          >
            <RefreshCw
              className={`size-3.5 ${loadingList ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="gap-2 h-9.5 px-4 rounded-xl shadow-xs font-semibold"
          >
            <Plus className="size-4" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Total Coupons</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Tag className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
            {totalCoupons}
          </p>
          <p className="text-xs text-muted-foreground">Configured vouchers</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Active Coupons</span>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {activeCount}
          </p>
          <p className="text-xs text-muted-foreground">Ready for redemption</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Disabled / Expired</span>
            <div className="size-8 rounded-lg bg-muted/60 text-muted-foreground flex items-center justify-center">
              <XCircle className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-muted-foreground font-mono">
            {inactiveCount}
          </p>
          <p className="text-xs text-muted-foreground">Inactive campaigns</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Total Redemptions</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
            {totalRedemptions}
          </p>
          <p className="text-xs text-muted-foreground">Used across all orders</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search coupon code (e.g. DIWALI50)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-background/80 border border-border/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground uppercase"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1.5 font-medium">
            <Filter className="size-3.5" />
            Status:
          </span>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Data Table */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/60 bg-muted/20">
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Coupon Code
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Discount
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Description
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Applies To
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Redemptions
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Expires
              </TableHead>
              <TableHead className="text-center font-semibold text-xs text-foreground uppercase tracking-wider w-[120px]">
                Status / Toggle
              </TableHead>
              <TableHead className="text-right font-semibold text-xs text-foreground uppercase tracking-wider w-[110px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingList ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton className="h-6 w-24 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-10 mx-auto rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-18 ml-auto rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
                    <Tag className="w-8 h-8 opacity-40" />
                    <p className="text-sm font-medium">No coupons found.</p>
                    <p className="text-xs">
                      Click "Create Coupon" above to launch a new promotional offer.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => {
                const isToggling = togglingId === coupon.id
                const maxUsesText = coupon.max_uses || '∞'
                const usagePercent = coupon.max_uses
                  ? Math.min(
                      100,
                      Math.round(((coupon.used_count || 0) / coupon.max_uses) * 100)
                    )
                  : 0

                return (
                  <TableRow
                    key={coupon.id}
                    className="hover:bg-muted/30 transition-colors border-border/40 group"
                  >
                    {/* Code */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-foreground text-muted-foreground transition-opacity rounded"
                          title="Copy Code"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Discount Value */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
                        {coupon.discount_type === 'percentage' ? (
                          <Percent className="w-3.5 h-3.5 text-emerald-500" />
                        ) : coupon.discount_type === 'flat' ? (
                          <IndianRupee className="w-3.5 h-3.5 text-sky-500" />
                        ) : (
                          <Gift className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span>
                          {formatDiscount(coupon.discount_type, coupon.discount_value)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Description */}
                    <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">
                      {coupon.description || '—'}
                    </TableCell>

                    {/* Applies To */}
                    <TableCell>
                      {(() => {
                        const codes = parseArray(coupon.applicable_products)
                        return codes.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {codes.map((code) => {
                              const pack = packs.find((p) => p.code === code)
                              return (
                                <Badge
                                  key={code}
                                  variant="outline"
                                  className="text-[10px] font-mono px-1.5 py-0"
                                >
                                  {pack ? `${pack.name} (${pack.credits}Q)` : code}
                                </Badge>
                              )
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium">
                            All Packs
                          </span>
                        )
                      })()}
                    </TableCell>

                    {/* Redemptions */}
                    <TableCell>
                      <div className="flex flex-col gap-1 min-w-[90px]">
                        <span className="text-xs font-mono text-foreground font-medium">
                          {coupon.used_count || 0} / {maxUsesText}
                        </span>
                        {coupon.max_uses && (
                          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Expires At */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatExpiry(coupon.expires_at)}
                    </TableCell>

                    {/* Status & Toggle Switch */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={Boolean(coupon.is_active)}
                          onCheckedChange={() => handleToggleStatus(coupon)}
                          disabled={isToggling}
                          aria-label={`Toggle active status for ${coupon.code}`}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                        <span
                          className={`text-xs font-medium w-12 text-left ${
                            coupon.is_active
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {coupon.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Edit & Delete Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(coupon)}
                          className="size-8 rounded-lg border-border/70 text-muted-foreground hover:text-primary hover:border-primary/40"
                          title="Edit coupon"
                          aria-label={`Edit coupon ${coupon.code}`}
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleOpenDelete(coupon)}
                          className="size-8 rounded-lg border-border/70 text-muted-foreground hover:text-destructive hover:border-destructive/40"
                          title="Delete coupon"
                          aria-label={`Delete coupon ${coupon.code}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Coupon Modal Form */}
      <CreateCouponModal
        key={couponToEdit?.id || `create-${createModalOpen}`}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        couponToEdit={couponToEdit}
      />

      {/* Delete Coupon Confirmation Dialog */}
      <DeleteCouponDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        coupon={couponToDelete}
      />
    </div>
  )
}
export default CouponsPage
