# Plan implementacji widoku Katalog Badań

## 1. Przegląd
Widok "Katalog Badań" ma na celu umożliwienie użytkownikom przeglądania, wyszukiwania i filtrowania statycznego katalogu dostępnych badań laboratoryjnych. Użytkownicy będą mogli łatwo znaleźć interesujące ich badania po nazwie lub przypisanych tagach. Widok ten będzie również wspierał działanie w trybie offline.

## 2. Routing widoku
Widok będzie dostępny pod następującą ścieżką:
- `/catalog`

## 3. Struktura komponentów
Hierarchia komponentów dla widoku Katalogu Badań będzie następująca:

```
CatalogPageComponent (Komponent strony, kontenerowy)
│
├── SearchFilterBarComponent (Komponent prezentacyjny dla wyszukiwania i filtrów)
│
└── TestListComponent (Komponent prezentacyjny dla listy badań)
```

## 4. Szczegóły komponentów

### `CatalogPageComponent`
- **Opis komponentu:** Główny komponent zarządzający logiką widoku katalogu badań. Odpowiada za pobieranie danych, zarządzanie stanem (wyszukiwanie, filtrowanie, ładowanie, błędy) oraz koordynację komponentów podrzędnych.
- **Główne elementy HTML i komponenty dzieci:**
    - `<app-search-filter-bar>`: Komponent do wprowadzania kryteriów wyszukiwania i wyboru tagów.
    - `<app-test-list>`: Komponent do wyświetlania listy badań.
    - Elementy do wyświetlania stanu ładowania (np. `mat-spinner`) i komunikatów o błędach lub braku wyników.
- **Obsługiwane interakcje (zdarzenia od dzieci):**
    - `(searchChange)="handleSearchTermChange($event)"`: Aktualizuje termin wyszukiwania.
    - `(tagsChange)="handleSelectedTagsChange($event)"`: Aktualizuje wybrane tagi filtrów.
- **Obsługiwana walidacja:** Nie dotyczy bezpośrednio, ale zarządza stanami ładowania i błędów.
- **Typy:**
    - `Signal<TestCatalog[]>` (dla wszystkich badań)
    - `Signal<TestCatalog[]>` (dla przefiltrowanych badań)
    - `Signal<string>` (dla terminu wyszukiwania)
    - `Signal<TestTag[]>` (dla wybranych tagów)
    - `Signal<TestTag[]>` (dla dostępnych tagów)
    - `Signal<boolean>` (dla stanu ładowania)
    - `Signal<string | null>` (dla komunikatów błędów)
    - `Signal<boolean>` (dla informacji o trybie offline)
- **Propsy (wejścia):** Brak, jest to komponent routowalny.

### `SearchFilterBarComponent`
- **Opis komponentu:** Komponent UI służący do interakcji użytkownika w celu wyszukiwania badań po nazwie oraz filtrowania ich na podstawie tagów.
- **Główne elementy HTML i komponenty dzieci:**
    - Pole tekstowe `matInput` w `mat-form-field` do wyszukiwania tekstowego.
    - Lista `mat-chip-list` z `mat-chip-option` dla wyboru tagów.
- **Obsługiwane interakcje (zdarzenia emitowane do rodzica):**
    - `@Output() searchChange = new EventEmitter<string>()`: Emituje zmianę terminu wyszukiwania.
    - `@Output() tagsChange = new EventEmitter<TestTag[]>()`: Emituje zmianę wybranych tagów.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `TestTag`.
- **Propsy (wejścia):**
    - `@Input() availableTags: TestTag[] = []`: Lista dostępnych tagów do wyświetlenia jako opcje filtrów.
    - `@Input() initialSearchTerm: string = ''`: Początkowa wartość dla pola wyszukiwania.
    - `@Input() initialSelectedTags: TestTag[] = []`: Początkowo wybrane tagi.

### `TestListComponent`
- **Opis komponentu:** Komponent prezentacyjny odpowiedzialny za wyświetlanie listy (lub tabeli) badań laboratoryjnych.
- **Główne elementy HTML i komponenty dzieci:**
    - `mat-list` z `mat-list-item` lub `mat-table` z `mat-row` do wyświetlania każdego badania.
    - W ramach każdego elementu listy/wiersza: nazwa badania, tagi (np. jako `mat-chip`).
    - Komunikat o braku wyników, jeśli lista badań jest pusta po przefiltrowaniu.
- **Obsługiwane interakcje (zdarzenia emitowane do rodzica):** Brak w podstawowej wersji (ewentualnie `testSelected` w przyszłości).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `TestCatalog`.
- **Propsy (wejścia):**
    - `@Input() tests: TestCatalog[] = []`: Lista badań do wyświetlenia.
    - `@Input() isLoading: boolean = false`: Informacja, czy dane są w trakcie ładowania (do wyświetlenia np. skeleton loaderów).

## 5. Typy
Kluczowe typy danych dla widoku katalogu badań pochodzą z biblioteki `libs/domain/src/lib/`:

-   **`TestCatalog`** (plik `test-catalog.model.ts`):
    ```typescript
    export interface TestCatalog {
      testId: string;         // Unikalny ID badania
      icdCode: string;        // Kod ICD badania
      name: string;           // Nazwa badania
      description: string;    // Opis badania
      tags: TestTag[];        // Tagi powiązane z badaniem
      parametersTemplate: ParameterTemplate[]; // Szablony parametrów dla badania
    }
    ```

-   **`TestTag`** (plik `test-catalog.model.ts`):
    ```typescript
    export const TEST_TAGS = [
      'hematologia', 'biochemia', 'hormonalne', /* ... inne tagi */
    ] as const;
    export type TestTag = typeof TEST_TAGS[number]; // Typ reprezentujący pojedynczy tag
    ```

-   **`ParameterTemplate`** (plik `parameter-template.model.ts`):
    ```typescript
    export interface ParameterTemplate {
      id: string;
      paramName: string;
      description: string;
      icdCode: string;
      unit: string;
      valueType: ValueType; // Enum, np. 'numeric', 'text'
      validation?: {
        min?: number;
        max?: number;
        allowedValues?: any[];
      };
    }
    ```
    (Uwaga: `ValueType` również zdefiniowany w `libs/domain`)

Nie przewiduje się na ten moment tworzenia dodatkowych, specyficznych dla tego widoku modeli ViewModel, ponieważ istniejące typy DTO są wystarczające.

## 6. Zarządzanie stanem
Stan widoku Katalogu Badań będzie zarządzany głównie w komponencie `CatalogPageComponent` przy użyciu sygnałów Angulara (`Signal`, `computed`).

-   **`allTests = signal<TestCatalog[]>([])`**: Przechowuje pełną listę badań pobraną z Firestore. Inicjalizowana jako pusta tablica.
-   **`searchTerm = signal<string>('')`**: Przechowuje aktualny ciąg znaków wprowadzony przez użytkownika w polu wyszukiwania.
-   **`selectedTags = signal<TestTag[]>([])`**: Przechowuje listę tagów wybranych przez użytkownika do filtrowania.
-   **`availableTags = signal<TestTag[]>(TEST_TAGS)`**: Lista wszystkich możliwych tagów, które użytkownik może wybrać. Może być to stała `TEST_TAGS` lub dynamicznie generowana lista unikalnych tagów z `allTests`.
-   **`filteredTests = computed<TestCatalog[]>(() => ...)`**: Sygnał obliczeniowy, który na podstawie `allTests()`, `searchTerm()` i `selectedTags()` zwraca przefiltrowaną listę badań do wyświetlenia.
    - Logika filtrowania:
        1. Zacznij od `allTests()`.
        2. Jeśli `searchTerm()` nie jest pusty, odfiltruj badania, których `name` (ignorując wielkość liter) zawiera `searchTerm()`.
        3. Jeśli `selectedTags()` nie jest puste, odfiltruj dalej badania, które zawierają *wszystkie* tagi z `selectedTags()`.
-   **`isLoading = signal<boolean>(false)`**: Wskazuje, czy dane są aktualnie ładowane z serwera.
-   **`error = signal<string | null>(null)`**: Przechowuje komunikat błędu, jeśli wystąpi problem z pobraniem danych.
-   **`isOffline = signal<boolean>(false)`**: Informuje, czy aplikacja działa w trybie offline i dane zostały załadowane z pamięci podręcznej.

Do pobierania danych z Firestore i potencjalnej obsługi logiki offline (cache) zostanie wykorzystany serwis (np. `CatalogDataService`), który będzie wstrzykiwany do `CatalogPageComponent`. Serwis ten będzie używał AngularFire.

## 7. Integracja API
Dane dla katalogu badań będą pobierane bezpośrednio z kolekcji `testsCatalog` w Firestore.

-   **Endpoint:** Kolekcja `testsCatalog` w Firestore.
-   **Metoda:** Odczyt wszystkich dokumentów z kolekcji.
-   **Biblioteka:** AngularFire.
    ```typescript
    // W CatalogDataService lub bezpośrednio w CatalogPageComponent
    import { collection, Firestore, collectionData } from '@angular/fire/firestore';
    import { Observable } from 'rxjs';
    // ...
    constructor(private firestore: Firestore) {}

    getTestsCatalog(): Observable<TestCatalog[]> {
      const testsCollection = collection(this.firestore, 'testsCatalog');
      return collectionData(testsCollection, { idField: 'testId' }) as Observable<TestCatalog[]>;
      // Użycie { idField: 'testId' } jeśli 'testId' jest ID dokumentu w Firestore,
      // w przeciwnym razie upewnij się, że 'testId' jest polem w dokumencie.
      // Zgodnie z TestCatalog, testId jest polem.
    }
    ```
-   **Typy żądania:** Nie dotyczy (pobieranie całej kolekcji).
-   **Typy odpowiedzi:** `Observable<TestCatalog[]>` konwertowane na `Signal<TestCatalog[]>` w komponencie.

Logika pobierania danych w `CatalogPageComponent` (lub przez serwis):
1. Przy inicjalizacji komponentu, ustaw `isLoading` na `true`.
2. Subskrybuj do `getTestsCatalog()`.
3. Po otrzymaniu danych: zaktualizuj `allTests`, ustaw `isLoading` na `false`, `error` na `null`.
4. W przypadku błędu: ustaw `error` z komunikatem, `isLoading` na `false`.
5. Implementacja Service Workera (przez `@angular/pwa`) zajmie się cache'owaniem danych dla dostępu offline. Logika w serwisie/komponencie powinna wykrywać tryb offline i informować o tym użytkownika, a także próbować serwować dane z cache.

## 8. Interakcje użytkownika
-   **Wpisywanie tekstu w polu wyszukiwania (`SearchFilterBarComponent`):**
    - Emituje zdarzenie `searchChange` z aktualnym tekstem.
    - `CatalogPageComponent` aktualizuje sygnał `searchTerm`.
    - Sygnał `filteredTests` jest automatycznie przeliczany, aktualizując listę w `TestListComponent`.
-   **Wybór/odznaczenie tagu (`SearchFilterBarComponent`):**
    - Emituje zdarzenie `tagsChange` z listą aktualnie wybranych tagów.
    - `CatalogPageComponent` aktualizuje sygnał `selectedTags`.
    - Sygnał `filteredTests` jest automatycznie przeliczany.
-   **Wyświetlanie listy badań (`TestListComponent`):**
    - Komponent otrzymuje `filteredTests` jako `@Input()` i renderuje listę.
    - Wyświetla stan ładowania na podstawie `@Input() isLoading`.
    - Wyświetla komunikat, jeśli `filteredTests` jest puste.

## 9. Warunki i walidacja
-   **Pole wyszukiwania:** Brak specyficznej walidacji formatu, akceptuje dowolny ciąg znaków. Wyszukiwanie jest typu "contains" i case-insensitive.
-   **Filtry tagów:** Użytkownik może wybrać zero, jeden lub wiele tagów. Logika filtrowania zastosuje warunek AND dla wybranych tagów (badanie musi posiadać wszystkie wybrane tagi).
-   **Stan interfejsu:**
    -   Podczas ładowania danych (`isLoading === true`): `TestListComponent` może pokazywać wskaźnik ładowania (np. skeleton-loader lub `mat-spinner`). `SearchFilterBarComponent` może być nieaktywny lub również wskazywać stan ładowania.
    -   Po załadowaniu danych: `SearchFilterBarComponent` jest aktywny, `TestListComponent` wyświetla `filteredTests`.
    -   Jeśli `filteredTests` jest pusty (po filtracji lub gdy `allTests` jest puste): `TestListComponent` wyświetla komunikat "Brak badań spełniających kryteria." lub "Katalog badań jest pusty.".
    -   W przypadku błędu (`error !== null`): Wyświetlany jest komunikat błędu (np. w `CatalogPageComponent`). Lista badań może być pusta.
    -   W trybie offline (`isOffline === true`): Wyświetlana jest informacja o trybie offline (np. snackbar lub baner).

## 10. Obsługa błędów
-   **Błąd pobierania danych z Firestore:**
    - Wykrywany w subskrypcji do `getTestsCatalog()`.
    - Sygnał `error` w `CatalogPageComponent` jest ustawiany na odpowiedni komunikat (np. "Nie udało się załadować katalogu badań. Sprawdź połączenie internetowe i spróbuj ponownie.").
    - Sygnał `isLoading` jest ustawiany na `false`.
    - Użytkownik widzi komunikat błędu. Jeśli dane są dostępne w cache (tryb offline), mogą zostać wyświetlone.
-   **Pusta lista badań:**
    - Jeśli `allTests` jest puste po pobraniu (lub z cache), `filteredTests` również będzie puste (chyba że filtry są aktywne).
    - `TestListComponent` wyświetli stosowny komunikat, np. "Katalog badań jest obecnie pusty." (jeśli nie ma filtrów) lub "Brak badań spełniających wybrane kryteria." (jeśli filtry są aktywne).
-   **Problem z trybem offline (Service Worker):**
    - Jeśli Service Worker nie działa poprawnie, tryb offline może nie być dostępny. Aplikacja powinna nadal próbować ładować dane online.
    - W przypadku braku połączenia i braku danych w cache, użytkownik zobaczy błąd pobierania danych.

## 11. Kroki implementacji
1.  **Utworzenie struktury plików i komponentów:**
    -   Wygeneruj `CatalogPageComponent` (lazy-loaded route), `SearchFilterBarComponent`, `TestListComponent` za pomocą Angular CLI.
    -   Upewnij się, że są to komponenty standalone.
    -   Zdefiniuj routing dla `/catalog` wskazujący na `CatalogPageComponent`.
2.  **Implementacja `CatalogDataService` (opcjonalnie, ale zalecane):**
    -   Stwórz serwis do hermetyzacji logiki pobierania danych z Firestore (`getTestsCatalog()`).
    -   Dodaj obsługę AngularFire.
3.  **Implementacja `CatalogPageComponent`:**
    -   Wstrzyknij `CatalogDataService` (lub Firestore, jeśli bez serwisu).
    -   Zdefiniuj sygnały: `allTests`, `searchTerm`, `selectedTags`, `availableTags`, `isLoading`, `error`, `isOffline`.
    -   Zaimplementuj logikę pobierania danych przy inicjalizacji (`effect` lub `constructor` + `toSignal`).
    -   Zdefiniuj sygnał `computed` `filteredTests` z logiką filtrowania.
    -   Zaimplementuj metody obsługi zdarzeń z `SearchFilterBarComponent` (`handleSearchTermChange`, `handleSelectedTagsChange`).
    -   Dodaj podstawowy szablon HTML z miejscami na komponenty podrzędne i obsługę stanów (ładowanie, błąd).
4.  **Implementacja `SearchFilterBarComponent`:**
    -   Dodaj `@Input()` dla `availableTags`, `initialSearchTerm`, `initialSelectedTags`.
    -   Dodaj `@Output()` `searchChange` i `tagsChange`.
    -   Zaimplementuj szablon HTML z `matInput` dla wyszukiwania i `mat-chip-list` dla tagów.
    -   Połącz interakcje użytkownika z emitowaniem odpowiednich zdarzeń.
5.  **Implementacja `TestListComponent`:**
    -   Dodaj `@Input()` dla `tests` i `isLoading`.
    -   Zaimplementuj szablon HTML używając `mat-list` lub `mat-table` do wyświetlania badań.
    -   Dodaj obsługę wyświetlania stanu ładowania (np. pętle z `mat-skeleton-loader` lub ogólny `mat-spinner`).
    -   Dodaj komunikat dla pustej listy.
6.  **Styling:**
    -   Użyj Angular Material dla podstawowych komponentów.
    -   Użyj Tailwind CSS dla specyficznych potrzeb layoutu i stylizacji, zgodnie z projektem.
7.  **Dostępność (WCAG):**
    -   Upewnij się, że wszystkie interaktywne elementy są dostępne z klawiatury.
    -   Dodaj odpowiednie atrybuty ARIA.
    -   Sprawdź kontrasty kolorów.
10. **Refaktoryzacja i optymalizacja:**
    -   Przejrzyj kod pod kątem czytelności i wydajności.
    -   Upewnij się, że wszystkie sygnały są używane efektywnie.
    -   Zoptymalizuj renderowanie listy, jeśli jest bardzo długa (np. rozważ `trackBy` w pętlach `@for`). 