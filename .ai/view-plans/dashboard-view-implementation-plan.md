# Plan implementacji widoku Dashboard

## 1. Przegląd
Widok Dashboard ma na celu prezentację kluczowych informacji o stanie zdrowia użytkownika. W bieżącej fazie implementacji skupiamy się na wyświetleniu listy ostatnich wyników badań pobranych z Firestore. Wskaźniki Health Score (HS), Compliance Score (CS) oraz kalendarz nadchodzących badań będą na tym etapie zamockowane. Widok zapewni użytkownikowi szybki dostęp do jego najnowszych danych medycznych.

## 2. Routing widoku
Widok Dashboard będzie dostępny pod następującą ścieżką:
- `/dashboard`

Komponent widoku (`DashboardViewComponent`) będzie komponentem samodzielnym (standalone) i zostanie zaimplementowany w ramach nowej, leniwie ładowanej biblioteki NX `libs/features/dashboard`.

**Konfiguracja routingu:**
1.  W bibliotece `libs/features/dashboard/src/lib/` utwórz plik `routes.ts`:
    ```typescript
    import { Route } from '@angular/router';
    import { DashboardViewComponent } from './dashboard-view.component'; // Upewnij się, że ścieżka jest poprawna

    export const DASHBOARD_ROUTES: Route[] = [
      {
        path: '',
        pathMatch: 'full',
        component: DashboardViewComponent
      },
    ];
    ```
2.  W głównym pliku routingu aplikacji (np. `app.routes.ts`) skonfiguruj leniwe ładowanie:
    ```typescript
    export const appRoutes: Route[] = [
      // ... inne trasy
      {
        path: 'dashboard',
        loadChildren: () => import('@my-health/features/dashboard').then(m => m.DASHBOARD_ROUTES) // Użyj poprawnej nazwy biblioteki NX
      },
      // ... inne trasy
    ];
    ```
3.  Upewnij się, że plik `index.ts` w `libs/features/dashboard/src/` eksportuje `DASHBOARD_ROUTES`:
    ```typescript
    export * from './lib/routes';
    ```

## 3. Struktura komponentów
Hierarchia komponentów (wszystkie jako komponenty samodzielne) dla widoku Dashboard będzie następująca:

```
Feature: Dashboard (libs/features/dashboard)
└── DashboardViewComponent (routowalny, smart, standalone)
    ├── ScoreCardComponent (prezentacyjny, standalone, dla zamockowanego HS)
    ├── ScoreCardComponent (prezentacyjny, standalone, dla zamockowanego CS)
    ├── RecentTestResultsListComponent (prezentacyjny, standalone)
    │   └── TestResultItemComponent (prezentacyjny, standalone, użyty w @for)
    └── UpcomingTestsSummaryComponent (prezentacyjny, standalone, dla zamockowanego kalendarza)
```

## 4. Szczegóły komponentów

Wszystkie komponenty będą samodzielne (standalone: true), z szablonami i stylami w osobnych plikach (np. `*.component.html`, `*.component.scss`, jeśli style są potrzebne). Zależności będą wstrzykiwane za pomocą `inject()`.

### `DashboardViewComponent`
- **Lokalizacja:** `libs/features/dashboard/src/lib/dashboard-view.component.ts`
- **Opis komponentu:** Główny komponent kontenerowy dla widoku Dashboard. Odpowiedzialny za koordynację pobierania danych (wyników badań), inicjalizację zamockowanych danych (HS, CS, kalendarz) oraz przekazywanie ich do komponentów prezentacyjnych. Wykorzystuje `DashboardStore` (wstrzykiwany przez `inject()`).
- **Główne elementy HTML i komponenty dzieci:**
    - `<app-score-card [data]="dashboardStore.healthScoreMock()">`
    - `<app-score-card [data]="dashboardStore.complianceScoreMock()">`
    - `<app-recent-test-results-list [results]="dashboardStore.recentTestResults()" [isLoading]="dashboardStore.isLoadingResults()" [error]="dashboardStore.resultsError()">`
    - `<app-upcoming-tests-summary [upcomingTests]="dashboardStore.upcomingTestsMock()">`
    - Elementy do wyświetlania stanu ładowania lub błędów (np. używając `@if` i `@defer` w komponentach dzieci).
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji użytkownika w tym komponencie w obecnej fazie.
- **Obsługiwana walidacja:** Sprawdzenie dostępności `userId` (np. z `AuthStore` lub `AuthService`) przed próbą pobrania danych w `DashboardStore`.
- **Typy:** Korzysta z `DashboardStore`.
- **Propsy:** Brak (komponent routowalny).
- **Providers:** `[DashboardStore]`

### `ScoreCardComponent`
- **Opis komponentu:** Prezentacyjny komponent do wyświetlania pojedynczego wskaźnika (np. Health Score, Compliance Score) wraz z jego wartością procentową i kolorowym oznaczeniem progów.
- **Główne elementy HTML:**
    - `mat-card` (Angular Material)
    - Elementy `div` lub `span` do wyświetlenia tytułu, wartości procentowej.
    - Stylowanie tła lub tekstu w zależności od wartości wskaźnika (zielony, żółty, czerwony).
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `ScoreCardVM`
- **Propsy (wejścia oparte na sygnałach):**
    - `data = input.required<ScoreCardVM>()`

### `RecentTestResultsListComponent`
- **Opis komponentu:** Prezentacyjny komponent wyświetlający listę ostatnich wyników badań użytkownika.
- **Główne elementy HTML i komponenty dzieci (używając `@for` i `@if`):**
    - `mat-list` (Angular Material) lub niestandardowa lista.
    - `@if (isLoading()) { <mat-progress-spinner mode="indeterminate"></mat-progress-spinner> } @else if (error()) { <p class="text-red-500">Błąd ładowania danych: {{ error() | json }}</p> } @else if (!results()?.length) { <p>Brak wyników badań.</p> } @else { @for (item of results(); track item.id) { <app-test-result-item [item]="item" /> } }`
- **Obsługiwane interakcje:** Brak w obecnej fazie.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `RecentTestResultItemVM[]`
- **Propsy (wejścia oparte na sygnałach):**
    - `results = input<RecentTestResultItemVM[] | null>(null)`
    - `isLoading = input<boolean>(false)`
    - `error = input<any | null>(null)`

### `TestResultItemComponent`
- **Opis komponentu:** Prezentacyjny komponent wyświetlający pojedynczy element na liście ostatnich wyników badań.
- **Główne elementy HTML:**
    - `mat-list-item` (jeśli nadrzędny komponent używa `mat-list`) lub `div` w `mat-card`.
    - Elementy `span` lub `div` do wyświetlenia identyfikatora badania (`testIdentifier`) i daty (`date`).
- **Obsługiwane interakcje:** Brak w obecnej fazie.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `RecentTestResultItemVM`
- **Propsy (wejścia oparte na sygnałach):**
    - `item = input.required<RecentTestResultItemVM>()`

### `UpcomingTestsSummaryComponent`
- **Opis komponentu:** Prezentacyjny komponent wyświetlający zamockowaną listę nadchodzących badań.
- **Główne elementy HTML:**
    - `mat-card` (Angular Material) z tytułem "Nadchodzące badania".
    - `@if (upcomingTests()?.length) { <mat-list> @for (test of upcomingTests(); track test.testName) { <mat-list-item>{{ test.testName }} - {{ test.date }}</mat-list-item> } </mat-list> } @else { <p>Brak zaplanowanych badań.</p> }`
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `UpcomingTestMockVM[]`
- **Propsy (wejścia oparte na sygnałach):**
    - `upcomingTests = input.required<UpcomingTestMockVM[]>()`

## 5. Typy
Do implementacji widoku wymagane będą następujące typy (DTO pochodzą z `libs/domain`, ViewModel są specyficzne dla widoku):

### DTO (Data Transfer Objects - z `libs/domain`)
- **`TestResult`** (`libs/domain/src/lib/test-result.model.ts`)
  ```typescript
  export interface TestResult {
    resultId: string;
    testId: string;
    createdAt: Date; // Firestore Timestamp zostanie przekonwertowany na Date
    parameters: TestResultParameter[];
  }
  ```
- **`TestResultParameter`** (`libs/domain/src/lib/test-result.model.ts`)
  ```typescript
  export interface TestResultParameter {
    paramId: string;
    value: number | string | boolean;
  }
  ```
- **`UserProfile`** (`libs/domain/src/lib/user-profile.model.ts` - do pozyskania `userId`)

### ViewModel (Specyficzne dla widoku Dashboard)
- **`ScoreCardVM`**
  ```typescript
  export interface ScoreCardVM {
    title: string;        // Np. "Health Score", "Compliance Score"
    value: number;        // Wartość procentowa, np. 85
    displayValue: string; // Sformatowana wartość, np. "85%"
    color: 'green' | 'yellow' | 'red' | 'grey'; // Kolor wskaźnika ('grey' dla stanu ładowania/braku danych)
  }
  ```

- **`RecentTestResultItemVM`**
  ```typescript
  export interface RecentTestResultItemVM {
    id: string;                      // resultId
    testIdentifier: string;          // Początkowo testId, docelowo nazwa badania z testCatalog
    date: string;                    // Sformatowana data badania (createdAt)
  }
  ```

- **`UpcomingTestMockVM`**
  ```typescript
  export interface UpcomingTestMockVM {
    testName: string; // Nazwa zamockowanego badania
    date: string;     // Zamockowana data
  }
  ```

## 6. Zarządzanie stanem
Stan widoku Dashboard będzie zarządzany przy użyciu `SignalStore` z biblioteki `@ngrx/signals-store`. Utworzymy dedykowany store, np. `DashboardStore`, który będzie odpowiedzialny za:
- Przechowywanie listy ostatnich wyników badań.
- Przechowywanie stanu ładowania i ewentualnych błędów związanych z pobieraniem wyników.
- Przechowywanie zamockowanych danych dla HS, CS i kalendarza nadchodzących badań.

**`DashboardStore` (używając `signalStore`):**
- **State Interface:**
  ```typescript
  // libs/features/dashboard/src/lib/dashboard.store.ts
  import { RecentTestResultItemVM, ScoreCardVM, UpcomingTestMockVM } from './dashboard.models'; // Przykładowa lokalizacja modeli VM

  export interface DashboardState {
    recentTestResults: RecentTestResultItemVM[] | null;
    isLoadingResults: boolean;
    resultsError: any | null;
    healthScoreMock: ScoreCardVM;
    complianceScoreMock: ScoreCardVM;
    upcomingTestsMock: UpcomingTestMockVM[];
  }

  export const initialState: DashboardState = {
    recentTestResults: null,
    isLoadingResults: false,
    resultsError: null,
    healthScoreMock: { title: 'Health Score', value: 0, displayValue: '0%', color: 'grey' },
    complianceScoreMock: { title: 'Compliance Score', value: 0, displayValue: '0%', color: 'grey' },
    upcomingTestsMock: [],
  };
  ```
- **Store Definition (przykład w `libs/features/dashboard/src/lib/dashboard.store.ts`):**
  ```typescript
  import { signalStore, withState, withMethods, patchState, withHooks } from '@ngrx/signals';
  import { computed, inject } from '@angular/core';
  import { TestResultsService } from '../../../../domain/src/lib/infrastructure/test-results.service'; // Dostosuj ścieżkę
  import { AuthService } from '../../../../domain/src/lib/infrastructure/auth.service'; // Dostosuj ścieżkę
  import { DashboardState, initialState, RecentTestResultItemVM, ScoreCardVM, UpcomingTestMockVM } from './dashboard.models';

  export const DashboardStore = signalStore(
    { providedIn: 'root' }, // lub dostarczony w komponencie DashboardViewComponent
    withState(initialState),
    withMethods((store, testResultsService = inject(TestResultsService), authService = inject(AuthService)) => ({
      async loadRecentTestResults(): Promise<void> {
        const userId = authService.currentUser()?.userId; // Załóżmy, że authService.currentUser() to sygnał zwracający obiekt User lub null
        if (!userId) {
          patchState(store, { recentTestResults: [], resultsError: 'User not authenticated', isLoadingResults: false });
          return;
        }
        patchState(store, { isLoadingResults: true, resultsError: null });
        try {
          const results = await testResultsService.fetchRecentResults(userId, 5);
          const viewModels: RecentTestResultItemVM[] = results.map(r => ({
            id: r.resultId,
            testIdentifier: r.testId, // Docelowo nazwa badania
            date: new Date(r.createdAt).toLocaleDateString(), // Przykładowe formatowanie
          }));
          patchState(store, { recentTestResults: viewModels, isLoadingResults: false });
        } catch (error) {
          patchState(store, { resultsError: error, isLoadingResults: false });
        }
      },
      initializeMockData(): void {
        const hsMock: ScoreCardVM = { title: 'Health Score', value: 85, displayValue: '85%', color: this.determineScoreColor(85) };
        const csMock: ScoreCardVM = { title: 'Compliance Score', value: 92, displayValue: '92%', color: this.determineScoreColor(92) };
        const upcomingMock: UpcomingTestMockVM[] = [
            { testName: 'Badanie krwi', date: '2024-08-15'},
            { testName: 'Kontrola dentystyczna', date: '2024-09-01'},
        ];
        patchState(store, {
            healthScoreMock: hsMock,
            complianceScoreMock: csMock,
            upcomingTestsMock: upcomingMock,
        });
      },
      determineScoreColor(value: number): 'green' | 'yellow' | 'red' | 'grey' {
        if (value >= 90) return 'green';
        if (value >= 70) return 'yellow';
        if (value < 70 && value > 0) return 'red';
        return 'grey';
      }
    })),
    withHooks({
        onInit(store) {
            store.initializeMockData();
            store.loadRecentTestResults(); // Automatyczne ładowanie danych przy inicjalizacji store
        }
    })
  );
  ```
- **Użycie w komponentach:** Komponent `DashboardViewComponent` wstrzyknie `DashboardStore` za pomocą `inject()` i będzie odczytywać stan bezpośrednio z instancji store (np. `dashboardStore.recentTestResults()`).

## 7. Integracja API
Dane dotyczące wyników badań będą pobierane bezpośrednio z Firestore za pośrednictwem `TestResultsService`.

- **Endpoint:** Kolekcja `users/{userId}/results` w Firestore.
- **Logika pobierania (w `TestResultsService`):**
  ```typescript
  // libs/domain/src/lib/infrastructure/test-results.service.ts
  import { collection, Firestore, query, orderBy, limit, getDocs, Timestamp } from '@angular/fire/firestore';
  import { inject, Injectable } from '@angular/core';
  import { TestResult } from '../test-result.model';

  @Injectable({ providedIn: 'root' })
  export class TestResultsService {
    private firestore = inject(Firestore);

    async fetchRecentResults(userId: string, count: number): Promise<TestResult[]> {
      const resultsCollection = collection(this.firestore, `users/${userId}/results`);
      const q = query(resultsCollection, orderBy('createdAt', 'desc'), limit(count));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            resultId: doc.id, 
            testId: data['testId'],
            createdAt: (data['createdAt'' as Timestamp).toDate(), // Konwersja Timestamp na Date
            parameters: data['parameters']
        } as TestResult;
      });
    }
  }
  ```
- **Typy żądania:** Parametrem jest `userId` (string).
- **Typy odpowiedzi:** `TestResult[]`, które następnie zostaną zmapowane na `RecentTestResultItemVM[]` w `DashboardStore`.

## 8. Interakcje użytkownika
W obecnej fazie implementacji interakcje użytkownika są ograniczone:
- **Ładowanie widoku:** Użytkownik przechodzi na ścieżkę `/dashboard`.
    - `DashboardStore` automatycznie inicjalizuje mocki i próbuje załadować wyniki badań (`onInit` hook).
    - Komponenty subskrybują (pośrednio przez odczyt sygnałów) do stanu w `DashboardStore` i aktualizują UI.
    - Aplikacja wyświetla wskaźniki ładowania dla sekcji wyników badań (obsługiwane przez `@if` w `RecentTestResultsListComponent`).
    - Zamockowane dane dla HS, CS i kalendarza są wyświetlane niemal natychmiast.
    - Po pomyślnym załadowaniu danych, lista wyników badań jest wyświetlana.
    - W przypadku braku wyników lub błędu, wyświetlane są odpowiednie komunikaty.

## 9. Warunki i walidacja
- **Warunki na poziomie komponentu/store:**
    - `DashboardStore`: Logika `loadRecentTestResults` sprawdza, czy `userId` jest dostępne przed wykonaniem zapytania.
    - Komponenty prezentacyjne obsługują stany `null` lub pustych tablic w szablonach za pomocą `@if`.
- **Firestore Security Rules:** Zdefiniowane w `db-plan.md` zapewniają, że użytkownik ma dostęp tylko do własnych danych.

## 10. Obsługa błędów
- **Brak `userId`:** `DashboardStore` ustawia `resultsError` i nie próbuje ładować danych. `RecentTestResultsListComponent` wyświetli błąd.
- **Błąd pobierania danych z Firestore:** `TestResultsService` może rzucać błędy, które są łapane w `DashboardStore` i ustawiany jest sygnał `resultsError`. `RecentTestResultsListComponent` wyświetli błąd.
- **Brak wyników badań:** `DashboardStore` ustawi `recentTestResults` na pustą tablicę. `RecentTestResultsListComponent` wyświetli odpowiedni komunikat.

## 11. Kroki implementacji
1.  **Przygotowanie biblioteki NX i routingu:**
    *   Utwórz bibliotekę NX `libs/features/dashboard` (`nx g @nx/angular:library features/dashboard --standalone --directory=libs/features --routing --lazy`).
    *   Skonfiguruj `DASHBOARD_ROUTES` w `libs/features/dashboard/src/lib/lib.routes.ts` i w głównym `app.routes.ts` dla leniwego ładowania.
    *   Usuń domyślnie wygenerowany moduł (np. `dashboard.module.ts`), jeśli powstał, ponieważ komponenty będą standalone.
2.  **Definicja Modeli ViewModel:**
    *   W `libs/features/dashboard/src/lib/` utwórz plik `dashboard.models.ts` (lub podobny) i zdefiniuj interfejsy `ScoreCardVM`, `RecentTestResultItemVM`, `UpcomingTestMockVM` oraz `DashboardState` i `initialState`.
3.  **Implementacja `AuthService` i `TestResultsService` (w `libs/domain`):**
    *   Upewnij się, że `AuthService` (`libs/domain/src/lib/infrastructure/auth.service.ts`) dostarcza `currentUser(): Signal<User | null>` (lub podobny sygnał z `userId`).
    *   Zaimplementuj `TestResultsService` (`libs/domain/src/lib/infrastructure/test-results.service.ts`) z metodą `fetchRecentResults`, jak opisano w sekcji 7.
4.  **Implementacja `DashboardStore`:**
    *   W `libs/features/dashboard/src/lib/` utwórz plik `dashboard.store.ts`.
    *   Zaimplementuj `DashboardStore` używając `signalStore`, `withState`, `withMethods`, `withHooks` (jak opisano w sekcji 6), wstrzykując `TestResultsService` i `AuthService`.
5.  **Utworzenie i implementacja komponentów (jako standalone):**
    *   W `libs/features/dashboard/src/lib/` utwórz `DashboardViewComponent` (oraz jego `.html`, opcjonalnie `.scss`). Wstrzyknij `DashboardStore` i podłącz jego sygnały do szablonu.
    *   W `libs/features/dashboard/src/lib/components/` (lub podobnej strukturze) utwórz komponenty prezentacyjne: `ScoreCardComponent`, `RecentTestResultsListComponent`, `TestResultItemComponent`, `UpcomingTestsSummaryComponent`. Każdy jako standalone, z osobnymi plikami szablonu i stylów. Implementuj je z użyciem wejść opartych na sygnałach i nowej składni przepływu sterowania (`@for`, `@if`).
6.  **Styling:** Dopracuj wygląd komponentów używając Angular Material i Tailwind CSS.
7.  **Dostarczenie `DashboardStore`:**
    *   Zdecyduj, czy `DashboardStore` ma być `providedIn: 'root'` czy dostarczony lokalnie w `DashboardViewComponent.providers`.
8.  **Testowanie:** Napisz testy jednostkowe dla `DashboardStore` i testy komponentów dla wszystkich utworzonych komponentów, uwzględniając komponenty samodzielne, sygnały i `SignalStore`.
9.  **Refaktoryzacja i przegląd kodu:** Upewnij się, że kod jest czysty, zgodny z wytycznymi projektu i dobrze udokumentowany.

Potencjalne przyszłe ulepszenie: Zamiast `testId` w `RecentTestResultItemVM`, pobrać rzeczywistą nazwę badania z `testCatalog` (wymagałoby to dodatkowej logiki, być może w `DashboardStore` lub osobnym serwisie). 