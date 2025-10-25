module.exports = {
  apps: [
    {
      name: 'pop-backend',
      script: 'dist/main.js',
      instances: 1,
      env_file: '.env',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],
};
