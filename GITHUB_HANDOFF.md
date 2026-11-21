# Offtrack — GitHub handoff

Project files are at the repository root (no nested project folder).

## Environment
Copy `.env.example` to `.env` locally and set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Set the same variables in Vercel Project Settings → Environment Variables.

## Important production blocker
The current checkout client inserts directly into `orders`. The included hardening migration revokes direct order inserts and documents a secure order-RPC path that checkout has not yet adopted. Do not apply that hardening migration to the live database until checkout is migrated to the secure RPC and tested. Verify all Supabase RLS policies and Storage policies before accepting real customer orders.

Governorate shipping settings are implemented in the admin settings UI and checkout reads the selected governorate rate. Test all 27 governorates and order totals with the deployed Supabase project.

InstaPay is manual proof upload/review, not an automatic payment gateway. A real online payment gateway needs a provider account and server-side integration.
