/**
 * Convert stored Google Maps links (share, place, search, etc.) into an iframe-safe embed URL.
 * Returns null when embedding is not supported (e.g. short links) or input is unusable.
 */

const SHORT_LINK_RE = /^(https?:\/\/)?((maps\.)?app\.goo\.gl|goo\.gl)\//i

function normalizeHttps(href) {
  if (!href) return href
  let s = String(href).trim()
  if (s.startsWith('//')) s = `https:${s}`
  else if (s.startsWith('http://')) s = `https://${s.slice(7)}`
  else if (!/^https?:\/\//i.test(s)) s = `https://${s}`
  return s
}

function finiteLatLng(lat, lng) {
  const la = lat != null && lat !== '' ? Number(lat) : NaN
  const ln = lng != null && lng !== '' ? Number(lng) : NaN
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return null
  return { la, ln }
}

function coordsEmbed(la, ln) {
  return `https://maps.google.com/maps?q=${la},${ln}&z=15&output=embed`
}

/**
 * @param {string|null|undefined} mapUrl
 * @param {number|string|null|undefined} lat
 * @param {number|string|null|undefined} lng
 * @returns {string|null}
 */
export function toGoogleMapsEmbedUrl(mapUrl, lat, lng) {
  const coords = finiteLatLng(lat, lng)
  const raw = mapUrl != null ? String(mapUrl).trim() : ''

  if (!raw) {
    return coords ? coordsEmbed(coords.la, coords.ln) : null
  }

  if (SHORT_LINK_RE.test(raw)) {
    return coords ? coordsEmbed(coords.la, coords.ln) : null
  }

  const href = normalizeHttps(raw)

  let url
  try {
    url = new URL(href)
  } catch {
    if (coords) return coordsEmbed(coords.la, coords.ln)
    return `https://maps.google.com/maps?q=${encodeURIComponent(raw)}&z=15&output=embed`
  }

  const path = url.pathname || ''

  // https://www.google.com/maps/embed?pb=...
  if (path.includes('/maps/embed')) {
    return url.toString()
  }

  // @lat,lng zoom pattern used in place/share links
  const atInPath = path.match(/@(-?\d+\.?\d+),(-?\d+\.?\d+)/)
  if (atInPath) {
    const la = parseFloat(atInPath[1])
    const ln = parseFloat(atInPath[2])
    if (Number.isFinite(la) && Number.isFinite(ln)) {
      return coordsEmbed(la, ln)
    }
  }

  const q = url.searchParams.get('q')
  if (q) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`
  }

  const query = url.searchParams.get('query')
  if (query) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`
  }

  const ll = url.searchParams.get('ll')
  if (ll) {
    const parts = ll.split(',').map((x) => parseFloat(x.trim()))
    if (parts.length >= 2 && parts.every(Number.isFinite)) {
      return coordsEmbed(parts[0], parts[1])
    }
  }

  if (path.includes('/place/')) {
    const afterPlace = path.split('/place/')[1] || ''
    const segment = decodeURIComponent(afterPlace.split('/')[0] || '').replace(/\+/g, ' ')
    if (segment) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(segment)}&z=15&output=embed`
    }
  }

  const host = (url.hostname || '').toLowerCase().replace(/^www\./, '')
  const isMapsHost = host === 'maps.google.com' || /^google\.(com|co\.\w{2,3})$/i.test(host)
  if (isMapsHost && (path.includes('/maps') || path === '/')) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(raw)}&z=15&output=embed`
  }

  return coords ? coordsEmbed(coords.la, coords.ln) : null
}

/**
 * Best URL to open the same place in a new tab (original or normalized).
 * @param {string|null|undefined} mapUrl
 * @returns {string|null}
 */
export function toGoogleMapsOpenUrl(mapUrl) {
  const raw = mapUrl != null ? String(mapUrl).trim() : ''
  if (!raw) return null
  try {
    return normalizeHttps(raw)
  } catch {
    return null
  }
}
