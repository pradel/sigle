const dotenv = require('dotenv');
const withPlugins = require('next-compose-plugins');
const withSourceMaps = require('@zeit/next-source-maps')();
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const BundleAnalyzerPluginReporter = require('@bundle-analyzer/webpack-plugin');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

dotenv.config();

const {
  NEXT_PUBLIC_SENTRY_DSN: SENTRY_DSN,
  SENTRY_ORG,
  SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN,
  NODE_ENV,
  VERCEL_GITHUB_COMMIT_SHA,
  VERCEL_GITLAB_COMMIT_SHA,
  VERCEL_BITBUCKET_COMMIT_SHA,
} = process.env;

const COMMIT_SHA =
  VERCEL_GITHUB_COMMIT_SHA ||
  VERCEL_GITLAB_COMMIT_SHA ||
  VERCEL_BITBUCKET_COMMIT_SHA;

process.env.SENTRY_DSN = SENTRY_DSN;
const basePath = '';

module.exports = withPlugins(
  [
    [withBundleAnalyzer],
    [
      withSourceMaps,
      {
        serverRuntimeConfig: {
          rootDir: __dirname,
        },
        webpack: (config, options) => {
          // In `pages/_app.js`, Sentry is imported from @sentry/browser. While
          // @sentry/node will run in a Node.js environment. @sentry/node will use
          // Node.js-only APIs to catch even more unhandled exceptions.
          //
          // This works well when Next.js is SSRing your page on a server with
          // Node.js, but it is not what we want when your client-side bundle is being
          // executed by a browser.
          //
          // Luckily, Next.js will call this webpack function twice, once for the
          // server and once for the client. Read more:
          // https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config
          //
          // So ask Webpack to replace @sentry/node imports with @sentry/browser when
          // building the browser's bundle
          if (!options.isServer) {
            config.resolve.alias['@sentry/node'] = '@sentry/browser';
          }

          // When all the Sentry configuration env variables are available/configured
          // The Sentry webpack plugin gets pushed to the webpack plugins to build
          // and upload the source maps to sentry.
          // This is an alternative to manually uploading the source maps
          // Note: This is disabled in development mode.
          if (
            SENTRY_DSN &&
            SENTRY_ORG &&
            SENTRY_PROJECT &&
            SENTRY_AUTH_TOKEN &&
            COMMIT_SHA &&
            NODE_ENV === 'production'
          ) {
            config.plugins.push(
              new SentryWebpackPlugin({
                include: '.next',
                ignore: ['node_modules'],
                stripPrefix: ['webpack://_N_E/'],
                urlPrefix: `~${basePath}/_next`,
                release: COMMIT_SHA,
              })
            );
          }
          return config;
        },
        basePath,
      },
    ],
  ],
  {
    env: {
      APP_URL: process.env.APP_URL,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      FATHOM_SITE_ID: process.env.FATHOM_SITE_ID,
    },
    webpack: (config, { isServer }) => {
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
