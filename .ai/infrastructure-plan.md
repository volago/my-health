# Plan infrastruktury i środowisk

Poniżej znajduje się kompleksowy plan środowisk i procesów CI/CD dla aplikacji **10xHealth** (Angular 19 + Angular Material 19 + Tailwind 4 + Firebase + Nx).

---

## 1. Liczba środowisk

1. **Lokalne (dev-local)**  
   – Uruchamiane na deweloperze za pomocą Firebase Emulator Suite  
   – Emulowane usługi: Auth, Firestore, Functions, Hosting

2. **Staging**  
   – Dedykowany projekt Firebase (np. `my-health-staging`)  
   – Automatyczne deploy'e z gałęzi `develop` lub `release/*`  
   – Służy do integracji, testów QA i demo

3. **Production**  
   – Dedykowany projekt Firebase (np. `my-health-prod`)  
   – Automatyczne deploy'e z gałęzi `main` po zatwierdzeniu staging  
   – Odporny na zmiany deweloperskie

> **Uwaga**: Dla bardzo wczesnej fazy aplikacji można pominąć staging, jednak warto od samego początku oddzielić środowisko pośrednie od produkcyjnego.

---

## 2. Środowisko lokalne: emulator czy dev-Firebase?

- **Zdecydowanie Firebase Emulator Suite**  
  • Pełny snapshot usług (Auth, Firestore, Functions, Hosting)  
  • Offline-first, brak wpływu na dane centralne  
  • Deterministyczne i szybkie testy

- **Fallback do staging** (opcjonalnie)  
  Jeżeli potrzebna jest weryfikacja integracji z usługami nieobsługiwanymi przez emulator, można skonfigurować łączenie się jedynie z projektem `staging`.

---

## 3. Testy end-to-end (E2E)

1. **Lokalnie**  
   – Playwright uruchamiany przeciwko Emulator Suite  
   – Szybki feedback przy zmianach UI i flow

2. **CI/CD (GitHub Actions)**
   - **Na każdy PR/feature branch**:
     1. job "Lint" (ESLint + Prettier)  
     2. job "Unit Tests" (Vitest)  
     3. job "E2E on Emulator" (Playwright + Emulator Suite)  
     → po zielonym statusie merge do develop/release
   - **Na gałęzi `develop`/`release/*`**:
     1. Deploy do `staging`  
     2. job "E2E on Staging" (Playwright przeciwko staging)  
   - **Na gałęzi `main`**:
     1. Deploy do `prod`  
     2. (Opcjonalnie) smoke tests na produkcji

> Dzięki temu wychwytujemy błędy przed produkcją i weryfikujemy realne środowisko staging.

---

## 4. Krok po kroku: plan przygotowania infrastruktury

1. **Firebase Projects & Aliasy**  
   – Utworzyć projekty: `my-health-dev` (opcjonalnie), `my-health-staging`, `my-health-prod`  
   – Skonfigurować `.firebaserc` z aliasami `dev`, `staging`, `prod`

2. **Konfiguracja środowisk Angular**  
   – `src/environments/environment.ts` (emulator)  
   – `src/environments/environment.staging.ts`  
   – `src/environments/environment.prod.ts`  
   – Dodać w `angular.json` profile build/serve dla każdej konfiguracji

3. **Emulator Suite**  
   – W `firebase.json`: konfiguracja rules, functions, hosting  
   – Skrypty w `package.json`:
   ```json
   "dev:emulate": "nx run my-health:serve --configuration=dev && firebase emulators:start --only auth,firestore,functions,hosting"
   ```
   – Skrypt `test:e2e:local` uruchamiający Playwright z `--base-url=http://localhost:4200`

4. **CI/CD (GitHub Actions)**  
   – `.github/workflows/ci.yml`: matrix joby (lint, unit, e2e-emulator), artefakty, raporty  
   – `.github/workflows/deploy-staging.yml`: trigger na `develop`/`release/*`, deploy staging, E2E  
   – `.github/workflows/deploy-prod.yml`: trigger na `main`, deploy prod, smoke tests

5. **Backup i monitoring**  
   – Codzienny backup Firestore (Cloud Scheduler + export do Cloud Storage)  
   – Cloud Logging + Error Reporting dla Functions

6. **Dokumentacja i onboarding**  
   – README z instrukcjami: uruchamianie emulatora, zmienne środowiskowe, testy, CI/CD

---

## Podsumowanie

- **3 środowiska**: lokalny emulator → staging → prod
- **Lokalnie**: zawsze emulator (izolacja)
- **E2E**: PR→emulator, staging→staging, prod→smoke tests
- **CI/CD**: wyraźny podział jobów: lint → unit → e2e → deploy

Taki proces zapewnia szybkie iteracje, bezpieczeństwo danych i minimalizuje ryzyko błędów w produkcji. 