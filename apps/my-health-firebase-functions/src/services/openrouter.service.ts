import * as logger from 'firebase-functions/logger';
import { UserProfile, TestCatalog } from '@my-health/domain';
import { OpenRouterRequest, OpenRouterResponse, TestResultWithCatalog } from './openrouter.types';

export class OpenRouterService {
  private readonly baseUrl = 'https://openrouter.ai/api/v1';
  private readonly defaultModel = 'anthropic/claude-3.5-sonnet';
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 sekunda

  constructor(private readonly apiKey: string) {}

  async generateHealthReport(
    userProfile: UserProfile,
    testResults: TestResultWithCatalog[]
  ): Promise<string> {
    return this.generateHealthReportWithRetry(userProfile, testResults);
  }

  private async generateHealthReportWithRetry(
    userProfile: UserProfile,
    testResults: TestResultWithCatalog[]
  ): Promise<string> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.generateHealthReportAttempt(userProfile, testResults);
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

  private async generateHealthReportAttempt(
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
`;

    if (testResults.length === 0) {
      prompt += `
WYNIKI BADAŃ:
Brak dostępnych wyników badań laboratoryjnych.

ZADANIE:
Wygeneruj ogólny raport zdrowotny dla osoby w wieku ${age} lat (${sexLabel}) bez analizy konkretnych wyników badań. 
Skup się na:
- Ogólnych zaleceniach profilaktycznych dla tej grupy wiekowej i płci
- Sugestiach badań, które warto wykonać w tym wieku
- Podstawowych poradach dotyczących zdrowego stylu życia
- Informacji o tym, jakie objawy wymagają konsultacji lekarskiej

Strukturyzuj odpowiedź zgodnie z podaną strukturą HTML.`;
    } else {
      prompt += `
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
            template => template.id === param.paramId
          );
          const paramName = paramTemplate?.paramName || param.paramId;
          const unit = paramTemplate?.unit || '';
          const referenceRange = 'brak danych'; // ParameterTemplate nie ma referenceRange
          
          prompt += `
   - ${paramName}: ${param.value} ${unit} (zakres referencyjny: ${referenceRange})`;
        });

        prompt += '\n';
      });

      prompt += `
Przeanalizuj powyższe wyniki badań i wygeneruj kompleksowy raport zdrowotny zgodny z podaną strukturą HTML.`;
    }

    return prompt;
  }

  private wrapInArticleTags(content: string): string {
    return `<article>\n${content}\n</article>`;
  }
} 