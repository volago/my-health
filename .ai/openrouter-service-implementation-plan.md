# Plan implementacji usługi OpenRouter dla generowania raportów zdrowotnych

## 1. Przegląd implementacji

### Cel
Zastąpienie mockowego mechanizmu generowania raportów w `report-processor.ts` integracją z usługą OpenRouter w celu tworzenia realnych raportów zdrowotnych opartych na wynikach badań użytkowników.

### Wymagania biznesowe
- Generowanie spersonalizowanych raportów zdrowotnych na podstawie wyników badań
- Uwzględnienie danych demograficznych użytkownika (wiek, płeć)
- Raport zawierający: omówienie wyników, sugestie dodatkowych badań, spersonalizowane porady zdrowotne
- Format wyjściowy: `<article>{{ treść w HTML zawierająca tylko tagi HTML, odpowiednie nagłówki, paragrafy itp. }}</article>`

## 2. Analiza obecnej architektury

### Obecny mechanizm (`report-processor.ts`)
- Funkcja `processReport()` z mockowymi danymi HTML
- Status management: `TO_PROCESS` → `PROCESSING` → `SUCCESS`/`ERROR`
- Integracja z Firebase Storage dla przechowywania raportów
- Firestore do śledzenia statusu raportów

### Dostępne modele danych
- `UserProfile`: userId, birthYear, sex, detailLevel
- `TestResult`: resultId, testId, createdAt, parameters[]
- `TestCatalog`: testId, name, description, tags, parametersTemplate
- `AIReport`: reportId, createdAt, reportHtml

## 3. Konfiguracja środowiska dla emulatora

### 3.1 Konfiguracja OpenRouter API Key dla emulatora

```bash
# apps/my-health-firebase-app/environment/.secret.local
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxx
```

### 3.2 Aktualizacja konfiguracji Firebase Functions dla emulatora

```typescript
// functions/src/index.ts
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

export const processReportQueue = onDocumentCreated(
  'users/{userId}/reports/{reportId}',
  async (event) => {
    const { reportId, userId } = event.params;
    const reportData = event.data?.data();
    
    if (!reportData) {
      console.error('No report data found');
      return;
    }

    // W emulatorze pobieramy klucz z environment variables
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    
    if (!openRouterApiKey) {
      console.error('OPENROUTER_API_KEY not configured');
      return;
    }

    await processReport(
      event.data?.ref.firestore!,
      getStorage().bucket(),
      FieldValue,
      reportId,
      userId,
      reportData,
      openRouterApiKey
    );
  }
);
```

## 4. Implementacja OpenRouter Service

### 4.1 Interfejsy i typy

```typescript
// functions/src/services/openrouter.types.ts
export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface TestResultWithCatalog extends TestResult {
  catalog: TestCatalog;
}
```

### 4.2 OpenRouter Service

```typescript
// functions/src/services/openrouter.service.ts
import * as logger from 'firebase-functions/logger';
import { OpenRouterRequest, OpenRouterResponse } from './openrouter.types';

export class OpenRouterService {
  private readonly baseUrl = 'https://openrouter.ai/api/v1';
  private readonly defaultModel = 'anthropic/claude-3.5-sonnet';

  constructor(private readonly apiKey: string) {}

  async generateHealthReport(
    userProfile: UserProfile,
    testResults: TestResultWithCatalog[]
  ): Promise<string> {
    const prompt = this.buildHealthReportPrompt(userProfile, testResults);
    
    const request: OpenRouterRequest = {
      model: this.defaultModel,
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt()
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    };

    try {
      const response = await this.callOpenRouter(request);
      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenRouter');
      }

      logger.info('OpenRouter usage:', response.usage);
      return this.wrapInArticleTags(content);
    } catch (error) {
      logger.error('OpenRouter API call failed:', error);
      throw new Error(`Failed to generate health report: ${error.message}`);
    }
  }

  private async callOpenRouter(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://my-health-app.com',
        'X-Title': '10xHealth Report Generator'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  private getSystemPrompt(): string {
    return `Jesteś ekspertem medycznym specjalizującym się w analizie wyników badań laboratoryjnych. 
    Twoim zadaniem jest wygenerowanie spersonalizowanego raportu zdrowotnego w języku polskim.

    WYMAGANIA RAPORTU:
    1. Używaj profesjonalnego, ale przystępnego języka
    2. Strukturyzuj raport używając HTML
    3. Uwzględnij wszystkie przekazane wyniki badań
    4. Dostosuj rekomendacje do wieku i płci pacjenta
    5. Zawsze zaznacz, że raport nie zastępuje konsultacji lekarskiej

    STRUKTURA RAPORTU:
    <h1>Raport stanu zdrowia</h1>

    <h2>Podsumowanie wykonanych badań</h2>
    <p>[Krótkie podsumowanie wykonanych badań]</p>

    <h2>Analiza wyników badań</h2>
    <p>[Szczegółowa analiza każdego badania z interpretacją wyników]</p>

    <h2>Rekomendacje dodatkowych badań</h2>
    <p>[Sugestie dodatkowych badań jeśli wskazane]</p>

    <h2>Personalizowane porady zdrowotne</h2>
    <ul>
    <li>[3-5 konkretnych porad dostosowanych do profilu użytkownika]</li>
    </ul>

    <h2>Zastrzeżenia</h2>
    <p>[Przypomnienie o konieczności konsultacji lekarskiej]</p>

    Cały raport musi być zawarty w tagach HTML, w głownym tagu <article>`;
  }

  private buildHealthReportPrompt(
    userProfile: UserProfile,
    testResults: TestResultWithCatalog[]
  ): string {
    const currentYear = new Date().getFullYear();
    const age = currentYear - userProfile.birthYear;
    const sexLabel = userProfile.sex === 'male' ? 'mężczyzna' : 'kobieta';

    let prompt = `PROFIL UŻYTKOWNIKA:
- Wiek: ${age} lat
- Płeć: ${sexLabel}
- Poziom szczegółowości: ${userProfile.detailLevel}

WYNIKI BADAŃ:
`;

    testResults.forEach((result, index) => {
      prompt += `
${index + 1}. ${result.catalog.name}
   Opis: ${result.catalog.description}
   Data wykonania: ${result.createdAt.toLocaleDateString('pl-PL')}
   Kategorie: ${result.catalog.tags.join(', ')}
   
   Parametry:`;

      result.parameters.forEach(param => {
        const paramTemplate = result.catalog.parametersTemplate.find(
          template => template.paramId === param.paramId
        );
        const paramName = paramTemplate?.name || param.paramId;
        const unit = paramTemplate?.unit || '';
        const referenceRange = paramTemplate?.referenceRange || 'brak danych';
        
        prompt += `
   - ${paramName}: ${param.value} ${unit} (zakres referencyjny: ${referenceRange})`;
      });

      prompt += '\n';
    });

    prompt += `
Przeanalizuj powyższe wyniki badań i wygeneruj kompleksowy raport zdrowotny zgodny z podaną strukturą HTML.`;

    return prompt;
  }

  private wrapInArticleTags(content: string): string {
    return `<article>\n${content}\n</article>`;
  }
}
```

## 5. Aktualizacja Report Processor

### 5.1 Rozszerzenie interfejsów

```typescript
// functions/src/report-processor.ts (aktualizacja)
import { UserProfile } from '@my-health/domain';
import { OpenRouterService, TestResultWithCatalog } from './services/openrouter.service';

// Rozszerzenie interfejsu Report
export interface Report {
  id: string;
  userId: string;
  createdAt: Timestamp | Date;
  status: ReportStatus;
  data?: {
    includedTestResultIds: string[];
    userProfile: UserProfile;
  };
  reportUrl?: string;
  errorMessage?: string;
  tokensUsed?: number;
  generationTimeMs?: number;
}
```

### 5.2 Aktualizacja funkcji processReport

```typescript
export async function processReport(
  db: Firestore,
  storage: Storage,
  fieldValueUtil: typeof FieldValue,
  reportId: string,
  userId: string,
  reportData: Report,
  openRouterApiKey: string
): Promise<void> {
  logger.info(`Processing report ${reportId} for user ${userId}`, { reportId, userId });

  const reportDocRef = db.collection('users').doc(userId).collection('reports').doc(reportId);
  const startTime = Date.now();

  try {
    // 1. Update status to PROCESSING
    await reportDocRef.update({
      status: ReportStatus.PROCESSING,
      processingDate: fieldValueUtil.serverTimestamp(),
    });

    // 2. Pobierz dane potrzebne do generowania raportu
    const reportInput = await gatherReportData(db, userId, reportData.data);
    
    // 3. Generuj raport używając OpenRouter
    const openRouterService = new OpenRouterService(openRouterApiKey);
    const htmlContent = await openRouterService.generateHealthReport(
      reportInput.userProfile,
      reportInput.testResults
    );

    logger.info(`Generated AI report for ${reportId}, length: ${htmlContent.length} characters`);

    // 4. Upload HTML to Cloud Storage
    const bucket = storage.bucket();
    const filePath = `reports/${reportId}/report.html`;
    const file = bucket.file(filePath);

    await file.save(htmlContent, {
      metadata: {
        contentType: 'text/html',
        customMetadata: {
          userId: userId,
          reportId: reportId,
          generatedAt: new Date().toISOString()
        }
      },
    });

    await file.makePublic();
    const publicUrl = file.publicUrl();

    // 5. Update Firestore with SUCCESS status
    const processingTime = Date.now() - startTime;
    await reportDocRef.update({
      status: ReportStatus.SUCCESS,
      reportUrl: publicUrl,
      processedDate: fieldValueUtil.serverTimestamp(),
      generationTimeMs: processingTime,
      errorMessage: fieldValueUtil.delete(),
    });

    logger.info(`Report ${reportId} processed successfully in ${processingTime}ms`);

  } catch (error: any) {
    logger.error(`Error processing report ${reportId}:`, error);
    
    await reportDocRef.update({
      status: ReportStatus.ERROR,
      errorMessage: error.message || 'Wystąpił nieoczekiwany błąd podczas generowania raportu.',
      errorDate: fieldValueUtil.serverTimestamp(),
      generationTimeMs: Date.now() - startTime,
    }).catch(updateError => {
      logger.error(`Failed to update report ${reportId} with error status:`, updateError);
    });
  }
}
```

## 6. Funkcja pomocnicza do zbierania danych

```typescript
async function gatherReportData(
  db: Firestore,
  userId: string,
  reportRequestData?: { includedTestResultIds: string[]; userProfile: UserProfile }
): Promise<{
  userProfile: UserProfile;
  testResults: TestResultWithCatalog[];
}> {
  if (!reportRequestData) {
    throw new Error('Missing report request data');
  }

  // Pobierz katalog badań
  const catalogSnapshot = await db.collection('testCatalog').get();
  const testCatalogMap = new Map<string, TestCatalog>();
  
  catalogSnapshot.docs.forEach(doc => {
    const catalog = doc.data() as TestCatalog;
    testCatalogMap.set(catalog.testId, catalog);
  });

  // Pobierz wyniki badań
  const testResults: TestResultWithCatalog[] = [];
  const resultsCollection = db.collection('users').doc(userId).collection('testResults');
  
  for (const resultId of reportRequestData.includedTestResultIds) {
    const resultDoc = await resultsCollection.doc(resultId).get();
    
    if (resultDoc.exists) {
      const testResult = { id: resultDoc.id, ...resultDoc.data() } as TestResult;
      const catalog = testCatalogMap.get(testResult.testId);
      
      if (catalog) {
        testResults.push({
          ...testResult,
          catalog
        });
      } else {
        logger.warn(`Catalog not found for test ID: ${testResult.testId}`);
      }
    }
  }

  if (testResults.length === 0) {
    throw new Error('No valid test results found for report generation');
  }

  return {
    userProfile: reportRequestData.userProfile,
    testResults
  };
}
```

## 7. Obsługa błędów

```typescript
// functions/src/services/openrouter.service.ts (rozszerzenie)
export class OpenRouterService {
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 sekunda

  async generateHealthReportWithRetry(
    userProfile: UserProfile,
    testResults: TestResultWithCatalog[]
  ): Promise<string> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.generateHealthReport(userProfile, testResults);
      } catch (error) {
        lastError = error as Error;
        logger.warn(`OpenRouter attempt ${attempt} failed:`, error);

        if (attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Failed to generate report after ${this.maxRetries} attempts: ${lastError.message}`);
  }

  private async callOpenRouter(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://my-health-app.com',
        'X-Title': '10xHealth Report Generator'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      switch (response.status) {
        case 401:
          throw new Error('Nieprawidłowy klucz API OpenRouter');
        case 429:
          throw new Error('Przekroczono limit żądań API - spróbuj ponownie później');
        case 500:
        case 502:
        case 503:
          throw new Error('Tymczasowy problem z usługą OpenRouter - spróbuj ponownie');
        default:
          throw new Error(`Błąd API OpenRouter: ${response.status} - ${errorText}`);
      }
    }

    return response.json();
  }
}
```

## 8. Testowanie lokalne

### 8.1 Podstawowe testy

```typescript
// functions/src/services/__tests__/openrouter.service.test.ts
import { OpenRouterService } from '../openrouter.service';

describe('OpenRouterService', () => {
  let service: OpenRouterService;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    service = new OpenRouterService(mockApiKey);
  });

  describe('generateHealthReport', () => {
    it('should generate valid HTML report', async () => {
      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: '<h1>Test Report</h1><p>Test content</p>'
            }
          }],
          usage: {
            total_tokens: 500
          }
        })
      });

      const result = await service.generateHealthReport(mockUserProfile, mockTestResults);

      expect(result).toContain('<article>');
      expect(result).toContain('</article>');
      expect(result).toContain('<h1>Test Report</h1>');
    });
  });
});
```

## 9. Uruchomienie lokalne

### 9.1 Konfiguracja środowiska

```bash
# 1. Skonfiguruj klucz API w .secret.local
echo "OPENROUTER_API_KEY=sk-or-v1-your-actual-key" >> apps/my-health-firebase-app/environment/.secret.local

# 2. Uruchom emulator Firebase
firebase emulators:start
```

### 9.2 Testowanie funkcjonalności

```bash
# Emulator będzie dostępny na:
# - Firestore: http://localhost:8080
# - Functions: http://localhost:5001
# - Storage: http://localhost:9199
```

## 10. Kroki implementacji

### Krok 1: Przygotowanie środowiska
1. Skonfiguruj OpenRouter API key w `.secret.local`
2. Upewnij się, że emulator Firebase działa

### Krok 2: Implementacja OpenRouter Service
1. Utwórz pliki `openrouter.types.ts` i `openrouter.service.ts`
2. Zaimplementuj podstawową funkcjonalność generowania raportów

### Krok 3: Aktualizacja Report Processor
1. Zaktualizuj `report-processor.ts`
2. Dodaj funkcję `gatherReportData`
3. Integruj z OpenRouter Service

### Krok 4: Testowanie
1. Napisz podstawowe testy jednostkowe
2. Przetestuj end-to-end w emulatorze
3. Sprawdź generowane raporty HTML

## 11. Checklist implementacji

- [ ] OpenRouter API key skonfigurowany w `.secret.local`
- [ ] Pliki `openrouter.types.ts` i `openrouter.service.ts` utworzone
- [ ] `report-processor.ts` zaktualizowany
- [ ] Funkcja `gatherReportData` zaimplementowana
- [ ] Podstawowe testy napisane
- [ ] Testowanie end-to-end w emulatorze zakończone sukcesem
- [ ] Wygenerowane raporty HTML są poprawne i czytelne

---

Ten uproszczony plan skupia się wyłącznie na lokalnej implementacji z emulatorem Firebase Functions, bez zbędnych komplikacji związanych z wdrożeniami produkcyjnymi. 