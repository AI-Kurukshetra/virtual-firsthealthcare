# Architecture

## Overview
The Virtual Health Platform is a multi-tenant SaaS with strict organization scoping. It uses Supabase for authentication, data storage, and real-time events, with Next.js server components for data fetching and server actions for mutations.

## Key Layers
- **App Router (Next.js)**: Server Components render the primary UI and fetch server-side data.
- **API + Server Actions**: Mutations and integrations (S3 signed URLs, billing) live in `/app/api` and server actions.
- **Supabase**: Auth, Postgres, RLS policies, and realtime messaging/notifications.
- **S3**: Secure file storage with signed upload URLs.

## Multi-Tenant Model
All domain tables include `organization_id`. RLS policies enforce access based on the current user's organization and role:
- Admin: full access within org
- Provider: clinical access within org
- Patient: self-only access

## Real-time Features
- Messaging and notifications use Supabase Realtime channels.
- Telehealth sessions use WebRTC for media and Supabase for signaling (future expansion).

## Frontend Structure
- `(auth)` routes handle login and registration
- `(dashboard)` routes handle protected workflows
- Shared UI in `components/` and `components/ui`

## Security
- RLS enabled across all tables
- Server-side access for sensitive operations
- Signed URL uploads via API
