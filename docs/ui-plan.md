# Architektura UI dla 10xHealth

## 1. Przegląd struktury UI

Aplikacja MyHealth to kompleksowy system umożliwiający użytkownikom zarządzanie danymi zdrowotnymi, który obejmuje przechowywanie wyników badań laboratoryjnych, analizę trendów, generowanie raportów AI oraz monitorowanie harmonogramu badań. Interfejs użytkownika został zaprojektowany w oparciu o Angular Material i Tailwind (mobile-first) oraz organizowany w ramach oddzielnych bibliotek NX z lazy-loadingiem poszczególnych widoków. Wszystkie widoki poza ekranami logowania i rejestracji są zabezpieczone za pomocą Firebase Auth Guard.

## 2. Lista widoków

1. **Ekran logowania**
   - **Ścieżka widoku:** `/login`
   - **Główny cel:** Umożliwienie użytkownikowi logowania przy użyciu identyfikatora i hasła.
   - **Kluczowe informacje:** Formularz logowania, komunikaty o błędach autoryzacji.
   - **Kluczowe komponenty:** Formularze Angular Material, przyciski, toast notifications dla błędów.
   - **UX, dostępność i bezpieczeństwo:** Responsywny design, wsparcie dla nawigacji klawiaturowej, inline komunikaty o błędach, brak dostępu bez poprawnej autoryzacji.

2. **Ekran rejestracji**
   - **Ścieżka widoku:** `/register`
   - **Główny cel:** Umożliwienie anonimowej rejestracji z generowaniem unikalnego identyfikatora i hasła oraz wprowadzenie dodatkowych danych (rok urodzenia, płeć, poziom szczegółowości badań).
   - **Kluczowe informacje:** Formularz rejestracyjny, walidacja danych, komunikaty o konieczności zapamiętania danych.
   - **Kluczowe komponenty:** Angular Material forms, validatory, mechanizmy inline error handling.
   - **UX, dostępność i bezpieczeństwo:** Prosty i intuicyjny proces, walidacja w czasie rzeczywistym, zgodność z WCAG, brak możliwości odzyskania hasła – informowanie użytkownika o konieczności zapamiętania danych.

3. **Dashboard**
   - **Ścieżka widoku:** `/dashboard`
   - **Główny cel:** Prezentacja przeglądu stanu zdrowia użytkownika poprzez Health Score (HS), Compliance Score (CS), listę ostatnich wyników oraz skrócony widok nadchodzących badań.
   - **Kluczowe informacje:** Wskaźniki HS i CS z kolorowym oznaczeniem (zielony, żółty, czerwony), lista ostatnich wyników, podsumowanie harmonogramu badań.
   - **Kluczowe komponenty:** Karty informacyjne, wskaźniki procentowe, wykresy, toast notifications, komponenty alertów.
   - **UX, dostępność i bezpieczeństwo:** Jasny, przejrzysty układ, responsywność, ochrona danych przez Firebase Auth, łatwa nawigacja pomiędzy sekcjami.

4. **Katalog badań**
   - **Ścieżka widoku:** `/catalog`
   - **Główny cel:** Umożliwienie przeglądania, wyszukiwania i filtrowania statycznego katalogu badań laboratoryjnych.
   - **Kluczowe informacje:** Lista badań z nazwami oraz tagami, pasek wyszukiwania, możliwości filtrowania.
   - **Kluczowe komponenty:** Lista lub tabela danych, pola wyszukiwania, filtry (chips), Angular Material list/table.
   - **UX, dostępność i bezpieczeństwo:** Intuicyjny interfejs, wsparcie dla użytkowników mobilnych, obsługa błędów przy ładowaniu danych, zabezpieczenia przez Firebase Auth.

4. **Opis pojedynczego badania**
   - **Ścieżka widoku:** `/catalog/testCatalogId`
   - **Główny cel:** Umożliwienie zapoznania się z informacjami o badaniu, w tym opisem, parametrami, wymaganymi próbkach itp.
   - **Kluczowe informacje:** Opis badania, parametry, klasyfikacja ICD.
   - **Kluczowe komponenty:** Nagłówek z nazwą badania, chipsy z tagami, opisem, parametrami.
   - **UX, dostępność i bezpieczeństwo:** Intuicyjny interfejs, wsparcie dla użytkowników mobilnych, obsługa błędów przy ładowaniu danych, zabezpieczenia przez Firebase Auth.

5. **Formularz dodawania wyników**
   - **Ścieżka widoku:** `/results/add`
   - **Główny cel:** Pozwolenie użytkownikowi na dodanie nowego wyniku badania z automatycznym porównaniem do poprzednich wyników.
   - **Kluczowe informacje:** Pola formularza dla parametrów badania, wskaźniki porównania, komunikaty walidacyjne.
   - **Kluczowe komponenty:** Formularze Angular Material, walidatory, kalendarz wyboru daty, komponenty do wyświetlania trendów.
   - **UX, dostępność i bezpieczeństwo:** Przejrzysty formularz z natychmiastową walidacją, inline komunikaty o błędach, zabezpieczenie operacji Firebase Auth.

6. **Kalendarz badań**
   - **Ścieżka widoku:** `/schedule`
   - **Główny cel:** Wyświetlenie harmonogramu nadchodzących badań oraz możliwość generowania rekomendowanego harmonogramu za pomocą API.
   - **Kluczowe informacje:** Terminy badań, status zaplanowanych testów, interakcja z API (`/api/schedule/generate`).
   - **Kluczowe komponenty:** Widok kalendarza, datpicker, listy, przyciski akcji.
   - **UX, dostępność i bezpieczeństwo:** Responsywny design, intuicyjna obsługa, komunikaty o błędach, zabezpieczenia Firebase Auth.

7. **Widok raportu AI**
   - **Ścieżka widoku:** `/reports`
   - **Główny cel:** Umożliwienie generowania oraz przeglądu raportu zdrowotnego generowanego przez AI.
   - **Kluczowe informacje:** Lista wygenerowanych raportów, zakolejkowanie raportu do wygenerowania, Status przetwarzania raportu, podgląd raportu w formacie HTML, komunikaty o błędach generacji.
   - **Kluczowe komponenty:** Komponenty statusu, loader, obszar wyświetlania HTML, toast notifications.
   - **UX, dostępność i bezpieczeństwo:** Wyraźny feedback statusu operacji, obsługa błędów, responsywność, ochrona przez Firebase Auth.

8. **Szczegóły testu**
   - **Ścieżka widoku:** `/tests/:id`
   - **Główny cel:** Zapewnienie szczegółowej analizy wybranego badania, w tym prezentacja trendów, historii wyników i parametrów testu.
   - **Kluczowe informacje:** Szczegółowe dane testu, wykresy trendu, historia zmian.
   - **Kluczowe komponenty:** Karty informacyjne, wykresy, listy danych, elementy interaktywne.
   - **UX, dostępność i bezpieczeństwo:** Przystępny i czytelny układ, możliwość filtrowania danych, inline komunikaty o błędach, stosowanie guardów uwierzytelniających.

## 3. Mapa podróży użytkownika

- Użytkownik wchodzi na stronę logowania lub rejestracji, gdzie dokonuje autoryzacji.
- Po poprawnym logowaniu, użytkownik trafia do dashboardu, gdzie widzi kluczowe wskaźniki zdrowotne (HS, CS), ostatnie wyniki badań oraz skrót kalendarza.
- Z dashboardu użytkownik może przejść do katalogu badań, aby wyszukać i przejrzeć dostępne testy laboratoryjne.
- Wybierając konkretny test z katalogu użytkownik trafia do widoku opisu tego badania..
- Wybierając konkretny test z dashboardu, użytkownik przechodzi do ekranu szczegółów testu, gdzie widzi analizę trendów oraz historyczne dane.
- Użytkownik korzysta z formularza dodawania wyników, aby wprowadzić nowe dane, przy czym system automatycznie porównuje je z poprzednimi wynikami.
- Z dashboardu lub poprzez menu nawigacyjne użytkownik przechodzi do kalendarza, aby sprawdzić nadchodzące terminy badań i wygenerować rekomendowany harmonogram.
- Inicjacja raportu AI odbywa się z poziomu widoku raportu, gdzie użytkownik monitoruje przebieg generowania i przegląda gotowy raport.
- Na każdym etapie system zapewnia ciągły feedback za pomocą inline komunikatów oraz toast notifications, a wszystkie operacje poza logowaniem i rejestracją są zabezpieczone Firebase Auth Guard.

## 4. Układ i struktura nawigacji

- **Desktop:** Tradycyjny pasek nawigacyjny umieszczony u góry ekranu z linkami do: Dashboard, Katalog badań, Dodaj Wynik, Kalendarz, Raport AI oraz dodatkowego menu użytkownika (profil, ustawienia).

- **Mobile:** Menu jest ukryte za przyciskiem hamburgera umieszczonym po lewej stronie toolbara. Po naciśnięciu, wysuwane jest boczne menu zawierające opcje: Dashboard, Katalog, Dodaj Wynik, Kalendarz, Raport AI oraz dodatkowe opcje (np. profil, ustawienia).

## 5. Kluczowe komponenty

- **Komponent autoryzacji:** Formularze logowania i rejestracji integrujące Firebase Auth z walidacją i inline error handling.
- **Komponent wskaźników:** Karty i wizualizacje dla Health Score oraz Compliance Score, z zastosowaniem kolorowania wg ustalonych progów.
- **Komponent list/tabela:** Prezentacja katalogu badań i listy ostatnich wyników z funkcjami wyszukiwania i filtrowania.
- **Komponent formularza:** Dynamiczny formularz dodawania wyników z walidacją w czasie rzeczywistym i porównaniem wyników.
- **Komponent kalendarza:** Interaktywny widok do prezentacji harmonogramu badań oraz generowania rekomendacji poprzez API.
- **Komponent raportu AI:** Wyświetlanie statusu generowania raportu, loader oraz podgląd gotowego raportu w HTML.
- **Mechanizm powiadomień:** Toast notifications oraz inline komunikaty błędów dla operacji CRUD i walidacji.
- **Mechanizm nawigacji:** Pasek nawigacyjny dla wersji desktop oraz bottom sheet dla wersji mobilnej, umożliwiający intuicyjne przechodzenie między widokami.
- **Zarządzanie stanem:** Implementacja z użyciem RxJS z możliwością migracji do NgRx Signal Store dla bardziej zaawansowanej kontroli stanu aplikacji. 