import { useState, useRef } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { createFaqThunk, updateFaqThunk } from '@/features/faqs/faqsApi'
import { clearFaqsError } from '@/features/faqs/faqsSlice'
import {
  HelpCircle,
  Loader2,
  AlertCircle,
  Sparkles,
  Tag,
  ArrowUpDown,
} from 'lucide-react'
import { toast } from 'sonner'

const PRESET_CATEGORIES = [
  { id: 'general', label: 'General' },
  { id: 'billing', label: 'Billing & Payments' },
  { id: 'reports', label: 'Reports & Kundli' },
  { id: 'horoscope', label: 'Horoscope & Charts' },
  { id: 'account', label: 'Account & Privacy' },
]

export function FaqModal({
  open,
  onOpenChange,
  faqToEdit = null,
  defaultSortOrder = 1,
}) {
  const dispatch = useDispatch()
  const { submitting, error } = useSelector((state) => state.faqs)
  const errorSummaryRef = useRef(null)

  const isEditMode = Boolean(faqToEdit?.id)

  const [question, setQuestion] = useState(() => faqToEdit?.question || '')
  const [answer, setAnswer] = useState(() => faqToEdit?.answer || '')
  const [category, setCategory] = useState(
    () => faqToEdit?.category || 'general'
  )
  const [sortOrder, setSortOrder] = useState(() =>
    faqToEdit?.sort_order !== undefined && faqToEdit?.sort_order !== null
      ? String(faqToEdit.sort_order)
      : String(defaultSortOrder)
  )
  const [isActive, setIsActive] = useState(() =>
    faqToEdit?.is_active !== undefined ? Boolean(faqToEdit.is_active) : true
  )

  const [touched, setTouched] = useState({ question: false, answer: false })
  const [validationError, setValidationError] = useState('')

  const questionError =
    touched.question && !question.trim()
      ? 'Please enter the FAQ question.'
      : ''
  const answerError =
    touched.answer && !answer.trim()
      ? 'Please provide a clear answer for this FAQ.'
      : ''

  const handleClose = () => {
    if (submitting) return
    setValidationError('')
    dispatch(clearFaqsError())
    onOpenChange(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ question: true, answer: true })
    setValidationError('')

    const cleanQuestion = question.trim()
    const cleanAnswer = answer.trim()
    const cleanCategory = (category || 'general')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')

    if (!cleanQuestion) {
      setValidationError('Question is required before saving.')
      setTimeout(() => errorSummaryRef.current?.focus(), 0)
      return
    }

    if (!cleanAnswer) {
      setValidationError('Answer is required before saving.')
      setTimeout(() => errorSummaryRef.current?.focus(), 0)
      return
    }

    const parsedSort = Number.parseInt(sortOrder, 10)
    const payload = {
      question: cleanQuestion,
      answer: cleanAnswer,
      category: cleanCategory || 'general',
      sort_order: Number.isNaN(parsedSort) ? 1 : Math.max(0, parsedSort),
      is_active: Boolean(isActive),
    }

    if (isEditMode) {
      const result = await dispatch(
        updateFaqThunk({ id: faqToEdit.id, payload })
      )
      if (updateFaqThunk.fulfilled.match(result)) {
        toast.success('FAQ updated successfully.')
        handleClose()
      } else {
        toast.error(result.payload || 'Failed to update FAQ.')
      }
    } else {
      const result = await dispatch(createFaqThunk(payload))
      if (createFaqThunk.fulfilled.match(result)) {
        toast.success('New FAQ created successfully.')
        handleClose()
      } else {
        toast.error(result.payload || 'Failed to create FAQ.')
      }
    }
  }

  const wordCount = answer.trim()
    ? answer.trim().split(/\s+/).filter(Boolean).length
    : 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl w-full max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/60 shadow-2xl bg-card">
        {/* Modal Header */}
        <div className="p-6 border-b border-border/40 bg-muted/20">
          <DialogHeader className="gap-1.5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold border border-primary/20 shrink-0">
                <HelpCircle className="size-5" aria-hidden="true" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  {isEditMode ? 'Edit FAQ Entry' : 'Create New FAQ'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isEditMode
                    ? 'Update the question, answer, category grouping, or display priority.'
                    : 'Add a new question and answer to the public Japaika help center.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
          {(validationError || error) && (
            <div
              ref={errorSummaryRef}
              role="alert"
              tabIndex={-1}
              className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5 focus:outline-none focus:ring-2 focus:ring-destructive/40"
            >
              <AlertCircle
                className="size-4 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-0.5">
                <p className="font-semibold">Unable to save FAQ</p>
                <p>{validationError || error}</p>
              </div>
            </div>
          )}

          {/* Question Field */}
          <div className="space-y-1.5">
            <Label
              htmlFor="faq-question"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Question <span className="text-destructive">*</span>
            </Label>
            <Input
              id="faq-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, question: true }))}
              placeholder="e.g. How accurate are the Vedic astrology calculations?"
              aria-invalid={Boolean(questionError)}
              aria-describedby={
                questionError ? 'faq-question-error' : undefined
              }
              className="h-10 rounded-xl"
              autoFocus
            />
            {questionError && (
              <p
                id="faq-question-error"
                className="text-xs font-medium text-destructive mt-1"
              >
                {questionError}
              </p>
            )}
          </div>

          {/* Answer Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="faq-answer"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Answer <span className="text-destructive">*</span>
              </Label>
              <span className="text-[11px] font-mono text-muted-foreground">
                {wordCount} {wordCount === 1 ? 'word' : 'words'} •{' '}
                {answer.length} chars
              </span>
            </div>
            <textarea
              id="faq-answer"
              rows={5}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, answer: true }))}
              placeholder="Provide a clear, helpful explanation (e.g. All charts are calculated using Japaika's  algorithmic calculations and Lahiri Ayanamsa for sub-arcsecond planetary precision.)"
              aria-invalid={Boolean(answerError)}
              aria-describedby={answerError ? 'faq-answer-error' : undefined}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 resize-y"
            />
            {answerError && (
              <p
                id="faq-answer-error"
                className="text-xs font-medium text-destructive mt-1"
              >
                {answerError}
              </p>
            )}
          </div>

          {/* Category Selection & Custom Input */}
          <div className="space-y-2">
            <Label
              htmlFor="faq-category"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
            >
              <Tag className="size-3.5 text-primary" aria-hidden="true" />
              Category Grouping
            </Label>

            {/* Quick-Select Preset Chips */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_CATEGORIES.map((preset) => {
                const isSelected =
                  category.trim().toLowerCase() === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setCategory(preset.id)}
                    aria-pressed={isSelected}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-2xs font-semibold'
                        : 'bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <Label
                  htmlFor="faq-category"
                  className="text-[11px] text-muted-foreground"
                >
                  Category Slug (or custom)
                </Label>
                <Input
                  id="faq-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="general"
                  className="h-9 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="faq-sort-order"
                  className="text-[11px] text-muted-foreground flex items-center gap-1"
                >
                  <ArrowUpDown className="size-3" aria-hidden="true" />
                  Display Sort Order
                </Label>
                <Input
                  id="faq-sort-order"
                  type="number"
                  min="0"
                  step="1"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  placeholder="1"
                  className="h-9 rounded-xl font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Visibility Switch */}
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3.5">
            <div className="space-y-0.5 pr-4">
              <Label
                htmlFor="faq-active-switch"
                className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles
                  className="size-3.5 text-primary"
                  aria-hidden="true"
                />
                Publish Immediately (Active)
              </Label>
              <p className="text-[11px] text-muted-foreground">
                When enabled, this FAQ is visible to users on the public Japaika
                platform.
              </p>
            </div>
            <Switch
              id="faq-active-switch"
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          {/* Modal Footer */}
          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-xl gap-2 font-semibold shadow-xs"
            >
              {submitting ? (
                <>
                  <Loader2
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                  {isEditMode ? 'Saving Changes...' : 'Creating FAQ...'}
                </>
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Create FAQ'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
