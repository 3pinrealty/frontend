import { Link } from 'react-router-dom'
import { formatPropertyDisplayPrice } from '../data/properties'

function formatWholeNumber(value) {
  if (value == null || value === '') return null
  const num = Number(value)
  if (!Number.isFinite(num) || num <= 0) return null
  return num.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

function formatAcres(value) {
  if (value == null || value === '') return null
  const num = Number(value)
  if (!Number.isFinite(num) || num <= 0) return null
  if (Number.isInteger(num)) return String(num)
  return num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function withRupeePrefix(priceText, currency) {
  const text = String(priceText || '').trim()
  if (!text) return text
  if (currency !== 'INR') return text
  if (text.startsWith('₹') || text.startsWith('Rs') || text.startsWith('INR')) return text
  return `₹${text}`
}

export function PropertyCard({ property }) {
  const beds = formatWholeNumber(property.bedrooms)
  const baths = formatWholeNumber(property.bathrooms)
  const sqftValue = formatWholeNumber(property.areaSqftMax ?? property.areaSqftMin)
  const areaSqm = Number(property.areaSqm)
  const fallbackSqft = Number.isFinite(areaSqm) && areaSqm > 0 ? formatWholeNumber(areaSqm * 10.7639) : null
  const sqft = sqftValue || fallbackSqft
  const acres = formatAcres(property.landAreaAcres)
  const addressText = String(property.addressLine || '').trim() || String(property.location || '').trim()

  const specItems = [
    beds ? `${beds} beds` : null,
    baths ? `${baths} baths` : null,
    sqft ? `${sqft} sqft` : null,
    acres ? `${acres} acres` : null,
  ].filter(Boolean)
  const displayPrice = withRupeePrefix(formatPropertyDisplayPrice(property), property.currency)

  return (
    <Link
      to={`/property/${property._id ?? property.id}`}
      className="group block prop-card"
    >
      {/* Image Container */}
      <div className="prop-card-image">
        <img
          src={property.images?.[0]}
          alt={property.title}
          loading="lazy"
          className="prop-card-image-media"
        />

        <div className="prop-card-image-gradient" />

        {/* Price and Type on Image */}
        <div className="prop-card-image-info">
          {property.type && (
            <span className="prop-card-type-badge">
              {property.type}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="prop-card-badges">
          {property.isNewDevelopment && (
            <span className="prop-card-badge prop-card-badge-new">
              New Development
            </span>
          )}
          {property.featured && (
            <span className="prop-card-badge prop-card-badge-featured">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="prop-card-content">
        <div className="prop-card-price-main">{displayPrice}</div>
        {specItems.length ? <div className="prop-card-specs">{specItems.join(' | ')}</div> : null}
        {addressText ? <div className="prop-card-address">{addressText}</div> : null}
      </div>
    </Link>
  )
}