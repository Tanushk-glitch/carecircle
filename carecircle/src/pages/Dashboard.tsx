
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse, LogOut, Pill, CalendarDays, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    const error = await signOut()

    if (error) {
      alert(error)
      return
    }

    navigate('/login')
  }

  const name = user?.user_metadata?.full_name || 'User'

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

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Pill, title: 'Medications', description: 'Manage medication schedules.' },
            { icon: CalendarDays, title: 'Appointments', description: 'Track upcoming appointments.' },
            { icon: Bell, title: 'Care alerts', description: 'Stay updated on important reminders.' },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border bg-white p-7 shadow-sm">
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
