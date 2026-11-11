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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { adjustUserCreditsThunk } from '@/features/users/usersApi'
import {
  Sparkles,
  FileText,
  Plus,
  Minus,
  Equal,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'

const ADD_DEDUCT_PRESETS = [1, 2, 5, 10]
const SET_PRESETS = [0, 1, 2, 5, 10]

function AdjustCreditsForm({ user, initialCreditType = 'questions', onClose }) {
  const dispatch = useDispatch()
  const { adjustingCredits } = useSelector((state) => state.users)

  const [creditType, setCreditType] = useState(
    initialCreditType === 'reports' ? 'reports' : 'questions'
  )
  const [action, setAction] = useState('add') // 'add' | 'deduct' | 'set'
  const [amount, setAmount] = useState('1')
  const [reason, setReason] = useState('')

  const isQuestionType = creditType === 'questions'
  const creditLabel = isQuestionType ? 'Question Credits' : 'Report Credits'
  const creditSingular = isQuestionType ? 'Question Credit' : 'Report Credit'
  const dbFieldName = isQuestionType ? 'credit_balance' : 'report_credits'

  const currentQuestions = Number(user.credit_balance ?? 0)
  const currentReports = Number(user.report_credits ?? 0)
  const currentVal = isQuestionType ? currentQuestions : currentReports

  const rawParsed = parseInt(amount, 10)
  const minAllowed = action === 'set' ? 0 : 1
  const parsedAmount = isNaN(rawParsed) ? 0 : Math.max(0, rawParsed)

  let calculatedNewVal = currentVal
  if (action === 'add') {
    calculatedNewVal = currentVal + parsedAmount
  } else if (action === 'deduct') {
    calculatedNewVal = Math.max(0, currentVal - parsedAmount)
  } else if (action === 'set') {
    calculatedNewVal = parsedAmount
  }

  const handleActionChange = (nextAction) => {
    setAction(nextAction)
    if (nextAction === 'set') {
      setAmount(String(currentVal))
    } else if (parsedAmount < 1) {
      setAmount('1')
    }
  }

  const handleCreditTypeChange = (nextType) => {
    setCreditType(nextType)
    if (action === 'set') {
      const targetVal = nextType === 'questions' ? currentQuestions : currentReports
      setAmount(String(targetVal))
    }
  }

  const getAmountLabel = () => {
    if (action === 'add') return `${creditLabel} to Add (+)`
    if (action === 'deduct') return `${creditLabel} to Deduct (-)`
    return `New ${creditLabel} Balance (=)`
  }

  const getSubmitButtonLabel = () => {
    const unit = parsedAmount === 1 ? creditSingular : creditLabel
    if (action === 'add') return `Add ${parsedAmount} ${unit}`
    if (action === 'deduct') return `Deduct ${parsedAmount} ${unit}`
    return `Set ${creditLabel} to ${parsedAmount}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isNaN(rawParsed) || rawParsed < minAllowed) {
      toast.error(
        action === 'set'
          ? `${creditLabel} balance must be 0 or greater.`
          : `Please enter at least 1 ${creditSingular.toLowerCase()} to ${action}.`
      )
      return
    }

    try {
      await dispatch(
        adjustUserCreditsThunk({
          id: user.id,
          credit_type: creditType,
          action,
          amount: parsedAmount,
          reason: reason.trim() || undefined,
        })
      ).unwrap()

      toast.success(
        `${creditLabel} updated from ${currentVal} to ${calculatedNewVal} for ${user.email}.`
      )
      onClose()
    } catch (err) {
      toast.error(err || `Failed to adjust ${creditLabel.toLowerCase()}.`)
    }
  }

  const presets = action === 'set' ? SET_PRESETS : ADD_DEDUCT_PRESETS

  return (
    <form onSubmit={handleSubmit}>
      {/* Fixed Header */}
      <DialogHeader className="border-b border-border/60 bg-muted/20 px-5 py-3.5 pr-14">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <DialogTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              {isQuestionType ? (
                <Sparkles className="size-4 text-primary" />
              ) : (
                <FileText className="size-4 text-sky-500" />
              )}
              <span>Manage {creditLabel}</span>
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
              Select whether to adjust <strong>Question Credits</strong> (AI Chat) or{' '}
              <strong>Report Credits</strong> (Kundli / Dosha Reports).
            </DialogDescription>
          </div>
          <Badge variant="outline" className="border-border text-xs font-mono">
            {user.email}
          </Badge>
        </div>
      </DialogHeader>

      {/* Scrollable Body */}
      <div className="max-h-[calc(92vh-7.5rem)] space-y-3.5 overflow-y-auto px-5 py-4 [scrollbar-width:thin]">
        {/* Step 1: Interactive Credit Type & Current Balance Cards */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            1. Choose Credit Type to Adjust
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {/* Question Credits Card */}
            <button
              type="button"
              onClick={() => handleCreditTypeChange('questions')}
              className={`group relative flex flex-col items-start rounded-xl border p-3 text-left outline-none transition-all ${
                isQuestionType
                  ? 'border-primary bg-primary/10 ring-1 ring-primary/30 shadow-xs'
                  : 'border-border/70 bg-card hover:bg-muted/40'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Sparkles className="size-3.5 text-primary" />
                  Question Credits
                </span>
                {isQuestionType && (
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                )}
              </div>
              <span className="mt-0.5 text-[11px] text-muted-foreground">
                AI Chat Consultations
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-mono text-lg font-bold text-foreground">
                  {currentQuestions}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  (credit_balance)
                </span>
              </div>
            </button>

            {/* Report Credits Card */}
            <button
              type="button"
              onClick={() => handleCreditTypeChange('reports')}
              className={`group relative flex flex-col items-start rounded-xl border p-3 text-left outline-none transition-all ${
                !isQuestionType
                  ? 'border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/30 shadow-xs'
                  : 'border-border/70 bg-card hover:bg-muted/40'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <FileText className="size-3.5 text-sky-500" />
                  Report Credits
                </span>
                {!isQuestionType && (
                  <CheckCircle2 className="size-3.5 text-sky-500 shrink-0" />
                )}
              </div>
              <span className="mt-0.5 text-[11px] text-muted-foreground">
                Kundli &amp; Dosha Reports
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-mono text-lg font-bold text-foreground">
                  {currentReports}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  (report_credits)
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Action Selector */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            2. Select Adjustment Action
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleActionChange('add')}
              className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-medium outline-none transition-all ${
                action === 'add'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold ring-1 ring-emerald-500/30'
                  : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/40'
              }`}
            >
              <Plus className="size-3.5" />
              <span>Add (+)</span>
            </button>

            <button
              type="button"
              onClick={() => handleActionChange('deduct')}
              className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-medium outline-none transition-all ${
                action === 'deduct'
                  ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold ring-1 ring-rose-500/30'
                  : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/40'
              }`}
            >
              <Minus className="size-3.5" />
              <span>Deduct (-)</span>
            </button>

            <button
              type="button"
              onClick={() => handleActionChange('set')}
              className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-medium outline-none transition-all ${
                action === 'set'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold ring-1 ring-blue-500/30'
                  : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/40'
              }`}
            >
              <Equal className="size-3.5" />
              <span>Set Exact (=)</span>
            </button>
          </div>
        </div>

        {/* Step 3: Amount Input & Quick Presets */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="credit-amount" className="text-xs font-semibold">
              {getAmountLabel()}
            </Label>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-muted-foreground mr-1">Quick:</span>
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(String(val))}
                  className={`rounded-md border px-2 py-0.5 font-mono text-[11px] outline-none transition-colors ${
                    parsedAmount === val
                      ? 'border-primary bg-primary/15 text-primary font-bold'
                      : 'border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {action === 'add' ? `+${val}` : action === 'deduct' ? `-${val}` : val}
                </button>
              ))}
            </div>
          </div>
          <Input
            id="credit-amount"
            type="number"
            min={minAllowed}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={adjustingCredits}
            autoFocus
            className="text-sm font-mono font-semibold"
          />
        </div>

        {/* Reason Input */}
        <div className="space-y-1.5">
          <Label htmlFor="credit-reason" className="text-xs font-semibold">
            Reason / Internal Audit Note (Optional)
          </Label>
          <Input
            id="credit-reason"
            type="text"
            placeholder={
              isQuestionType
                ? 'e.g. Compensation for chat disconnect, promotional question grant'
                : 'e.g. Manual Kundli report pack grant, support credit adjustment'
            }
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={adjustingCredits}
            className="text-xs"
          />
        </div>

        {/* Explicit Live Calculation Preview Banner */}
        <div
          className={`rounded-xl border p-3 text-xs space-y-1 ${
            isQuestionType
              ? 'border-primary/30 bg-primary/5'
              : 'border-sky-500/30 bg-sky-500/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              {isQuestionType ? (
                <Sparkles className="size-3.5 text-primary" />
              ) : (
                <FileText className="size-3.5 text-sky-500" />
              )}
              <span>{creditLabel} Preview</span>
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {dbFieldName}
              </code>
            </span>

            <div className="flex items-center gap-2 font-mono">
              <span className="text-muted-foreground">{currentVal}</span>
              <span className="font-bold text-foreground">
                {action === 'add'
                  ? `+${parsedAmount}`
                  : action === 'deduct'
                  ? `-${parsedAmount}`
                  : '→'}
              </span>
              <ArrowRight className="size-3 text-muted-foreground" />
              <span
                className={`rounded-md px-2 py-0.5 text-sm font-bold ${
                  isQuestionType
                    ? 'bg-primary/20 text-primary'
                    : 'bg-sky-500/20 text-sky-600 dark:text-sky-400'
                }`}
              >
                {calculatedNewVal}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            {isQuestionType
              ? `Report Credits (report_credits) will remain unchanged at ${currentReports}.`
              : `Question Credits (credit_balance) will remain unchanged at ${currentQuestions}.`}
          </p>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-muted/20 px-5 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={adjustingCredits}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={adjustingCredits || rawParsed < minAllowed || isNaN(rawParsed)}
          className="gap-1.5"
        >
          {adjustingCredits ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Updating {creditLabel}...</span>
            </>
          ) : (
            <>
              {isQuestionType ? (
                <Sparkles className="size-3.5" />
              ) : (
                <FileText className="size-3.5" />
              )}
              <span>{getSubmitButtonLabel()}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export function AdjustCreditsModal({
  open,
  onOpenChange,
  user,
  initialCreditType = 'questions',
}) {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg sm:max-w-lg gap-0 overflow-hidden p-0 sm:rounded-2xl">
        {open && (
          <AdjustCreditsForm
            key={`${user.id}-${initialCreditType}`}
            user={user}
            initialCreditType={initialCreditType}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
