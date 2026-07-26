# webDAV

## Setup

Copy the example env and compose override files, then fill in your values:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
cp compose.override.example.yaml compose.override.yaml
```

- `.env`
- `compose.override.yaml` — sets the host/container port mapping and restart policy for local dev.

Then start the stack:

```bash
docker compose up -d --build
```

Install [goose](https://github.com/pressly/goose) (used by the `Makefile` to run migrations against the host-mapped DB port — not bundled as a Go dependency):

```bash
go install github.com/pressly/goose/v3/cmd/goose@latest
```

Apply migrations:

```bash
make migrate-up
```

### DB

apply all pending migrations
```
make migrate-up
```

roll back the last migration
```
make migrate-down
```

check migration status
```
make migrate-status
```

create a new migration
```
make migrate-create name=add_users_table
```
