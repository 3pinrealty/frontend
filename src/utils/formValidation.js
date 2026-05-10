/** Basic email shape check for client-side required email fields. */
export function isValidEmailFormat(value) {
  const s = String(value ?? '').trim()
  if (!s) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}
