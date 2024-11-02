module.exports = {
  extends: ['next', 'next/core-web-vitals'],
  env: {
    node: true,
    browser: true,
  },
  rules: {
    'import/no-anonymous-default-export': 'off',
  },
}
