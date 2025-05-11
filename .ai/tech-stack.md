Frontend:
- Angular 19
- Angular Material 19 dostarcza komponentów, które są niezbędne do tworzenia aplikacji
- Tailwind 4 do stylowania niedostępnego w Angular Material, na przykład układ flex, grid, itp
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Angular Fire dla dostępu do Firebase

Backend - Firebase jako kompleksowe rozwiązanie backendowe:
- Zapewnia bazę danych Firestore
- Zapewnia kod backend jako Cloud Functions
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Posiada emulator pozwalający na lokalny development
- Posiada wbudowane uwierzytelnianie użytkowników

Monorepo
- Nx do zarządzania monorepo

AI - Komunikacja z modelami przez usługę Openrouter.ai:
- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

CI/CD i Hosting:
- Github Actions do tworzenia pipeline'ów CI/CD
- Firebase Hosting do hostowania aplikacji
- Firebase Cloud Functions do hostowania Cloud Functions

Testing:
- Vitest  do testów jednostkowych
- Playwright do testów end-to-end 

Linting i Formatowanie:
- ESLint (^9.8.0) z pluginami angular-eslint i @nx/eslint oraz eslint-config-prettier
- Prettier do formatowania kodu
