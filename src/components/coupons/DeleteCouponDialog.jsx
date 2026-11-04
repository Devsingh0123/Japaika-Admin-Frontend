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
import { Badge } from '@/components/ui/badge'
import { deleteCouponThunk } from '@/features/coupons/couponsApi'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteCouponDialog({ open, onOpenChange, coupon }) {
  const dispatch = useDispatch()
  const { deletingId } = useSelector((state) => state.coupons)

  const isDeleting = deletingId === coupon?.id

  const handleClose = () => {
    if (isDeleting) return
    onOpenChange(false)
  }

  const handleDelete = async () => {
    const result = await dispatch(deleteCouponThunk(coupon.id))
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(`Coupon "${coupon.code}" deleted successfully.`)
      handleClose()
    } else {
      toast.error(result.payload)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                Delete Coupon
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                This will soft-delete the coupon code and prevent any future
                redemptions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {coupon && (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                {coupon.code}
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {coupon.used_count || 0} redemptions
              </Badge>
            </div>
            {coupon.description && (
              <p className="text-muted-foreground leading-relaxed">
                {coupon.description}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isDeleting}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-xl gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Coupon'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
