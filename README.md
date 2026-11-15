# CareCircle ❤️

**A Healthcare Coordination Platform for Senior Citizens, Caregivers, and Families.**

CareCircle is a web-based healthcare management platform that simplifies daily care coordination for senior citizens. It helps users manage medications, track appointments, monitor wellbeing, and stay connected with caregivers and family members through a centralized dashboard.

## ✨ Features

- **Secure Authentication:** Signup, login, and role-based access for seniors, caregivers, and family members.
- **Medication Management:** Add, manage, and track medications and dose records.
- **Appointment Management:** Schedule and manage healthcare appointments.
- **Caregiver Connections:** Connect seniors with caregivers and family members using invite codes.
- **Care Alerts:** Generate alerts for overdue medication doses.
- **Daily Wellbeing Check-ins:** Record mood, sleep quality, appetite, and personal notes.
- **Caregiver Dashboard:** Allow connected caregivers to view relevant senior care information and wellbeing history.
- **Database Security:** Supabase Row Level Security (RLS) policies protect user data and control access.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend & Database | Supabase, PostgreSQL |
| Authentication | Supabase Auth |
| Routing | React Router |
| Icons | Lucide React |
| Notifications UI | React Hot Toast |
| Deployment | Vercel |
| Version Control | Git & GitHub |

## 🏗️ Architecture

- React-based frontend for user interaction.
- Supabase handles authentication and database operations.
- PostgreSQL stores user profiles, medications, appointments, care connections, alerts, and wellbeing check-ins.
- Row Level Security (RLS) enforces data access permissions.
- Vercel hosts the deployed application.

## 🚀 Getting Started

### Prerequisites
- Node.js and npm
- A Supabase project

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Tanushk-glitch/carecircle.git
   ```

2. Navigate to the application directory:

   ```bash
   cd carecircle/carecircle
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the application directory and configure your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Create a production build:

   ```bash
   npm run build
   ```

## 🌐 Live Demo

[CareCircle – Live Application](https://carecircle-lake.vercel.app/)

## 🎯 Problem We Solve

Senior citizens often face challenges in managing medications, remembering appointments, and communicating their daily healthcare needs. CareCircle provides a centralized platform that improves visibility, organization, and coordination between seniors and their caregivers.

## 👨‍💻 Developer

**Tanushk Baranwal**

- GitHub: [Tanushk-glitch](https://github.com/Tanushk-glitch)

---

*CareCircle – Making everyday care more connected, organized, and accessible.* ❤️
