module.exports = {
  apps: [
    {
      name: 'pop-indexer',
      script: 'pnpm',
      args: 'dev',
      instances: 1,
      env_file: '.env',
      error_file: './logs/indexer-err.log',
      out_file: './logs/indexer-out.log',
      log_file: './logs/indexer-combined.log',
      time: true,
      interpreter: 'none',
    },
  ],
}
