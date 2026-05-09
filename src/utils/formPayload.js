const KEY_ALIAS_TO_CANONICAL = {
  mobile: 'phone',
  mail: 'email',
  emailId: 'email',
}

function toTrimmedValue(value) {
  if (typeof value === 'string') {
    return value.trim()
  }
  return value
}

function isEmptyValue(value) {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  return false
}

export function standardizePayloadKeys(rawPayload = {}) {
  const standardized = {}

  Object.entries(rawPayload).forEach(([rawKey, rawValue]) => {
    const canonicalKey = KEY_ALIAS_TO_CANONICAL[rawKey] || rawKey
    const value = toTrimmedValue(rawValue)

    if (
      Object.prototype.hasOwnProperty.call(standardized, canonicalKey) &&
      KEY_ALIAS_TO_CANONICAL[rawKey]
    ) {
      return
    }

    standardized[canonicalKey] = value
  })

  return standardized
}

export function buildPayload(rawPayload = {}, allowedKeys = []) {
  const standardized = standardizePayloadKeys(rawPayload)
  const payload = {}

  allowedKeys.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(standardized, key)) return
    const value = standardized[key]
    if (isEmptyValue(value)) return
    payload[key] = value
  })

  return payload
}
