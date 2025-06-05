// Auth0 configuration for Convex
export default {
  providers: [
    {
      domain: process.env.AUTH0_DOMAIN,
      applicationID: process.env.AUTH0_CLIENT_ID,
      name: "auth0",
    },
  ],
};