const dotenv = require('dotenv');
const withPlugins = require('next-compose-plugins');
const withCSS = require('@zeit/next-css');
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');
const BundleAnalyzerPluginReporter = require('@bundle-analyzer/webpack-plugin');

dotenv.config();

module.exports = withPlugins(
  [
    [withCSS],
    [
      withBundleAnalyzer,
      {
        analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
        analyzeBrowser: ['browser', 'both'].includes(
          process.env.BUNDLE_ANALYZE
        ),
        bundleAnalyzerConfig: {
          server: {
            analyzerMode: 'static',
            reportFilename: '../bundles/server.html',
          },
          browser: {
            analyzerMode: 'static',
            reportFilename: '../bundles/client.html',
          },
        },
      },
    ],
  ],
  {
    env: {
      APP_URL: process.env.APP_URL || 'http://localhost:3000',
      SENTRY_DSN_CLIENT: process.env.SENTRY_DSN_CLIENT,
      FATHOM_SITE_ID: process.env.FATHOM_SITE_ID,
    },
    webpack: (config, { isServer }) => {
      // In `pages/_app.js`, Sentry is imported from @sentry/node. While
      // @sentry/browser will run in a Node.js environment, @sentry/node will use
      // Node.js-only APIs to catch even more unhandled exceptions.
      if (!isServer) {
        config.resolve.alias['@sentry/node'] = '@sentry/browser';
      }

      // We want to report only for the client bundle
      if (process.env.BUNDLE_ANALYZER_TOKEN && !isServer) {
        config.plugins.push(
          new BundleAnalyzerPluginReporter({
            token: process.env.BUNDLE_ANALYZER_TOKEN,
          })
        );
      }
      return config;
    },
  }
);
