# 🚀 LuxeEssentials Deployment & Setup Guide

This guide describes how to deploy your Premium PWA E-commerce app built with React, Supabase, and Tailwind.

## 1. Prerequisites (Variables d'environnement)

You must fill out your `.env` file first:
```env
VITE_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_KEY"
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"
VITE_ONESIGNAL_APP_ID="YOUR_ONESIGNAL_APP_ID"
VITE_ONESIGNAL_REST_API_KEY="YOUR_ONESIGNAL_REST_API_KEY"
```

## 2. Supabase Configuration (Manual Steps)

1. Create a project on [supabase.com](https://supabase.com/).
2. Enable **Email/Password authentication**.
3. Create a **Storage Bucket** named `product-images` (make it Public).
4. Create a **Storage Bucket** named `invoices` (make it Private).
5. Open the Supabase SQL editor and execute the complete `supabase_schema.sql` file located in the root of this repository.

## 3. Deploying Edge Functions

Ensure you have the Supabase CLI installed, then login and link your project:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Deploy the 4 edge functions:
```bash
supabase functions deploy generate-invoice
supabase functions deploy validate-order
supabase functions deploy send-push-notification
supabase functions deploy generate-qr
```

For the push notification function, set the secrets in Supabase CLI:
```bash
supabase secrets set ONESIGNAL_APP_ID="YOUR_ID"
supabase secrets set ONESIGNAL_REST_API_KEY="YOUR_KEY"
```

## 4. Run Locally
```bash
npm install
npm exec prisma generate
npm run dev
```

The public product pages now read through Vercel API routes backed by Prisma:

- `GET /api/products`
- `GET /api/products/:id`

Those API routes require `DATABASE_URL`. Keep `DIRECT_URL` for migration commands that need the Supabase session-mode pooler.

## 5. Build for Production & Deploy
```bash
npm run build
```
You can deploy the resulting `dist/` folder to Vercel, Netlify, or Firebase Hosting.
The Vite PWA plugin will automatically generate the service worker at `dist/sw.js`.

For Vercel or Netlify, just link your GitHub repo and they will automatically run `npm run build` and deploy the output out of the box!
