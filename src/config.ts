export const config = {
  env: process.env.NODE_ENV,
  appUrl: process.env.APP_URL,
  sentryDsn: process.env.SENTRY_DSN_CLIENT,
  fathomSiteId: process.env.FATHOM_SITE_ID,
  githubUrl: 'https://github.com/pradel/sigle',
  twitterUrl: 'https://twitter.com/sigleapp',
  telegramUrl: 'https://t.me/sigleapp',
  // This reflect the tailwindcss config
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
};
