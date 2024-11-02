module.exports = {
  extends: ['next', 'next/core-web-vitals'],
  env: {
    node: true,
    browser: true,
  },
  globals: {
    REACT_APP_ENV: true,
  },
  rules: {
    'import/no-anonymous-default-export': 'off',
  },
}
