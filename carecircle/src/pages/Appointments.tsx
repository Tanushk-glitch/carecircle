
import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  Plus,
  CalendarDays,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Stethoscope,
  Ban,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface Appointment {
  id: string
  user_id: string
  doctor_name: string
  appointment_date: string
  appointment_time: string
  location: string | null
  notes: string | null
  status: 'upcoming' | 'completed' | 'cancelled'
}

const emptyForm = {
  doctor_name: '',
  appointment_date: '',
  appointment_time: '',
  location: '',
  notes: '',
}

export default function Appointments() {
  const { user } = useAuth()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming')

  async function loadAppointments() {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    if (error) {
      toast.error('Could not load appointments.')
      console.error(error)
    } else {
      setAppointments((data ?? []) as Appointment[])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadAppointments()
  }, [user?.id])

  function openAddForm() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  function openEditForm(appointment: Appointment) {
    setForm({
      doctor_name: appointment.doctor_name,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time.slice(0, 5),
      location: appointment.location ?? '',
      notes: appointment.notes ?? '',
    })

    setEditingId(appointment.id)
    setShowForm(true)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user) return

    setSaving(true)

    const appointmentData = {
      doctor_name: form.doctor_name.trim(),
      appointment_date: form.appointment_date,
      appointment_time: form.appointment_time,
      location: form.location.trim() || null,
      notes: form.notes.trim() || null,
    }

    const result = editingId
      ? await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', editingId)
          .eq('user_id', user.id)
      : await supabase
          .from('appointments')
          .insert({
            ...appointmentData,
            user_id: user.id,
          })

    if (result.error) {
      toast.error(result.error.message)
    } else {
      toast.success(
        editingId ? 'Appointment updated!' : 'Appointment added!'
      )
      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
      await loadAppointments()
    }

    setSaving(false)
  }

  async function updateStatus(
    appointment: Appointment,
    status: 'completed' | 'cancelled'
  ) {
    if (!user || updatingId) return

    setUpdatingId(appointment.id)

    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointment.id)
      .eq('user_id', user.id)

    if (error) {
      toast.error('Could not update appointment.')
      console.error(error)
    } else {
      toast.success(
        status === 'completed'
          ? 'Appointment marked as completed!'
          : 'Appointment cancelled.'
      )
      await loadAppointments()
    }

    setUpdatingId(null)
  }

  async function deleteAppointment(id: string) {
    if (!user) return

    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return
    }

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      toast.error('Could not delete appointment.')
      console.error(error)
    } else {
      toast.success('Appointment deleted.')
      await loadAppointments()
    }
  }

  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status === 'upcoming'
  )

  const historyAppointments = appointments.filter(
    (appointment) => appointment.status !== 'upcoming'
  )

  const displayedAppointments =
    activeTab === 'upcoming'
      ? upcomingAppointments
      : historyAppointments

  function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString([], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  function formatTime(time: string) {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(Number(hours), Number(minutes), 0, 0)

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

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
              Appointments
            </h2>
            <p className="mt-2 text-slate-600">
              Keep track of doctor visits and medical appointments.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700"
          >
            <Plus size={19} />
            Add appointment
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingId ? 'Edit appointment' : 'Add an appointment'}
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
                  Doctor's name
                </label>
                <input
                  required
                  value={form.doctor_name}
                  onChange={(e) =>
                    setForm({ ...form, doctor_name: e.target.value })
                  }
                  placeholder="e.g. Dr. Sharma"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Appointment location
                </label>
                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="Hospital or clinic name"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Appointment date
                </label>
                <input
                  required
                  type="date"
                  value={form.appointment_date}
                  onChange={(e) =>
                    setForm({ ...form, appointment_date: e.target.value })
                  }
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Appointment time
                </label>
                <input
                  required
                  type="time"
                  value={form.appointment_time}
                  onChange={(e) =>
                    setForm({ ...form, appointment_time: e.target.value })
                  }
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Additional notes (optional)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                placeholder="Reason for visit or other important details"
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
                  ? 'Update appointment'
                  : 'Save appointment'}
            </button>
          </form>
        )}

        <div className="mt-10 flex gap-3 border-b">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`border-b-2 px-4 py-3 font-semibold ${
              activeTab === 'upcoming'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500'
            }`}
          >
            Upcoming ({upcomingAppointments.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`border-b-2 px-4 py-3 font-semibold ${
              activeTab === 'history'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500'
            }`}
          >
            History ({historyAppointments.length})
          </button>
        </div>

        <section className="mt-6 space-y-4">
          {loading ? (
            <p className="py-12 text-center text-slate-500">
              Loading appointments...
            </p>
          ) : displayedAppointments.length === 0 ? (
            <div className="rounded-2xl border bg-white px-6 py-16 text-center">
              <CalendarDays
                className="mx-auto text-teal-600"
                size={42}
              />
              <h3 className="mt-4 text-xl font-bold">
                {activeTab === 'upcoming'
                  ? 'No upcoming appointments'
                  : 'No appointment history'}
              </h3>
              <p className="mt-2 text-slate-500">
                {activeTab === 'upcoming'
                  ? 'Add your next doctor appointment to get started.'
                  : 'Completed or cancelled appointments will appear here.'}
              </p>
            </div>
          ) : (
            displayedAppointments.map((appointment) => (
              <article
                key={appointment.id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
                      <Stethoscope size={25} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {appointment.doctor_name}
                      </h3>

                      <div className="mt-2 space-y-2 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                          <CalendarDays size={16} />
                          {formatDate(appointment.appointment_date)}
                        </p>

                        <p className="flex items-center gap-2">
                          <Clock size={16} />
                          {formatTime(appointment.appointment_time)}
                        </p>

                        {appointment.location && (
                          <p className="flex items-center gap-2">
                            <MapPin size={16} />
                            {appointment.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                      appointment.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : appointment.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {appointment.status.charAt(0).toUpperCase() +
                      appointment.status.slice(1)}
                  </span>
                </div>

                {appointment.notes && (
                  <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    {appointment.notes}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  {appointment.status === 'upcoming' && (
                    <>
                      <button
                        disabled={updatingId !== null}
                        onClick={() =>
                          updateStatus(appointment, 'completed')
                        }
                        className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle2 size={16} />
                        Complete
                      </button>

                      <button
                        disabled={updatingId !== null}
                        onClick={() =>
                          updateStatus(appointment, 'cancelled')
                        }
                        className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Ban size={16} />
                        Cancel
                      </button>

                      <button
                        onClick={() => openEditForm(appointment)}
                        aria-label="Edit appointment"
                        className="rounded-xl border p-2.5 text-slate-600 hover:bg-slate-50"
                      >
                        <Pencil size={17} />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => deleteAppointment(appointment.id)}
                    aria-label="Delete appointment"
                    className="rounded-xl border p-2.5 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  )
}
