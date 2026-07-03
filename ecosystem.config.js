module.exports = {
  apps: [
    {
      name: "noahvisuals",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
      // .env in project root is read by Next.js itself (ADMIN_USER, ADMIN_PASS,
      // JWT_SECRET, ANTHROPIC_API_KEY) — no need to duplicate here.
      out_file: "logs/noahvisuals-pm2-out.log",
      error_file: "logs/noahvisuals-pm2-error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
