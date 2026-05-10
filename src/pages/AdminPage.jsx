import { useState } from 'react'
import { Link } from 'react-router-dom'
import { properties as baseProperties, formatPropertyDisplayPrice } from '../data/properties'

const LEAD_STATUSES = ['new', 'contacted', 'visit scheduled', 'closed']
const TASK_TYPES = ['call customer', 'schedule visit', 'follow up']
const TASK_STATUSES = ['active', 'pending', 'completed']

export function AdminPage() {
  const [items, setItems] = useState(baseProperties)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    location: '',
    locationDetails: '',
    price: '',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 3,
    videoUrl: '',
  })

  const [leads, setLeads] = useState([
    {
      id: 'l-1',
      name: 'Ada Obasi',
      phone: '+2348000000001',
      property: baseProperties[0]?.title || 'Modern 3-Bed Apartment in Ikoyi',
      message: 'Interested in a viewing this weekend.',
      status: 'new',
      tasks: [
        { id: 't-1', title: 'call customer', status: 'active' },
        { id: 't-2', title: 'schedule visit', status: 'pending' },
      ],
    },
    {
      id: 'l-2',
      name: 'Kunle Ade',
      phone: '+2348000000002',
      property: baseProperties[1]?.title || 'Luxury Terraces (Off-Plan)',
      message: 'Looking for flexible payment plan details.',
      status: 'contacted',
      tasks: [{ id: 't-3', title: 'follow up', status: 'pending' }],
    },
  ])
  const [selectedLeadId, setSelectedLeadId] = useState(null)
  const [taskForm, setTaskForm] = useState({ title: TASK_TYPES[0], status: TASK_STATUSES[0] })

  function resetForm() {
    setEditingId(null)
    setForm({
      title: '',
      location: '',
      locationDetails: '',
      price: '',
      type: 'Apartment',
      bedrooms: 3,
      bathrooms: 3,
      videoUrl: '',
    })
  }

  function startEdit(p) {
    setEditingId(p.id)
    setForm({
      title: p.title,
      location: p.location,
      locationDetails: p.locationDetails || '',
      price: String(p.price ?? ''),
      type: p.type || 'Apartment',
      bedrooms: p.bedrooms ?? 3,
      bathrooms: p.bathrooms ?? 3,
      videoUrl: p.youtubeId ? `https://www.youtube.com/watch?v=${p.youtubeId}` : '',
    })
  }

  function extractYoutubeId(input) {
    if (!input) return ''
    const trimmed = input.trim()
    // If it's already an 11-char ID, return as is
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
    try {
      const url = new URL(trimmed)
      if (url.hostname.includes('youtu.be')) {
        return url.pathname.replace('/', '') || ''
      }
      if (url.searchParams.get('v')) {
        return url.searchParams.get('v') || ''
      }
      const parts = url.pathname.split('/')
      const embedIndex = parts.indexOf('embed')
      if (embedIndex !== -1 && parts[embedIndex + 1]) {
        return parts[embedIndex + 1]
      }
    } catch {
      // not a valid URL, fall through
    }
    return ''
  }

  function handleSubmit(e) {
    e.preventDefault()
    const price = String(form.price || '').trim()
    if (!form.title.trim() || !form.location.trim() || !price) return

    const youtubeId = extractYoutubeId(form.videoUrl)

    if (editingId) {
      setItems((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                title: form.title.trim(),
                location: form.location.trim(),
                locationDetails: form.locationDetails.trim(),
                price,
                type: form.type,
                bedrooms: Number(form.bedrooms || 0),
                bathrooms: Number(form.bathrooms || 0),
                youtubeId: youtubeId || undefined,
              }
            : p,
        ),
      )
    } else {
      const id = `p-${Date.now()}`
      setItems((prev) => [
        {
          id,
          title: form.title.trim(),
          location: form.location.trim(),
          locationDetails: form.locationDetails.trim(),
          price,
          currency: 'INR',
          type: form.type,
          bedrooms: Number(form.bedrooms || 0),
          bathrooms: Number(form.bathrooms || 0),
          areaSqm: 0,
          featured: false,
          isNewDevelopment: false,
          youtubeId: youtubeId || undefined,
        },
        ...prev,
      ])
    }

    resetForm()
  }

  function deleteProperty(id) {
    setItems((prev) => prev.filter((p) => p.id !== id))
    if (editingId === id) resetForm()
  }

  function updateLeadStatus(id, status) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
  }

  function deleteLead(id) {
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }

  function updateTaskStatus(leadId, taskId, status) {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              tasks: (lead.tasks || []).map((task) => (task.id === taskId ? { ...task, status } : task)),
            }
          : lead,
      ),
    )
  }

  function deleteTask(leadId, taskId) {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, tasks: (lead.tasks || []).filter((task) => task.id !== taskId) } : lead,
      ),
    )
  }

  function handleAddTask(e) {
    e.preventDefault()
    if (!selectedLeadId || !taskForm.title) return
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === selectedLeadId
          ? {
              ...lead,
              tasks: [
                ...(lead.tasks || []),
                {
                  id: `t-${Date.now()}`,
                  title: taskForm.title,
                  status: taskForm.status,
                },
              ],
            }
          : lead,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Admin dashboard</h1>
          <p className="text-sm text-slate-600">Manage properties and leads.</p>
        </div>
        <Link
          to="/listings"
          className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          View public listings
        </Link>
      </div>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
            Property management
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Property
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{p.title}</div>
                      <div className="text-xs text-slate-500">
                        {p.bedrooms} bd • {p.bathrooms} ba • {p.areaSqm} sqm
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{p.location}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {formatPropertyDisplayPrice(p, p.currency || 'INR')}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">{p.type}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProperty(p.id)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {editingId ? 'Edit property' : 'Add property'}
              </div>
              <div className="text-xs text-slate-500">
                Basic fields for quick updates (in-memory only).
              </div>
            </div>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
            ) : null}
          </div>

          <div className="grid gap-2">
            <input
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              placeholder="Property name"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
            <input
              value={form.location}
              onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
              placeholder="Location"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
            <input
              value={form.locationDetails}
              onChange={(e) => setForm((s) => ({ ...s, locationDetails: e.target.value }))}
              placeholder="Additional location details (landmark / full address)"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
            <input
              value={form.videoUrl}
              onChange={(e) => setForm((s) => ({ ...s, videoUrl: e.target.value }))}
              placeholder="Property video (YouTube link or ID)"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                type="text"
                value={form.price}
                onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                placeholder="Price (e.g. 80 Lakhs)"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              />
              <select
                value={form.type}
                onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              >
                <option>Apartment</option>
                <option>Terrace</option>
                <option>Detached</option>
                <option>Semi-Detached</option>
                <option>Duplex</option>
                <option>Condo</option>
                <option>Bungalow</option>
                <option>Studio</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  value={form.bedrooms}
                  onChange={(e) => setForm((s) => ({ ...s, bedrooms: Number(e.target.value || 0) }))}
                  placeholder="Beds"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
                <input
                  type="number"
                  min={0}
                  value={form.bathrooms}
                  onChange={(e) => setForm((s) => ({ ...s, bathrooms: Number(e.target.value || 0) }))}
                  placeholder="Baths"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-slate-800"
          >
            {editingId ? 'Save changes' : 'Add property'}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
          Lead management
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Tasks
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {leads.map((lead) => {
                const taskCount = lead.tasks?.length ?? 0
                return (
                  <tr key={lead.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-900">{lead.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{lead.phone}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{lead.property}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-xs">
                      <span className="line-clamp-2">{lead.message}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Tasks ({taskCount})
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteLead(lead.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
              {leads.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-5 text-center text-xs text-slate-500"
                  >
                    No leads yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {(() => {
          const lead = leads.find((l) => l.id === selectedLeadId) || null
          if (!lead) return null
          const tasks = lead.tasks || []
          return (
            <div className="border-t border-slate-200 bg-slate-50/60 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Tasks for {lead.name}
                  </div>
                  <div className="text-xs text-slate-500">{lead.property}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLeadId(null)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Close
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {tasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-500">
                    No tasks yet for this lead.
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                    >
                      <div className="font-semibold text-slate-800">{task.title}</div>
                      <div className="flex items-center gap-2">
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(lead.id, task.id, e.target.value)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                        >
                          {TASK_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => deleteTask(lead.id, task.id)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddTask} className="mt-3 grid gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                  <select
                    value={taskForm.title}
                    onChange={(e) => setTaskForm((s) => ({ ...s, title: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                  >
                    {TASK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm((s) => ({ ...s, status: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                  >
                    {TASK_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-soft hover:bg-slate-800"
                >
                  Add task
                </button>
              </form>
            </div>
          )
        })()}
      </section>
    </div>
  )
}

