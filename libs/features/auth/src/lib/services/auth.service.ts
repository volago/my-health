import { Injectable, WritableSignal, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, User, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs'; // Removed unused RxJS operators for now
import { AuthCredentials, UserRegistrationData, UserRegistrationProfileData } from '../models/auth.models';
import { FirebaseError } from '@firebase/util';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly firestore: Firestore = inject(Firestore);
  private readonly auth: Auth = inject(Auth);

  // --- State Signals ---
  readonly currentUser: WritableSignal<User | null> = signal(null);
  readonly isLoggedIn: WritableSignal<boolean> = signal(false);
  readonly isLoading: WritableSignal<boolean> = signal(false);
  readonly error: WritableSignal<string | null> = signal(null);

  private authStateSubscription: Subscription;

  constructor() {
    this.authStateSubscription = authState(this.auth).subscribe(user => {
      this.currentUser.set(user);
    });

    effect(() => {
      const loggedIn = !!this.currentUser();
      this.isLoggedIn.set(loggedIn);
      if (loggedIn && this.router.url.includes('/auth')) {
        this.router.navigate(['/']);
      }
    });
  }

  private mapFirebaseError(firebaseError: FirebaseError): string {
    switch (firebaseError.code) {
      case 'auth/invalid-email':
        return 'Nieprawidłowy format identyfikatora (oczekiwano formatu email).';
      case 'auth/user-disabled':
        return 'Konto użytkownika zostało zablokowane.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Nieprawidłowa nazwa użytkownika lub hasło.';
      case 'auth/email-already-in-use':
        return 'Ten identyfikator (email) jest już zajęty.';
      case 'auth/weak-password':
        return 'Hasło jest zbyt słabe (minimum 6 znaków).';
      case 'auth/operation-not-allowed':
        return 'Logowanie tym sposobem nie jest dozwolone.';
      default:
        console.error('Firebase Auth Error:', firebaseError);
        return 'Wystąpił nieoczekiwany błąd podczas uwierzytelniania. Spróbuj ponownie.';
    }
  }

  generateUserIdentifier(): string {
    this.error.set(null); // Clear previous errors
    const adj = ['happy', 'silly', 'lucky', 'clever', 'brave', 'fast', 'shiny', 'wise'];
    const nouns = ['cat', 'dog', 'fox', 'bear', 'lion', 'bird', 'fish', 'wolf'];
    const randomAdj = adj[Math.floor(Math.random() * adj.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    return `${randomAdj}-${randomNoun}-${randomNumber}`; // Returns only the username part
  }

  async register(registrationData: UserRegistrationData): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    const { identifier, password_DO_USUNIECIA_PO_REFAKTORZE_TYMCZASOWE, profile } = registrationData;

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, identifier, password_DO_USUNIECIA_PO_REFAKTORZE_TYMCZASOWE);
      const user = userCredential.user;
      
      const userProfileForDb: UserRegistrationProfileData & { createdAt: Date; userId: string; lastLogin?: Date } = {
        userId: user.uid, // Storing Firebase UID
        ...profile,
        createdAt: new Date(),
      };
      // Ensure all fields required by UserProfile model are present if we were to use it directly
      // For now, UserRegistrationProfileData defines the subset we collect at registration.
      await setDoc(doc(this.firestore, `users/${user.uid}`), userProfileForDb);
      this.router.navigate(['/']); // Nawigacja po udanej rejestracji
    } catch (error) {
      this.error.set(this.mapFirebaseError(error as FirebaseError));
      throw error; 
    } finally {
      this.isLoading.set(false);
    }
  }

  async login(credentials: AuthCredentials): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    const { identifier, password } = credentials;

    if (!password) { 
        this.error.set('Hasło jest wymagane.');
        this.isLoading.set(false);
        throw new Error('Password is required for login.');
    }

    try {
      await signInWithEmailAndPassword(this.auth, identifier, password);
      this.router.navigate(['/']); // Dodana nawigacja po udanym logowaniu
    } catch (error) {
      this.error.set(this.mapFirebaseError(error as FirebaseError));
      throw error; 
    } finally {
      this.isLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      await signOut(this.auth);
      // currentUser and isLoggedIn are updated by authState subscription/effect
      // Effect will not redirect here as isLoggedIn becomes false, so manual redirect is needed if desired for logout specifically.
      this.router.navigate(['/auth/login']);
    } catch (error) {
      this.error.set(this.mapFirebaseError(error as FirebaseError));
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
  }
} 