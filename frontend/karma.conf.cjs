/* global module, require */

const webpack = require('webpack')

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'webpack'],

    files: [
      {
        pattern: 'tests/componentes.spec.jsx',
        watched: false,
      },
    ],

    preprocessors: {
      'tests/**/*.jsx': ['webpack'],
    },

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',

      resolve: {
        extensions: ['.js', '.jsx'],
      },

      plugins: [
        new webpack.DefinePlugin({
          'import.meta.env.BASE_URL': JSON.stringify('/'),
        }),
      ],

      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                configFile: false,
                presets: [
                  ['@babel/preset-env', {
                    targets: { chrome: '120' },
                    modules: false,
                  }],
                  ['@babel/preset-react', {
                    runtime: 'automatic',
                  }],
                ],
                plugins: [
                  ['babel-plugin-istanbul', {
                    include: ['src/**/*.js', 'src/**/*.jsx'],
                    exclude: ['tests/**', 'node_modules/**'],
                  }],
                ],
              },
            },
          },
        ],
      },
    },

    reporters: ['progress', 'coverage'],

    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly', subdir: '.', file: 'lcov.info' },
      ],
    },

    browsers: ['ChromeHeadless'],
    singleRun: true,
    autoWatch: false,

    client: {
      jasmine: {
        random: false,
      },
    },

    browserNoActivityTimeout: 60000,
  })
}