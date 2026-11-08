// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://65abf25df76314114cf8155e0d0dd32c@o4511694896103424.ingest.us.sentry.io/4511694896758784",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // Checkout/OTP requests carry phone, email, address and codes — never ship them.
    userInfo: false,
    httpBodies: [],
  },
});
