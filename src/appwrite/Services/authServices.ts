// services/authServices.ts

import { account } from '../config';
import { AppwriteException, ID } from 'appwrite';
import db  from './dbServices';
import { RegisterUserInput } from '@framework/types';

/**
 * Registers a new user.
 * Creates a user in Appwrite Auth, sends a magic link for email verification, and creates a corresponding document in the Frontend's Users collection.
 */
export async function registerUser({
  name,
  email,
  password,
  telephone,
}: RegisterUserInput): Promise<void> {
  try {
    // Step 1: Create user in Appwrite Auth
    const user = await account.create(ID.unique(), email, password, name);

    // Step 2: Send Magic URL for Email Verification
    const redirectUrl = `${window.location.origin}/verify-email`; // URL to handle email verification
    await account.createMagicURLToken(user.$id, email, redirectUrl);

    // Step 3: Create user document in Frontend's Users collection
    await db.Users.create({
      userId: user.$id,
      role: 'user', // Default role; adjust if needed
      name: name,
      isWholesaleApproved: false,
      telephone: telephone,
      email: email,
    });

    // Inform the user to check their email
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Completes email verification and logs in the user.
 */
export async function completeEmailVerification(
  userId: string,
  secret: string
): Promise<void> {
  try {
    // Use the userId and secret to create a session and verify the email
    await account.updateMagicURLSession(userId, secret);
    // Email verification and login successful
  } catch (error) {
    console.error('Email Verification Error:', error);
    throw error;
  }
}

/**
 * Initiates the login process.
 * Verifies user credentials and sends a magic link to the user's email.
 */
export const initiateLogin = async (
  email: string,
  password: string
): Promise<void> => {
  try {

     // Check if the user is a demo user
     const isDemoUser = email === "demo@iwalewah.com";

    // Step 1: Create Email/Password Session to verify credentials
    const session = await account.createEmailPasswordSession(email, password);

    if (isDemoUser) {
      // Store session flag to recognize demo users
      sessionStorage.setItem("isDemo", "true");
      console.log("Demo user logged in directly, skipping magic link.");
      return; // Skip further steps
    }

    // Step 2: Get the user's ID
    const user = await account.get();

    // Step 3: Delete the session as we don't want the user to be logged in yet
    await account.deleteSession(session.$id);

    // Step 4: Send the magic link email
    const redirectUrl = `${window.location.origin}/auth/complete-login`; // URL to handle magic link login
    await account.createMagicURLToken(user.$id, email, redirectUrl);

    // Inform the user to check their email
  } catch (error) {
    console.error('Login initiation error:', error);
    throw error;
  }
};

/**
 * Completes the login process when the user clicks the magic link.
 */
export const completeLogin = async (
  userId: string,
  secret: string
): Promise<void> => {
  try {
    // Use the userId and secret to create a session
    await account.updateMagicURLSession(userId, secret);
    // Login successful
  } catch (error) {
    console.error('Login completion error:', error);
    throw error;
  }
};

/**
 * Signs out the current user.
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await account.deleteSessions(); // Deletes all sessions
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};

/**
 * Retrieves the current user.
 */
export const getCurrentUser = async (): Promise<any | null> => {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    return null;
  }
};

/**
 * Checks if a user is authenticated.
 */
export const checkAuth = async (): Promise<boolean> => {
  try {
    await account.get();
    return true;
  } catch (error) {
    return false;
  }
};


export async function sendRecoveryEmail(email: string): Promise<void> {
  try {
    const recoveryUrl = `${window.location.origin}/reset-password`; // URL to handle reset
    await account.createRecovery(email, recoveryUrl);
  } catch (error) {
    console.error('Send Recovery Email Error:', error);
    throw error;
  }
}
/**
 * Resets the user's password using the user ID and secret.
 */
export async function resetPassword(
  userId: string,
  secret: string,
  newPassword: string,
  confirmPassword: string  // Added confirmPassword parameter
): Promise<void> {
  try {
    await account.updateRecovery(userId, secret, newPassword);  // Added confirmPassword here
  } catch (error) {
    console.error('Reset Password Error:', error);
    throw error;
  }
}

export const updatePassword = async (oldPassword: string, newPassword: string) => {
  try {
    // Call Appwrite SDK to update password
    await account.updatePassword(newPassword, oldPassword);
  } catch (error) {
    throw error;
  }
};