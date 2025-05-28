# Implementacja Firebase

Plan implementacji i zadań związanych z Firebase dla projektu My Health.

## Completed Tasks

- [x] Skonfigurować podstawowe połączenie z Firestore
- [x] Przetestować pobieranie i dodawanie dokumentów do Firestore
- [x] Wyłączyć niepotrzebne emulatory w konfiguracji Firebase
- [x] Stworzyć plan API (Cloud Functions) do pobrania raportów o stanie zdrowia
- [x] Wygenerować typy danych TypeScript na podstawie planu bazy danych
- [x] Utworzyć katalog badań oraz przypisać je do grup wiekowych
- [x] Dowiedzieć się jak seedować emulator danymi i dodać katalog badań na starcie emulatora
- [x] Zaplanować interface użytkownika
- [x] Zaimplementować interfejs użytkownika dla katalogu badań (dodać lib nx)
- [x] Zaimplementować logowanie użytkownika z Firebase Auth
  - [x] Dodać przykładowego użytkownika do emulatora

## In Progress Tasks

- [ ] Zaimplementować dashboard użytkownika. Prosta wersja z mockami wskaźników i       
      terminów przyszłych wizyt, ale pobierająca z bazy wyniki ostatnich badań
  - [ ] Dodać przykładowe badania do bazy

## Future Tasks

- [ ] Zaimplementować Cloud Functions z API planu:
  - [ ] Implementacja endpointów metryk zdrowotnych:
    - [ ] `/api/metrics/health-score` - obliczanie Health Score
    - [ ] `/api/metrics/compliance-score` - obliczanie Compliance Score
  - [ ] Implementacja analizy trendów wyników badań `/api/results/trend`
  - [ ] Implementacja generowania harmonogramu badań `/api/schedule/generate`
  - [ ] Implementacja endpointów raportów AI:
    - [ ] `/api/reports/generate` - generowanie raportu AI
    - [ ] `/api/reports/{reportId}/status` - sprawdzanie statusu generowania
    - [ ] `/api/reports/{reportId}` - pobieranie wygenerowanego raportu
- [ ] Skonfigurować walidację danych zgodnie z planem API
- [ ] Zaimplementować mechanizmy bezpieczeństwa:
  - [ ] Weryfikacja tokenów Firebase ID
  - [ ] Bezpieczne przechowywanie kluczy API dla usług zewnętrznych
  - [ ] Implementacja limitowania żądań
  - [ ] Skonfigurować uprawnienia w regułach Firestore

## Implementation Plan

### Konfiguracja emulatorów

Obecnie projekt używa wielu emulatorów Firebase, ale nie wszystkie są potrzebne na tym etapie. 
Należy zoptymalizować konfigurację i wyłączyć niepotrzebne emulatory, co przyspieszy start środowiska deweloperskiego.

**Status:** ✅ Ukończone. Zmodyfikowano konfigurację firebase.json oraz projekt.json, aby uruchamiać tylko niezbędne emulatory: auth, firestore i functions. Usunięto nieużywane porty z komendy killports.

### Plan API dla raportów zdrowotnych

Zaprojektować i zaimplementować Cloud Functions, które będą odpowiedzialne za:
- Pobieranie danych zdrowotnych użytkownika
- Agregację wyników badań
- Generowanie raportów i statystyk
- Rekomendacje na podstawie danych zdrowotnych

**Status:** ✅ Ukończone. Stworzono kompleksowy plan API w .ai/api-plan.md, który definiuje wszystkie wymagane endpointy, struktury żądań i odpowiedzi, oraz mechanizmy bezpieczeństwa.

### Generowanie typów TypeScript

Utworzyć interfejsy TypeScript dla wszystkich kolekcji i podkolekcji bazy danych. Typy powinny dokładnie odzwierciedlać strukturę dokumentów opisaną w planie bazy danych, wraz z typami pól i ograniczeniami walidacyjnymi.

**Status:** 🔄 W trakcie realizacji. Trwa tworzenie interfejsów dla kolekcji testCatalog, users, results, schedules, aiReports i scheduleRecommendations.

### Implementacja Cloud Functions

Należy zaimplementować następujące endpointy API zgodnie z planem API:

1. **Endpoint rejestracji anonimowej**
   - Generowanie unikalnego ID użytkownika
   - Zapisywanie hasła w Firebase Auth
   - Tworzenie profilu użytkownika w Firestore

2. **Endpointy metryk zdrowotnych**
   - Obliczanie Health Score na podstawie procentu parametrów w normie
   - Obliczanie Compliance Score na podstawie przestrzegania harmonogramu badań
   - Zwracanie kategorii wyniku (zielony/żółty/czerwony) zgodnie z progami

3. **Endpoint analizy trendów wyników**
   - Pobieranie historycznych wyników dla danego parametru
   - Analiza kierunku zmiany (poprawa/pogorszenie)
   - Obliczanie procentowej zmiany

4. **Endpoint generowania harmonogramu badań**
   - Uwzględnianie wieku, płci i poziomu szczegółowości użytkownika
   - Pobieranie rekomendacji z kolekcji scheduleRecommendations
   - Tworzenie spersonalizowanego harmonogramu

5. **Endpointy raportów AI**
   - Integracja z Openrouter.ai do generowania raportów
   - Zabezpieczenie kluczy API w zmiennych środowiskowych
   - Asynchroniczne przetwarzanie z monitorowaniem statusu
   - Zapisywanie wygenerowanych raportów w Firestore

### Struktura danych

Należy zaprojektować i wdrożyć strukturę danych dla:
- Profili użytkowników
- Wyników badań
- Katalogów badań i norm
- Grup wiekowych
- Raportów zdrowotnych

### Implementacja bezpieczeństwa

1. **Uwierzytelnianie i autoryzacja**
   - Weryfikacja tokenów Firebase ID dla każdego żądania API
   - Sprawdzanie uprawnień dostępu do danych (tylko własne dane użytkownika)

2. **Walidacja danych**
   - Implementacja walidacji zgodnej z regułami w planie API
   - Walidacja parametrów wyników badań zgodnie z katalogiem badań

3. **Zabezpieczenia przed nadużyciami**
   - Limitowanie żądań API (max 100 na minutę)
   - Limitowanie generowania raportów AI (max 1 dziennie)

### Seedowanie danych testowych

Opracować mechanizm automatycznego zasilania emulatora danymi testowymi, w tym:
- Katalogiem badań
- Przypisaniem badań do grup wiekowych
- Przykładowymi profilami użytkowników

### Relevant Files

- `apps/my-health/src/environments/environment.ts` - Konfiguracja Firebase i emulatorów
- `apps/my-health/src/app/app.config.ts` - Konfiguracja Angular Fire i inicjalizacja emulatorów
- `apps/my-health/src/app/app.component.ts` - Testowe połączenie z Firestore
- `firebase.json` - Główna konfiguracja Firebase (✅ zmodyfikowana)
- `apps/my-health-firebase-app/project.json` - Konfiguracja projektu Firebase (✅ zmodyfikowana)
- `apps/my-health-firebase-app/firestore.rules` - Reguły bezpieczeństwa dla Firestore
- `apps/my-health-firebase-functions/src/index.ts` - Cloud Functions do implementacji (do utworzenia)
- `.ai/api-plan.md` - Szczegółowy plan API (✅ utworzony) 