import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'
import {
  handlePhonePaste,
  isValidPhoneValue,
  PHONE_PATTERN_ATTR,
  PHONE_VALIDATION_MESSAGE,
  sanitizePhoneInputValue,
} from '../utils/phoneInput'
import { isValidEmailFormat } from '../utils/formValidation'
import '../styles/sell.css'

const sanitizePayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (value == null) return false
      if (typeof value === 'string') return value.trim() !== ''
      return true
    }).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
  )

const emptySellErrors = () => ({
  name: '',
  email: '',
  phone: '',
  propertyDetails: '',
})

function validateSellForm(form) {
  const e = emptySellErrors()
  let bad = false

  if (!String(form.name ?? '').trim()) {
    e.name = 'Name is required'
    bad = true
  }
  if (!String(form.email ?? '').trim()) {
    e.email = 'Email is required'
    bad = true
  } else if (!isValidEmailFormat(form.email)) {
    e.email = 'Enter a valid email address'
    bad = true
  }

  const phoneTrim = String(form.phone ?? '').trim()
  if (!phoneTrim) {
    e.phone = 'Phone Number is required'
    bad = true
  } else if (!isValidPhoneValue(form.phone)) {
    e.phone = PHONE_VALIDATION_MESSAGE
    bad = true
  }

  if (!String(form.propertyDetails ?? '').trim()) {
    e.propertyDetails = 'Property details are required'
    bad = true
  }

  return bad ? e : null
}

const errClass = 'text-xs text-red-600 mt-1'

export function SellPage() {
  const [status, setStatus] = useState('idle')
  const [form, setForm] = useState({ name: '', email: '', phone: '', propertyDetails: '' })
  const [fieldErrors, setFieldErrors] = useState(emptySellErrors)

  const clearError = (field) => {
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))
  }

  async function submit(e) {
    e.preventDefault()
    if (status === 'loading') return

    const nextErrors = validateSellForm(form)
    if (nextErrors) {
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors(emptySellErrors())
    setStatus('loading')

    const sellPayload = sanitizePayload({
      name: form.name,
      email: form.email,
      phone: form.phone,
      propertyDetails: form.propertyDetails,
      sheetName: 'Sell Your Property',
    })

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sellPayload),
      })

      if (!response.ok) {
        let apiError = ''
        try {
          const errJson = await response.json()
          apiError = (errJson?.error || errJson?.message || '').trim()
        } catch (_) {
          /* ignore */
        }
        throw new Error(apiError || 'Unable to submit. Please try again.')
      }

      toast.success('Valuation Requested')
      setStatus('success')
      setForm({ name: '', email: '', phone: '', propertyDetails: '' })
    } catch (err) {
      console.error(err)
      setStatus('error')
      const msg = typeof err?.message === 'string' ? err.message.trim() : ''
      toast.error(msg || 'Unable to submit. Please try again.')
    } finally {
      setTimeout(() => setStatus('idle'), 2500)
    }
  }

  return (
    <div className="sell-section">
      <div className="sell-section__container">
        <div className="sell-section__header">
          <h1 className="sell-section__title">Sell Your Property</h1>
          <p className="sell-section__subtitle">
            Maximize your property's value with our expert marketing and negotiation services
          </p>
        </div>

        <div className="sell-section__content-grid">
          {/* Left Column - Sell Info */}
          <div className="sell-section__left">
            <div className="sell-section__info-card">
              {/* Professional Marketing */}
              <div className="sell-section__info-block">
                <div className="sell-section__info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="sell-section__info-label">Professional Marketing</h3>
                  <p className="sell-section__info-text">High-quality photography, virtual tours, and strategic online exposure to attract qualified buyers</p>
                </div>
              </div>

              {/* Expert Negotiation */}
              <div className="sell-section__info-block">
                <div className="sell-section__info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                    <path d="M12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="sell-section__info-label">Expert Negotiation</h3>
                  <p className="sell-section__info-text">Skilled negotiation to secure the best possible price and terms for your property</p>
                </div>
              </div>

              {/* Scheduled Viewings */}
              <div className="sell-section__info-block">
                <div className="sell-section__info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div>
                  <h3 className="sell-section__info-label">Scheduled Viewings</h3>
                  <p className="sell-section__info-text">Coordinated property showings with pre-qualified buyers at convenient times</p>
                </div>
              </div>

              {/* End to End Assistance */}
              <div className="sell-section__info-block">
                <div className="sell-section__info-icon">
                  <ClipboardDocumentCheckIcon />
                </div>
                <div>
                  <h3 className="sell-section__info-label">End to End Assistance</h3>
                  <p className="sell-section__info-text">End-to-end documentation support including sale agreements, legal verification, registration, and handover - handled with precision so you close without hassle.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sell Form */}
          <div className="sell-section__right">
            <div className="sell-section__form-card">
              <form onSubmit={submit} className="space-y-4" noValidate>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <input
                      value={form.name}
                      onChange={(e) => {
                        clearError('name')
                        setForm((s) => ({ ...s, name: e.target.value }))
                      }}
                      placeholder="Full name"
                      className="sell-section__input"
                      aria-invalid={Boolean(fieldErrors.name)}
                    />
                    {fieldErrors.name ? <p className={errClass}>{fieldErrors.name}</p> : null}
                  </div>
                  <div className="space-y-1">
                    <input
                      value={form.email}
                      onChange={(e) => {
                        clearError('email')
                        setForm((s) => ({ ...s, email: e.target.value }))
                      }}
                      placeholder="Email address"
                      type="email"
                      className="sell-section__input"
                      aria-invalid={Boolean(fieldErrors.email)}
                    />
                    {fieldErrors.email ? <p className={errClass}>{fieldErrors.email}</p> : null}
                  </div>
                  <div className="space-y-1">
                    <input
                      value={form.phone}
                      onChange={(e) => {
                        clearError('phone')
                        setForm((s) => ({ ...s, phone: sanitizePhoneInputValue(e.target.value) }))
                      }}
                      onPaste={(e) => {
                        clearError('phone')
                        handlePhonePaste(e, (next) => setForm((s) => ({ ...s, phone: next })))
                      }}
                      placeholder="Phone number"
                      type="tel"
                      className="sell-section__input"
                      maxLength={20}
                      pattern={PHONE_PATTERN_ATTR}
                      title={PHONE_VALIDATION_MESSAGE}
                      aria-invalid={Boolean(fieldErrors.phone)}
                    />
                    {fieldErrors.phone ? <p className={errClass}>{fieldErrors.phone}</p> : null}
                  </div>
                  <div className="space-y-1">
                    <textarea
                      value={form.propertyDetails}
                      onChange={(e) => {
                        clearError('propertyDetails')
                        setForm((s) => ({ ...s, propertyDetails: e.target.value }))
                      }}
                      placeholder="Property details (location, size, features, etc.)"
                      rows={4}
                      className="sell-section__input sell-section__textarea"
                      aria-invalid={Boolean(fieldErrors.propertyDetails)}
                    />
                    {fieldErrors.propertyDetails ? (
                      <p className={errClass}>{fieldErrors.propertyDetails}</p>
                    ) : null}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="sell-section__button disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'Get Free Property Valuation'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
