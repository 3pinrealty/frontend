import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { formatPrice } from '../data/properties'

const ADMIN_TOAST_KEY = 'adminToast'

export function AdminPropertyListPage() {
  const [properties, setProperties] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const msg = location.state?.[ADMIN_TOAST_KEY]
    if (msg) {
      setToast(msg)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 4000)
    return () => window.clearTimeout(t)
  }, [toast])

  const refreshProperties = useCallback(async () => {
    try {
      setListLoading(true)
      setListError('')
      const res = await api.get('/api/properties')
      setProperties(res.data?.data || [])
    } catch {
      setListError('Failed to load properties.')
      setProperties([])
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshProperties()
  }, [refreshProperties])

  const handleDelete = async (id) => {
    if (!id) return
    const ok = window.confirm('Delete this property?')
    if (!ok) return

    try {
      setListError('')
      setDeletingId(id)
      await api.delete(`/api/properties/${id}`)
      setProperties((prev) => prev.filter((p) => p._id !== id && p.id !== id))
    } catch {
      setListError('Failed to delete property.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 bg-[#f4f2ed] p-4 sm:p-6 md:p-8 md:rounded-2xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Properties</h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-slate-600">
            Manage listings shown on the public site. Create, edit, or remove properties.
          </p>
        </div>
        <Link
          to="/admin/properties/new"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/35 focus:ring-offset-2 focus:ring-offset-[#f4f2ed]"
        >
          Create property
        </Link>
      </header>

      {toast ? (
        <div
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 shadow-sm"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      {listError ? (
        <div
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 shadow-sm"
          role="alert"
        >
          {listError}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_rgba(15,23,42,0.07)]">
        <div className="border-b border-stone-200/80 bg-stone-50/90 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">All properties</h2>
          <p className="mt-0.5 text-sm text-slate-600">Sort: newest first.</p>
        </div>

        {listLoading ? (
          <div className="px-6 py-16 text-center text-sm font-medium text-slate-600">Loading properties…</div>
        ) : properties.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-slate-700">No properties yet.</p>
            <p className="mt-2 text-sm text-slate-600">
              Create your first listing to show it on the site.
            </p>
            <Link
              to="/admin/properties/new"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Create property
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 text-[15px]">
              <thead className="bg-stone-50/80">
                <tr>
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-700"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-700"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-700"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-slate-700"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white">
                {properties.map((p) => {
                  const id = p._id || p.id
                  const busy = deletingId === id
                  return (
                    <tr key={id} className="transition-colors hover:bg-stone-50/80">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="aspect-[4/3] w-16 shrink-0 overflow-hidden rounded-lg border border-[#d1d5db] bg-stone-100 shadow-sm">
                            {(p.images || [])[0] ? (
                              <img
                                src={(p.images || [])[0]}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full min-h-[48px] w-full items-center justify-center bg-stone-200 text-[9px] font-medium text-slate-500">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900">{p.title}</div>
                            <div className="mt-1 text-xs text-slate-600">
                              {(p.amenities || []).length} amenities · {(p.nearbyLandmarks || []).length}{' '}
                              landmarks
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-800">{p.location || '—'}</td>
                      <td className="px-5 py-4 text-base font-semibold tabular-nums text-slate-900">
                        {formatPrice(p.price, p.currency || 'INR')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Link
                            to={`/admin/properties/${id}/edit`}
                            className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-stone-50"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(id)}
                            disabled={busy}
                            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-700 underline-offset-2 hover:bg-rose-50 hover:text-rose-800 hover:underline disabled:cursor-not-allowed disabled:opacity-60 disabled:no-underline"
                          >
                            {busy ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
