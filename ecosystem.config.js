module.exports = {
  apps: [{
    name: 'zed-legends',
    script: 'server-optimized.js',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '800M',
    node_args: '--max-old-space-size=512',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      MUSIC_DIR: '/home/purple/Music'
    },
    log_file: './logs/combined.log',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    time: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}