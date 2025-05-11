1. Lista struktur dokumentów z ich polami, typami danych i ograniczeniami

- **testCatalog** (kolekcja)
  - Document ID: `testId` (string)
  - `name`: string
  - `description`: string
  - `tags`: string[]
  - `parametersTemplate`: Array<ParameterTemplate>
    - `paramName`: string
    - `icdCode`: string
    - `unit`: string
    - `valueType`: "number" | "string" | "boolean"
    - `validation` (opcjonalne):
      - `min`?: number
      - `max`?: number
      - `allowedValues`?: any[]

- **users** (kolekcja)
  - Document ID: `userId` (string)
  - `createdAt`: Timestamp
  - `lastLogin`: Timestamp
  - `birthYear`: number
  - `sex`: "male" | "female"
  - `detailLevel`: "basic" | "recommended" | "detailed"

- **users/{userId}/results** (subkolekcja)
  - Document ID: `resultId` (string)
  - `testId`: string (FK → testCatalog.testId)
  - `createdAt`: Timestamp
  - `parameters`: Map<string, any>
    - klucz: `paramName` z `parametersTemplate`
    - wartość: number | string | boolean

- **users/{userId}/schedules** (subkolekcja)
  - Document ID: `scheduleId` (string)
  - `testId`: string (FK → testCatalog.testId)
  - `scheduledDate`: Timestamp

- **users/{userId}/aiReports** (subkolekcja)
  - Document ID: `reportId` (string)
  - `createdAt`: Timestamp
  - `reportHtml`: string

- **scheduleRecommendations** (kolekcja)
  - Document ID: `recommendationId` (string)
  - `testId`: string (FK → testCatalog.testId)
  - `sex`: "male" | "female"
  - `age`: number
  - `detailLevel`: "basic" | "recommended" | "detailed"

2. Zagnieżdżenia dokumentów i relacje

- `testCatalog/{testId}` – top-level (publiczny odczyt)
- `users/{userId}` – top-level (własne dane użytkownika)
  - Relacja jeden-do-wielu: `results/{resultId}`
  - Relacja jeden-do-wielu: `schedules/{scheduleId}`
  - Relacja jeden-do-wielu: `aiReports/{reportId}`

4. Zasady Firestore

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Publiczny katalog badań
    match /testCatalog/{testId} {
      allow read: if true;
      allow write: if false;
    }

    // Dane użytkownika tylko dla właściciela
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

5. Dodatkowe uwagi i wyjaśnienia

- **Indeksy:**
  - `results` (collectionGroup): złożony indeks na `testId` (ASC) i `createdAt` (DESC)
  - `schedules` (collectionGroup): indeks na `scheduledDate` (ASC)
- **Trend wyników** obliczany dynamicznie po stronie klienta/backendu na podstawie kolejnych dokumentów w `results`
- **Transakcje**: atomowa aktualizacja pola `scheduledDate` w `schedules` po dodaniu nowego wyniku
- **Walidacja** parametrów: po stronie klienta według `parametersTemplate`; dodatkowa weryfikacja w Cloud Functions
- **TTL / archiwizacja** `aiReports`: rozważyć ustawienie polityki TTL w Firestore (np. usuwanie raportów starszych niż X dni)
- **Audyt historii harmonogramu**: rozważyć subkolekcję `schedulesHistory` pod każdym `scheduleId` lub osobną kolekcję `auditLogs` dla zapisu zmian 