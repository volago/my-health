# Status implementacji widoku Katalog Badań

## Zrealizowane kroki

1.  **Struktura plików i komponentów (Krok 1 z planu):**
    *   Utworzono `CatalogPageComponent` jako komponent routowalny.
    *   Utworzono `SearchFilterBarComponent` i `TestListComponent`.
    *   Dostosowano strukturę folderów komponentów zgodnie z uwagami użytkownika (prezentacyjne komponenty w osobnych folderach w `lib/`).
    *   Zdefiniowano routing dla `/catalog` w `apps/my-health/src/app/app.routes.ts` ładujący leniwie `CATALOG_ROUTES` z biblioteki `features/catalog`.

2.  **Serwis danych (`CatalogDataService`) (Krok 2 z planu):**
    *   Utworzono `CatalogDataService` w `libs/features/catalog/src/lib/services/` do pobierania danych z Firestore.
    *   Zaimplementowano metodę `getTestsCatalog()` używającą AngularFire, z uwzględnieniem poprawnej nazwy kolekcji (`'tests-catalog'`) i użycia `query()` do rozwiązania problemu z typem referencji.
    *   Problem z pobieraniem danych został rozwiązany poprzez downgrade wersji `@angular/fire` do `18.0.1`.

3.  **Zarządzanie stanem (`CatalogStore`) (Krok 3 z planu + modyfikacja):**
    *   Zaimplementowano `CatalogStore` (`libs/features/catalog/src/lib/state/catalog.store.ts`) używając `@ngrx/signals` (`signalStore`).
    *   Store zarządza stanem: `allTests`, `searchTerm`, `selectedTags`, `isLoading`, `error`, `isOffline`, `availableTags`.
    *   Zdefiniowano selektory (computed signals) dla `filteredTests`.
    *   Zaimplementowano metody (`loadAllTests`, `setSearchTerm`, `setSelectedTags`) do aktualizacji stanu.
    *   Logika filtrowania tagów w `filteredTests` została zmieniona z AND na OR (badanie musi mieć przynajmniej jeden z wybranych tagów).

4.  **Implementacja `CatalogPageComponent` (Krok 3 z planu):**
    *   Komponent wstrzykuje `CatalogStore` i używa go do zarządzania stanem oraz wyświetlania danych.
    *   Szablon (`catalog-page.component.html`) został wydzielony do osobnego pliku.
    *   Obsługuje wyświetlanie stanów ładowania, błędów i pustej listy.
    *   Pasek wyszukiwania (`SearchFilterBarComponent`) został wyśrodkowany.

5.  **Implementacja `SearchFilterBarComponent` (Krok 4 z planu + modyfikacje):**
    *   Komponent wstrzykuje `CatalogStore` i komunikuje się za jego pośrednictwem (usunięto `@Input` i `@Output` na rzecz store).
    *   Używa `FormControl` do obsługi pola wyszukiwania.
    *   Emituje zmiany wyszukiwania i wybranych tagów do `CatalogStore`.
    *   Szablon (`search-filter-bar.component.html`) i style (`search-filter-bar.component.css`) zostały wydzielone.
    *   Dodano usprawnienie responsywności dla listy chipów (scroll na małych ekranach).

6.  **Implementacja `TestListComponent` (Krok 5 z planu + modyfikacje):**
    *   Komponent wstrzykuje `CatalogStore` i używa go do pobierania listy testów i stanu ładowania.
    *   Usunięto redundantne stany ładowania/pustej listy (obsługiwane przez rodzica).
    *   Szablon (`test-list.component.html`) i style (`test-list.component.css`) zostały wydzielone.
    *   Zaktualizowano szablon, aby używał nowego `TestListItemComponent` w responsywnej siatce.
    *   Zastosowanie `mat-card` dla każdego elementu badania.
    *   Dodanie wstępnego układu dla tytułu, opisu, zakresu referencyjnego i ikony ">".
    *   Stworzono podstawową implementację `TestListItemComponent` (`.ts`, `.html`, `.scss`) przyjmującego `TestCatalog` jako input.
    *   Ograniczono opis badania do 2 linii z wielokropkiem.
    *   Przycisk nawigacyjny (ikona ">") przeniesiono do nagłówka karty, wyrównany do prawej.
    *   Dodano odpowiednie style CSS/SCSS i zaktualizowano importy modułów Angular Material.
    *   Zrefaktoryzowano style `TestListItemComponent`, przenosząc je z pliku SCSS do klas Tailwind bezpośrednio w szablonie HTML.

7.  **Wprowadzenie motywu Angular Material:**
    *   Początkowo próbowano zaimplementować niestandardowy motyw Azure.
    *   Z powodu błędów kompilacji powrócono do predefiniowanego motywu `indigo-pink.css` w `apps/my-health/src/styles.scss`.
    *   Upewniono się, że `index.html` zawiera `mat-typography` oraz linki do fontu Roboto i Material Icons.



## Kolejne kroki

0.  **Styling (część Kroku 6 z planu):**
    *   Wprowadzono wstępne sugestie dotyczące stylowania i responsywności dla `SearchFilterBarComponent`.
    *   Uproszczono szablon `TestListComponent`.
    *   Zmieniono styl przycisku "Retry" na `mat-raised-button` z kolorem `primary`.
    *   Rozpoczęto refaktoryzację wyglądu listy testów poprzez:
        *   Wydzielenie `TestListItemComponent`.
        *   Zastosowanie `mat-card` dla każdego elementu badania.
        *   Dodanie wstępnego układu dla tytułu, opisu, zakresu referencyjnego i ikony ">".
        *   Stworzono podstawową implementację `TestListItemComponent` (`.ts`, `.html`, `.scss`) przyjmującego `TestCatalog` jako input.
        *   Ograniczono opis badania do 2 linii z wielokropkiem.
        *   Przycisk nawigacyjny (ikona ">") przeniesiono do nagłówka karty, wyrównany do prawej.
        *   Dodano odpowiednie style CSS/SCSS i zaktualizowano importy modułów Angular Material.
        *   Zrefaktoryzowano style `TestListItemComponent`, przenosząc je z pliku SCSS do klas Tailwind bezpośrednio w szablonie HTML.
    *   Weryfikacja i dopracowanie responsywności całego widoku katalogu na różnych urządzeniach.
    *   Ujednolicenie kolorystyki i typografii zgodnie z wybranym motywem Material i ewentualnymi dodatkowymi wymaganiami.

1.  **Dostępność (WCAG) (Krok 7 z planu):**
    *   Sprawdzenie nawigacji klawiaturą.
    *   Weryfikacja użycia atrybutów ARIA.
    *   Sprawdzenie kontrastów kolorów.

2.  **Refaktoryzacja i Optymalizacja (Krok 10 z planu):**
    *   Przejrzenie kodu pod kątem czytelności i wydajności.
    *   Implementacja pełnej logiki dla trybu offline (`isOffline` w `CatalogStore`).
    *   Dopracowanie wyświetlania zakresów referencyjnych w `TestListItemComponent`.
    *   Dodanie ewentualnej nawigacji lub akcji po kliknięciu na element badania (ikona ">").
