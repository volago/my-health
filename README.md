# 10xHealth

![Version](https://img.shields.io/badge/version-0.0.0-blue)
![License: MIT](https://img.shields.io/badge/license-MIT-green)
![Build Status](https://github.com/<YOUR_GITHUB_USERNAME>/my-health/actions/workflows/ci.yml/badge.svg)

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

10xHealth is a web application that enables users to centrally store laboratory test results, analyze trends in real time, and generate AI-powered health reports. With secure anonymous registration and offline support, 10xHealth helps users monitor their health metrics and stay on top of preventive care schedules.

## Tech Stack

### Frontend

- Angular 19
- Angular Material 19
- Tailwind CSS 4
- TypeScript 5
- Angular Fire (Firebase SDK)
- RxJS
- Zone.js

### Backend

- Firebase Authentication
- Cloud Firestore
- Firebase Realtime Database
- Firebase Cloud Functions
- Firebase Storage

### Monorepo & Tooling

- Nx 21.0.3
- Vitest (unit testing)
- Playwright (end-to-end testing)
- ESLint & Prettier (linting & formatting)
- GitHub Actions (CI/CD)
- OpenRouter.ai (AI model integrations)

## Getting Started Locally

### Prerequisites

- Node.js >= 18
- npm >= 8
- Firebase CLI (`npm install -g firebase-tools`)
- Nx CLI (`npm install -g nx`)

### Installation

```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/my-health.git
cd my-health
npm install
```

### Firebase Configuration

1. Authenticate with the Firebase CLI:
   ```bash
   firebase login
   ```
2. Retrieve runtime configuration for Cloud Functions:
   ```bash
   npx nx run my-health-firebase-app:getconfig
   ```

### Running the Application

Start the Angular frontend:
```bash
npx nx serve my-health
``

Start the Firebase emulators and hosting:
```bash
npx nx serve my-health-firebase-app
```

The frontend will be available at `http://localhost:4200`, and the Firebase emulator UI at `http://localhost:5000`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm install` | Install dependencies |
| `npx nx serve my-health` | Serve the Angular application |
| `npx nx serve my-health-firebase-app` | Serve Firebase emulator & hosting |
| `npx nx build my-health` | Build the Angular application for production |
| `npx nx test my-health` | Run unit tests (Vitest) |
| `npx nx lint my-health` | Lint the Angular application |
| `npx nx test my-health-firebase-app` | Run backend tests |
| `npx nx lint my-health-firebase-app` | Lint the Firebase application |
| `npx nx e2e my-health-e2e` | Run end-to-end tests (Playwright) |
| `npx nx run my-health-firebase-app:deploy` | Deploy hosting & functions to Firebase |
| `npx nx run my-health-firebase-app:emulate` | Start all Firebase emulators |

## Project Scope

### In Scope

- Anonymous user registration and authentication (Firebase Auth)
- Management and filtering of a static test catalog (Cloud Firestore)
- Adding laboratory test results with date tracking
- Automatic comparison of results and trend indication
- Dashboard displaying Health Score (HS) and Compliance Score (CS) with visual indicators
- AI-powered HTML report generation via Cloud Functions
- Responsive UI built with Angular Material and Tailwind CSS
- Offline support (PWA) for dashboard and catalog
- CI/CD pipeline, monitoring, and daily backups

### Out of Scope

- Exporting or importing test results
- Sharing results with medical professionals
- Custom calendar editing
- Notifications for changes in official guidelines
- Gamification or monetization features
- Integration with external measurement devices or healthcare systems
- Automatic import of laboratory data

## Project Status

This project is currently in active development (Alpha). Roadmap and open issues are tracked in this repository.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details. 