# Specyfikacja Techniczna Modułu Autentykacji

## 1. Wprowadzenie

Niniejszy dokument opisuje architekturę i implementację modułu autentykacji (rejestracji, logowania, wylogowywania) dla aplikacji My Health. Specyfikacja bazuje na wymaganiach użytkownika US-001 (Rejestracja anonimowa) i US-002 (Logowanie użytkownika) zdefiniowanych w pliku `prd.md`, z wykorzystaniem stosu technologicznego opisanego w `tech-stack.md` oraz zgodnie z wytycznymi dla Angulara zawartymi w `angular.mdc` i ogólnych zasadach projektu.

Moduł autentykacji będzie odpowiedzialny za bezpieczne zarządzanie tożsamością użytkowników, wykorzystując Firebase Authentication. Wszystkie komponenty i logika związane z autentykacją zostaną umieszczone w dedykowanej, leniwie ładowanej bibliotece NX `@my-health/features/auth`.

## 2. Architektura Interfejsu Użytkownika (Frontend)

### 2.1. Biblioteka NX `@my-health/features/auth`
- **Lokalizacja:** `libs/features/auth/`
- **Odpowiedzialność:** Zawiera wszystkie komponenty, serwisy, modele, trasy oraz logikę biznesową związaną z procesami rejestracji, logowania i wylogowywania użytkowników.
- **Lazy Loading:** Moduł będzie ładowany leniwie. W głównym pliku routingu aplikacji (`apps/my-health/src/app/app.routes.ts`) zostanie dodana odpowiednia konfiguracja:
  ```typescript
  // apps/my-health/src/app/app.routes.ts
  // ...
  {
    path: 'auth',
    loadChildren: () => import('@my-health/features/auth').then(m => m.AUTH_ROUTES)
  },
  // ...
  ```
- **Eksportowane trasy:** Plik `libs/features/auth/src/lib/routes.ts` będzie eksportował stałą `AUTH_ROUTES` zawierającą definicje tras dla modułu.
  ```typescript
  // libs/features/auth/src/lib/routes.ts
  import { Route } from '@angular/router';
  import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
  import { LoginFormComponent }s } from './login-form/login-form.component';
  import { RegisterFormComponent }s } from './register-form/register-form.component';

  export const AUTH_ROUTES: Route[] = [
    {
      path: '',
      component: AuthLayoutComponent,
      children: [
        { path: 'login', component: LoginFormComponent },
        { path: 'register', component: RegisterFormComponent },
        { path: '', redirectTo: 'login', pathMatch: 'full' }
      ]
    }
  ];
  ```
- **Główny plik biblioteki:** `libs/features/auth/src/index.ts` będzie re-eksportować `AUTH_ROUTES`:
  ```typescript
  // libs/features/auth/src/index.ts
  export * from './lib/routes';
  ```

### 2.2. Strony (Trasy)
Moduł autentykacji będzie obsługiwał następujące trasy:
- `/auth/login`: Strona logowania użytkownika.
- `/auth/register`: Strona rejestracji nowego użytkownika.
- `/auth`: Domyślnie przekierowuje na `/auth/login`.

### 2.3. Komponenty (Standalone Components)

- **`AuthLayoutComponent`**
    - **Lokalizacja:** `libs/features/auth/src/lib/auth-layout/auth-layout.component.ts` (oraz `.html`, `.scss`)
    - **Cel:** Główny kontener (layout) dla stron logowania i rejestracji. Odpowiada za spójny wygląd (np. centrowanie treści, wyświetlanie logo aplikacji, tło). Będzie zawierał `<router-outlet>` dla `LoginFormComponent` i `RegisterFormComponent`.
    - **Styling:** Tailwind CSS i Angular Material.

- **`LoginFormComponent`**
    - **Lokalizacja:** `libs/features/auth/src/lib/login-form/login-form.component.ts` (oraz `.html`, `.scss`)
    - **Cel:** Udostępnia formularz logowania z polami na identyfikator użytkownika i hasło. Odpowiada za walidację wprowadzonych danych oraz wyświetlanie komunikatów o błędach (np. nieprawidłowe dane, błąd serwera).
    - **Formularz (Typowany, `FormBuilder`):**
      ```typescript
      // Przykład struktury formularza
      loginForm = this.fb.group({
        identifier: ['', [Validators.required]], // Używany jako email w Firebase Auth
        password: ['', [Validators.required]]
      });
      ```
    - **Przyciski:**
        - "Zaloguj się" (Submit)
        - Link/Przycisk "Nie masz konta? Zarejestruj się" (nawigacja do `/auth/register`)
    - **Interakcja:** Wywołuje metodę `login()` z `AuthService`.

- **`RegisterFormComponent`**
    - **Lokalizacja:** `libs/features/auth/src/lib/register-form/register-form.component.ts` (oraz `.html`, `.scss`)
    - **Cel:** Udostępnia formularz rejestracji. Umożliwia użytkownikowi wprowadzenie hasła oraz wybór danych profilowych (rok urodzenia, płeć, pakiet badań). Wyświetla wygenerowany identyfikator użytkownika z opcją jego ponownego generowania. Informuje o konieczności zapisania danych logowania.
    - **Formularz (Typowany, `FormBuilder`):**
      ```typescript
      // Przykład struktury formularza
      registerForm = this.fb.group({
        // generatedIdentifier będzie zarządzany osobno, nie jako część FormBuilder
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        yearOfBirth: [null as number | null, [Validators.required]], // lub odpowiedni typ i walidatory
        gender: ['', [Validators.required]],
        detailPackage: ['', [Validators.required]]
      }, { validators: passwordMatchValidator }); // Custom validator dla zgodności haseł
      ```
      Wygenerowany identyfikator (`generatedIdentifier`) będzie wyświetlany obok formularza.
    - **Przyciski:**
        - "Zarejestruj się" (Submit)
        - "Generuj nowy identyfikator"
        - Link/Przycisk "Masz już konto? Zaloguj się" (nawigacja do `/auth/login`)
    - **Informacje dla użytkownika:**
        - Wyraźne komunikaty o celu zbierania danych (rok urodzenia, płeć, pakiet).
        - Ostrzeżenie o konieczności zapisania/zapamiętania identyfikatora i hasła, podkreślając brak możliwości ich odzyskania.
    - **Interakcja:** Wywołuje metodę `generateUserIdentifier()` oraz `register()` z `AuthService`.

### 2.4. Serwisy Angular (w `libs/features/auth/src/lib/services/`)

- **`AuthService` (`auth.service.ts`)**
    - **Odpowiedzialność:** Centralny serwis do zarządzania logiką autentykacji i stanem użytkownika.
    - **Zależności:** `Auth` (z `@angular/fire/auth`), `Firestore` (z `@angular/fire/firestore`), `Router`.
    - **Metody publiczne:**
        - `generateUserIdentifier(): string`: Generuje łatwy do zapamiętania, unikalny identyfikator dla nowego użytkownika (np. "szybki-jelen-77"). Format powinien być kompatybilny z użyciem jako część adresu email dla Firebase Auth (np. `szybki-jelen-77@example.com`). Może wymagać użycia zewnętrznej biblioteki (np. `unique-names-generator`). Ostateczna weryfikacja unikalności (jako email) nastąpi w Firebase.
        - `register(credentials: UserRegistrationData): Promise<void>`: Rejestruje nowego użytkownika w Firebase Auth (`createUserWithEmailAndPassword` używając `credentials.identifier` jako email), a następnie zapisuje dodatkowe dane (`credentials.profile`) w Firestore w kolekcji `users` pod UIDem użytkownika.
        - `login(credentials: AuthCredentials): Promise<void>`: Loguje użytkownika za pomocą Firebase Auth (`signInWithEmailAndPassword`).
        - `logout(): Promise<void>`: Wylogowuje użytkownika (`signOut`) i przekierowuje na stronę logowania.
        - `isLoggedIn: Signal<boolean>`: Sygnał informujący, czy użytkownik jest aktualnie zalogowany.
        - `currentUser: Signal<User | null>`: Sygnał przechowujący obiekt użytkownika Firebase lub `null`.
        - `isLoading: Signal<boolean>`: Sygnał informujący o trwaniu operacji autentykacyjnej (rejestracja/logowanie).
        - `error: Signal<string | null>`: Sygnał przechowujący ostatni komunikat błędu.
    - **Logika wewnętrzna:**
        - Użycie `inject(Auth)` i `inject(Firestore)`.
        - Zarządzanie wewnętrznymi sygnałami (`WritableSignal`) dla `currentUser`, `isLoading`, `error`.
        - Subskrypcja do `authState(this.auth)` lub `user(this.auth)` do aktualizacji sygnałów `currentUser` i `isLoggedIn`.
        - Mapowanie błędów Firebase na komunikaty przyjazne użytkownikowi.

- **`AuthEffectsService` (opcjonalnie, jeśli potrzebne są bardziej złożone side effects, np. `auth-effects.service.ts`)**
    - **Odpowiedzialność:** Obsługa skutków ubocznych operacji autentykacyjnych, np. nawigacja po udanej operacji, wyświetlanie globalnych powiadomień (snackbar).
    - **Metody:** Mogłaby nasłuchiwać na zmiany sygnałów z `AuthService` i reagować odpowiednio.

### 2.5. Kontrakty (Modele TypeScript)
Lokalizacja: `libs/features/auth/src/lib/models/` lub `libs/domain/` jeśli mają szersze zastosowanie.

- **`AuthCredentials` (`auth.models.ts`)**
  ```typescript
  export interface AuthCredentials {
    identifier: string; // Używany jako email w Firebase Auth
    password?: string; // Opcjonalne, bo przy rejestracji może być częścią innego interfejsu
  }
  ```
- **`UserProfileData` (`user.models.ts` - może być w `libs/domain`)**
  ```typescript
  export interface UserProfileData {
    yearOfBirth: number;
    gender: 'female' | 'male' | 'other' | 'undisclosed';
    detailPackage: 'basic' | 'recommended' | 'detailed';
    // Można dodać createdAt, updatedAt jeśli potrzebne
  }
  ```
- **`UserRegistrationData` (`auth.models.ts`)**
  ```typescript
  export interface UserRegistrationData {
    identifier: string; // Nadpisuje AuthCredentials, żeby było wymagane
    password_DO_USUNIECIA_PO_REFAKTORZE_TYMCZASOWE: string; // Nadpisuje AuthCredentials, żeby było wymagane
    profile: UserProfileData;
  }
  ```
  *Uwaga: `password` w `UserRegistrationData` jest celowo powtórzone, aby podkreślić, że jest wymagane przy rejestracji. W `AuthCredentials` jest opcjonalne, bo ten interfejs może być używany w innych kontekstach (np. tylko do logowania, gdzie `identifier` i `password` są zawsze razem).*

### 2.6. Walidacja i Komunikaty Błędów (Frontend)
- **Formularz Rejestracji:**
    - Identyfikator: Generowany, użytkownik akceptuje lub generuje nowy. Unikalność weryfikowana przez Firebase.
    - Hasło: Wymagane, min. 6 znaków (standard Firebase). Komunikat: "Hasło musi mieć co najmniej 6 znaków."
    - Potwierdź hasło: Wymagane, musi być zgodne z hasłem. Komunikat: "Hasła nie są zgodne." (Custom validator).
    - Rok urodzenia: Wymagane, poprawny format roku (np. zakres 1900 - obecny rok). Komunikat: "Podaj poprawny rok urodzenia."
    - Płeć: Wymagane. Komunikat: "Wybierz płeć."
    - Pakiet badań: Wymagane. Komunikat: "Wybierz pakiet badań."
    - Ogólne błędy Firebase (np. `auth/email-already-in-use` mapowane na "Ten identyfikator jest już używany. Wygeneruj inny lub spróbuj się zalogować."): Wyświetlane w dedykowanym miejscu formularza.
- **Formularz Logowania:**
    - Identyfikator: Wymagane. Komunikat: "Pole Identyfikator jest wymagane."
    - Hasło: Wymagane. Komunikat: "Pole Hasło jest wymagane."
    - Błędy Firebase (np. `auth/user-not-found`, `auth/wrong-password`, `auth/invalid-credential`): Mapowane na ogólny komunikat "Nieprawidłowy identyfikator lub hasło." lub bardziej szczegółowe, jeśli to bezpieczne.

### 2.7. Scenariusze Użytkownika (Frontend Flow)

- **Rejestracja Użytkownika (US-001):**
    1. Użytkownik nawiguje do `/auth/register`.
    2. `RegisterFormComponent` przy inicjalizacji woła `AuthService.generateUserIdentifier()` i wyświetla wynik.
    3. Użytkownik może kliknąć "Generuj nowy identyfikator", co ponownie woła w/w metodę.
    4. Użytkownik wypełnia hasło, potwierdzenie hasła, rok urodzenia, płeć, pakiet badań.
    5. Użytkownik akceptuje regulaminy (jeśli są) i klika "Zarejestruj się".
    6. Komponent wywołuje `AuthService.register()` z zebranymi danymi.
    7. `AuthService` ustawia `isLoadingSignal` na `true`.
    8. Po pomyślnej rejestracji w Firebase Auth i zapisie profilu w Firestore:
        - `isLoadingSignal` na `false`, `errorSignal` na `null`.
        - `currentUserSignal` jest aktualizowany przez `authState`.
        - Następuje przekierowanie na stronę główną aplikacji (np. `/dashboard`).
    9. W przypadku błędu: `isLoadingSignal` na `false`, `errorSignal` ustawiany jest na odpowiedni komunikat. Błąd jest wyświetlany w `RegisterFormComponent`.

- **Logowanie Użytkownika (US-002):**
    1. Użytkownik nawiguje do `/auth/login`.
    2. Wypełnia pola identyfikator i hasło.
    3. Klika "Zaloguj się".
    4. Komponent wywołuje `AuthService.login()` z danymi.
    5. `AuthService` ustawia `isLoadingSignal` na `true`.
    6. Po pomyślnym zalogowaniu:
        - `isLoadingSignal` na `false`, `errorSignal` na `null`.
        - `currentUserSignal` jest aktualizowany.
        - Przekierowanie na `/dashboard`.
    7. W przypadku błędu: `isLoadingSignal` na `false`, `errorSignal` ustawiany jest. Błąd jest wyświetlany w `LoginFormComponent`.

- **Wylogowanie Użytkownika (US-003):**
    1. Mechanizm wylogowania będzie dostępny w aplikacji (np. poprzez opcję w menu głównym lub na stronie profilu użytkownika - poza zakresem tego modułu).
    2. Wywołanie `AuthService.logout()`.
    3. `AuthService` wylogowuje użytkownika z Firebase i przekierowuje na `/auth/login`. Sygnał `currentUser` jest aktualizowany na `null`.

- **Ochrona Tras (AuthGuard):**
    - Implementacja jako funkcja `canActivateFn` (`auth.guard.ts` w `libs/features/auth/src/lib/guards/`).
    - Guard wstrzykuje `AuthService` i `Router`.
    - Sprawdza wartość sygnału `AuthService.isLoggedIn`.
    - Jeśli użytkownik nie jest zalogowany, przekierowuje na `/auth/login` i zwraca `false`.
    - Jeśli zalogowany, zwraca `true`.
    - Guard będzie używany w definicjach tras chronionych w `apps/my-health/src/app/app.routes.ts`.

### 2.8. Zmiany w Głównym Layout'cie Aplikacji
- Główny komponent aplikacji (np. `AppComponent` lub dedykowany `MainLayoutComponent` w `apps/my-health/src/app/layout/`) będzie odczytywał sygnały `AuthService.isLoggedIn` oraz `AuthService.currentUser`.
- Na podstawie tych sygnałów, główny layout aplikacji będzie mógł dynamicznie dostosowywać interfejs (np. wyświetlać opcję "Wyloguj", ukrywać linki do logowania/rejestracji dla zalogowanego użytkownika). Konkretne elementy UI poza modułem `auth` są poza zakresem tej specyfikacji.

## 3. Logika Backendowa (Firebase & AngularFire)

Logika backendowa w kontekście tej aplikacji opiera się głównie na interakcjach z usługami Firebase (Auth i Firestore) zarządzanymi przez AngularFire z poziomu klienta (przeglądarki), zgodnie z zasadą enkapsulacji zapytań w serwisach Angular.

### 3.1. Komunikacja z Firebase Authentication
- **Rejestracja:** `AuthService` użyje `createUserWithEmailAndPassword(auth, identifier, password)` z `@angular/fire/auth`. `identifier` będzie pełnił rolę adresu e-mail.
- **Logowanie:** `AuthService` użyje `signInWithEmailAndPassword(auth, identifier, password)`.
- **Wylogowanie:** `AuthService` użyje `signOut(auth)`.
- **Obserwacja stanu autentykacji:** `AuthService` będzie korzystał z `authState(this.auth)` lub `user(this.auth)` do reaktywnego śledzenia stanu zalogowania użytkownika i aktualizowania wewnętrznych sygnałów (np. `currentUser`, `isLoggedIn`). Firebase SDK automatycznie zarządza tokenami sesji.

### 3.2. Przechowywanie Danych Profilu Użytkownika w Firestore
- Po udanej rejestracji przez Firebase Auth, `AuthService` utworzy dokument w kolekcji `users` w Firestore.
- Nazwa dokumentu będzie odpowiadać `uid` nowo utworzonego użytkownika Firebase.
- Dokument będzie zawierał dane z interfejsu `UserProfileData` (rok urodzenia, płeć, pakiet).
- Operacja zapisu będzie realizowana przez `AuthService` przy użyciu `setDoc(doc(this.firestore, 'users', uid), profileData)` z `@angular/fire/firestore`.
- **Reguły Bezpieczeństwa Firestore (`firestore.rules`):**
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      // Użytkownicy mogą tworzyć swój profil tylko jeśli są zalogowani i UID dokumentu zgadza się z ich UID
      // Mogą czytać i aktualizować tylko własny profil.
      match /users/{userId} {
        allow read, update: if request.auth != null && request.auth.uid == userId;
        allow create: if request.auth != null && request.auth.uid == userId; // Pozwala na utworzenie dokumentu, jeśli uid zgadza się z zalogowanym użytkownikiem
      }
      // ... inne reguły dla pozostałych kolekcji
    }
  }
  ```
  Reguła `create` dla `/users/{userId}` zapewni, że tylko nowo zarejestrowany użytkownik (który jest już technicznie zalogowany po `createUserWithEmailAndPassword`) może utworzyć swój własny dokument profilowy.

### 3.3. Mechanizm Walidacji Danych Wejściowych (Po Stronie Firebase)
- Firebase Auth automatycznie waliduje:
    - Format "emaila" (w naszym przypadku `identifier` musi przejść walidację emailową Firebase, co może wymagać, aby generowany identyfikator miał np. postać `random-string@app.local` lub podobną, jeśli nie chcemy prawdziwych domen). Alternatywnie, można rozważyć Custom Auth z Firebase, ale to komplikuje setup. Użycie `identifier` jako email jest prostsze, o ile jego format jest akceptowalny. Jeśli identyfikator ma być np. `jan-kowalski-123`, to nie przejdzie jako email. **Należy to wyjaśnić i dostosować strategię generowania identyfikatora lub rozważyć inne metody autentykacji Firebase, jeśli "login" nie może być emailem.** Dla uproszczenia, zakładam, że wygenerowany `identifier` będzie miał format akceptowalny jako email przez Firebase (np. `identyfikator@example.com`, gdzie `example.com` jest domeną kontrolowaną lub nieistotną).
    - Minimalną siłę hasła (np. co najmniej 6 znaków).
    - Unikalność "emaila" (identyfikatora) w systemie.
- Firestore: Reguły bezpieczeństwa mogą dodatkowo walidować typy i strukturę danych zapisywanych w dokumentach profilu użytkownika, choć główna walidacja formatu odbywa się na frontendzie.

### 3.4. Obsługa Wyjątków (Po Stronie Firebase)
- `AuthService` będzie przechwytywał błędy (obiekty `FirebaseError`) zwracane przez metody `AngularFireAuth`.
- Kody błędów (np. `error.code`) będą mapowane na zrozumiałe dla użytkownika komunikaty:
    - `auth/email-already-in-use` -> "Ten identyfikator jest już zajęty."
    - `auth/invalid-email` -> "Nieprawidłowy format identyfikatora."
    - `auth/weak-password` -> "Hasło jest zbyt słabe (minimum 6 znaków)."
    - `auth/user-not-found`, `auth/wrong-password`, `auth/invalid-credential` -> "Nieprawidłowy identyfikator lub hasło."
    - Inne błędy sieciowe/serwera -> "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później."
- Te komunikaty będą przekazywane do komponentów przez sygnał `error`.

## 4. System Autentykacji (Podsumowanie Firebase Auth)

- **Tożsamość Użytkownika:** Każdy użytkownik w Firebase Auth będzie miał unikalny `uid`.
- **Metoda Podstawowa:** Email (w naszym przypadku generowany `identifier`) i Hasło.
- **Anonimowość:** Zgodnie z PRD (US-001 "Rejestracja anonimowa"), system ma zapewnić anonimowość. Osiągniemy to przez:
    - Brak wymogu podawania prawdziwego adresu e-mail. Zamiast tego używany jest generowany identyfikator.
    - Jasne komunikowanie użytkownikowi, że identyfikator i hasło są jedynymi środkami dostępu i nie ma możliwości ich odzyskania.
- **Sesja Użytkownika:** Firebase SDK (zarządzane przez AngularFire) automatycznie obsługuje sesję użytkownika, przechowując tokeny (np. ID token, refresh token) w bezpieczny sposób w przeglądarce (zazwyczaj `IndexedDB`). Biblioteka odświeża tokeny w tle.
- **Dodatkowe Dane Użytkownika:** Rok urodzenia, płeć, pakiet badań są przechowywane w Firestore i powiązane z `uid` użytkownika. Nie są częścią samego obiektu użytkownika Firebase Auth.

## 5. Kluczowe Wnioski i Elementy Dodatkowe

- **Zgodność z `angular.mdc` i `shared` rules:**
    - Użycie standalone components.
    - Zarządzanie stanem za pomocą Angular Signals.
    - `inject` zamiast dependency injection w konstruktorze.
    - Lazy loading dla modułu `auth`.
    - Eksport tras z `routes.ts` w `index.ts` biblioteki.
    - Enkapsulacja zapytań AngularFire w serwisach.
- **Kwestia Generowanego Identyfikatora:** Generowany identyfikator (np. `wesoly-pingwin-34`) będzie używany jako lokalna część adresu email przesyłanego do Firebase Auth (np. `wesoly-pingwin-34@example.com`, gdzie `example.com` może być domeną zdefiniowaną dla projektu lub zastępczą). Może to wymagać użycia zewnętrznej biblioteki do generowania przyjaznych nazw.
- **Bezpieczeństwo Danych Logowania:** Kluczowe jest poinformowanie użytkownika o konieczności bezpiecznego przechowania wygenerowanego identyfikatora i hasła, ponieważ nie będzie standardowej opcji "zapomniałem hasła" (brak rzeczywistego emaila do resetu).
- **Doświadczenie Użytkownika (UX):** Proces rejestracji i logowania powinien być jak najprostszy i najbardziej intuicyjny, z jasnymi komunikatami i instrukcjami.
- **Testowanie:** Należy zaplanować testy jednostkowe dla serwisów i komponentów.

Ta specyfikacja powinna stanowić solidną podstawę do implementacji modułu autentykacji. 