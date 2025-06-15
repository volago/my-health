# Plan Testów - Projekt My-Health

## 1. Wprowadzenie i Cele Testowania

### Cel główny
Plan testów ma na celu zapewnienie wysokiej jakości aplikacji my-health - systemu zarządzania zdrowiem opartego na Angular 19 i Firebase, zorganizowanego w architekturze monorepo Nx.

### Cele szczegółowe
- Weryfikacja poprawności funkcjonalności uwierzytelniania użytkowników
- Zapewnienie poprawnej integracji z usługami Firebase (Firestore, Auth, Functions)
- Walidacja logiki biznesowej w modułach domenowych
- Kontrola jakości interfejsu użytkownika (Angular Material + Tailwind)
- Weryfikacja poprawności routingu i guardów bezpieczeństwa
- Sprawdzenie wydajności i responsywności aplikacji

## 2. Zakres Testów

### Komponenty objęte testami
- **Aplikacja główna (my-health)**
  - Moduły funkcjonalne: auth, catalog, dashboard, reports
  - Routing i guardy uwierzytelniania
  - Komponenty interfejsu użytkownika
  
- **Biblioteki Nx**
  - Domain - modele i logika biznesowa
  - Shared - komponenty współdzielone
  - Features - implementacje funkcjonalności
  
- **Backend Firebase**
  - my-health-firebase-functions
  - Integracja z Firestore
  - Uwierzytelnianie Firebase Auth

### Komponenty wyłączone z testów
- Zewnętrzne usługi OpenRouter.ai (testowane przez dostawcę)
- Infrastruktura GitHub Actions (testowana oddzielnie)
- Konfiguracja Firebase Hosting

## 3. Typy Testów

### 3.1 Testy Jednostkowe (Unit Tests)
**Narzędzie:** Vitest
**Zakres:**
- Modele domenowe (libs/domain)
- Serwisy Angular
- Komponenty Angular (logika)
- Utility functions
- Pipe'y i dyrektywy

**Pokrycie:** 80% kodu

### 3.2 Testy Integracyjne (Integration Tests)
**Narzędzie:** Vitest + Firebase Emulators
**Zakres:**
- Integracja z Firebase Firestore
- Firebase Auth flow
- Firebase Functions
- Komunikacja między modułami Nx
- API endpoints

### 3.3 Testy Komponentów (Component Tests)
**Narzędzie:** Vitest + Angular Testing Utilities
**Zakres:**
- Renderowanie komponentów
- Interakcje użytkownika
- Binding danych
- Material UI components
- Responsywność (Tailwind)

### 3.4 Testy End-to-End (E2E Tests)
**Narzędzie:** Playwright
**Zakres:**
- Pełne scenariusze użytkownika
- Nawigacja między stronami
- Formularze i walidacja
- Uwierzytelnianie użytkowników
- Cross-browser testing

### 3.5 Testy Wydajnościowe
**Narzędzie:** Playwright + Lighthouse
**Zakres:**
- Czas ładowania aplikacji
- Core Web Vitals
- Bundle size analysis
- Memory leaks

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

### 4.1 Uwierzytelnianie (Auth Module)
**Scenariusze pozytywne:**
- Logowanie z prawidłowymi danymi
- Rejestracja nowego użytkownika
- Wylogowanie użytkownika
- Odzyskiwanie hasła

**Scenariusze negatywne:**
- Logowanie z nieprawidłowymi danymi
- Rejestracja z istniejącym emailem
- Dostęp do chronionych tras bez uwierzytelniania

### 4.2 Katalog Testów (Catalog Module)
**Scenariusze testowe:**
- Wyświetlanie listy dostępnych testów
- Filtrowanie testów według kategorii
- Wyszukiwanie testów
- Dodawanie testu do harmonogramu
- Wyświetlanie szczegółów testu

### 4.3 Dashboard
**Scenariusze testowe:**
- Wyświetlanie przeglądu stanu zdrowia
- Prezentacja nadchodzących testów
- Wyświetlanie ostatnich wyników
- Nawigacja do innych modułów
- Responsywność na różnych urządzeniach

### 4.4 Raporty (Reports Module)
**Scenariusze testowe:**
- Generowanie raportów zdrowotnych
- Eksport raportów (PDF/Excel)
- Filtrowanie wyników według daty
- Integracja z AI (OpenRouter)
- Wyświetlanie trendów zdrowotnych

### 4.5 Routing i Guardy
**Scenariusze testowe:**
- Przekierowanie niezalogowanych użytkowników
- Przekierowanie zalogowanych z /auth do /catalog
- Obsługa nieistniejących tras (404)
- Lazy loading modułów
- Breadcrumb navigation

## 5. Środowisko Testowe

### 5.1 Środowisko lokalne
- **OS:** Windows 10/11, Linux, macOS
- **Node.js:** wersja zgodna z Angular 19
- **Firebase Emulators:** Firestore, Auth, Functions
- **Browsers:** Chrome, Firefox, Edge (dla testów E2E)

### 5.2 Środowisko CI/CD
- **GitHub Actions**
- **Firebase Test Environment**
- **Nx Cloud** (dla cache i distributed testing)

### 5.3 Konfiguracja testowa
```typescript
// Przykład konfiguracji Firebase Emulators
export const testEnvironment = {
  firebase: {
    projectId: 'my-health-test',
    emulators: {
      firestore: { host: 'localhost', port: 8080 },
      auth: { host: 'localhost', port: 9099 },
      functions: { host: 'localhost', port: 5001 }
    }
  }
};
```

## 6. Narzędzia do Testowania

### 6.1 Framework testowy
- **Vitest** - testy jednostkowe i integracyjne
- **Playwright** - testy E2E
- **Angular Testing Utilities** - testy komponentów

### 6.2 Utilities i biblioteki pomocnicze
- **@testing-library/angular** - user-centric testing
- **MSW (Mock Service Worker)** - mockowanie API
- **Firebase Test SDK** - testy z emulatorami
- **@nx/cypress** - integracja z Nx

### 6.3 Narzędzia analizy
- **Coverage reports** (Istanbul)
- **Bundle analyzer** (webpack-bundle-analyzer)
- **Lighthouse CI** - testy wydajności
- **ESLint** - jakość kodu testów

## 7. Harmonogram Testów

### Faza 1: Przygotowanie (1 tydzień)
- Konfiguracja środowiska testowego
- Ustawienie Firebase Emulators
- Przygotowanie danych testowych
- Konfiguracja CI/CD pipeline

### Faza 2: Testy jednostkowe (2 tygodnie)
- Testy modeli domenowych
- Testy serwisów Angular
- Testy utility functions
- Refactoring na podstawie wyników

### Faza 3: Testy integracyjne (2 tygodnie)
- Testy integracji z Firebase
- Testy komunikacji między modułami
- Testy API endpoints
- Optymalizacja wydajności

### Faza 4: Testy komponentów (2 tygodnie)
- Testy renderowania komponentów
- Testy interakcji użytkownika
- Testy responsywności
- Testy Material UI integration

### Faza 5: Testy E2E (2 tygodnie)
- Implementacja kluczowych scenariuszy
- Cross-browser testing
- Mobile testing
- Performance testing

### Faza 6: Optymalizacja i raportowanie (1 tydzień)
- Analiza pokrycia testami
- Optymalizacja wydajności testów
- Dokumentacja wyników
- Przekazanie do zespołu

## 8. Kryteria Akceptacji Testów

### 8.1 Pokrycie kodem
- **Minimum:** 80% pokrycia dla kodu krytycznego
- **Cel:** 90% pokrycia dla logiki biznesowej
- **Wyłączenia:** Pliki konfiguracyjne, mock data

### 8.2 Wydajność
- **Czas ładowania:** < 3 sekundy (First Contentful Paint)
- **Core Web Vitals:** Wszystkie metryki w zielonym zakresie
- **Bundle size:** < 2MB dla initial bundle

### 8.3 Kompatybilność
- **Browsers:** Chrome 90+, Firefox 85+, Edge 90+, Safari 14+
- **Mobile:** iOS Safari, Chrome Android
- **Accessibility:** WCAG 2.1 AA compliance

### 8.4 Bezpieczeństwo
- **Auth flow:** Wszystkie scenariusze uwierzytelniania działają poprawnie
- **Route guards:** Chroni wszystkie chronione zasoby
- **Data validation:** Walidacja danych wejściowych

## 9. Role i Odpowiedzialności

### 9.1 Test Lead
- Nadzór nad realizacją planu testów
- Koordinacja z zespołem rozwoju
- Raportowanie postępów
- Podejmowanie decyzji o akceptacji

### 9.2 QA Engineers
- Implementacja scenariuszy testowych
- Wykonywanie testów manualnych
- Raportowanie błędów
- Weryfikacja poprawek

### 9.3 Developers
- Implementacja testów jednostkowych
- Współpraca przy testach integracyjnych
- Naprawa zgłoszonych błędów
- Code review testów

### 9.4 DevOps Engineer
- Konfiguracja środowiska CI/CD
- Utrzymanie Firebase Emulators
- Monitoring pipeline testowego
- Deployment do środowisk testowych

## 10. Procedury Raportowania Błędów

### 10.1 Klasyfikacja błędów
- **Critical:** Aplikacja nie działa / utrata danych
- **High:** Główne funkcjonalności nie działają
- **Medium:** Funkcjonalności działają z ograniczeniami
- **Low:** Problemy kosmetyczne / UX

### 10.2 Template raportu błędu
```markdown
## Tytuł błędu
**Priorytet:** [Critical/High/Medium/Low]
**Moduł:** [Auth/Catalog/Dashboard/Reports/Shared]
**Środowisko:** [Local/Test/Production]

### Kroki reprodukcji
1. Krok 1
2. Krok 2
3. Krok 3

### Oczekiwany rezultat
Opis oczekiwanego zachowania

### Aktualny rezultat
Opis rzeczywistego zachowania

### Dodatkowe informacje
- Browser/OS
- Screenshots/videos
- Error logs
- Network requests
```

### 10.3 Workflow błędów
1. **Zgłoszenie** - QA tworzy ticket w systemie
2. **Triage** - Test Lead przydziela priorytet
3. **Assignment** - Przydzielenie do developera
4. **Fix** - Implementacja poprawki
5. **Verification** - QA weryfikuje poprawkę
6. **Close** - Zamknięcie po akceptacji

### 10.4 Metryki i KPI
- **Defect density:** liczba błędów / KLOC
- **Test execution rate:** % wykonanych testów
- **Defect removal efficiency:** % błędów znalezionych przed produkcją
- **Mean time to resolution:** średni czas naprawy błędu

## 11. Narzędzia Wspomagające

### 11.1 Test Management
- **Jira/Azure DevOps** - tracking testów i błędów
- **TestRail** - przypadki testowe i execution
- **Allure** - raportowanie wyników

### 11.2 Monitoring i Analytics
- **Sentry** - error tracking w produkcji
- **Google Analytics** - user behavior analysis
- **Firebase Performance** - monitoring wydajności

### 11.3 Documentation
- **Confluence/Notion** - dokumentacja testów
- **Storybook** - dokumentacja komponentów
- **Swagger** - dokumentacja API

---

**Dokument został stworzony:** [DATA]  
**Wersja:** 1.0  
**Autor:** AI QA Engineer  
**Zatwierdził:** [DO UZUPEŁNIENIA] 