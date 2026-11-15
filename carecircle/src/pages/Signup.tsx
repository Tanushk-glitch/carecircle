
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse, UserRound, Users, HeartHandshake } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'senior' | 'caregiver' | 'family'>('senior')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (fullName.trim().length < 2) {
      toast.error('Please enter your full name.')
      return
    }

    if (password.length < 8) {
      toast.error('Password must contain at least 8 characters.')
      return
    }

    setSubmitting(true)

    try {
      const result = await signUp(fullName.trim(), email.trim(), password, role)

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.needsEmailConfirmation) {
        toast.success('Account created! Please verify your email before logging in.')
        navigate('/login')
      } else {
        toast.success('Welcome to CareCircle!')
        navigate('/dashboard')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const roles = [
    { value: 'senior', label: 'Senior', icon: UserRound },
    { value: 'caregiver', label: 'Caregiver', icon: HeartHandshake },
    { value: 'family', label: 'Family', icon: Users },
  ] as const

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f8f6] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <HeartPulse className="text-teal-600" size={32} />
          <span className="text-2xl font-bold text-slate-900">
            Care<span className="text-teal-600">Circle</span>
          </span>
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-slate-500">
            Start building your care circle today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-slate-700">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              autoComplete="name"
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">
              I am joining as a
            </p>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  aria-pressed={role === value}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
                    role === value
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-slate-200 text-slate-600 hover:border-teal-300'
                  }`}
                >
                  <Icon size={22} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-teal-600 py-3.5 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
