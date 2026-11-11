import { useState, useEffect, useCallback } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { createPackThunk, updatePackThunk } from '@/features/packs/packsApi'
import { clearPacksError } from '@/features/packs/packsSlice'
import { fetchCouponsThunk } from '@/features/coupons/couponsApi'
import {
  Package,
  Sparkles,
  Loader2,
  AlertCircle,
  Coins,
  Shield,
  ArrowUpDown,
  Tag,
  Percent,
} from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT_PRICES = {
  INR: { basePrice: '1399' },
  USD: { basePrice: '14.99' },
}

const CURRENCIES = [
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', step: '1', min: '1' },
  { code: 'USD', label: 'US Dollar', symbol: '$', step: '0.01', min: '0.01' },
]

const TIERS = [
  { id: 'silver', label: 'Silver', color: 'border-slate-400/40 text-slate-700 dark:text-slate-300 bg-slate-500/10' },
  { id: 'gold', label: 'Gold', color: 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10' },
  { id: 'diamond', label: 'Diamond', color: 'border-sky-500/40 text-sky-600 dark:text-sky-400 bg-sky-500/10' },
  { id: 'custom', label: 'Custom', color: 'border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/10' },
]

function parsePrices(prices) {
  if (!prices) return {}
  if (typeof prices === 'object') return prices
  if (typeof prices === 'string') {
    try {
      return JSON.parse(prices)
    } catch {
      return {}
    }
  }
  return {}
}

export function PackModal({ open, onOpenChange, packToEdit = null }) {
  const dispatch = useDispatch()
  const { isSubmitting, error } = useSelector((state) => state.packs)
  const { coupons } = useSelector((state) => state.coupons)

  const isEdit = Boolean(packToEdit)

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [tier, setTier] = useState('silver')
  const [credits, setCredits] = useState('5')
  const [sortOrder, setSortOrder] = useState('1')
  const [isActive, setIsActive] = useState(true)
  const [defaultCouponId, setDefaultCouponId] = useState('')

  // Multi-Currency Prices state: { INR: { basePrice: '' }, USD: { basePrice: '' } }
  const [prices, setPrices] = useState({
    INR: { basePrice: '' },
    USD: { basePrice: '' },
  })

  const [validationError, setValidationError] = useState('')

  // Load active coupons if not already present
  useEffect(() => {
    if (open && coupons.length === 0) {
      dispatch(fetchCouponsThunk({ is_active: 'true' }))
    }
  }, [open, coupons.length, dispatch])

  const resetForm = useCallback(() => {
    setName('')
    setCode('')
    setTitle('')
    setTier('silver')
    setCredits('5')
    setSortOrder('1')
    setIsActive(true)
    setDefaultCouponId('')
    setPrices(DEFAULT_PRICES)
    setValidationError('')
    dispatch(clearPacksError())
  }, [dispatch])

  useEffect(() => {
    if (packToEdit) {
      setName(packToEdit.name || '')
      setCode(packToEdit.code || '')
      setTitle(packToEdit.title || '')
      setTier(packToEdit.tier?.toLowerCase() || 'silver')
      setCredits(String(packToEdit.credits ?? '5'))
      setSortOrder(String(packToEdit.sort_order ?? '1'))
      setIsActive(packToEdit.is_active !== false)
      setDefaultCouponId(packToEdit.default_coupon_id || '')

      const parsed = parsePrices(packToEdit.prices)
      const inrBase =
        parsed.INR?.basePrice !== undefined
          ? parsed.INR.basePrice
          : parsed.INR?.originalPrice !== undefined
          ? parsed.INR.originalPrice
          : parsed.INR?.offerPrice ?? ''
      const usdBase =
        parsed.USD?.basePrice !== undefined
          ? parsed.USD.basePrice
          : parsed.USD?.originalPrice !== undefined
          ? parsed.USD.originalPrice
          : parsed.USD?.offerPrice ?? ''

      setPrices({
        INR: { basePrice: inrBase !== '' ? String(inrBase) : '' },
        USD: { basePrice: usdBase !== '' ? String(usdBase) : '' },
      })
    } else {
      resetForm()
    }
  }, [packToEdit, open, resetForm])

  const handlePriceChange = (currCode, value) => {
    setPrices((prev) => ({
      ...prev,
      [currCode]: {
        basePrice: value,
      },
    }))
  }

  const handleClose = () => {
    if (isSubmitting) return
    onOpenChange(false)
    resetForm()
  }

  // Find linked coupon for live computation
  const selectedCoupon = coupons.find((c) => c.id === defaultCouponId)

  // Compute live effective price calculation for admin preview
  const livePreview = (() => {
    if (!selectedCoupon) return null
    const val = Number(selectedCoupon.discount_value) || 0
    const inrBase = parseFloat(prices.INR?.basePrice) || 0
    const usdBase = parseFloat(prices.USD?.basePrice) || 0

    let inrDiscount = 0
    let usdDiscount = 0

    if (selectedCoupon.discount_type === 'percentage') {
      inrDiscount = Math.round(inrBase * (val / 100) * 100) / 100
      usdDiscount = Math.round(usdBase * (val / 100) * 100) / 100
    } else if (selectedCoupon.discount_type === 'flat') {
      inrDiscount = Math.min(inrBase, val)
      if (usdBase > 0 && inrBase > 0) {
        const ratio = Math.min(1, val / inrBase)
        usdDiscount = Math.round(usdBase * ratio * 100) / 100
      } else {
        usdDiscount = Math.min(usdBase, val)
      }
    }

    return {
      couponCode: selectedCoupon.code,
      discountLabel:
        selectedCoupon.discount_type === 'percentage'
          ? `${val}% OFF`
          : `₹${val} OFF`,
      INR: {
        basePrice: inrBase,
        discountAmount: inrDiscount,
        effectivePrice: Math.max(0, Math.round((inrBase - inrDiscount) * 100) / 100),
      },
      USD: {
        basePrice: usdBase,
        discountAmount: usdDiscount,
        effectivePrice: Math.max(0, Math.round((usdBase - usdDiscount) * 100) / 100),
      },
    }
  })()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    const cleanName = name.trim()
    if (!cleanName) {
      setValidationError('Pack name is required.')
      return
    }

    const numCredits = parseInt(credits, 10)
    if (isNaN(numCredits) || numCredits <= 0) {
      setValidationError('Credits must be a positive integer greater than 0.')
      return
    }

    // Build prices object with single basePrice validation
    const formattedPrices = {}
    for (const curr of CURRENCIES) {
      const base = parseFloat(prices[curr.code]?.basePrice)

      if (isNaN(base) || base <= 0) {
        setValidationError(`Base price for ${curr.code} must be greater than 0.`)
        return
      }

      formattedPrices[curr.code] = {
        basePrice: base,
      }
    }

    const payload = {
      name: cleanName,
      credits: numCredits,
      tier,
      sort_order: parseInt(sortOrder, 10) || 1,
      is_active: isActive,
      prices: formattedPrices,
      default_coupon_id: defaultCouponId || null,
    }

    if (code.trim()) {
      payload.code = code.trim().toLowerCase().replace(/\s+/g, '_')
    }
    if (title.trim()) {
      payload.title = title.trim()
    } else {
      payload.title = `${cleanName} Pack (${numCredits} Questions)`
    }

    let result
    if (isEdit) {
      result = await dispatch(updatePackThunk({ id: packToEdit.id, packData: payload }))
      if (updatePackThunk.fulfilled.match(result)) {
        toast.success(`Question Pack "${cleanName}" updated successfully!`)
        handleClose()
      } else {
        toast.error(result.payload || 'Failed to update question pack.')
      }
    } else {
      result = await dispatch(createPackThunk(payload))
      if (createPackThunk.fulfilled.match(result)) {
        toast.success(`Question Pack "${cleanName}" created successfully!`)
        handleClose()
      } else {
        toast.error(result.payload || 'Failed to create question pack.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl w-full max-h-[92vh] overflow-y-auto p-0 gap-0 border-border/60 shadow-2xl bg-card">
        {/* Header */}
        <div className="p-6 border-b border-border/40 bg-muted/20">
          <DialogHeader className="gap-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold border border-primary/20">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  {isEdit ? 'Edit Question Pack' : 'Create Question Pack'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Configure question credits, tier access, and multi-currency pricing.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {(validationError || error) && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}

          {/* Basic Info: Name, Credits, Tier */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pack-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pack Name *
                </Label>
                <Input
                  id="pack-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (!isEdit && !code) {
                      setCode(`pack_${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${credits}`)
                    }
                  }}
                  placeholder="e.g. Starter Boost or Gold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pack-credits" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  Question Credits Granted *
                </Label>
                <Input
                  id="pack-credits"
                  type="number"
                  min="1"
                  step="1"
                  value={credits}
                  onChange={(e) => {
                    setCredits(e.target.value)
                    if (!isEdit && name) {
                      setCode(`pack_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${e.target.value}`)
                    }
                  }}
                  placeholder="e.g. 5"
                  className="font-mono font-semibold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tier Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  Tier Access *
                </Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {TIERS.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setTier(t.id)}
                      className={`py-2 px-1 text-center rounded-lg text-xs font-medium border transition-all ${
                        tier === t.id
                          ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                          : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order & Code */}
              <div className="space-y-1.5">
                <Label htmlFor="sort-order" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
                  Display Sort Order
                </Label>
                <Input
                  id="sort-order"
                  type="number"
                  min="1"
                  step="1"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  placeholder="1"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pack-code" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pack Code (Identifier)
                </Label>
                <Input
                  id="pack-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. pack_starter_5"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pack-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Custom Display Title
                </Label>
                <Input
                  id="pack-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Starter Boost Pack (5 Questions)"
                />
              </div>
            </div>
          </div>

          {/* Multi-Currency Pricing Matrix (Base Price) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" />
                Multi-Currency Base Price *
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Set base catalogue selling price for INR and USD
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CURRENCIES.map((curr) => {
                const baseVal = prices[curr.code]?.basePrice || ''

                return (
                  <div
                    key={curr.code}
                    className="p-3.5 rounded-xl border border-border/60 bg-muted/15 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs bg-background border border-border/60 px-2 py-0.5 rounded">
                          {curr.code} ({curr.symbol})
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {curr.label}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-primary uppercase font-semibold">
                        Base Price *
                      </span>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary text-xs font-mono font-bold">
                          {curr.symbol}
                        </span>
                        <Input
                          type="number"
                          step={curr.step}
                          min={curr.min}
                          value={baseVal}
                          onChange={(e) =>
                            handlePriceChange(curr.code, e.target.value)
                          }
                          placeholder="0"
                          className="pl-6 font-mono text-xs h-9 font-semibold border-border/70 focus:border-primary"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Auto-Applied Default Coupon & Live Offer Telemetry */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="pack-default-coupon"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
                >
                  <Percent className="size-3.5 text-primary" />
                  Auto-Applied Offer Coupon
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Optional discount applied at checkout
                </span>
              </div>

              <select
                id="pack-default-coupon"
                value={defaultCouponId}
                onChange={(e) => setDefaultCouponId(e.target.value)}
                className="w-full text-xs rounded-xl bg-background border border-border/70 px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">
                  None (Standard Price — No Auto-Applied Coupon)
                </option>
                {coupons
                  .filter((c) => c.is_active)
                  .map((c) => {
                    const discountText =
                      c.discount_type === 'percentage'
                        ? `${Number(c.discount_value)}% OFF`
                        : `₹${Number(c.discount_value).toFixed(2)} OFF`
                    return (
                      <option key={c.id} value={c.id}>
                        {c.code} — {discountText} ({c.description || 'Promotional offer'})
                      </option>
                    )
                  })}
              </select>
            </div>

            {/* Live Calculation Preview Banner */}
            {livePreview ? (
              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px] font-mono font-semibold"
                    >
                      {livePreview.couponCode}
                    </Badge>
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      Auto-Applied ({livePreview.discountLabel})
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Live Checkout Preview
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-2 rounded-md bg-background/60 border border-border/50">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      India (INR)
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5 font-mono">
                      <span className="font-bold text-foreground text-sm">
                        ₹{livePreview.INR.effectivePrice.toLocaleString('en-IN')}
                      </span>
                      {livePreview.INR.discountAmount > 0 && (
                        <span className="text-muted-foreground line-through text-[11px]">
                          ₹{livePreview.INR.basePrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    {livePreview.INR.discountAmount > 0 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Save ₹{livePreview.INR.discountAmount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="p-2 rounded-md bg-background/60 border border-border/50">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Global (USD)
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5 font-mono">
                      <span className="font-bold text-foreground text-sm">
                        ${livePreview.USD.effectivePrice.toFixed(2)}
                      </span>
                      {livePreview.USD.discountAmount > 0 && (
                        <span className="text-muted-foreground line-through text-[11px]">
                          ${livePreview.USD.basePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {livePreview.USD.discountAmount > 0 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Save ${livePreview.USD.discountAmount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground italic">
                No offer coupon linked. Customers will purchase this pack at the full base price.
              </p>
            )}
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-foreground">
                Active & Available for Purchase
              </Label>
              <p className="text-xs text-muted-foreground">
                If enabled, users can select and buy this pack in storefront checkout.
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          {/* Modal Footer Buttons */}
          <DialogFooter className="pt-3 border-t border-border/40 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {isEdit ? 'Save Changes' : 'Create Pack'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
