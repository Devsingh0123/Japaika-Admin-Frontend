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
import { deleteFaqThunk } from '@/features/faqs/faqsApi'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteFaqDialog({ open, onOpenChange, faq }) {
  const dispatch = useDispatch()
  const { deletingId } = useSelector((state) => state.faqs)

  const isDeleting = deletingId === faq?.id

  const handleClose = () => {
    if (isDeleting) return
    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (!faq?.id) return

    const result = await dispatch(deleteFaqThunk(faq.id))
    if (deleteFaqThunk.fulfilled.match(result)) {
      toast.success('FAQ deleted successfully.')
      handleClose()
    } else {
      toast.error(result.payload || 'Failed to delete FAQ.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                Delete FAQ Entry
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                This action will permanently remove this FAQ from the help
                center.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {faq && (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant="outline"
                className="text-[10px] font-mono uppercase tracking-wider px-2 py-0"
              >
                {faq.category || 'general'}
              </Badge>
              <span className="font-mono text-[11px] text-muted-foreground">
                Order #{faq.sort_order ?? 1}
              </span>
            </div>
            <div className="font-semibold text-foreground leading-snug">
              {faq.question}
            </div>
            <p className="text-muted-foreground line-clamp-2 leading-relaxed">
              {faq.answer}
            </p>
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
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                Deleting...
              </>
            ) : (
              'Delete FAQ'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
