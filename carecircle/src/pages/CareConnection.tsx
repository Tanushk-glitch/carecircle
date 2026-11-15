
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HeartHandshake,
  Copy,
  Users,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

type Connection = {
  id: string
  senior_id: string
  caregiver_id: string
  status: 'active' | 'revoked'
  created_at: string
}

export default function CareConnections() {
  const { user } = useAuth()
  const role = user?.user_metadata?.role as
    | 'senior'
    | 'caregiver'
    | 'family'
    | undefined

  const [code, setCode] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  async function loadConnections() {
    if (!user) return

    setLoading(true)

    const { data, error } = await supabase
      .from('care_connections')
      .select('id, senior_id, caregiver_id, status, created_at')
      .or(`senior_id.eq.${user.id},caregiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Could not load connections')
      console.error(error)
    } else {
      setConnections(data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadConnections()
  }, [user?.id])

  async function generateInvite() {
    setSubmitting(true)

    const { data, error } = await supabase.rpc('create_care_invite')

    if (error) {
      toast.error(error.message)
    } else {
      setInviteCode(data)
      toast.success('Invitation code generated')
    }

    setSubmitting(false)
  }

  async function redeemInvite() {
    if (!code.trim()) {
      toast.error('Enter an invitation code')
      return
    }

    setSubmitting(true)

    const { error } = await supabase.rpc('redeem_care_invite', {
      p_code: code.trim(),
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Successfully connected to the senior!')
      setCode('')
      await loadConnections()
    }

    setSubmitting(false)
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(inviteCode)
      toast.success('Invitation code copied')
    } catch {
      toast.error('Could not copy code')
    }
  }

  const isSenior = role === 'senior'

  return (
    <div className="min-h-screen bg-[#f1f8f6]">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-semibold text-slate-700"
          >
            <ArrowLeft size={18} />
            Dashboard
          </Link>

          <h1 className="flex items-center gap-2 text-lg font-bold">
            <HeartHandshake className="text-teal-600" />
            Care Connections
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="text-3xl font-bold text-slate-900">
          Your Care Circle
        </h2>

        <p className="mt-2 text-slate-600">
          Connect seniors with trusted family members and caregivers.
        </p>

        {isSenior ? (
          <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">Invite a caregiver or family member</h3>
            <p className="mt-2 text-sm text-slate-500">
              Generate a secure invitation code. It expires after 24 hours
              and can only be used once.
            </p>

            <button
              onClick={generateInvite}
              disabled={submitting}
              className="mt-5 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {submitting ? 'Generating...' : 'Generate invitation code'}
            </button>

            {inviteCode && (
              <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50 p-4">
                <p className="text-sm font-semibold text-teal-800">
                  Your invitation code
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <code className="break-all text-lg font-bold tracking-wider text-slate-900">
                    {inviteCode}
                  </code>

                  <button
                    onClick={copyCode}
                    className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold"
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-600">
                  Share this code privately with your trusted caregiver.
                </p>
              </div>
            )}
          </section>
        ) : (
          <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">Join a Care Circle</h3>
            <p className="mt-2 text-sm text-slate-500">
              Enter the invitation code shared by the senior.
            </p>

            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="Enter invitation code"
              maxLength={16}
              className="mt-5 w-full rounded-xl border px-4 py-3 outline-none focus:border-teal-500 sm:max-w-md"
            />

            <button
              onClick={redeemInvite}
              disabled={submitting}
              className="mt-4 block rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {submitting ? 'Connecting...' : 'Connect to senior'}
            </button>
          </section>
        )}

        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <Users className="text-teal-600" />
              Connected members
            </h3>

            <button
              onClick={loadConnections}
              className="rounded-lg border p-2 hover:bg-slate-50"
              aria-label="Refresh connections"
            >
              <RefreshCw size={17} />
            </button>
          </div>

          {loading ? (
            <p className="mt-5 text-slate-500">Loading connections...</p>
          ) : connections.length === 0 ? (
            <p className="mt-5 text-slate-500">
              No connected members yet.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {connections.map((connection) => {
                const otherId =
                  connection.senior_id === user?.id
                    ? connection.caregiver_id
                    : connection.senior_id

                return (
                  <div
                    key={connection.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">
                        {connection.senior_id === user?.id
                          ? 'Connected caregiver / family'
                          : 'Connected senior'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Member ID: {otherId.slice(0, 8)}...
                      </p>
                    </div>

                    <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
                      {connection.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
