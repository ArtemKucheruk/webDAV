-- +goose Up
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  user_id integer not null references users(id) on delete cascade,
  filename text not null,
  file_type text not null check(file_type in ('document', 'image', 'video', 'audio', 'other')),
  disk_path text not null,
  created_at TIMESTAMPTZ not null DEFAULT now()
);

CREATE INDEX idx_file_user_id ON files(user_id);

-- +goose Down
drop table files;
