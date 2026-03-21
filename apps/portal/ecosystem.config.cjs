// apps/portal/ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'portal-static',
    script: 'serve',
    args: '-s dist -l 4000',
    cwd: '/home/ec2-user/portal',
    env: { NODE_ENV: 'production' },
  }],
}
