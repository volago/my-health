# Implementacja Firebase

Plan implementacji i zadań związanych z Firebase dla projektu My Health.

## Completed Tasks

- [x] Skonfigurować podstawowe połączenie z Firestore
- [x] Przetestować pobieranie i dodawanie dokumentów do Firestore
- [x] Wyłączyć niepotrzebne emulatory w konfiguracji Firebase

## In Progress Tasks

- [ ] Stworzyć plan API (Cloud Functions) do pobrania raportów o stanie zdrowia

## Future Tasks

- [ ] Wygenerować typy danych TypeScript na podstawie planu bazy danych
- [ ] Utworzyć katalog badań oraz przypisać je do grup wiekowych
- [ ] Dowiedzieć się jak seedować emulator danymi i dodać katalog badań na starcie emulatora
- [ ] Zaimplementować pełne uwierzytelnianie użytkowników z Firebase Auth
- [ ] Skonfigurować uprawnienia w regułach Firestore
- [ ] Zoptymalizować zapytania do Firestore

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

### Struktura danych

Należy zaprojektować i wdrożyć strukturę danych dla:
- Profili użytkowników
- Wyników badań
- Katalogów badań i norm
- Grup wiekowych
- Raportów zdrowotnych

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