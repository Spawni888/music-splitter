const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const PrerenderSPAPlugin = require('prerender-spa-plugin');

module.exports = {
  css: {
    extract: false,
    loaderOptions: {
      sass: {
        prependData:
          '@import "@/assets/styles/main.scss";',
      },
    },
  },
  configureWebpack: (config) => {
    // eslint-disable-next-line no-param-reassign
    config.entry = {
      app: [
        './frontend/src/main.js',
      ],
    };
    config.resolve = {
      ...config.resolve,
      alias: {
        '@': path.resolve(__dirname, './frontend/src'),
        vue$: 'vue/dist/vue.runtime.esm.js',
      },
      extensions: [
        '.wasm',
        '.mjs',
        '.js',
        '.jsx',
        '.vue',
        '.json',
      ],
      modules: [
        'node_modules',
        path.resolve(__dirname, './node_modules'),
        path.resolve(__dirname, './node_modules/@vue/cli-service/node_modules'),
      ],
    };
    config.devServer = {
      ...config.devServer,
      watchOptions: {
        poll: true,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
        },
      },
    };

    config.plugins = [
      ...config.plugins,
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'frontend/src/static',
            to: 'static',
          },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        title: 'split-music',
        favicon: path.resolve(__dirname, './frontend/public/favicon.png'),
        template: path.resolve(__dirname, './frontend/public/index.html'),
        inject: true,
      }),
    ];

    // prerender at build
    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new PrerenderSPAPlugin({
          staticDir: path.join(__dirname, 'dist'),
          routes: ['/', '/about'],

          postProcess(renderedRoute) {
            renderedRoute.route = renderedRoute.originalRoute;
            if (renderedRoute.route.endsWith('.html')) {
              renderedRoute.outputPath = path.join(__dirname, 'dist', renderedRoute.route);
            }

            return renderedRoute;
          },
        }),
      );
    }
  },
};
