import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Auth0Provider } from '@auth0/auth0-react';
import { ConvexProviderWithAuth0 } from "convex/react-auth0";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

const convex = new ConvexReactClient(convexUrl);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <ConvexProviderWithAuth0 client={convex}>
        <App />
      </ConvexProviderWithAuth0>
    </Auth0Provider>
  </React.StrictMode>,
);