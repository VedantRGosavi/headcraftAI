const config = {
  plugins: {
    'tailwindcss': {},
    'postcss-calc': {
      preserve: true,
      warnWhenCannotResolve: false,
      mediaQueries: true,
      selectors: true
    },
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production'
      ? {
          cssnano: {
            preset: ['default', {
              calc: false,
              discardComments: { removeAll: true }
            }],
          },
        }
      : {}),
  },
};

export default config;
