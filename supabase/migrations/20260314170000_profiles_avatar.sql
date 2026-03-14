-- Add profile image column only (view update moved to next migration)

alter table public.users
  add column if not exists profile_image text;
