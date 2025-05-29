# Plan implementacji widoku Raportów

## 1. Przegląd
Widok Raportów (`/reports`) umożliwia użytkownikom generowanie, przeglądanie i zarządzanie raportami zdrowotnymi. Użytkownicy mogą inicjować generowanie nowego raportu poprzez dedykowany przycisk FAB. Lista historycznych raportów jest wyświetlana, a każdy raport posiada indywidualny status przetwarzania. Wygenerowane raporty (pliki HTML) są przechowywane w Cloud Storage i dostępne do wglądu w aplikacji. Proces generowania raportu odbywa się w tle przy użyciu Firebase Cloud Function.

## 2. Routing widoku
Widok Raportów będzie zaimplementowany jako lazy-loaded feature module w bibliotece NX `@my-health/features/reports`.

**Konfiguracja w `libs/features/reports/src/lib/reports.routes.ts`:**
```typescript
import { Route } from '@angular/router';
import { ReportsPageComponent } from './reports-page/reports-page.component';

export const REPORTS_ROUTES: Route[] = [
  {
    path: '',
    component: ReportsPageComponent,
    children: [
      {
        path: ':reportId',
        component: ReportsPageComponent,
      }
    ]
  },
];
```

**Konfiguracja w `apps/my-health/src/app/app.routes.ts` (fragment):**
```typescript
import { redirectUnauthorizedTo, AuthGuard } from '@angular/fire/auth-guard'; // Upewnij się, że import jest poprawny

// ... (inne importy)

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['auth/login']); // Zakładając, że ścieżka logowania to /auth/login

export const appRoutes: Route[] = [
  // ... inne trasy
  {
    path: 'reports',
    loadChildren: () => import('@my-health/features/reports').then(m => m.REPORTS_ROUTES),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  // ... inne trasy
];
```

## 3. Struktura komponentów
Hierarchia komponentów dla widoku Raportów:

```
ReportsPageComponent (Smart Component, kontener strony)
│
├── ReportListComponent (Dumb Component, wyświetla listę raportów)
│   └── ReportListItemComponent (Dumb Component, element listy, wyświetla status)
│
├── ReportDetailViewerComponent (Dumb Component, wyświetla HTML raportu w panelu bocznym/dialogu)
│
└── MatFabButton (Angular Material FAB, do inicjowania nowego raportu)
```

## 4. Szczegóły komponentów

### `ReportsPageComponent`
-   **Opis komponentu:** Główny kontener dla widoku `/reports` i `/reports/:reportId`. Odpowiada za koordynację komponentów podrzędnych, interakcję z `ReportSignalStore`, obsługę logiki związanej z tworzeniem nowego raportu, wyświetlaniem listy oraz dynamicznym pokazywaniem szczegółów raportu (panel boczny na desktopie, dialog na mobile).
-   **Główne elementy HTML i komponenty dzieci:**
    -   `<app-report-list>`
    -   `<app-report-detail-viewer>` (dynamicznie ładowany lub kontrolowany przez `MatDrawer`/`MatDialog`)
    -   `<button mat-fab color="primary">` (Angular Material FAB)
    -   `MatDrawerContainer`, `MatDrawer` (dla widoku desktop)
-   **Obsługiwane interakcje:**
    -   Inicjacja pobrania listy raportów przy inicjalizacji.
    -   Obsługa kliknięcia FAB w celu utworzenia nowego dokumentu raportu w Firestore (status `to-process`).
    -   Obsługa wyboru raportu z listy (`ReportListComponent`) -> nawigacja do `/reports/:reportId` i otwarcie panelu/dialogu.
    -   Obsługa zamknięcia panelu/dialogu detali.
    -   Reagowanie na zmiany `reportId` w URL.
-   **Typy:** Korzysta z typów i stanu zarządzanego przez `ReportSignalStore`.
-   **Propsy:** Brak.

### `ReportListComponent`
-   **Opis komponentu:** Wyświetla listę raportów. Każdy element listy pokazuje tytuł, datę utworzenia i aktualny status raportu.
-   **Główne elementy HTML i komponenty dzieci:**
    -   `<mat-list>`
    -   Użycie dyrektywy `@for` do iteracji po `ReportListItemComponent` lub bezpośrednio po `mat-list-item`.
    -   Komunikat "Brak raportów do wyświetlenia", jeśli lista jest pusta.
-   **Obsługiwane interakcje:**
    -   Kliknięcie na element listy emituje zdarzenie `reportSelected: EventEmitter<DisplayReport>` (lub `reportId: string`).
-   **Typy (wejściowe sygnały):**
    -   `reports = input.required<DisplayReport[]>();`
-   **Propsy (Signal-based inputs):**
    -   `reports: InputSignal<DisplayReport[]>`

### `ReportListItemComponent` (Opcjonalny, alternatywnie logika w `ReportListComponent`)
-   **Opis komponentu:** Reprezentuje pojedynczy element na liście raportów. Wyświetla kluczowe informacje o raporcie, w tym jego status (np. "Przetwarzanie", "Gotowy", "Błąd").
-   **Główne elementy HTML i komponenty dzieci:**
    -   `mat-list-item`
    -   Elementy tekstowe dla tytułu, daty.
    -   Wskaźnik statusu (np. ikona, chip, tekst z kolorem). `mat-spinner` dla statusu `processing`.
-   **Obsługiwane interakcje:** Kliknięcie emituje zdarzenie wyboru raportu (`reportClicked: EventEmitter<void>`).
-   **Typy (wejściowe sygnały):**
    -   `report = input.required<DisplayReport>();`
-   **Propsy (Signal-based inputs):**
    -   `report: InputSignal<DisplayReport>`

### `ReportDetailViewerComponent`
-   **Opis komponentu:** Odpowiada za wyświetlanie zawartości HTML pojedynczego raportu. Treść HTML jest pobierana z URL przechowywanego w metadanych raportu (Cloud Storage). Komponent ten będzie używany wewnątrz `MatDrawer` (desktop) lub `MatDialog` (mobile).
-   **Główne elementy HTML i komponenty dzieci:**
    -   Kontener (`div`) z atrybutem `[innerHTML]` powiązanym z oczyszczonym HTML raportu.
    -   Wskaźnik ładowania podczas pobierania HTML.
    -   Komunikat błędu, jeśli nie można załadować HTML.
    -   Przycisk zamknięcia (szczególnie ważny w widoku dialogu na mobile).
-   **Obsługiwane interakcje:** Może emitować zdarzenie `closeViewer: EventEmitter<void>`.
-   **Typy (wejściowe sygnały):**
    -   `reportHtmlContent = input<SafeHtml | null>(null);`
    -   `isLoading = input<boolean>(false);`
    -   `error = input<string | null>(null);`
-   **Propsy (Signal-based inputs):**
    -   `reportHtmlContent: InputSignal<SafeHtml | null>`
    -   `isLoading: InputSignal<boolean>`
    -   `error: InputSignal<string | null>`

## 5. Typy (Modele)
Modele `Report`, `DisplayReport` oraz typ `ReportStatus` będą zdefiniowane w bibliotece `@my-health/features/reports`, np. w pliku `libs/features/reports/src/lib/models/report.models.ts`.

### DTO (Data Transfer Object) - `Report`
```typescript
// In libs/features/reports/src/lib/models/report.models.ts
import { Timestamp } from 'firebase/firestore'; // Lub import { FieldValue } from '@angular/fire/firestore';

export type ReportStatus = 'to-process' | 'processing' | 'success' | 'error';

export interface Report {
  reportId: string;        // Firestore document ID - dodawany po stronie klienta przy odczycie
  userId: string;
  createdAt: Timestamp;    // Firestore Timestamp
  updatedAt?: Timestamp;   // Firestore Timestamp
  status: ReportStatus;
  title: string;
  reportHtmlUrl?: string;
  storagePath?: string;
  errorDetails?: string;
}
```

### ViewModel - `DisplayReport`
```typescript
// In libs/features/reports/src/lib/models/report.models.ts
import { SafeHtml } from '@angular/platform-browser';
// Report, ReportStatus są już zdefiniowane powyżej w tym samym pliku

export interface DisplayReport {
  reportId: string;
  userId: string;
  createdAtFormatted: string;
  updatedAtFormatted?: string;
  status: ReportStatus;
  title: string;
  reportHtmlUrl?: string;
  storagePath?: string;
  errorDetails?: string;
  originalReport: Report; // Przechowuje oryginalny obiekt z Firestore
}
```

## 6. Zarządzanie stanem (SignalStore)
Stan widoku Raportów będzie zarządzany za pomocą `@ngrx/signals/signal-store` w dedykowanym `ReportSignalStore`.

**`ReportSignalStore` (przykład struktury - plik `libs/features/reports/src/lib/store/report.store.ts`):**
```typescript
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { computed, inject, Signal } from '@angular/core';
import { Firestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp, collectionData, doc } from '@angular/fire/firestore';
import { FirebaseStorage, ref, getDownloadURL } from '@angular/fire/storage';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Report, DisplayReport, ReportStatus } from '../models/report.models';
import { AuthService } from '@my-health/features/auth-api'; // Poprawiony import
import { Observable, from, of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';

type ReportsState = {
  reports: DisplayReport[];
  selectedReportId: string | null;
  isLoadingList: boolean;
  listError: string | null;
  isLoadingDetail: boolean;
  detailError: string | null;
  selectedReportHtml: SafeHtml | null;
  currentUserId: string | null; // Dodane do przechowywania ID użytkownika
};

const initialState: ReportsState = {
  reports: [],
  selectedReportId: null,
  isLoadingList: false,
  listError: null,
  isLoadingDetail: false,
  detailError: null,
  selectedReportHtml: null,
  currentUserId: null, // Inicjalizacja
};

export const ReportSignalStore = signalStore(
  { providedIn: 'root' }, // Lub provided w komponencie/trasie
  withState(initialState),
  withMethods((store, firestore = inject(Firestore), storage = inject(FirebaseStorage), sanitizer = inject(DomSanitizer), authService = inject(AuthService)) => {

    // Efekt do ustawiania currentUserId na podstawie AuthService
    authService.currentUser.subscribe(user => {
      patchState(store, { currentUserId: user ? user.uid : null });
      if (user) {
        loadReportsInternal(user.uid);
      }
    });

    function toDisplayReport(reportDoc: Report & { reportId: string }): DisplayReport {
      return {
        ...reportDoc,
        createdAtFormatted: reportDoc.createdAt instanceof Timestamp ? reportDoc.createdAt.toDate().toLocaleString() : 'N/A',
        updatedAtFormatted: reportDoc.updatedAt instanceof Timestamp ? reportDoc.updatedAt.toDate().toLocaleString() : undefined,
        originalReport: reportDoc,
      };
    }
    
    function loadReportsInternal(userId: string): void {
        if (!userId) return;
        patchState(store, { isLoadingList: true, listError: null });
        const reportsCol = collection(firestore, `users/${userId}/reports`);
        const q = query(reportsCol, orderBy('createdAt', 'desc'));

        // Użycie collectionData z RxFire dla lepszej integracji z Angular i Signals
        (collectionData(q, { idField: 'reportId' }) as Observable<Report[] | undefined>)
          .pipe(
            map(reports => reports?.map(r => toDisplayReport(r as Report & { reportId: string })) || []),
            tap(displayReports => patchState(store, { reports: displayReports, isLoadingList: false })),
            catchError(err => {
              patchState(store, { listError: err.message, isLoadingList: false });
              return of([]);
            })
          ).subscribe(); // Subskrypcja jest zarządzana przez RxFire lub można dodać takeUntilDestroyed
    }

    return {
      loadReports(): void {
        const userId = store.currentUserId();
        if (userId) loadReportsInternal(userId);
      },

      async createReportRequest(title: string): Promise<string | null> {
        const userId = store.currentUserId();
        if (!userId) {
          console.error("User not logged in");
          return null;
        }
        try {
          const reportsCol = collection(firestore, `users/${userId}/reports`);
          const newReportDoc = await addDoc(reportsCol, {
            userId,
            title,
            status: 'to-process' as ReportStatus,
            createdAt: serverTimestamp(),
          });
          return newReportDoc.id;
        } catch (error: any) {
          console.error("Error creating report request:", error);
          return null;
        }
      },

      selectReport(reportId: string | null): void {
        patchState(store, { selectedReportId: reportId, selectedReportHtml: null, detailError: null });
        if (reportId) {
          const selected = store.reports().find(r => r.reportId === reportId);
          if (selected?.status === 'success' && selected.reportHtmlUrl) {
            this.loadReportHtml(selected.reportHtmlUrl);
          } else if (selected?.status !== 'success' && selected?.status !== 'processing' && selected?.status !== 'to-process') {
            patchState(store, { selectedReportHtml: null, detailError: selected?.errorDetails || 'Raport zawiera błędy lub nie jest jeszcze gotowy.' });
          } else {
             patchState(store, { selectedReportHtml: null, detailError: null }); // Pokazuje status z listy
          }
        }
      },

      async loadReportHtml(url: string): Promise<void> {
        patchState(store, { isLoadingDetail: true, detailError: null, selectedReportHtml: null });
        try {
          const response = await fetch(url); // Bezpośrednie pobranie
          if (!response.ok) throw new Error(`Nie udało się pobrać raportu HTML: ${response.statusText}`);
          const htmlString = await response.text();
          patchState(store, { selectedReportHtml: sanitizer.bypassSecurityTrustHtml(htmlString), isLoadingDetail: false });
        } catch (error: any) {
          patchState(store, { detailError: error.message, isLoadingDetail: false });
        }
      },
    };
  }),
  withComputed((store) => ({
    selectedReport: computed(() => {
      const reports = store.reports();
      const id = store.selectedReportId();
      return id ? reports.find(r => r.reportId === id) : null;
    }),
  }))
);
```

## 7. Integracja API (Firebase)

1.  **Tworzenie nowego raportu (żądanie):**
    *   **Frontend:** Po kliknięciu FAB, `ReportSignalStore.createReportRequest()` dodaje nowy dokument do kolekcji `users/{userId}/reports` w Firestore.
    *   **Dokument:** `{ userId, title, status: 'to-process', createdAt: serverTimestamp() }`.
2.  **Pobieranie listy raportów:**
    *   **Frontend:** `ReportSignalStore.loadReports()` (wywoływane automatycznie po zalogowaniu) nasłuchuje zmian w kolekcji `users/{userId}/reports`, aktualizując stan `reports`.
3.  **Generowanie raportu w tle (Firebase Cloud Function):**
    *   **Lokalizacja:** Projekt `apps/my-health-firebase-functions`.
    *   **Nazwa funkcji:** np. `processReportRequest`.
    *   **Trigger:** Firestore `onDocumentWritten` w `users/{userId}/reports/{reportId}`.
    *   **Logika funkcji:**
        1.  Sprawdza, czy dokument został utworzony lub czy `status` zmienił się na `to-process` (aby uniknąć wielokrotnego przetwarzania przy innych update'ach).
        2.  Pobiera dane dokumentu. Jeśli `status` nie jest `to-process` (lub jeśli to nie jest operacja create/update na to-process), kończy działanie.
        3.  Aktualizuje status dokumentu w Firestore na `'processing'`.
        4.  Symuluje pracę (np. `await new Promise(resolve => setTimeout(resolve, 5000));`).
        5.  Generuje przykładowy plik HTML: `<h1>Raport dla ${docData.title}</h1><p>Wygenerowano: ${new Date().toLocaleString()}</p>`.
        6.  Zapisuje HTML do Cloud Storage w ścieżce `users/{userId}/reports/{reportId}/report.html` (content type: `text/html`).
        7.  Pobiera URL do pobrania pliku za pomocą `getDownloadURL()` z Firebase Admin SDK (lub SDK klienta, jeśli funkcja działa w kontekście użytkownika, ale Admin SDK jest preferowane dla funkcji backendowych).
        8.  Aktualizuje dokument raportu w Firestore: `status: 'success'`, `reportHtmlUrl: <URL_pobierania_pliku_HTML>`, `storagePath: <ścieżka_w_storage>`, `updatedAt: serverTimestamp()`.
        9.  W przypadku błędu: aktualizuje `status: 'error'`, `errorDetails: <opis_bledu>`.
4.  **Pobieranie treści HTML raportu:**
    *   **Frontend:** Gdy użytkownik wybiera raport ze statusem `success`, `ReportSignalStore.loadReportHtml()` pobiera HTML z `report.reportHtmlUrl`.
5.  **Zabezpieczenia:**
    *   **Firestore Security Rules:** Zapewniają, że użytkownik może czytać swoje raporty i tworzyć nowe (`allow create`). Aktualizacje statusu (`processing`, `success`, `error`) powinny być dozwolone tylko dla Cloud Function (np. przez sprawdzanie `request.auth.token.firebase.sign_in_provider == 'custom'` jeśli funkcja używa niestandardowego tokenu, lub przez brak reguł `update` dla tych pól z klienta).
        ```firestore
        match /users/{userId}/reports/{reportId} {
          allow read: if request.auth.uid == userId;
          allow create: if request.auth.uid == userId && request.resource.data.userId == userId && request.resource.data.status == 'to-process';
          // Aktualizacje przez funkcje (status, reportHtmlUrl etc.) nie są tu blokowane dla uproszczenia,
          // ale w produkcji można by dodać reguły pozwalające na update tylko konkretnych pól przez funkcję.
        }
        ```
    *   **Cloud Storage Security Rules:**
        ```
        rules_version = '2';
        service firebase.storage {
          match /b/{bucket}/o {
            match /users/{userId}/reports/{reportId}/report.html {
              allow read: if request.auth != null && request.auth.uid == userId;
              // Zapis przez Firebase Function (działa z uprawnieniami admina/konta serwisowego, więc nie potrzebuje tu reguły write dla użytkownika)
            }
          }
        }
        ```

## 8. Interakcje użytkownika

1.  **Wejście na stronę `/reports`:**
    *   `ReportSignalStore` ładuje listę raportów. `ReportListComponent` wyświetla je, każdy z aktualnym statusem.
    *   FAB do tworzenia nowego raportu jest widoczny.
2.  **Kliknięcie FAB "Utwórz nowy raport":**
    *   Wywołanie `ReportSignalStore.createReportRequest()`.
    *   Nowy raport pojawia się na liście ze statusem `'to-process'`, a następnie `'processing'`.
3.  **Kliknięcie raportu na liście:**
    *   Nawigacja do `/reports/{reportId}`.
    *   `ReportSignalStore.selectReport(reportId)` jest wywoływane.
    *   **Desktop:** `MatDrawer` z `ReportDetailViewerComponent` otwiera się po prawej stronie.
    *   **Mobile:** `MatDialog` z `ReportDetailViewerComponent` otwiera się na pełnym ekranie.
    *   Jeśli raport ma `status: 'success'` i `reportHtmlUrl`, `ReportSignalStore` inicjuje pobieranie HTML. `ReportDetailViewerComponent` pokazuje loader, a potem treść.
    *   Jeśli raport ma inny status, `ReportDetailViewerComponent` pokazuje odpowiedni komunikat (np. "Przetwarzanie...", "Błąd generowania").
4.  **Zamknięcie panelu/dialogu detali:**
    *   Nawigacja z powrotem do `/reports` (lub `ReportSignalStore.selectReport(null)`).
    *   Panel/dialog jest zamykany.
5.  **Automatyczna aktualizacja statusu raportu na liście:**
    *   Dzięki nasłuchiwaniu `onSnapshot` w `ReportSignalStore`, zmiany statusu raportu (przetwarzane przez Cloud Function) są automatycznie odzwierciedlane na liście.

## 9. Warunki i walidacja

-   **Dostęp do widoku:** Chroniony przez `AuthGuard`.
-   **Tworzenie raportu:** Użytkownik musi być zalogowany. Tytuł raportu może być generowany automatycznie lub pobierany od użytkownika (do ustalenia).
-   **Wyświetlanie HTML:** Oczyszczanie przez `DomSanitizer` w `ReportDetailViewerComponent`.
-   **Responsywność:** Mechanizm otwierania detali (panel vs dialog) zależy od szerokości ekranu (np. `BreakpointObserver` z Angular CDK).

## 10. Obsługa błędów

-   **Błędy ładowania listy raportów:** `ReportSignalStore.listError` jest ustawiany, `ReportsPageComponent` wyświetla błąd.
-   **Błędy tworzenia żądania raportu:** Obsługiwane w `ReportSignalStore.createReportRequest()`, można wyświetlić `MatSnackBar`.
-   **Błędy przetwarzania raportu przez Cloud Function:** Status raportu zmieniany na `'error'`, `errorDetails` wypełniane. `ReportListItemComponent` wyświetla błąd. Po kliknięciu, `ReportDetailViewerComponent` również może pokazać `errorDetails`.
-   **Błędy pobierania HTML z Cloud Storage:** `ReportSignalStore.detailError` ustawiany, `ReportDetailViewerComponent` wyświetla błąd.
-   **Brak połączenia:** Standardowa obsługa błędów Firebase SDK.

## 11. Kroki implementacji

1.  **Konfiguracja NX Library (`@my-health/features/reports`):**
    *   Potwierdzone istnienie. Skonfigurować routing (`routes.ts`) i podłączyć do `app.routes.ts` z lazy loading i `AuthGuard`.
2.  **Modele (`Report`, `DisplayReport`, `ReportStatus`):**
    *   Utworzyć w `libs/features/reports/src/lib/models/report.models.ts`.
3.  **`ReportSignalStore`:**
    *   Zaimplementować w `libs/features/reports/src/lib/store/report.store.ts` z integracją `AuthService` z `@my-health/features/auth-api`.
4.  **Komponenty (`ReportsPageComponent`, `ReportListComponent`, `ReportListItemComponent`, `ReportDetailViewerComponent`):**
    *   Implementacja z użyciem sygnałów (w tym `@Input` jako `input()`), Angular Material, Tailwind. Logika otwierania panelu/dialogu w `ReportsPageComponent`.
5.  **Firebase Cloud Function (`processReportRequest`):**
    *   Implementacja w `apps/my-health-firebase-functions`.
6.  **Security Rules:**
    *   Aktualizacja/implementacja dla Firestore i Cloud Storage.
7.  **Styling i Responsywność.**
8.  **Testowanie.**
9.  **Integracja `AuthService` i `AuthGuard`:**
    *   Upewnić się, że `AuthGuard` działa poprawnie, a `ReportSignalStore` ma dostęp do `userId`.

Ten zaktualizowany plan uwzględnia wszystkie Twoje uwagi. Jest znacznie bardziej złożony, ale odzwierciedla nowoczesne podejście do Angulara i obsługę operacji w tle. 