// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'paint-app',
    script: 'npx',
    args: 'serve -s build -l 3000 --single',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};