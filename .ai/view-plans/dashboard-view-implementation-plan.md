# Plan implementacji widoku Dashboard

## 1. Przegląd
Widok Dashboard ma na celu prezentację kluczowych informacji o stanie zdrowia użytkownika. W bieżącej fazie implementacji skupiamy się na wyświetleniu listy ostatnich wyników badań pobranych z Firestore. Wskaźniki Health Score (HS), Compliance Score (CS) oraz kalendarz nadchodzących badań będą na tym etapie zamockowane. Widok zapewni użytkownikowi szybki dostęp do jego najnowszych danych medycznych.

## 2. Routing widoku
Widok Dashboard będzie dostępny pod następującą ścieżką:
- `/dashboard`

Komponent widoku (`DashboardViewComponent`) będzie komponentem samodzielnym (standalone) i zostanie zaimplementowany w ramach istniejącej, leniwie ładowanej biblioteki NX `libs/features/dashboard`.

**Konfiguracja routingu:**
1.  W bibliotece `libs/features/dashboard/src/lib/` powinien istnieć plik `lib.routes.ts` (lub `routes.ts`):
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
        // Użyj poprawnej nazwy biblioteki NX, np. @nazwa-projektu/features-dashboard lub @my-health/features/dashboard
        loadChildren: () => import('@my-health/features/dashboard').then(m => m.DASHBOARD_ROUTES)
      },
      // ... inne trasy
    ];
    ```
3.  Upewnij się, że plik `index.ts` w `libs/features/dashboard/src/` eksportuje `DASHBOARD_ROUTES`:
    ```typescript
    export * from './lib/lib.routes'; // lub './lib/routes'
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
- **Opis komponentu:** Główny komponent kontenerowy dla widoku Dashboard. Odpowiedzialny za przekazywanie danych ze store do komponentów prezentacyjnych. Wykorzystuje `DashboardStore` (wstrzykiwany przez `inject()`).
- **Główne elementy HTML i komponenty dzieci:**
    - `<app-score-card [data]="dashboardStore.healthScoreMock()">`
    - `<app-score-card [data]="dashboardStore.complianceScoreMock()">`
    - `<app-recent-test-results-list [results]="dashboardStore.recentTestResultsForView()" [isLoading]="dashboardStore.isLoadingResults()" [error]="dashboardStore.resultsError()">`
    - `<app-upcoming-tests-summary [upcomingTests]="dashboardStore.upcomingTestsMock()">`
    - Elementy do wyświetlania stanu ładowania lub błędów (obsługiwane w komponentach dzieci).
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji użytkownika w tym komponencie w obecnej fazie.
- **Obsługiwana walidacja:** Logika walidacji (np. dostępność `userId`) jest obsługiwana w `DashboardStore`.
- **Typy:** Korzysta z `DashboardStore`.
- **Propsy:** Brak (komponent routowalny).
- **Providers:** `[DashboardStore]`

### `ScoreCardComponent`
- **Opis komponentu:** Prezentacyjny komponent do wyświetlania pojedynczego wskaźnika (np. Health Score, Compliance Score) wraz z jego wartością procentową i kolorowym oznaczeniem progów. Dane do tego komponentu (w kształcie `ScoreCardData`) są przygotowywane przez `DashboardStore`.
- **Główne elementy HTML:**
    - `mat-card` (Angular Material)
    - Elementy `div` lub `span` do wyświetlenia tytułu, wartości procentowej.
    - Stylowanie tła lub tekstu w zależności od wartości wskaźnika (zielony, żółty, czerwony).
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `ScoreCardData` (struktura danych zdefiniowana np. w `dashboard.model.ts` lub w `dashboard.store.ts`)
- **Propsy (wejścia oparte na sygnałach):**
    - `data = input.required<ScoreCardData>()`

### `RecentTestResultsListComponent`
- **Opis komponentu:** Prezentacyjny komponent wyświetlający listę ostatnich wyników badań użytkownika. Dane (lista obiektów `TestResultItemData`) są dostarczane przez `DashboardStore` po transformacji z modelu domenowego `TestResult`.
- **Główne elementy HTML i komponenty dzieci (używając `@for` i `@if`):**
    - `mat-list` (Angular Material) lub niestandardowa lista.
    - `@if (isLoading()) { <mat-progress-spinner mode="indeterminate"></mat-progress-spinner> } @else if (error()) { <p class="text-red-500">Błąd ładowania danych: {{ error() | json }}</p> } @else if (!results()?.length) { <p>Brak wyników badań.</p> } @else { @for (item of results(); track item.id) { <app-test-result-item [item]="item" /> } }`
- **Obsługiwane interakcje:** Brak w obecnej fazie.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `TestResultItemData[]` (struktura danych zdefiniowana np. w `dashboard.model.ts` lub w `dashboard.store.ts`)
- **Propsy (wejścia oparte na sygnałach):**
    - `results = input<TestResultItemData[] | null>(null)`
    - `isLoading = input<boolean>(false)`
    - `error = input<any | null>(null)`

### `TestResultItemComponent`
- **Opis komponentu:** Prezentacyjny komponent wyświetlający pojedynczy element na liście ostatnich wyników badań.
- **Główne elementy HTML:**
    - `mat-list-item` (jeśli nadrzędny komponent używa `mat-list`) lub `div` w `mat-card`.
    - Elementy `span` lub `div` do wyświetlenia identyfikatora badania (`testIdentifier`) i daty (`date`).
- **Obsługiwane interakcje:** Brak w obecnej fazie.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `TestResultItemData`
- **Propsy (wejścia oparte na sygnałach):**
    - `item = input.required<TestResultItemData>()`

### `UpcomingTestsSummaryComponent`
- **Opis komponentu:** Prezentacyjny komponent wyświetlający zamockowaną listę nadchodzących badań. Dane (lista `UpcomingTestMockData`) są przygotowywane przez `DashboardStore`.
- **Główne elementy HTML:**
    - `mat-card` (Angular Material) z tytułem "Nadchodzące badania".
    - `@if (upcomingTests()?.length) { <mat-list> @for (test of upcomingTests(); track test.testName) { <mat-list-item>{{ test.testName }} - {{ test.date }}</mat-list-item> } </mat-list> } @else { <p>Brak zaplanowanych badań.</p> }`
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `UpcomingTestMockData[]` (struktura danych zdefiniowana np. w `dashboard.model.ts` lub w `dashboard.store.ts`)
- **Propsy (wejścia oparte na sygnałach):**
    - `upcomingTests = input.required<UpcomingTestMockData[]>()`

## 5. Struktury danych dla widoku
Komponenty będą korzystać ze struktur danych przygotowanych przez `DashboardStore`. Te struktury są pochodnymi modeli domenowych z `libs/domain` lub są specyficzne dla UI dashboardu.

- **Model domenowy (z `libs/domain`):**
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

- **Struktury danych używane przez komponenty Dashboard (definiowane np. w `libs/features/dashboard/src/lib/dashboard.models.ts` lub bezpośrednio w pliku store):**
  - **`ScoreCardData`** (dla `ScoreCardComponent`)
    ```typescript
    export interface ScoreCardData {
      title: string;
      value: number;
      displayValue: string;
      color: 'green' | 'yellow' | 'red' | 'grey';
    }
    ```
  - **`TestResultItemData`** (dla `TestResultItemComponent`, element listy `RecentTestResultsListComponent`. `DashboardStore` transformuje `TestResult` do tej struktury)
    ```typescript
    export interface TestResultItemData {
      id: string;          // z TestResult.resultId
      testIdentifier: string; // z TestResult.testId (docelowo nazwa badania)
      date: string;        // sformatowana TestResult.createdAt
    }
    ```
  - **`UpcomingTestMockData`** (dla `UpcomingTestsSummaryComponent`, dane zamockowane)
    ```typescript
    export interface UpcomingTestMockData {
      testName: string;
      date: string;
    }
    ```

## 6. Zarządzanie stanem
Stan widoku Dashboard będzie zarządzany przy użyciu `SignalStore` z biblioteki `@ngrx/signals-store`. Utworzymy dedykowany store, np. `DashboardStore`, który będzie odpowiedzialny za:
- Przechowywanie i transformację listy ostatnich wyników badań (`TestResult[]` na `TestResultItemData[]`).
- Przechowywanie stanu ładowania i ewentualnych błędów.
- Przechowywanie zamockowanych danych dla HS, CS i kalendarza.

**`DashboardStore` (używając `signalStore`):**
- **State Interface (w `libs/features/dashboard/src/lib/dashboard.store.ts` lub `dashboard.models.ts`):**
  ```typescript
  import { TestResultItemData, ScoreCardData, UpcomingTestMockData } from './dashboard.models';

  export interface DashboardState {
    recentTestResults: TestResultItemData[] | null; // Przechowuje już przetransformowane dane
    isLoadingResults: boolean;
    resultsError: any | null;
    healthScoreMock: ScoreCardData;
    complianceScoreMock: ScoreCardData;
    upcomingTestsMock: UpcomingTestMockData[];
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
  import { signalStore, withState, withMethods, patchState, withHooks, withComputed } from '@ngrx/signals';
  import { computed, inject } from '@angular/core';
  import { TestResultsService } from '../../../../libs/domain/src/lib/infrastructure/test-results.service'; // Poprawiona ścieżka
  import { AuthService } from '../../../../libs/features/auth/src/lib/services/auth.service.ts'; // Poprawiona ścieżka
  import { DashboardState, initialState, TestResultItemData, ScoreCardData, UpcomingTestMockData } from './dashboard.models';
  import { TestResult } from '../../../../libs/domain/src/lib/test-result.model'; // Poprawiona ścieżka

  export const DashboardStore = signalStore(
    { providedIn: 'root' }, // lub dostarczony w komponencie DashboardViewComponent
    withState(initialState),
    withComputed((state) => ({
      recentTestResultsForView: computed(() => state.recentTestResults()), // Sygnał gotowy dla widoku
    })),
    withMethods((store, testResultsService = inject(TestResultsService), authService = inject(AuthService)) => ({
      async loadRecentTestResults(): Promise<void> {
        const currentUser = authService.currentUser();
        const userId = currentUser?.uid;
        if (!userId) {
          patchState(store, { recentTestResults: [], resultsError: 'User not authenticated', isLoadingResults: false });
          return;
        }
        patchState(store, { isLoadingResults: true, resultsError: null });
        try {
          const domainResults: TestResult[] = await testResultsService.fetchRecentResults(userId, 5);
          const viewData: TestResultItemData[] = domainResults.map(r => ({
            id: r.resultId,
            testIdentifier: r.testId, // Docelowo nazwa badania
            date: new Date(r.createdAt).toLocaleDateString(), // Przykładowe formatowanie
          }));
          patchState(store, { recentTestResults: viewData, isLoadingResults: false });
        } catch (error) {
          patchState(store, { resultsError: error, isLoadingResults: false });
        }
      },
      initializeMockData(): void {
        const hsMock: ScoreCardData = { title: 'Health Score', value: 85, displayValue: '85%', color: this.determineScoreColor(85) };
        const csMock: ScoreCardData = { title: 'Compliance Score', value: 92, displayValue: '92%', color: this.determineScoreColor(92) };
        const upcomingMock: UpcomingTestMockData[] = [
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
            store.loadRecentTestResults();
        }
    })
  );
  ```
- **Użycie w komponentach:** Komponent `DashboardViewComponent` wstrzyknie `DashboardStore` za pomocą `inject()` i będzie odczytywać stan bezpośrednio z instancji store (np. `dashboardStore.recentTestResultsForView()`).

## 7. Integracja API
Dane dotyczące wyników badań (`TestResult[]`) będą pobierane bezpośrednio z Firestore za pośrednictwem `TestResultsService` (z `libs/domain`).

- **Endpoint:** Kolekcja `users/{userId}/results` w Firestore.
- **Logika pobierania (w `libs/domain/src/lib/infrastructure/test-results.service.ts`):**
  ```typescript
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
            createdAt: (data['createdAt'] as Timestamp).toDate(), // Konwersja Timestamp na Date
            parameters: data['parameters']
        } as TestResult;
      });
    }
  }
  ```
- **Typy żądania:** Parametrem jest `userId` (string).
- **Typy odpowiedzi:** `TestResult[]`, które następnie zostaną zmapowane na `TestResultItemData[]` w `DashboardStore`.

## 8. Interakcje użytkownika
W obecnej fazie implementacji interakcje użytkownika są ograniczone:
- **Ładowanie widoku:** Użytkownik przechodzi na ścieżkę `/dashboard`.
    - `DashboardStore` automatycznie inicjalizuje mocki i próbuje załadować wyniki badań.
    - Komponenty odczytują sygnały ze `DashboardStore` i aktualizują UI.

## 9. Warunki i walidacja
- **Warunki na poziomie store:**
    - `DashboardStore`: Logika `loadRecentTestResults` sprawdza `userId` z `AuthService`.
- **Firestore Security Rules:** Zdefiniowane w `db-plan.md`.

## 10. Obsługa błędów
- **Brak `userId`:** `DashboardStore` ustawia `resultsError`.
- **Błąd pobierania danych z Firestore:** `TestResultsService` może rzucać błędy, które są łapane w `DashboardStore` i ustawiany jest sygnał `resultsError`.
- **Brak wyników badań:** `DashboardStore` ustawi `recentTestResults` na pustą tablicę. Komponenty wyświetlą odpowiedni komunikat.

## 11. Kroki implementacji
1.  **Konfiguracja biblioteki NX i routingu:**
    *   Upewnij się, że biblioteka NX `libs/features/dashboard` jest poprawnie skonfigurowana dla komponentów samodzielnych i leniwego ładowania (plik  `routes.ts` oraz główny `app.routes.ts`).    
2.  **Definicja Struktur Danych dla Widoku:**
    *   W `libs/features/dashboard/src/lib/` utwórz plik `dashboard.models.ts` (lub podobny) i zdefiniuj interfejsy `ScoreCardData`, `TestResultItemData`, `UpcomingTestMockData` oraz `DashboardState` i `initialState` dla `DashboardStore`.
3.  **Weryfikacja/Implementacja Usług Domenowych:**
    *   Użyj istniejącego `AuthService` z `libs/features/auth/src/lib/services/auth.service.ts`. Upewnij się, że dostarcza on `currentUser(): Signal<User | null>` (gdzie `User` z `@angular/fire/auth` zawiera `uid`).
    *   Upewnij się, że `TestResultsService` jest zaimplementowany w `libs/domain/src/lib/infrastructure/test-results.service.ts` z metodą `fetchRecentResults`, jak opisano w sekcji 7.
4.  **Implementacja `DashboardStore`:**
    *   W `libs/features/dashboard/src/lib/` utwórz plik `dashboard.store.ts`.
    *   Zaimplementuj `DashboardStore` używając `signalStore`, wstrzykując `TestResultsService` i `AuthService` oraz implementując logikę transformacji danych domenowych `TestResult` na `TestResultItemData`.
5.  **Utworzenie i implementacja komponentów (jako standalone):**
    *   W `libs/features/dashboard/src/lib/` utwórz `DashboardViewComponent`. Wstrzyknij `DashboardStore` i podłącz jego sygnały do szablonu. Zadeklaruj `DashboardStore` w `providers` tego komponentu.
    *   W `libs/features/dashboard/src/lib/components/` (lub podobnej strukturze) utwórz komponenty prezentacyjne: `ScoreCardComponent`, `RecentTestResultsListComponent`, `TestResultItemComponent`, `UpcomingTestsSummaryComponent`. Implementuj je z użyciem wejść opartych na sygnałach i nowej składni przepływu sterowania (`@for`, `@if`).
6.  **Styling:** Dopracuj wygląd komponentów używając Angular Material i Tailwind CSS.
8.  **Refaktoryzacja i przegląd kodu.**
