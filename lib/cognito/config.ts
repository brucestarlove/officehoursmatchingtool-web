/**
 * Cognito Configuration - Client-Side Only
 * 
 * This module should ONLY be imported and used in Client Components.
 * The Cognito SDK requires browser APIs and cannot run on the server.
 * 
 * Best Practice: Always import this module conditionally or in client components only.
 */

// Lazy import Cognito SDK only on client-side
let CognitoUserPool: typeof import("amazon-cognito-identity-js").CognitoUserPool | null = null;

/**
 * Dynamically import Cognito SDK (client-side only)
 * This ensures the SDK is never loaded during SSR/build
 */
async function getCognitoSDK() {
  if (typeof window === "undefined") {
    throw new Error(
      "Cognito SDK can only be used in client-side code. Ensure this code runs in a Client Component."
    );
  }

  if (!CognitoUserPool) {
    const cognitoModule = await import("amazon-cognito-identity-js");
    CognitoUserPool = cognitoModule.CognitoUserPool;
  }

  return { CognitoUserPool };
}

// Cache for user pool instance
let userPoolInstance: InstanceType<typeof CognitoUserPool> | null = null;

/**
 * Get Cognito User Pool instance (client-side only)
 * 
 * This function ensures:
 * 1. Only runs in browser (throws if called server-side)
 * 2. Environment variables are validated
 * 3. Singleton pattern for pool instance
 */
export async function getUserPool(): Promise<InstanceType<typeof CognitoUserPool>> {
  // Guard: Ensure we're on client-side
  if (typeof window === "undefined") {
    throw new Error(
      "getUserPool() can only be called in client-side code. Use in Client Components only."
    );
  }

  // Return cached instance if available
  if (userPoolInstance) {
    return userPoolInstance;
  }

  // Dynamically import Cognito SDK
  const { CognitoUserPool: CognitoUserPoolClass } = await getCognitoSDK();

  // Validate environment variables
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

  if (!userPoolId || !clientId) {
    throw new Error(
      "Cognito configuration missing. Please set NEXT_PUBLIC_COGNITO_USER_POOL_ID and NEXT_PUBLIC_COGNITO_CLIENT_ID"
    );
  }

  // Create and cache instance
  userPoolInstance = new CognitoUserPoolClass({
    UserPoolId: userPoolId,
    ClientId: clientId,
  });

  return userPoolInstance;
}

// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
