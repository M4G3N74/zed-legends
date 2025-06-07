module.exports = {
  apps: [{
    name: 'zed-legends',
    script: 'server-optimized.js',
    instances: 1, // Single instance for 1GB RAM
    exec_mode: 'fork', // Use fork mode instead of cluster
    max_memory_restart: '800M', // Restart if memory exceeds 800MB
    node_args: '--max-old-space-size=512', // Limit Node.js heap to 512MB
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '/var/log/zed-legends.log',
    error_file: '/var/log/zed-legends-error.log',
    out_file: '/var/log/zed-legends-out.log',
    time: true
  }]
}