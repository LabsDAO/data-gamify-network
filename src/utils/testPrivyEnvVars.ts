/**
 * Test script to verify Privy environment variables are loaded correctly
 * 
 * To run this script:
 * npx vite-node src/utils/testPrivyEnvVars.ts
 */

// This script checks if the Privy environment variables are properly loaded

console.log('Testing Privy environment variables...');
console.log('----------------------------------------');

// Check for Privy App ID
const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;
if (privyAppId) {
  console.log('✅ VITE_PRIVY_APP_ID is set:', maskString(privyAppId));
} else {
  console.log('❌ VITE_PRIVY_APP_ID is not set');
}

// Check for WalletConnect Project ID
const walletConnectProjectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
if (walletConnectProjectId) {
  console.log('✅ VITE_WALLET_CONNECT_PROJECT_ID is set:', maskString(walletConnectProjectId));
} else {
  console.log('❌ VITE_WALLET_CONNECT_PROJECT_ID is not set');
}

// Helper function to mask sensitive values
function maskString(str: string): string {
  if (str.length <= 8) {
    return '****';
  }
  
  const firstFour = str.substring(0, 4);
  const lastFour = str.substring(str.length - 4);
  const masked = '*'.repeat(Math.min(str.length - 8, 8));
  
  return `${firstFour}${masked}${lastFour}`;
}

console.log('\nIf both environment variables are set, your Privy configuration should work correctly.');
console.log('If any variables are missing, check your .env file and make sure it contains the correct values.');
console.log('\nTo use these environment variables in your code:');
console.log('import.meta.env.VITE_PRIVY_APP_ID');
console.log('import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID');