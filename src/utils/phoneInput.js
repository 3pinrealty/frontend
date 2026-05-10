/** Matches full entered value: allowed chars only, length 8–20. */
export const PHONE_INPUT_REGEX = /^[0-9+\-()\s]{8,20}$/

/** For native <input pattern={...} /> (anchored full-string match). */
export const PHONE_PATTERN_ATTR = '[0-9+\\-()\\s]{8,20}'

export const PHONE_VALIDATION_MESSAGE =
  'Enter a valid phone number (8–20 characters: digits, +, -, spaces, and parentheses only).'

export const PHONE_MAX_LENGTH = 20

const DISALLOWED_CHARS = /[^0-9+\-()\s]/g

export function sanitizePhoneInputValue(raw) {
  return String(raw ?? '')
    .replace(DISALLOWED_CHARS, '')
    .slice(0, PHONE_MAX_LENGTH)
}

export function isValidPhoneValue(value) {
  return PHONE_INPUT_REGEX.test(String(value ?? '').trim())
}

/** Sanitizes paste and preserves caret roughly after the inserted text (max length 20). */
export function handlePhonePaste(e, setPhoneValue) {
  e.preventDefault()
  const clip = e.clipboardData.getData('text') || ''
  const input = e.currentTarget
  const value = input.value
  const start = input.selectionStart ?? value.length
  const end = input.selectionEnd ?? value.length
  const pasted = sanitizePhoneInputValue(clip)
  const next = sanitizePhoneInputValue(value.slice(0, start) + pasted + value.slice(end))
  setPhoneValue(next)
  requestAnimationFrame(() => {
    try {
      const caret = Math.min(start + pasted.length, next.length)
      input.setSelectionRange(caret, caret)
    } catch (_) {
      /* ignore */
    }
  })
}
