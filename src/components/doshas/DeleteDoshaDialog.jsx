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
import { deleteDoshaThunk } from '@/features/doshas/doshasApi'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteDoshaDialog({ open, onOpenChange, dosha, onSuccess }) {
  const dispatch = useDispatch()
  const { deletingId } = useSelector((state) => state.doshas)

  const isDeleting = deletingId === dosha?.id

  const handleClose = () => {
    if (isDeleting) return
    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (!dosha) return

    const result = await dispatch(deleteDoshaThunk(dosha.id))
    if (deleteDoshaThunk.fulfilled.match(result)) {
      toast.success(`Dosha "${dosha.name}" deleted successfully.`)
      handleClose()
      if (onSuccess) onSuccess()
    } else {
      toast.error(result.payload || 'Failed to delete Vedic Dosha.')
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
                Delete Vedic Dosha
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                This action will soft-delete the Dosha entry and archive it.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {dosha && (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1.5 text-xs">
            <div className="font-semibold text-foreground">
              {dosha.name} {dosha.sanskrit_name ? `(${dosha.sanskrit_name})` : ''}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground truncate">
              Slug: {dosha.slug}
            </div>
            {dosha.title && (
              <div className="text-[11px] text-muted-foreground line-clamp-2">
                {dosha.title}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-4 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2 rounded-xl text-xs font-semibold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              'Confirm Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
