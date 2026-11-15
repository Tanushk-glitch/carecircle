
import { Link, useNavigate } from 'react-router-dom'
import {
  HeartPulse,
  LogOut,
  Pill,
  CalendarDays,
  Bell,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { generateOverdueAlerts } from '../lib/careAlerts'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

type CareAlert = {
  id: string
  message: string
  status: 'active' | 'resolved' | 'dismissed'
  created_at: string
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [alerts, setAlerts] = useState<CareAlert[]>([])
  const [alertsLoading, setAlertsLoading] = useState(true)

  const name = user?.user_metadata?.full_name || 'User'

  async function handleLogout() {
    const error = await signOut()

    if (error) {
      alert(error)
      return
    }

    navigate('/login')
  }

  async function loadAlerts() {
    if (!user) return

    try {
      await generateOverdueAlerts(user.id)

      const { data, error } = await supabase
        .from('care_alerts')
        .select('id, message, status, created_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error

      setAlerts(data ?? [])
    } catch (error) {
      console.error('Failed to load care alerts:', error)
      toast.error('Could not load care alerts')
    } finally {
      setAlertsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadAlerts()
    }
  }, [user?.id])

  async function updateAlertStatus(
    alertId: string,
    status: 'resolved' | 'dismissed'
  ) {
    const { error } = await supabase
      .from('care_alerts')
      .update({
        status,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', alertId)

    if (error) {
      toast.error('Could not update alert')
      return
    }

    toast.success(
      status === 'resolved' ? 'Alert resolved' : 'Alert dismissed'
    )

    await loadAlerts()
  }

  return (
    <div className="min-h-screen bg-[#f1f8f6]">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <HeartPulse className="text-teal-600" size={28} />
          <h1 className="text-xl font-bold">
            Care<span className="text-teal-600">Circle</span>
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          <LogOut size={17} /> Logout
        </button>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-3xl font-bold text-slate-900">
          Welcome, {name}!
        </h2>

        <p className="mt-2 text-slate-600">
          Your CareCircle dashboard is ready.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/medications"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700"
          >
            <Pill size={19} />
            Manage medications
          </Link>

          <Link
            to="/appointments"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700"
          >
            <CalendarDays size={19} />
            Manage appointments
          </Link>
        </div>

        {/* Care Alerts */}
        <section className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              <Bell className="mr-2 inline text-teal-600" size={22} />
              Care Alerts
            </h3>

            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
              {alerts.length} Active
            </span>
          </div>

          {alertsLoading ? (
            <p className="mt-4 text-slate-500">
              Checking alerts...
            </p>
          ) : alerts.length === 0 ? (
            <p className="mt-4 text-slate-500">
              No active alerts. You're all caught up!
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-xl border border-red-200 bg-red-50 p-4"
                >
                  <p className="font-medium text-slate-800">
                    {alert.message}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>

                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() =>
                        updateAlertStatus(alert.id, 'resolved')
                      }
                      className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                    >
                      Resolve
                    </button>

                    <button
                      onClick={() =>
                        updateAlertStatus(alert.id, 'dismissed')
                      }
                      className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-white"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Dashboard Cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Pill,
              title: 'Medications',
              description: 'Manage medication schedules.',
            },
            {
              icon: CalendarDays,
              title: 'Appointments',
              description: 'Track upcoming appointments.',
            },
            {
              icon: Bell,
              title: 'Care alerts',
              description: 'Stay updated on important reminders.',
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border bg-white p-7 shadow-sm"
            >
              <Icon size={30} className="text-teal-600" />
              <h3 className="mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
