# Plan Implementacji: US-011 – Dodawanie wielu wyników badań

Na podstawie analizy user story `US-011` oraz istniejącego kontekstu projektu, poniższy plan opisuje kroki niezbędne do wdrożenia funkcjonalności dodawania wielu wyników badań w ramach jednej sesji.

## 1. Analiza wymagań

User story `US-011` wprowadza nową, kluczową dla aplikacji funkcjonalność. Główne wymagania obejmują:
- Stworzenie dedykowanego widoku z formularzem, dostępnego z poziomu dashboardu poprzez przycisk FAB.
- Implementację mechanizmu wyszukiwania i dodawania badań z istniejącego katalogu.
- Dynamiczne generowanie pól formularza na podstawie parametrów wybranego badania, z obsługą zarówno testów jedno-, jak i wieloparametrowych.
- Umożliwienie użytkownikowi ustawienia wspólnej daty dla całej sesji badań oraz dodania opcjonalnej notatki i linku.
- Zapisanie wszystkich wprowadzonych danych w jednej, atomowej transakcji do bazy danych Firestore.
- Zapewnienie solidnej walidacji danych wejściowych i czytelnej informacji zwrotnej dla użytkownika (np. komunikaty toast).
- Zaprojektowanie interfejsu użytkownika zgodnie z podejściem mobile-first, wykorzystując Angular Material i TailwindCSS.

## 2. Zmiany w modelach domenowych

Konieczne jest wprowadzenie nowego modelu dla "sesji badań" oraz rozszerzenie istniejącego modelu wyniku. Zmiany te zostaną wprowadzone w bibliotece `@my-health/domain`.

- **Zadania:**
    1.  **Stworzenie modelu `TestSession`**: Wprowadzenie nowego interfejsu `TestSession` w pliku `libs/domain/src/lib/test-session.model.ts`, który będzie reprezentował pojedynczą sesję dodawania wyników. Będzie zawierać `id: string`, `userId: string`, `date: Date`, `note?: string`, `link?: string`.
    2.  **Aktualizacja modelu `TestResult`**: Rozszerzenie interfejsu `TestResult` w pliku `libs/domain/src/lib/test-result.model.ts` o pole `sessionId: string`, które połączy wynik z konkretną sesją.
    3.  **Aktualizacja `index.ts`**: Wyeksportowanie nowych i zmodyfikowanych modeli w głównych plikach `index.ts` biblioteki domenowej, aby były dostępne w całej aplikacji.

## 3. Zmiany w bazie danych

Zmiany obejmują zdefiniowanie nowej kolekcji w Firestore oraz aktualizację reguł bezpieczeństwa w celu ochrony danych.

- **Zadania:**
    1.  **Definicja nowej kolekcji `testSessions`**: W Firestore zostanie utworzona nowa kolekcja przechowująca dokumenty sesji badań, których struktura będzie zgodna z modelem `TestSession`.
    2.  **Aktualizacja reguł bezpieczeństwa**: W pliku `firestore.rules` zostaną dodane reguły dla kolekcji `testSessions`, zapewniające, że użytkownicy mogą tworzyć i odczytywać wyłącznie własne dane (`allow read, write: if request.auth.uid == resource.data.userId;`).
    3.  **Struktura `testResults`**: Nowo tworzone dokumenty w kolekcji `testResults` będą zawierać pole `sessionId`. Nie przewiduje się migracji istniejących danych.

## 4. Zmiany w UI

Wprowadzenie nowej, kompleksowej i leniwie ładowanej biblioteki `results` do zarządzania wszystkimi aspektami wyników badań.

- **Zadania:**
    1.  **Stworzenie biblioteki `libs/features/results`**: Wygenerowanie nowej, współdzielonej i budowalnej (buildable) biblioteki za pomocą schematów Nx (`nx g @nx/angular:library --name=results --directory=libs/features --buildable --lazy --routing --parent=apps/my-health/src/app/app.routes.ts`). Biblioteka ta będzie zawierać wszystkie komponenty i logikę związaną z wynikami.
    2.  **Modyfikacja Dashboardu (`libs/features/dashboard`)**: Dodanie przycisku FAB w komponencie `dashboard-view.component.html`, który będzie nawigował do nowej, dedykowanej ścieżki dodawania wyników: `/results/add`.
    3.  **Implementacja struktury routingu w bibliotece `results`**:
        - Główna, leniwie ładowana ścieżka w `app.routes.ts` będzie wskazywać na `/results`.
        - Wewnętrzny routing w `libs/features/results/src/lib/routes.ts` obsłuży pod-widoki:
            - `''` (domyślnie `/results`): Widok listy sesji badań (do zaimplementowania w przyszłości).
            - `'add'` (`/results/add`): Widok dodawania nowej sesji badań (implementowany w ramach tego user story).            
    4.  **Implementacja komponentów dla widoku dodawania wyników (`/results/add`)**:
        - **Strona (`add-result-page.component.ts`)**: Komponent-kontener dla widoku dodawania.
        - **Formularz sesji (`session-details-form.component.ts`)**: Do edycji daty, notatek i linku.
        - **Wyszukiwarka badań (`test-search.component.ts`)**: Do wyszukiwania i dodawania badań do sesji.
        - **Formularz wyniku (`test-result-form.component.ts`)**: Do dynamicznego renderowania pól dla parametrów badania.

## 5. Zmiany w logice biznesowej

Centralizacja logiki biznesowej w nowej, współdzielonej bibliotece `results`.

- **Zadania:**
    1.  **Stworzenie `ResultsDataService`**: Serwis, umieszczony w `libs/features/results/src/lib/services/`, będzie zarządzał wszystkimi operacjami CRUD na sesjach i wynikach badań. Na potrzeby tego user story, będzie zawierał metodę `addTestSession(session, results)`. W przyszłości zostanie rozbudowany o metody `getResults`, `updateResult`, `deleteResult`.
    2.  **Zarządzanie stanem za pomocą `ResultsStore`**: Stworzenie komponentowego, sygnałowego store'a (`results.store.ts`) w `libs/features/results/src/lib/state/`, który będzie zarządzał stanem dla całej funkcjonalności – listą sesji, formularzem dodawania, edytowanym wynikiem itp.

## 6. Refaktoryzacja i reużycie kodu

Zgodnie z przyjętymi w projekcie wzorcami (`auth`/`auth-api`), zamiast przenosić kod do ogólnej biblioteki `shared`, stworzymy dedykowaną bibliotekę `catalog-api`, która będzie eksportować publiczne elementy `catalog`. Dodatkowo, rozbudujemy istniejące komponenty o nowe, parametryzowane funkcjonalności.

- **Zadania:**
    1.  **Stworzenie biblioteki `catalog-api`**: Za pomocą schematów Nx zostanie utworzona nowa, budowalna (buildable) biblioteka `libs/features/catalog-api` (`nx g @nx/angular:library --name=catalog-api --directory=libs/features --buildable`).
    2.  **Eksport `CatalogDataService`**: Serwis zostanie wyeksportowany z `catalog-api`, a biblioteka `results` będzie zależeć od `catalog-api`, a nie od `catalog`.
    3.  **Rozbudowa komponentu `test-list`**:
        - W komponencie `libs/features/catalog/src/lib/test-list/test-list.component.ts` zostanie dodane nowe wejście oparte na sygnale: `multiSelect = input(false);`.
        - Do szablonu `test-list-item` zostanie dodany `mat-checkbox`, widoczny tylko, gdy `multiSelect()` jest `true` (zwróć uwagę na odczyt wartości z sygnału).
        - Komponent `test-list` otrzyma nowe wyjście `@Output() selectionChange`, które będzie emitować listę zaznaczonych badań.
    4.  **Eksport reużywalnych komponentów**: Komponenty `search-filter-bar` i `test-list` zostaną wyeksportowane z `catalog-api`.
    5.  **Użycie rozbudowanych komponentów w `results`**: Widok dodawania wyników użyje gotowych komponentów `search-filter-bar` oraz `test-list` (z włączoną opcją `multiSelect`), zamiast tworzyć własne implementacje.

## 7. Infrastruktura

- Brak zmian w infrastrukturze. Istniejące środowiska Firebase (dev, staging, prod) są wystarczające.

## 8. Testy

- **Zadania:**
    1.  **Testy jednostkowe (Vitest)**: Pokrycie logiki `ResultsDataService`, `ResultsStore` oraz walidacji formularzy w poszczególnych komponentach.
    2.  **Testy E2E (Playwright)**: Scenariusz `add-multiple-results.spec.ts` zweryfikuje przepływ dodawania wyników, uwzględniając nawigację do nowej ścieżki `/results/add`.

## 9. Potencjalne ryzyka i ich mitygacja

- **Ryzyko**: Złożoność dynamicznego formularza dla badań wieloparametrowych.
  - **Mitygacja**: Staranne zaprojektowanie komponentu `test-result-form.component`, dokładne testy jednostkowe dla różnych typów parametrów i struktur badań.
- **Ryzyko**: Problemy z wydajnością przy dodawaniu wielu badań do sesji.
  - **Mitygacja**: Optymalizacja renderowania komponentów, użycie strategii `OnPush` i zapewnienie, że stan jest zarządzany efektywnie przy pomocy sygnałów.
- **Ryzyko**: Błędy transakcji w Firestore przy zapisie dużej liczby wyników.
  - **Mitygacja**: Implementacja solidnego mechanizmu obsługi błędów z możliwością ponowienia próby przez użytkownika oraz informowanie go o statusie operacji.

## 10. Wdrożenie
- Brak specjalnych wymagań. Zmiany zostaną wdrożone w ramach standardowego procesu CI/CD skonfigurowanego w GitHub Actions.

## 11. Aktualizacja dokumentacji

- **Zadania:**
    1.  **Aktualizacja `docs/ui-plan.md`**: Zaktualizowanie planu UI o nową, kompleksową sekcję "Zarządzanie wynikami" ze ścieżką bazową `/results`, opisującą widoki dodawania, listowania i edycji.
    2.  **Stworzenie nowego pliku `docs/domain/test-results.md`**: Utworzenie dedykowanego pliku dokumentacji opisującego nowe modele `TestSession` i `TestResult` oraz ich wzajemne relacje (podobnie jak to jest zrobione w `docs/domain/test.md`). 