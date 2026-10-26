#!/usr/bin/env bash
# 在服务器 /home/work/tutor-platform-backend 下执行。用 PM2 托管 Fastify。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"

if ! command -v pm2 >/dev/null 2>&1; then
  echo "未找到 pm2。请先安装: npm install -g pm2" >&2
  exit 1
fi

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

mkdir -p logs

APP_NAME="tutor-backend"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  # 从旧的 nohup 进程切过来时，先让出 3000 端口。
  if pgrep -f "node dist/server.js" >/dev/null 2>&1; then
    pkill -f "node dist/server.js" || true
    sleep 1
  fi
  pm2 start ecosystem.config.cjs --update-env
fi

pm2 save

sleep 2
if curl -sf "http://127.0.0.1:${PORT:-3000}/api/v1/health" >/dev/null; then
  echo "health: OK"
else
  echo "health: FAIL (pm2 logs $APP_NAME)"
fi

echo "日志: $(pwd)/logs/out.log"
echo "开机自启（root 执行一次）: env PATH=\$PATH:\$HOME/.npm-global/bin pm2 startup systemd -u work --hp /home/work"
