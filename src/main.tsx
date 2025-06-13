import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { Auth0Provider } from '@auth0/auth0-react';
import { ConvexProviderWithAuth0 } from 'convex/react-auth0';
import { BrowserRouter } from 'react-router-dom';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN as string}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID as string}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <ConvexProviderWithAuth0 client={convex}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConvexProviderWithAuth0>
    </Auth0Provider>
  </React.StrictMode>,
);