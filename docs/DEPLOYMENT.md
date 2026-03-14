# Deployment

## Vercel
1. Set environment variables from `.env.example` in Vercel.
2. Connect the repo and deploy with the Next.js preset.
3. Ensure Supabase project URL and anon key are configured.

## Supabase
1. Apply migrations from `database/migrations/`.
2. Enable RLS policies in the migration file.
3. Seed sample data if needed.

## AWS S3
1. Create a private S3 bucket.
2. Configure IAM credentials for signed uploads.
3. Store credentials in Vercel secrets.
