
import {
  Activity,
  ArrowRight,
  BellRing,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  HeartHandshake,
  HeartPulse,
  Pill,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const features = [
  {
    icon: Pill,
    title: "Medication reminders",
    description:
      "Keep track of daily medicines, dosage schedules, and whether each dose has been taken.",
    color: "teal",
  },
  {
    icon: CalendarDays,
    title: "Appointment tracking",
    description:
      "Organise upcoming doctor visits and keep important healthcare appointments in one place.",
    color: "blue",
  },
  {
    icon: BellRing,
    title: "Smart care alerts",
    description:
      "Help caregivers stay informed when a scheduled medication needs attention.",
    color: "orange",
  },
  {
    icon: UsersRound,
    title: "Connected family",
    description:
      "Bring seniors, family members, and caregivers together around everyday care.",
    color: "purple",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7faf9] text-slate-800">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-lg">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <a href="#" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
              <HeartPulse size={23} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Care<span className="text-teal-600">Circle</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-teal-700">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-teal-700">
              How it works
            </a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-teal-700">
              About
            </a>
          </div>

          <a
           href="/signup"
            className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            Get started <ArrowRight className="ml-1 inline" size={16} />
          </a>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-teal-100/60 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-4 py-2 text-sm font-medium text-teal-700 shadow-sm">
                <Heart size={15} className="fill-teal-500 text-teal-500" />
                Care that keeps everyone connected
              </div>

              <h1 className="max-w-2xl text-5xl font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-6xl">
                Better care,
                <span className="block text-teal-600">closer together.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
                Making everyday elderly care simpler. Manage medications,
                organise appointments, and keep family members connected —
                all in one caring circle.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <a
                  href="/signup"
                  className="rounded-xl bg-teal-600 px-7 py-4 font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5 hover:bg-teal-700"
                >
                  Start your care circle <ArrowRight className="ml-2 inline" size={18} />
                </a>
                <a
                  href="#features"
                  className="rounded-xl border border-slate-300 bg-white px-7 py-4 font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-700"
                >
                  Explore features
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-teal-600" />
                  Easy to use
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-teal-600" />
                  Family connected
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-teal-600" />
                  Care focused
                </span>
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-5 rounded-[2rem] bg-teal-100/60 blur-2xl" />
              <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-300/40 sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Good morning</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                      Today&apos;s care
                    </h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                    <Activity size={25} />
                  </div>
                </div>

                <div className="mt-7 rounded-2xl bg-teal-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-teal-800">Daily progress</p>
                      <p className="mt-1 text-3xl font-bold text-slate-900">2 of 3</p>
                      <p className="mt-1 text-sm text-slate-600">Medication doses completed</p>
                    </div>
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-[7px] border-teal-200">
                      <span className="text-lg font-bold text-teal-700">67%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-7">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Medication schedule</h3>
                    <span className="text-sm font-medium text-teal-700">Today</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Pill size={21} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800">Morning medication</p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                          <Clock3 size={14} /> 8:00 AM
                        </p>
                      </div>
                      <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                        Taken
                      </span>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                        <Pill size={21} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800">Afternoon medication</p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                          <Clock3 size={14} /> 2:00 PM
                        </p>
                      </div>
                      <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                        Taken
                      </span>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border border-orange-100 bg-orange-50/40 p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                        <Pill size={21} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800">Evening medication</p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                          <Clock3 size={14} /> 8:00 PM
                        </p>
                      </div>
                      <span className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-teal-700 shadow-sm">
                    <ShieldCheck size={21} />
                  </div>
                  <p className="text-sm leading-5 text-slate-600">
                    <span className="font-semibold text-slate-800">Peace of mind.</span>{" "}
                    Stay connected with the people who care.
                  </p>
                </div>
                <p className="mt-3 text-center text-xs text-slate-400">
                  Illustrative dashboard preview
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-teal-600">
                What we offer
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything in care, in one circle.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Thoughtful tools that make daily healthcare coordination easier
                for seniors and the people who support them.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                const colors: Record<string, string> = {
                  teal: "bg-teal-50 text-teal-700",
                  blue: "bg-blue-50 text-blue-700",
                  orange: "bg-orange-50 text-orange-700",
                  purple: "bg-purple-50 text-purple-700",
                };

                return (
                  <article
                    key={feature.title}
                    className="rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-200/50"
                  >
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors[feature.color]}`}>
                      <Icon size={27} />
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="mt-3 leading-7 text-slate-600">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-[#f1f8f6] py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-teal-600">
                Simple by design
              </span>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                A little more connected. Every day.
              </h2>
            </div>

            <div className="mt-16 grid gap-10 md:grid-cols-3">
              {[
                {
                  number: "01",
                  icon: UsersRound,
                  title: "Create your circle",
                  description:
                    "Bring the senior, family members, and caregivers into one connected space.",
                },
                {
                  number: "02",
                  icon: CalendarDays,
                  title: "Organise daily care",
                  description:
                    "Add medication schedules and upcoming appointments to stay organised.",
                },
                {
                  number: "03",
                  icon: HeartHandshake,
                  title: "Stay in the loop",
                  description:
                    "Keep caregivers informed about medication updates and important reminders.",
                },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="relative text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-md shadow-teal-900/5">
                      <Icon size={29} />
                    </div>
                    <p className="mt-6 text-sm font-bold tracking-widest text-teal-600">
                      STEP {step.number}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mx-auto mt-3 max-w-sm leading-7 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* About / CTA */}
        <section id="about" className="bg-white px-6 py-24">
          <div className="mx-auto max-w-5xl rounded-3xl bg-slate-900 px-7 py-14 text-center sm:px-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500 text-white">
              <HeartPulse size={29} />
            </div>
            <h2 className="mt-7 text-3xl font-bold text-white sm:text-4xl">
              Because care works better together.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Make everyday care more organised, more connected, and a little
              less stressful for everyone involved.
            </p>
            <a
              id="get-started"
              href="/signup"
              className="mt-9 inline-flex items-center rounded-xl bg-teal-500 px-7 py-4 font-semibold text-white transition hover:bg-teal-400"
            >
              Create your account <ArrowRight className="ml-2" size={18} />
            </a>
            <p className="mt-4 text-xs text-slate-400">
              Login and account creation will be available once authentication is implemented.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row lg:px-8">
          <a href="#" className="flex items-center gap-2 font-bold text-slate-900">
            <HeartPulse className="text-teal-600" size={21} />
            CareCircle
          </a>
          <p className="text-center text-sm text-slate-500">
            Made with care. Keeping families connected.
          </p>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} CareCircle
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
