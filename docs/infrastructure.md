# Infrastruktura aplikacji 10xHealth

## Środowisko lokalne (dev-local)

Poniżej znajduje się dokumentacja aktualnego etapu wdrożenia infrastruktury dla aplikacji **10xHealth** (Angular 19 + Angular Material 19 + Tailwind 4 + Firebase + Nx).

### Komponenty środowiska lokalnego

1. **Firebase Emulator Suite**  
   - Lokalny emulator usług Firebase 
   - Emulowane usługi:
     - Auth (uwierzytelnianie)
     - Firestore (baza danych)
     - Functions (funkcje serverless)
   - Zapewnia izolowane środowisko deweloperskie
   - Umożliwia pracę offline bez wpływu na dane centralne

2. **Angular z konfiguracją deweloperską**
   - Skonfigurowane połączenie Angular -> Firebase Emulator
   - Przygotowane zmienne środowiskowe w pliku `environment.ts`
   - Profil deweloperski skonfigurowany w Angular CLI

### Konfiguracja

1. **Firebase**
   - Skonfigurowany plik `firebase.json` z regułami dla emulowanych usług
   - Plik `.firebaserc` z aliasami dla środowisk

2. **Angular**
   - Skonfigurowany profil dev w `angular.json`
   - Zmienne środowiskowe wskazujące na emulator Firebase

### Uruchamianie środowiska lokalnego

Środowisko lokalne uruchamiane jest za pomocą następujących komend Nx:

1. Uruchomienie emulatorów Firebase:
```bash
npx nx serve my-health-firebase-app
```
Jeśli występuje błąd dotyczący portów, należy uruchomić komendę 
```bash
npx nx run my-health-firebase-app:killports
```

2. Uruchomienie aplikacji Angular:
```bash
npx nx serve my-health
```

Po uruchomieniu:
- Aplikacja Angular dostępna jest pod adresem `http://localhost:4200`
- UI emulatora Firebase dostępne jest pod adresem `http://localhost:4000`

3. Wypełnienie emulatorów przykładowymi danymi (opcjonalne, po uruchomieniu emulatorów):
```bash
node scripts/seed-firestore-emulator.js
```

### Kolejne kroki

Kolejne etapy rozwoju infrastruktury (do wdrożenia w przyszłości):
- Środowisko staging
- Środowisko produkcyjne
- Testy E2E
- Pełen proces CI/CD 