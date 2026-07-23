# webDAV

## Setup

Copy the example env and compose override files, then fill in your values:

```bash
cp .env.example .env
cp compose.override.example.yaml compose.override.yaml
```

- `.env`
- `compose.override.yaml` — sets the host/container port mapping and restart policy for local dev.

Then start the stack:

```bash
docker compose up -d --build
```
