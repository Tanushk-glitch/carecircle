
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  UserRound,
  Mail,
  ShieldCheck,
  CalendarDays,
  Lock,
  LogOut,
  Save,
  HeartPulse,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

type ProfileData = {
  full_name: string
  role: 'senior' | 'caregiver' | 'family'
}

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [password, setPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Profile loading error:', error)
        toast.error('Could not load your profile')
      } else {
        setProfile(data)
        setFullName(data.full_name)
      }

      setLoading(false)
    }

    loadProfile()
  }, [user])

  async function handleSaveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!user || !fullName.trim()) {
      toast.error('Please enter your full name')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', user.id)

    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    const { error: metadataError } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim() },
    })

    setProfile((previous) =>
      previous ? { ...previous, full_name: fullName.trim() } : previous
    )

    if (metadataError) {
      toast.error('Profile saved, but account display name could not sync')
    } else {
      toast.success('Profile updated successfully!')
    }

    setSaving(false)
  }

  async function handlePasswordUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('Password must contain at least 8 characters')
      return
    }

    setUpdatingPassword(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully!')
      setPassword('')
    }

    setUpdatingPassword(false)
  }

  async function handleLogout() {
    const error = await signOut()

    if (error) {
      toast.error(error)
      return
    }

    navigate('/login')
  }

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const roleLabel = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : 'Member'

  return (
    <div className="min-h-screen bg-[#f1f8f6]">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <HeartPulse className="text-teal-600" size={28} />
          <h1 className="text-xl font-bold">
            Care<span className="text-teal-600">Circle</span>
          </h1>
        </Link>

        <Link
          to="/dashboard"
          className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10">
        <h2 className="text-3xl font-bold text-slate-900">
          My Profile
        </h2>
        <p className="mt-2 text-slate-600">
          Manage your personal information and account settings.
        </p>

        {loading ? (
          <p className="mt-8 text-slate-500">Loading your profile...</p>
        ) : (
          <>
            <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-2xl font-bold text-teal-700">
                  {initials || <UserRound size={32} />}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {fullName || 'CareCircle Member'}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {roleLabel} account
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Active member
                  </span>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                Personal Information
              </h3>

              <form onSubmit={handleSaveProfile} className="mt-5 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3 text-slate-600">
                    <Mail size={18} />
                    <span className="break-all text-sm">
                      {user?.email}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Your registered email address.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Account Role
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3 text-slate-600">
                    <ShieldCheck size={18} />
                    {roleLabel}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Member Since
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3 text-slate-600">
                    <CalendarDays size={18} />
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString(
                          undefined,
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }
                        )
                      : 'Unavailable'}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </section>

            <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Lock className="text-teal-600" size={20} />
                Change Password
              </h3>

              <form onSubmit={handlePasswordUpdate} className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                    placeholder="Enter your new password"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Use at least 8 characters.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="rounded-xl border border-teal-600 px-5 py-3 font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-50"
                >
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </section>

            <section className="mt-6 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                Account Actions
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Sign out of your CareCircle account on this device.
              </p>

              <button
                onClick={handleLogout}
                className="mt-4 flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
