import { auth } from './firebase';
import type { UserCredential } from 'firebase/auth';
import type { Auth, User } from '@firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { sendEmailVerification as sendEmailVerificationAction } from 'firebase/auth/cordova';
import { sendPasswordResetEmail as sendPasswordResetEmailAction } from 'firebase/auth/cordova';
import { applyActionCode as applyActionCodeAction } from 'firebase/auth/cordova';

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export const sendVerificationEmail = async (user: User): Promise<true | AuthError> => {
  try {
    await sendEmailVerificationAction(user);
    return true;
  } catch (error: any) {
    return {
      code: error.code,
      message: error.message
    };
  }
};

export const verifyEmail = async (code: string): Promise<true | AuthError> => {
  try {
    await applyActionCodeAction(auth, code);
    return true;
  } catch (error: any) {
    return {
      code: error.code,
      message: error.message
    };
  }
};

export const signUp = async (email: string, password: string): Promise<UserCredential | AuthError> => {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (credential.user) {
      await sendVerificationEmail(credential.user);
    }
    return credential;
  } catch (error: any) {
    return {
      code: error.code,
      message: error.message
    };
  }
};

export const signIn = async (email: string, password: string): Promise<UserCredential | AuthError> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    return {
      code: error.code,
      message: error.message
    };
  }
};

export const resetPassword = async (email: string): Promise<true | AuthError> => {
  try {
    await sendPasswordResetEmailAction(auth, email);
    return true;
  } catch (error: any) {
    return {
      code: error.code,
      message: error.message
    };
  }
};

export const signInWithGoogle = async (): Promise<UserCredential | AuthError> => {
  try {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    return {
      code: error.code,
      message: error.message
    };
  }
};

export const signOut = async (): Promise<void | AuthError> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    return {
      code: error.code,
      message: error.message
    };
  }
};
