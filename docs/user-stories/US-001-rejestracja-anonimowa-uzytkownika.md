# US-001: Rejestracja anonimowa użytkownika

## Opis
Jako nowy użytkownik chcę się zarejestrować z losowym loginem i hasłem, aby zachować anonimowość.

## Kryteria akceptacji
- możliwe jest wygenerowanie unikalnego identyfikatora
- użytkownik może ponownie wygenerować identyfikator, jeśli obecny mu się nie podoba
- użytkownik podaje tylko hasło, które jest zapamiętywane w Firebase Auth
- użytkownik podaje także rok urodzenia, płeć i wybrany pakiet szczegółowości badań
- użytkownik dostaje jasne informacje o celu zbierania tych danych i odpowiedzi na pytania o cel używania aplikacji
- użytkownik ma jasno komunikowane, że musi zapisać lub zapamiętać identyfikator i hasło, bo nie ma możliwości ich odzyskania z powodu nie wprowadzania e-maila
- po rejestracji użytkownik trafia na stronę dashboardu 