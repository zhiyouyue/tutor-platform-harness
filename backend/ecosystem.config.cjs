// 4 核 8G，且 MySQL 常与本机同驻。
// WebSocket 连接表在进程内存里，多实例会拆掉同一用户的推送，因此保持 fork 单实例。
// 堆上限 1G，常驻内存超过 1200M 由 PM2 重启，把其余内存留给系统和数据库。
module.exports = {
  apps: [
    {
      name: "tutor-backend",
      cwd: __dirname,
      script: "dist/server.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "1200M",
      node_args: "--max-old-space-size=1024",
      kill_timeout: 8000,
      listen_timeout: 10000,
      wait_ready: true,
      exp_backoff_restart_delay: 100,
      min_uptime: "10s",
      max_restarts: 10,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      out_file: "logs/out.log",
      error_file: "logs/error.log",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
