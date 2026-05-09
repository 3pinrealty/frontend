/**
 * Sanitize payload by removing null, undefined, and empty string values
 */
export const sanitizePayload = (payload) => {
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([, value]) => {
        if (value == null) return false
        if (typeof value === 'string') return value.trim() !== ''
        return true
      })
      .map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim() : value,
      ])
  )
}

/**
 * Standardize field names to match backend schema
 */
export const normalizeFieldNames = (payload) => {
  const fieldMap = {
    mobile: 'phone',
    mobileNumber: 'phone',
    emailId: 'email',
    mail: 'email',
  }

  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      fieldMap[key] || key,
      value,
    ])
  )
}

/**
 * Filter payload to only include allowed fields for a specific sheet
 */
export const filterPayloadBySheet = (payload, sheetName) => {
  const allowedFieldsBySheet = {
    Contact: ['name', 'phone', 'email', 'message'],
    'Schedule a visit': ['name', 'email', 'phone', 'message', 'date', 'time'],
    'Sell Your Property': ['name', 'email', 'phone', 'propertyDetails'],
    'Brochure Leads': ['name', 'phone'],
  }

  const allowedFields = allowedFieldsBySheet[sheetName] || []
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowedFields.includes(key))
  )
}

/**
 * Complete payload preparation with all validations
 */
export const preparePayload = (formData, sheetName) => {
  console.log('📝 Raw form data:', formData)

  // Step 1: Normalize field names
  let normalized = normalizeFieldNames(formData)
  console.log('🔄 After field normalization:', normalized)

  // Step 2: Filter to allowed fields only
  let filtered = filterPayloadBySheet(normalized, sheetName)
  console.log('🎯 After field filtering:', filtered)

  // Step 3: Sanitize (remove empty values)
  let sanitized = sanitizePayload(filtered)
  console.log('✨ After sanitization:', sanitized)

  // Always add sheetName
  const final = {
    ...sanitized,
    sheetName,
  }

  console.log('✅ Final payload ready for API:', final)
  return final
}
