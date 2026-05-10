import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  handlePhonePaste,
  isValidPhoneValue,
  PHONE_PATTERN_ATTR,
  PHONE_VALIDATION_MESSAGE,
  sanitizePhoneInputValue,
} from '../utils/phoneInput'

const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
]

const emptyFieldErrors = () => ({
  name: '',
  phone: '',
  date: '',
  time: '',
})

function validateFields(state, showDateTime) {
  const e = emptyFieldErrors()
  let hasError = false

  if (!String(state.name ?? '').trim()) {
    e.name = 'Name is required'
    hasError = true
  }

  const phoneTrim = String(state.phone ?? '').trim()
  if (!phoneTrim) {
    e.phone = 'Phone Number is required'
    hasError = true
  } else if (!isValidPhoneValue(state.phone)) {
    e.phone = PHONE_VALIDATION_MESSAGE
    hasError = true
  }

  if (showDateTime) {
    if (!String(state.date ?? '').trim()) {
      e.date = 'Date is required'
      hasError = true
    }
    if (!String(state.time ?? '').trim()) {
      e.time = 'Time is required'
      hasError = true
    }
  }

  return hasError ? e : null
}

const errClass = 'text-xs text-red-600 mt-1'

function getSubmitErrorMessage(err) {
  const d = err?.response?.data
  const fromBody =
    (typeof d?.message === 'string' && d.message.trim()) ||
    (typeof d?.error === 'string' && d.error.trim()) ||
    ''
  if (fromBody) return fromBody
  return typeof err?.message === 'string' ? err.message.trim() : ''
}

export function ContactForm({
  title = 'Contact agent',
  subtitle = 'We\'ll respond shortly.',
  onSubmit,
  showDateTime = false,
  compact = false,
}) {
  const [status, setStatus] = useState('idle')
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    date: '',
    time: '',
  })
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors)

  const today = new Date().toISOString().split('T')[0]

  const filteredTimeSlots = useMemo(() => {
    if (!scheduleForm.date) return TIME_SLOTS
    if (scheduleForm.date !== today) return TIME_SLOTS

    const now = new Date()
    return TIME_SLOTS.filter((slot) => {
      const [time, modifier] = slot.split(' ')
      let [hours, minutes] = time.split(':').map(Number)
      if (modifier === 'PM' && hours !== 12) hours += 12
      if (modifier === 'AM' && hours === 12) hours = 0
      const slotDate = new Date()
      slotDate.setHours(hours, minutes, 0, 0)
      return slotDate > now
    })
  }, [scheduleForm.date, today])

  const activeForm = showDateTime ? scheduleForm : contactForm

  const clearError = (field) => {
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const updateField = (field, value) => {
    clearError(field)
    if (showDateTime) {
      setScheduleForm((prev) => ({ ...prev, [field]: value }))
      return
    }
    setContactForm((prev) => ({ ...prev, [field]: value }))
  }

  async function submit(e) {
    e.preventDefault()
    if (status === 'loading') return

    const nextErrors = validateFields(activeForm, showDateTime)
    if (nextErrors) {
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors(emptyFieldErrors())
    setStatus('loading')

    try {
      const promise = onSubmit
        ? onSubmit(activeForm)
        : new Promise((res) => setTimeout(res, 1000))
      await promise
      toast.success('Message sent successfully')
      setStatus('success')
      if (showDateTime) {
        setScheduleForm({ name: '', email: '', phone: '', message: '', date: '', time: '' })
      } else {
        setContactForm({ name: '', email: '', phone: '', message: '' })
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
      const msg = getSubmitErrorMessage(err)
      toast.error(msg || 'Failed to send message')
    } finally {
      setTimeout(() => setStatus('idle'), 2500)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="space-y-3">
        <div className="space-y-1">
          <input
            value={activeForm.name}
            onChange={(e) => updateField('name', e.target.value)}
            onBlur={() => {
              const e = validateFields(activeForm, showDateTime)
              setFieldErrors((p) => ({ ...p, name: e?.name ?? '' }))
            }}
            placeholder="Full name *"
            className="luxury-input text-sm"
            aria-invalid={Boolean(fieldErrors.name)}
          />
          {fieldErrors.name ? <p className={errClass}>{fieldErrors.name}</p> : null}
        </div>
        <input
          value={activeForm.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="Email address"
          type="email"
          className="luxury-input text-sm"
        />
        <div className="space-y-1">
          <input
            value={activeForm.phone}
            onChange={(e) => updateField('phone', sanitizePhoneInputValue(e.target.value))}
            onPaste={(e) => {
              clearError('phone')
              handlePhonePaste(e, (next) =>
                showDateTime
                  ? setScheduleForm((s) => ({ ...s, phone: next }))
                  : setContactForm((s) => ({ ...s, phone: next }))
              )
            }}
            onBlur={() => {
              const e = validateFields(activeForm, showDateTime)
              setFieldErrors((p) => ({ ...p, phone: e?.phone ?? '' }))
            }}
            placeholder="Phone number *"
            type="tel"
            className="luxury-input text-sm"
            maxLength={20}
            pattern={PHONE_PATTERN_ATTR}
            title={PHONE_VALIDATION_MESSAGE}
            aria-invalid={Boolean(fieldErrors.phone)}
          />
          {fieldErrors.phone ? <p className={errClass}>{fieldErrors.phone}</p> : null}
        </div>
        <textarea
          value={activeForm.message}
          onChange={(e) => updateField('message', e.target.value)}
          placeholder="Your message (optional)"
          rows={compact ? 3 : 4}
          className="luxury-input resize-none text-sm"
        />
        {showDateTime ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-1">
              <input
                type="date"
                value={scheduleForm.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  clearError('date')
                  setScheduleForm((s) => ({ ...s, date: e.target.value }))
                }}
                onBlur={() => {
                  const e = validateFields(scheduleForm, true)
                  setFieldErrors((p) => ({ ...p, date: e?.date ?? '' }))
                }}
                className="luxury-input text-sm"
                aria-invalid={Boolean(fieldErrors.date)}
              />
              {fieldErrors.date ? <p className={errClass}>{fieldErrors.date}</p> : null}
            </div>
            <div className="space-y-1 sm:col-span-1">
              <select
                value={scheduleForm.time}
                onChange={(e) => {
                  clearError('time')
                  setScheduleForm((s) => ({ ...s, time: e.target.value }))
                }}
                onBlur={() => {
                  const e = validateFields(scheduleForm, true)
                  setFieldErrors((p) => ({ ...p, time: e?.time ?? '' }))
                }}
                className="luxury-input text-sm"
                aria-invalid={Boolean(fieldErrors.time)}
              >
                <option value="">Select time</option>
                {filteredTimeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {fieldErrors.time ? <p className={errClass}>{fieldErrors.time}</p> : null}
            </div>
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="luxury-button luxury-button-primary w-full text-xs disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </span>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  )
}
