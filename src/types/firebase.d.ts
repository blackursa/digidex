declare module 'firebase/app' {
  import { FirebaseApp } from '@firebase/app-types';
  export { FirebaseApp };
  export function initializeApp(options: any): FirebaseApp;
}

declare module 'firebase/auth' {
  import { Auth, UserCredential } from '@firebase/auth-types';
  export { Auth, UserCredential };
  export function getAuth(app?: any): Auth;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signOut(auth: Auth): Promise<void>;
  export class GoogleAuthProvider {
    constructor();
  }
  export function signInWithPopup(auth: Auth, provider: GoogleAuthProvider): Promise<UserCredential>;
}

declare module 'firebase/firestore' {
  import { Firestore } from '@firebase/firestore-types';
  export { Firestore };
  export function getFirestore(app?: any): Firestore;
}

declare module 'firebase/analytics' {
  export function getAnalytics(app: any): any;
}
