# Dokument wymagań produktu (PRD) - 10xHealth

## 1. Przegląd produktu

10xHealth to aplikacja webowa umożliwiająca użytkownikom centralne przechowywanie wyników badań laboratoryjnych, ich analizę w czasie rzeczywistym oraz generowanie raportów stanu zdrowia wspomaganych przez sztuczną inteligencję. System wspiera anonimową rejestrację i logowanie, a dane użytkowników są bezpiecznie przechowywane z precyzyjnymi regułami dostępu.

## 2. Problem użytkownika

- Wyniki badań rozproszone są w wielu dokumentach (głównie papierowych), co utrudnia ich przegląd i analizę.
- Ręczne porównywanie wyników kolejnych badań wymaga dużo czasu i jest podatne na błędy.
- Brak przejrzystego harmonogramu badań profilaktycznych prowadzi do pomijania zalecanych terminów.
- Użytkownik nie ma jednego miejsca do monitorowania swojego stanu zdrowia i postępów.

## 3. Wymagania funkcjonalne

Autentykacja i autoryzacja
- Anonimowa rejestracja z losowo generowanym identyfikatorem i hasłem (Firebase Auth).
- Logowanie z wykorzystaniem identyfikatora i hasła.
- Zabezpieczenie danych poprzez Firestore Security Rules – dostęp tylko do własnych dokumentów.

Zarządzanie katalogiem badań
- Statyczny katalog badań w formacie JSON, importowany do Firestore przez CI/CD.
- Możliwość filtrowania i wyszukiwania badań po nazwie oraz tagach.

Dodawanie i analiza wyników
- Formularz dodawania wyników z listą parametrów dla wybranego badania.
- Automatyczne porównanie z poprzednimi wynikami i wskazanie pogorszenia lub poprawy.
- Zapis wyników w Firestore.

Dashboard i wskaźniki
- Wyliczanie Health Score (HS) i Compliance Score (CS) w procentach z wizualnym oznaczeniem progów zielony (≥90%), żółty (≥70%), czerwony (<70%).
- Podsumowanie ostatnich wyników.
- harmonogram nadchodzących badań.
- Możliwość wyboru poziomu szczegółowości: podstawa, zalecany, szczegółowy.

Generowanie raportu AI
- Wywołanie Cloud Function z ukrytym kluczem API do stworzenia raportu w HTML.
- Wyświetlenie i pobranie wygenerowanego raportu.

UI/UX i dostępność
- Interfejs oparty na Angular Material.
- Pełna zgodność z WCAG A/AA.
- Responsywność i dostęp offline (service worker pre-cache dashboardu i katalogu badań).

Infrastruktura, monitoring i CI/CD
- Trzy środowiska: dev (Firestore emulator), staging, prod w Firebase.
- Automatyczny build, testy unit i e2e (wybrane scenariusze) oraz deploy przez GitHub Actions.
- Codzienny backup Firestore.
- Monitorowanie błędów i logowanie w Cloud Logging.

## 4. Granice produktu

- Brak eksportu/importu wyników badań.
- Brak współdzielenia wyników z lekarzem.
- Brak własnej edycji kalendarza badań.
- Brak powiadomień o zmianach w oficjalnych zaleceniach.
- Brak grywalizacji i monetizacji.
- Brak integracji z urządzeniami pomiarowymi i systemami opieki medycznej.
- Brak automatycznego importu danych z laboratoriów.

## 5. Historyjki użytkowników

- ID: US-001
  Tytuł: Rejestracja anonimowa użytkownika
  Opis: Jako nowy użytkownik chcę się zarejestrować z losowym loginem i hasłem, aby zachować anonimowość.
  Kryteria akceptacji:
  - możliwe jest wygenerowanie unikalnego identyfikatora
  - użytkownik może ponownie wygenerować identyfikator, keśli obecny mu się nie podoba
  - użytkownik podaje tylko hasło, które jest zapamiętywane w Firebase Auth
  - użtykownik podaje także rok urodzenia, płeć i wybrany pakiet szczegółowości badań
  - użytkownik dostaje jasne informacje o celu zbierania tych danych i odpowiedzi na pytania o cel używania aplikacji
  - użytkownik ma jasno kumunikowane, że musi zapisać lub zapamiętać identyfikator i hasło, bo nie ma mozliwości ich odzyskania z powodu nie wprowadzania e-maila
  - po rejestracji użytkownik trafia na stronę dashboardu

- ID: US-002
  Tytuł: Logowanie użytkownika
  Opis: Jako zarejestrowany użytkownik chcę się zalogować za pomocą loginu i hasła, aby uzyskać dostęp do moich danych.
  Kryteria akceptacji:
  - użytkownik musi być zalogowany w systemie aby zobaczyć jakąkolwiek zawartość
  - każdy URL aplikacji przekierowuje niezalogowanego użytkownika do ekranu logowania
  - informacja o zalogowanym użytkowniku jest widoczna w toolbarze, po prawej stronie
  - po kliknięciu w avatar użytkownika pojawia się menu z opcją wylogowania
  - poprawne dane uwierzytelniają użytkownika
  - niepoprawne dane wyświetlają komunikat o błędzie
  - po poprawnym logowaniu przekierowanie do dashboardu

- ID: US-003
  Tytuł: Wylogowanie użytkownika
  Opis: Jako zalogowany użytkownik chcę się wylogować, aby zabezpieczyć dostęp do aplikacji.
  Kryteria akceptacji:
  - po kliknięciu 'Wyloguj' następuje powrót do ekranu logowania
  - dane sesji są usuwane z aplikacji i cache

- ID: US-004
  Tytuł: Przegląd dashboardu
  Opis: Jako użytkownik chcę zobaczyć Health Score, Compliance Score, ostatnie wyniki i harmonogram nadchodzących badań.
  Kryteria akceptacji:
  - HS i CS wyświetlone w procentach z wizualnym oznaczeniem progów zielony (≥90%), żółty (≥70%), czerwony (<70%).
  - lista ostatnich badań
  - kalendarz kolejnych terminów

- ID: US-006
  Tytuł: Przegląd i wyszukiwanie katalogu badań
  Opis: Jako użytkownik chcę przeglądać katalog badań i filtrować je po nazwie lub tagach.
  Kryteria akceptacji:
  - lista badań ładuje się z Firestore
  - możliwe filtrowanie według tekstu i tagów
  - katalog dostępny offline

- ID: US-008
  Tytuł: Dodawanie wyniku badania
  Opis: Jako użytkownik chcę dodać nowy wynik badania, aby śledzić zmiany w czasie.
  Kryteria akceptacji:
  - formularz pozwala wprowadzić wszystkie wymagane parametry
  - wynik jest zapisywany w Firestore z datą wykonania
  - aplikacja porównuje wartość z poprzednim i wskazuje trend

- ID: US-009
  Tytuł: Generowanie raportu AI
  Opis: Jako użytkownik chcę wygenerować raport HTML o stanie mojego zdrowia przy pomocy AI i wyświetlić go w aplikacji.
  Kryteria akceptacji:
  - wywoływana jest Cloud Function z kluczem API przechowywanym w środowisku
  - po chwili pojawia się podgląd raportu w HTML
  - raport jest zapisywany i możliwy do przeglądu w przyszłości

- ID: US-010
  Tytuł: Dostęp offline (PWA)
  Opis: Jako użytkownik chcę mieć dostęp do dashboardu i katalogu badań bez połączenia z internetem.
  Kryteria akceptacji:
  - service worker pre-cache zasoby dashboardu i katalogu
  - przy braku sieci aplikacja ładuje ostatnio zcache'owane dane


## 6. Metryki sukcesu

- 70% użytkowników doda wyniki badań przynajmniej 2 razy w roku.
- 70% użytkowników wygeneruje raport AI co najmniej raz.
- 70% dodanych wyników będzie zgodnych z zaleceniami kalendarza (CS ≥ 80%).
- Stabilność: mniej niż 1% błędów zapisu/wyświetlania monitorowanych przez Cloud Logging.
- Uptime PWA ≥ 99% w środowisku prod.


