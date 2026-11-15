
import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  Plus,
  Pill,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  Ban,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface Medication {
  id: string
  user_id: string
  name: string
  dosage: string
  frequency: string
  times: string[]
  instructions: string | null
  is_active: boolean
}

interface DoseLog {
  id: string
  medication_id: string
  user_id: string
  scheduled_for: string
  status: 'pending' | 'taken' | 'skipped'
  action_at: string | null
}

const emptyForm = {
  name: '',
  dosage: '',
  frequency: 'Once daily',
  times: '08:00 AM',
  instructions: '',
}

function getTodayRange() {
  const now = new Date()

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )

  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  )

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

function createScheduledDate(time: string) {
  const match = time.match(
    /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i
  )

  if (!match) return null

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const period = match[3].toUpperCase()

  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  const now = new Date()

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  )
}

export default function Medications() {
  const { user } = useAuth()

  const [medications, setMedications] = useState<Medication[]>([])
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingDose, setUpdatingDose] = useState<string | null>(null)

  async function loadTodayLogs(meds: Medication[]) {
    if (!user) return

    const { start, end } = getTodayRange()

    const scheduledLogs = meds
      .filter((medication) => medication.is_active)
      .flatMap((medication) =>
        [...new Set(medication.times)].flatMap((time) => {
          const scheduledDate = createScheduledDate(time)

          if (!scheduledDate) return []

          return [{
            medication_id: medication.id,
            user_id: user.id,
            scheduled_for: scheduledDate.toISOString(),
            status: 'pending' as const,
          }]
        })
      )

    if (scheduledLogs.length > 0) {
      const { error: insertError } = await supabase
        .from('medication_logs')
        .upsert(scheduledLogs, {
          onConflict: 'medication_id,scheduled_for',
          ignoreDuplicates: true,
        })

      if (insertError) {
        toast.error('Could not prepare today’s dose schedule.')
        console.error(insertError)
        return
      }
    }

    const { data, error } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('scheduled_for', start)
      .lt('scheduled_for', end)
      .order('scheduled_for', { ascending: true })

    if (error) {
      toast.error('Could not load dose history.')
      console.error(error)
      return
    }

    setDoseLogs((data ?? []) as DoseLog[])
  }

  async function loadMedications() {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Could not load medications.')
      console.error(error)
    } else {
      const loadedMeds = (data ?? []) as Medication[]
      setMedications(loadedMeds)
      await loadTodayLogs(loadedMeds)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadMedications()
  }, [user?.id])

  function openAddForm() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  function openEditForm(medication: Medication) {
    setForm({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      times: medication.times.join(', '),
      instructions: medication.instructions ?? '',
    })

    setEditingId(medication.id)
    setShowForm(true)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user) return

    const times = [...new Set(
      form.times
        .split(',')
        .map((time) => time.trim().toUpperCase())
        .filter(Boolean)
    )]

    if (times.length === 0) {
      toast.error('Please enter at least one medication time.')
      return
    }

    if (
      times.some(
        (time) =>
          !/^((0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM))$/i.test(time)
      )
    ) {
      toast.error('Use a time format like 08:00 AM, 02:30 PM.')
      return
    }

    setSaving(true)

    const medicationData = {
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      frequency: form.frequency,
      times,
      instructions: form.instructions.trim() || null,
    }

    const result = editingId
      ? await supabase
          .from('medications')
          .update(medicationData)
          .eq('id', editingId)
          .eq('user_id', user.id)
      : await supabase
          .from('medications')
          .insert({ ...medicationData, user_id: user.id })

    if (result.error) {
      toast.error(result.error.message)
    } else {
      toast.success(editingId ? 'Medication updated!' : 'Medication added!')
      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
      await loadMedications()
    }

    setSaving(false)
  }

  async function deleteMedication(id: string) {
    if (!user) return

    if (!window.confirm('Are you sure you want to delete this medication?')) {
      return
    }

    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      toast.error('Could not delete medication.')
    } else {
      toast.success('Medication deleted.')
      await loadMedications()
    }
  }

  async function updateDoseStatus(
    log: DoseLog,
    status: 'taken' | 'skipped'
  ) {
    if (!user || updatingDose) return

    setUpdatingDose(log.id)

    const { data, error } = await supabase
      .from('medication_logs')
      .update({
        status,
        action_at: new Date().toISOString(),
      })
      .eq('id', log.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      toast.error('Could not update dose status.')
      console.error(error)
    } else {
      setDoseLogs((current) =>
        current.map((item) =>
          item.id === log.id ? (data as DoseLog) : item
        )
      )

      toast.success(
        status === 'taken'
          ? 'Dose marked as taken!'
          : 'Dose marked as skipped.'
      )
    }

    setUpdatingDose(null)
  }

  const takenCount = doseLogs.filter(
    (log) => log.status === 'taken'
  ).length

  const skippedCount = doseLogs.filter(
    (log) => log.status === 'skipped'
  ).length

  const pendingCount = doseLogs.filter(
    (log) => log.status === 'pending'
  ).length

  return (
    <div className="min-h-screen bg-[#f1f8f6]">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-slate-600 hover:text-teal-700"
        >
          <ArrowLeft size={19} />
          Dashboard
        </Link>

        <h1 className="text-xl font-bold text-slate-900">
          Care<span className="text-teal-600">Circle</span>
        </h1>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              My Medications
            </h2>
            <p className="mt-2 text-slate-600">
              Manage medications and track your daily doses.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700"
          >
            <Plus size={19} />
            Add medication
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingId ? 'Edit medication' : 'Add a medication'}
              </h3>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Medication name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g. Medicine A"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Dosage
                </label>
                <input
                  required
                  value={form.dosage}
                  onChange={(e) =>
                    setForm({ ...form, dosage: e.target.value })
                  }
                  placeholder="e.g. 1 tablet"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Frequency
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) =>
                    setForm({ ...form, frequency: e.target.value })
                  }
                  className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-teal-500"
                >
                  <option>Once daily</option>
                  <option>Twice daily</option>
                  <option>Three times daily</option>
                  <option>Four times daily</option>
                  <option>As needed</option>
                  <option>Custom schedule</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Schedule times
                </label>
                <input
                  required
                  value={form.times}
                  onChange={(e) =>
                    setForm({ ...form, times: e.target.value })
                  }
                  placeholder="08:00 AM, 08:00 PM"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-teal-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Separate multiple times with commas.
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Additional instructions (optional)
              </label>
              <textarea
                value={form.instructions}
                onChange={(e) =>
                  setForm({ ...form, instructions: e.target.value })
                }
                placeholder="Instructions provided by your healthcare professional"
                rows={3}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update medication'
                  : 'Save medication'}
            </button>
          </form>
        )}

        {/* Today's dose tracker */}
        <section className="mt-10">
          <div className="mb-5">
            <h3 className="text-2xl font-bold text-slate-900">
              Today's Dose Tracker
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Track each scheduled dose throughout the day.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border bg-white p-4">
              <CheckCircle2 className="text-green-600" />
              <p className="mt-2 text-2xl font-bold">{takenCount}</p>
              <p className="text-sm text-slate-500">Taken</p>
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <Clock className="text-amber-600" />
              <p className="mt-2 text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-slate-500">Pending</p>
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <Ban className="text-red-600" />
              <p className="mt-2 text-2xl font-bold">{skippedCount}</p>
              <p className="text-sm text-slate-500">Skipped</p>
            </div>
          </div>

          {doseLogs.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center">
              <Clock className="mx-auto text-teal-600" size={35} />
              <p className="mt-3 font-semibold text-slate-800">
                No doses scheduled for today
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add a medication with a schedule time to see it here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {doseLogs.map((log) => {
                const medication = medications.find(
                  (item) => item.id === log.medication_id
                )

                if (!medication) return null

                const scheduledTime = new Date(
                  log.scheduled_for
                ).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <article
                    key={log.id}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
                          <Pill size={22} />
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900">
                            {medication.name}
                          </h4>
                          <p className="text-sm text-slate-600">
                            {medication.dosage} · {scheduledTime}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                          log.status === 'taken'
                            ? 'bg-green-100 text-green-700'
                            : log.status === 'skipped'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {log.status.charAt(0).toUpperCase() +
                          log.status.slice(1)}
                      </span>
                    </div>

                    {log.status === 'pending' ? (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          disabled={updatingDose !== null}
                          onClick={() =>
                            updateDoseStatus(log, 'taken')
                          }
                          className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle2 size={17} />
                          Mark as Taken
                        </button>

                        <button
                          disabled={updatingDose !== null}
                          onClick={() =>
                            updateDoseStatus(log, 'skipped')
                          }
                          className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Ban size={17} />
                          Mark as Skipped
                        </button>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-slate-500">
                        Recorded at:{' '}
                        {log.action_at
                          ? new Date(log.action_at).toLocaleTimeString()
                          : 'Not available'}
                      </p>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* Medication list */}
        <section className="mt-12 space-y-4">
          <h3 className="text-2xl font-bold text-slate-900">
            All Medications
          </h3>

          {loading ? (
            <p className="py-12 text-center text-slate-500">
              Loading medications...
            </p>
          ) : medications.length === 0 ? (
            <div className="rounded-2xl border bg-white px-6 py-16 text-center">
              <Pill className="mx-auto text-teal-600" size={42} />
              <h3 className="mt-4 text-xl font-bold">
                No medications yet
              </h3>
              <p className="mt-2 text-slate-500">
                Add your first medication to start tracking your schedule.
              </p>
            </div>
          ) : (
            medications.map((medication) => (
              <article
                key={medication.id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
                      <Pill size={25} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {medication.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {medication.dosage} · {medication.frequency}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(medication)}
                      aria-label={`Edit ${medication.name}`}
                      className="rounded-lg border p-2 text-slate-600 hover:bg-slate-50"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      onClick={() => deleteMedication(medication.id)}
                      aria-label={`Delete ${medication.name}`}
                      className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {medication.times.map((time) => (
                    <span
                      key={time}
                      className="rounded-full bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700"
                    >
                      {time}
                    </span>
                  ))}
                </div>

                {medication.instructions && (
                  <p className="mt-4 text-sm text-slate-500">
                    {medication.instructions}
                  </p>
                )}
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  )
}
