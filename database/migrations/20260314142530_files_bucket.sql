-- Track storage bucket for uploaded files

alter table files
  add column if not exists bucket text not null default 'documents';
