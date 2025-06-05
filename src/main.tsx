import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Auth0Provider } from '@auth0/auth0-react';
import { ConvexProviderWithAuth0 } from 'convex/react-auth0';
import { ConvexReactClient } from 'convex/react';

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  throw new Error('VITE_CONVEX_URL is not defined. Check your .env file.');
}

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
if (!auth0Domain) {
  throw new Error('VITE_AUTH0_DOMAIN is not defined. Check your .env file.');
}

const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
if (!auth0ClientId) {
  throw new Error('VITE_AUTH0_CLIENT_ID is not defined. Check your .env file.');
}

const convex = new ConvexReactClient(convexUrl as string);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin, // This ensures correct redirect URLs
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <ConvexProviderWithAuth0 client={convex} useAuth={useAuth0}>
        <App />
      </ConvexProviderWithAuth0>
    </Auth0Provider>
  </React.StrictMode>,
);