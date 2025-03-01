# Wallet Connections with Privy

This document explains how wallet connections are set up in the application using Privy authentication.

## Overview

The application uses Privy (`@privy-io/react-auth`) for authentication, which supports both email-based and wallet-based authentication. Wallet connections allow users to sign in using their cryptocurrency wallets like MetaMask, WalletConnect, and others.

## Configuration

### Environment Variables

The wallet connection configuration uses environment variables for sensitive values. These are defined in the `.env` file:

```
# Privy Authentication Configuration
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

### PrivyProvider Setup

The wallet connection is configured in `src/App.tsx` using the `PrivyProvider` component:

```jsx
<PrivyProvider
  appId={import.meta.env.VITE_PRIVY_APP_ID}
  config={{
    loginMethods: ["email", "wallet"],
    appearance: {
      theme: "light",
      accentColor: "#6366F1",
      logo: "/lovable-uploads/3c0d4a69-03a7-4f9f-b704-73bcc535ddef.png",
    },
    // Enable wallet connections with WalletConnect
    walletConnectCloudProjectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  }}
>
  {/* App content */}
</PrivyProvider>
```

Key configuration points:
- `loginMethods: ["email", "wallet"]` - Enables both email and wallet authentication methods
- `walletConnectCloudProjectId` - Required for WalletConnect integration, which allows connecting to mobile wallets
- Environment variables are used for sensitive values to keep them out of the codebase

## How Wallet Authentication Works

1. When a user clicks the "Sign In" button, the Privy login modal opens with options for email and wallet authentication.
2. If the user selects a wallet option, they'll be prompted to connect their wallet.
3. After successful authentication, the user's wallet address is extracted from the Privy user object.
4. The wallet address is stored in the user object and can be used throughout the application.

## Implementation Details

### User Authentication Flow

The authentication flow is implemented in `src/hooks/useAuth.tsx`:

```jsx
// When a user authenticates with Privy
if (authenticated && privyUser) {
  // Extract wallet address from Privy user
  let walletAddress = '';
  
  // Check for linked wallets
  if (privyUser.linkedAccounts && privyUser.linkedAccounts.length > 0) {
    const walletAccount = privyUser.linkedAccounts.find(
      account => account.type === 'wallet'
    );
    
    if (walletAccount && walletAccount.address) {
      walletAddress = walletAccount.address;
    }
  }
  
  // Fallback to the wallet property
  if (!walletAddress && privyUser.wallet && privyUser.wallet.address) {
    walletAddress = privyUser.wallet.address;
  }
  
  // Create user with wallet address
  const newUser = {
    // ... other user properties
    walletAddress: walletAddress,
  };
  
  // Store user
  setUser(newUser);
  localStorage.setItem('labsmarket_user', JSON.stringify(newUser));
}
```

### Login Button

The login button is implemented in `src/components/layout/Header.tsx`:

```jsx
const handleAuthAction = async () => {
  if (authenticated) {
    await logout();
    navigate('/');
  } else {
    // Open Privy login modal
    privyLogin();
  }
};
```

## Troubleshooting

If wallet connections are not working:

1. **Check WalletConnect Project ID**: Ensure you have a valid WalletConnect Cloud Project ID in the PrivyProvider configuration.

2. **Browser Compatibility**: Make sure you're using a modern browser that supports the Web3 features required for wallet connections.

3. **Wallet Extension**: If using MetaMask or another browser extension wallet, ensure it's installed and unlocked.

4. **Network Issues**: Check if there are any network connectivity issues that might prevent connecting to the wallet providers.

5. **Console Errors**: Look for any errors in the browser console that might provide more information about the issue.

## Getting a WalletConnect Project ID

To get a WalletConnect Cloud Project ID:

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Create a new project
4. Copy the Project ID
5. Add your Project ID to the `.env` file:
   ```
   VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

## Testing Wallet Connections

To test wallet connections:

1. Click the "Sign In" button in the application
2. Select a wallet option from the Privy login modal
3. Follow the prompts to connect your wallet
4. After successful authentication, you should see your wallet address in the user profile

## Environment Variables

The application uses environment variables to store sensitive configuration values. These are defined in the `.env` file:

```
# Privy Authentication Configuration
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Setting Up Environment Variables

1. Copy the `.env.example` file to create a new `.env` file:
   ```
   cp .env.example .env
   ```

2. Edit the `.env` file and add your actual values:
   ```
   VITE_PRIVY_APP_ID=your_actual_privy_app_id
   VITE_WALLET_CONNECT_PROJECT_ID=your_actual_walletconnect_project_id
   ```

3. The `.env` file is already included in `.gitignore` to prevent committing sensitive information to the repository.

### Testing Environment Variables

You can verify that the environment variables are being loaded correctly by running the test script:

```
npx vite-node src/utils/testPrivyEnvVars.ts
```

This script will check if the Privy environment variables are set and display masked versions of their values.

## Resources

- [Privy Documentation](https://docs.privy.io/)
- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)