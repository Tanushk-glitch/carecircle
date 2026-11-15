
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  HeartPulse,
  Moon,
  Utensils,
  CalendarDays,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

type Mood = 'great' | 'good' | 'okay' | 'low'
type Quality = 'good' | 'average' | 'poor'

type Checkin = {
  id: string
  user_id: string
  checkin_date: string
  mood: Mood
  sleep_quality: Quality
  appetite: Quality
  notes: string | null
  created_at: string
}

type Connection = {
  senior_id: string
}

const moods: { value: Mood; emoji: string; label: string }[] = [
  { value: 'great', emoji: '😄', label: 'Great' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'low', emoji: '😟', label: 'Low' },
]

const qualities: Quality[] = ['good', 'average', 'poor']

function localDate() {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10)
}

export default function WellbeingCheckin() {
  const { user } = useAuth()
  const role = user?.user_metadata?.role

  const isSenior = role === 'senior'

  const [mood, setMood] = useState<Mood>('good')
  const [sleep, setSleep] = useState<Quality>('good')
  const [appetite, setAppetite] = useState<Quality>('good')
  const [notes, setNotes] = useState('')
  const [todayCheckin, setTodayCheckin] = useState<Checkin | null>(null)

  const [history, setHistory] = useState<Checkin[]>([])
  const [seniorNames, setSeniorNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function loadSeniorCheckin() {
    if (!user) return

    const { data, error } = await supabase
      .from('wellbeing_checkins')
      .select('*')
      .eq('user_id', user.id)
      .eq('checkin_date', localDate())
      .maybeSingle()

    if (error) {
      toast.error('Could not load today’s check-in')
      console.error(error)
      return
    }

    if (data) {
      setTodayCheckin(data)
      setMood(data.mood)
      setSleep(data.sleep_quality)
      setAppetite(data.appetite)
      setNotes(data.notes ?? '')
    }
  }

  async function saveCheckin() {
    if (!user) return

    setSaving(true)

    const { data, error } = await supabase
      .from('wellbeing_checkins')
      .upsert(
        {
          user_id: user.id,
          checkin_date: localDate(),
          mood,
          sleep_quality: sleep,
          appetite,
          notes: notes.trim() || null,
        },
        { onConflict: 'user_id,checkin_date' }
      )
      .select()
      .single()

    if (error) {
      toast.error(error.message)
      console.error(error)
    } else {
      setTodayCheckin(data)
      toast.success('Your wellbeing check-in is saved!')
    }

    setSaving(false)
  }

  async function loadCaregiverHistory() {
    if (!user) return

    const { data: connections, error: connectionError } = await supabase
      .from('care_connections')
      .select('senior_id')
      .eq('caregiver_id', user.id)
      .eq('status', 'active')

    if (connectionError) {
      console.error(connectionError)
      toast.error('Could not load connected seniors')
      return
    }

    const seniorIds = [
      ...new Set((connections ?? []).map((item: Connection) => item.senior_id)),
    ]

    if (seniorIds.length === 0) {
      setHistory([])
      setSeniorNames({})
      return
    }

    const { data: checkins, error } = await supabase
      .from('wellbeing_checkins')
      .select('*')
      .in('user_id', seniorIds)
      .order('checkin_date', { ascending: false })

    if (error) {
      console.error(error)
      toast.error('Could not load wellbeing history')
      return
    }

    setHistory(checkins ?? [])

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', seniorIds)

    const names: Record<string, string> = {}

    profiles?.forEach((profile) => {
      names[profile.id] = profile.full_name || 'Connected senior'
    })

    setSeniorNames(names)
  }

  async function loadData() {
    setLoading(true)

    if (isSenior) {
      await loadSeniorCheckin()
    } else {
      await loadCaregiverHistory()
    }

    setLoading(false)
  }

  useEffect(() => {
    if (user) loadData()
  }, [user?.id])

  function qualityLabel(value: Quality) {
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

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

          <h1 className="flex items-center gap-2 font-bold">
            <HeartPulse className="text-teal-600" />
            Wellbeing Check-in
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="text-3xl font-bold text-slate-900">
          {isSenior ? 'How are you feeling today?' : 'Wellbeing overview'}
        </h2>

        <p className="mt-2 text-slate-600">
          {isSenior
            ? 'Take a moment to share how your day is going.'
            : 'Stay informed about the wellbeing of your connected seniors.'}
        </p>

        {loading ? (
          <p className="mt-8 text-slate-500">Loading wellbeing information...</p>
        ) : isSenior ? (
          <section className="mt-8 space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold">How are you feeling?</h3>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {moods.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMood(item.value)}
                    className={`rounded-xl border p-4 transition ${
                      mood === item.value
                        ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-200'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-3xl">{item.emoji}</span>
                    <span className="mt-2 block font-semibold">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-bold">
                <Moon className="text-teal-600" />
                How was your sleep?
              </h3>

              <div className="mt-3 flex flex-wrap gap-3">
                {qualities.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSleep(item)}
                    className={`rounded-xl border px-5 py-3 font-medium ${
                      sleep === item
                        ? 'border-teal-600 bg-teal-50 text-teal-700'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {qualityLabel(item)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-bold">
                <Utensils className="text-teal-600" />
                How is your appetite?
              </h3>

              <div className="mt-3 flex flex-wrap gap-3">
                {qualities.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAppetite(item)}
                    className={`rounded-xl border px-5 py-3 font-medium ${
                      appetite === item
                        ? 'border-teal-600 bg-teal-50 text-teal-700'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {qualityLabel(item)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold" htmlFor="wellbeing-notes">
                Any concerns today? (Optional)
              </label>

              <textarea
                id="wellbeing-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Share anything you would like your caregiver to know..."
                className="mt-3 w-full rounded-xl border p-4 outline-none focus:border-teal-500"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {notes.length}/500
              </p>
            </div>

            <button
              onClick={saveCheckin}
              disabled={saving}
              className="w-full rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {saving
                ? 'Saving...'
                : todayCheckin
                  ? 'Update today’s check-in'
                  : 'Submit today’s check-in'}
            </button>

            {todayCheckin && (
              <p className="text-center text-sm text-teal-700">
                ✓ You have already submitted today’s check-in. You can update it anytime.
              </p>
            )}
          </section>
        ) : (
          <section className="mt-8">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold">Recent check-ins</h3>

              <button
                onClick={loadData}
                className="rounded-lg border bg-white p-2 hover:bg-slate-50"
                aria-label="Refresh wellbeing history"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            {history.length === 0 ? (
              <div className="rounded-2xl border bg-white p-8 text-center">
                <HeartPulse className="mx-auto text-teal-600" size={36} />
                <h3 className="mt-3 font-bold">No check-ins yet</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Your connected seniors’ wellbeing updates will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => {
                  const moodInfo = moods.find(
                    (m) => m.value === item.mood
                  )

                  return (
                    <article
                      key={item.id}
                      className="rounded-2xl border bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-slate-900">
                            {seniorNames[item.user_id] || 'Connected senior'}
                          </h4>
                          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <CalendarDays size={15} />
                            {item.checkin_date}
                          </p>
                        </div>

                        <span className="rounded-full bg-teal-50 px-4 py-2 font-semibold text-teal-700">
                          {moodInfo?.emoji} {moodInfo?.label || item.mood}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-sm text-slate-500">Sleep quality</p>
                          <p className="mt-1 font-semibold">
                            {qualityLabel(item.sleep_quality)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-sm text-slate-500">Appetite</p>
                          <p className="mt-1 font-semibold">
                            {qualityLabel(item.appetite)}
                          </p>
                        </div>
                      </div>

                      {item.notes && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <p className="text-sm font-semibold">Senior's note</p>
                          <p className="mt-1 text-sm text-slate-700">
                            {item.notes}
                          </p>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
