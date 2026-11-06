import { Plus, Trash2, Sparkles, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { REMEDY_TYPES } from '@/lib/constants'

export function RemediesBuilder({ remedies = [], onChange }) {
  const handleAddRemedy = () => {
    const newRemedy = {
      type: 'mantra',
      title: '',
      description: '',
    }
    onChange([...remedies, newRemedy])
  }

  const handleUpdateRemedy = (index, field, value) => {
    const updated = remedies.map((r, i) => {
      if (i === index) {
        return { ...r, [field]: value }
      }
      return r
    })
    onChange(updated)
  }

  const handleRemoveRemedy = (index) => {
    onChange(remedies.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            Structured Vedic Remedies ({remedies.length})
          </Label>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Add structured remedial actions (mantras, rituals, gemstones, charity, vrat).
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRemedy}
          className="gap-1.5 text-xs h-8 rounded-xl border-border/70 hover:bg-muted font-medium"
        >
          <Plus className="size-3.5" />
          Add Remedy
        </Button>
      </div>

      {remedies.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-border/70 bg-muted/10 text-center space-y-2">
          <BookOpen className="size-6 text-muted-foreground/40 mx-auto" />
          <p className="text-xs text-muted-foreground">
            No remedies added yet. Click &quot;Add Remedy&quot; to configure classical mantras, pujas, and lifestyle remedies.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {remedies.map((remedy, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-3 relative group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="size-5 rounded-md bg-primary/10 text-primary font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <select
                    value={remedy.type || 'mantra'}
                    onChange={(e) =>
                      handleUpdateRemedy(idx, 'type', e.target.value)
                    }
                    className="text-xs rounded-lg bg-background border border-border/70 px-2.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  >
                    {REMEDY_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleRemoveRemedy(idx)}
                  className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Remove Remedy"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Input
                  value={remedy.title || ''}
                  onChange={(e) =>
                    handleUpdateRemedy(idx, 'title', e.target.value)
                  }
                  placeholder="Remedy Title (e.g., Hanuman Chalisa Daily, Kumbh Vivah)"
                  className="text-xs h-8 font-medium bg-background"
                  required
                />

                <textarea
                  value={remedy.description || ''}
                  onChange={(e) =>
                    handleUpdateRemedy(idx, 'description', e.target.value)
                  }
                  placeholder="Instructions, procedure, timings, or sacred mantras..."
                  rows={2}
                  className="w-full text-xs rounded-lg bg-background border border-border/70 p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none placeholder:text-muted-foreground/60"
                  required
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
