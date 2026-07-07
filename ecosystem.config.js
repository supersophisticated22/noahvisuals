require('dotenv').config();


module.exports = {
    apps: [
        {
            name: "noahvisuals",
            cwd: __dirname,
            script: "node_modules/next/dist/bin/next",
            args: "start -H 127.0.0.1 -p 3001",
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            max_memory_restart: "512M",
            env: {
                NODE_ENV: "production",
                HOSTNAME: "127.0.0.1",
                PORT: "3001",
                ADMIN_USER: process.env.ADMIN_USER,
                ADMIN_PASS: process.env.ADMIN_PASS,
                JWT_SECRET: process.env.JWT_SECRET,
                ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
            },
            out_file: "logs/noahvisuals-pm2-out.log",
            error_file: "logs/noahvisuals-pm2-error.log",
            merge_logs: true,
            time: true,
        },
    ],
};