module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [{
        name: 'Plum',
        script: './start.sh',
        cwd: '.',
        watch: true,
        exec_mode: 'cluster',
        instances: 2,
        ignore_watch: [
            'node_modules',
            'logs'
        ],
        watch_options: {
            usePolling: false
        },
        env: {
            COMMON_VARIABLE: 'true',
            NODE_ENV: 'production'
        },
        env_dev: {
            COMMON_VARIABLE: 'true',
            NODE_ENV: 'development'
        },
        env_test: {
            NODE_ENV: 'test'
        },
        log_date_format: 'YYYY-MM-DD HH:mm Z',
        error_file: './logs/plum-err.log',
        out_file: './logs/plum-out.log'
    }],

    /**
     * Deployment section
     * http://pm2.keymetrics.io/docs/usage/deployment/
     */
    deploy: {
        development: {
            user: 'dn',
            host: '192.168.1.13',
            ref: 'origin/master',
            repo: 'http://deploy:123456789@git.datacenter.io/DataCenter/plum.git',
            path: '/var/www/plum/development',
            env: {
                NODE_ENV: 'development'
            },
            'pre-setup': 'mkdir -p /var/www/plum/development/logs',
            'post-deploy': 'npm install --registry=https://registry.npm.taobao.org && pm2 reload ecosystem.config.js --env development'
        }
    }
};
