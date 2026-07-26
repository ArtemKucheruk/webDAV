-- +goose Up
alter table users
  add column active bool not null default true;

-- +goose Down
alter table users
  drop column active;
