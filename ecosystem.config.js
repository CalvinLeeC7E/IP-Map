module.exports = {
  apps: [
    {
      name: 'ip-map',
      script: 'src/server.js',
      max_memory_restart: '512M',
      env: {
        PORT: '3009',
        NODE_ENV: 'production'
      }
    }
  ]
}
