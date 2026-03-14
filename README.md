# Virtual Health Platform

Production-grade, multi-tenant telehealth + EHR platform built with Next.js App Router, Supabase, and AWS S3. Designed for healthcare organizations that require compliant workflows, real-time collaboration, and scalable infrastructure.

## Core Capabilities
- Multi-tenant organizations with role-based access (`admin`, `provider`, `patient`)
- Telehealth rooms with WebRTC client controls
- EHR workflows: SOAP notes, care plans, prescriptions, labs, and documents
- Real-time messaging and notifications
- Analytics dashboards for clinical and business KPIs
- Secure file uploads via AWS S3 signed URLs

## Tech Stack
- Next.js App Router + TypeScript
- TailwindCSS + shadcn/ui + lucide-react
- Supabase Auth + Postgres + Realtime + Edge Functions
- AWS S3 for document storage
- React Query, Zod, react-hook-form, recharts

## Quick Start
```bash
npm install
supabase init
supabase db push
supabase db seed
npm run dev
```

## Environment Variables
Copy `.env.example` and fill in the required values.

## Documentation
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/API.md`
- `docs/SEEDERS.md`
- `docs/DEPLOYMENT.md`

## Notes
- Supabase Auth manages credentials; `public.users` mirrors user profiles.
- RLS policies enforce organization and role scoping for all clinical data.
