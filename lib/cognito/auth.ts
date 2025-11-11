/**
 * Cognito Authentication Functions - Client-Side Only
 * 
 * All functions in this module require browser APIs and should only be called
 * from Client Components or client-side code.
 */

// Type-only import for type definitions (doesn't affect runtime)
import type * as CognitoSDK from "amazon-cognito-identity-js";

// Lazy import types and classes (client-side only)
type CognitoTypes = typeof CognitoSDK;
let cognitoModule: CognitoTypes | null = null;

// Type aliases for cleaner code
type CognitoUser = CognitoSDK.CognitoUser;
type CognitoUserSession = CognitoSDK.CognitoUserSession;
type CognitoUserAttribute = CognitoSDK.CognitoUserAttribute;
type ISignUpResult = CognitoSDK.ISignUpResult;

/**
 * Dynamically import Cognito SDK (client-side only)
 */
async function getCognitoModule(): Promise<CognitoTypes> {
  if (typeof window === "undefined") {
    throw new Error(
      "Cognito authentication can only be used in client-side code."
    );
  }

  if (!cognitoModule) {
    cognitoModule = await import("amazon-cognito-identity-js");
  }

  return cognitoModule;
}

import { getUserPool } from "./config";

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export interface UserAttributes {
  email?: string;
  name?: string;
  role?: "mentor" | "mentee";
  [key: string]: string | undefined;
}

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
  attributes: UserAttributes = {}
): Promise<CognitoUser> {
  const cognito = await getCognitoModule();
  const userPool = await getUserPool();
  
  return new Promise((resolve, reject) => {
    const attributeList = Object.entries(attributes).map(
      ([key, value]) =>
        new cognito.CognitoUserAttribute({
          Name: key,
          Value: value || "",
        })
    );

    userPool.signUp(
      email,
      password,
      attributeList,
      [],
      (err: Error | undefined, result: ISignUpResult | undefined) => {
        if (err) {
          reject(err);
          return;
        }
        if (!result) {
          reject(new Error("Sign up failed: No result"));
          return;
        }
        resolve(result.user);
      }
    );
  });
}

/**
 * Confirm sign up with verification code
 */
export async function confirmSignUp(
  email: string,
  code: string
): Promise<void> {
  const cognito = await getCognitoModule();
  const userPool = await getUserPool();
  
  return new Promise((resolve, reject) => {
    const cognitoUser = new cognito.CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthTokens> {
  const cognito = await getCognitoModule();
  const userPool = await getUserPool();
  
  return new Promise((resolve, reject) => {
    const authenticationDetails = new cognito.AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const cognitoUser = new cognito.CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session: CognitoUserSession) => {
        const tokens: AuthTokens = {
          accessToken: session.getAccessToken().getJwtToken(),
          idToken: session.getIdToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
        };
        resolve(tokens);
      },
      onFailure: (err) => {
        // Enhanced error message for common Cognito configuration issues
        if (err?.message?.includes("USER_SRP_AUTH is not enabled")) {
          reject(
            new Error(
              "Authentication flow not enabled. Please ask your backend engineer to enable USER_SRP_AUTH in the Cognito App Client settings."
            )
          );
          return;
        }
        reject(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        // Handle new password required (first time login)
        reject(
          new Error(
            "New password required. Please use the change password flow."
          )
        );
      },
    });
  });
}

/**
 * Get current user session
 */
export async function getCurrentSession(): Promise<AuthTokens | null> {
  const cognito = await getCognitoModule();
  const userPool = await getUserPool();
  
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      resolve(null);
      return;
    }

      cognitoUser.getSession((err: Error | undefined, session: CognitoUserSession | null): void => {
      if (err) {
        reject(err);
        return;
      }
      if (!session || !session.isValid()) {
        resolve(null);
        return;
      }

      const tokens: AuthTokens = {
        accessToken: session.getAccessToken().getJwtToken(),
        idToken: session.getIdToken().getJwtToken(),
        refreshToken: session.getRefreshToken().getToken(),
      };
      resolve(tokens);
    });
  });
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  const userPool = await getUserPool();
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<AuthTokens> {
  const cognito = await getCognitoModule();
  const userPool = await getUserPool();
  
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error("No current user"));
      return;
    }

    cognitoUser.refreshSession(
      {
        getToken: () => refreshToken,
      },
      (err: Error | undefined, session: CognitoUserSession | null) => {
        if (err) {
          reject(err);
          return;
        }
        if (!session) {
          reject(new Error("Refresh session failed: No session"));
          return;
        }

        const tokens: AuthTokens = {
          accessToken: session.getAccessToken().getJwtToken(),
          idToken: session.getIdToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
        };
        resolve(tokens);
      }
    );
  });
}

/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<void> {
  const cognito = await getCognitoModule();
  const userPool = await getUserPool();
  
  return new Promise((resolve, reject) => {
    const cognitoUser = new cognito.CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.forgotPassword({
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

/**
 * Confirm password reset with code
 */
export async function confirmPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  const cognito = await getCognitoModule();
  const userPool = await getUserPool();
  
  return new Promise((resolve, reject) => {
    const cognitoUser = new cognito.CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

/**
 * Get current user attributes
 */
export async function getCurrentUserAttributes(): Promise<UserAttributes> {
  const cognito = await getCognitoModule();
  const userPool = await getUserPool();
  
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error("No current user"));
      return;
    }

    cognitoUser.getSession((err: Error | undefined, session: CognitoUserSession | null): void => {
      if (err || !session) {
        reject(err || new Error("No valid session"));
        return;
      }

        cognitoUser.getUserAttributes((err: Error | undefined, attributes: CognitoUserAttribute[] | undefined): void => {
        if (err) {
          reject(err);
          return;
        }

        const userAttributes: UserAttributes = {};

        attributes?.forEach((attr) => {
          userAttributes[attr.getName()] = attr.getValue();
        });

        resolve(userAttributes);
      });
    });
  });
}

