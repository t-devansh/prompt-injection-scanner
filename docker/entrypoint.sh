#!/usr/bin/env bash
set -euo pipefail

MODE="${MODE:-api}"

if [ "$MODE" = "cli" ]; then
  # pass all args through to the CLI
  exec python -m src.cli "$@"
else
  # default: API mode
  exec uvicorn src.api.main:app --host 0.0.0.0 --port 8000
fi
