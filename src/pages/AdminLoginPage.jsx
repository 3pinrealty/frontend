import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const DUMMY_EMAIL = 'Admin@threepin.in' || 'admin@threepin.in'
const DUMMY_PASSWORD = '3pin@administrator2026'
const STORAGE_KEY = 'adminAuthed'

const fieldErrClass = 'text-xs font-medium text-rose-600 mt-1'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })

  function handleSubmit(e) {
    e.preventDefault()
    const fe = { email: '', password: '' }
    if (!email.trim()) fe.email = 'Email is required'
    if (!password) fe.password = 'Password is required'
    if (fe.email || fe.password) {
      setFieldErrors(fe)
      setError('')
      return
    }
    setFieldErrors({ email: '', password: '' })

    if (email.trim() === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
      window.localStorage.setItem(STORAGE_KEY, '1')
      setError('')
      navigate('/admin/properties', { replace: true })
    } else {
      setError('Invalid admin credentials. Use the demo login details shown below.')
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Admin login</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter the admin credentials to access the dashboard.
        </p>
        {/* <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 leading-relaxed">
          <p className="font-semibold text-slate-800">Property admin (after sign-in)</p>
          <p className="mt-1">
            You can capture the full public listing: price range, payment label, super built-up (sq ft), handover date, unit
            count, price per sqft, structure, towers, completion date, launch badge, amenities (one per line), nearby
            landmarks (<span className="font-mono">Name | distance</span> per line), map embed URL or lat/long, YouTube
            tour, brochure URL, and floor-plan uploads.
          </p>
        </div> */}
      </div>

      {/* <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <div className="font-semibold text-slate-800">Demo credentials</div>
        <div className="mt-1 space-y-0.5">
          <div>
            <span className="font-medium">Email:</span> {DUMMY_EMAIL}
          </div>
          <div>
            <span className="font-medium">Password:</span> {DUMMY_PASSWORD}
          </div>
        </div>
      </div> */}

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setFieldErrors((s) => ({ ...s, email: '' }))
              setEmail(e.target.value)
            }}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email ? <p className={fieldErrClass}>{fieldErrors.email}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setFieldErrors((s) => ({ ...s, password: '' }))
              setPassword(e.target.value)
            }}
            placeholder="Enter your password"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
            aria-invalid={Boolean(fieldErrors.password)}
          />
          {fieldErrors.password ? <p className={fieldErrClass}>{fieldErrors.password}</p> : null}
        </div>

        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            className="font-semibold text-slate-600 hover:text-slate-900"
            // onClick={() => {
            //   alert('Forgot password is demo-only for now. In a real app this would send a reset link.')
            // }}
          >
            Forgot password?
          </button>
          <Link
            to="/"
            className="text-slate-500 hover:text-slate-800"
          >
            Back to site
          </Link>
        </div>

        <button
          type="submit"
          className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-slate-800"
        >
          Sign in
        </button>
      </form>
    </div>
  )
}

