#!/usr/bin/env bash
# 在服务器 /home/work/tutor-platform-backend 下执行（与 docs/ops/生产发布快捷命令.md 一致）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"

if [[ ! -f dist/server.js ]]; then
  echo "missing dist/server.js — run: npm run build -w backend" >&2
  exit 1
fi

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

pkill -f "node dist/server.js" 2>/dev/null || true
sleep 1

nohup node dist/server.js >> nohup_backend.out 2>&1 &
echo "started pid $! — log: $(pwd)/nohup_backend.out"

sleep 2
curl -sf "http://127.0.0.1:${PORT:-3000}/api/v1/health" >/dev/null && echo "health: OK" || echo "health: FAIL (check log)"
