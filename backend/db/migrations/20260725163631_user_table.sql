-- +goose Up
alter table users
  add column email TEXT not null UNIQUE,
  add column password_hash TEXT not null,
  add column created_at TIMESTAMPTZ not null DEFAULT now();

-- +goose Down
alter table users
  drop column email,
  drop column password_hash,
  drop column created_at;
