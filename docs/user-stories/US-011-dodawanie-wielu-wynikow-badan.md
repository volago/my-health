# ID: US-011 – Dodawanie wielu wyników badań

## Historia użytkownika

Jako **użytkownik aplikacji**, chcę **dodać jednorazowo jeden lub więcej wyników badań – zarówno jedno- jak i wieloparametrowych – w możliwie najprostszy sposób**, aby **szybko uzupełnić swoje dane zdrowotne bez powtarzania żmudnych czynności**.

## Kryteria akceptacji

1. Dodanie jednego lub kilku wyników badań tworzy automatycznie sesję badań.
2. Domyślna data sesji badań ustawiana jest na bieżący dzień; użytkownik może ją zmienić.
3. Na dashboardzie widoczny jest pływający przycisk akcji (FAB) „Dodaj wynik” (ikona ➕) w prawym dolnym rogu.
4. Po kliknięciu przycisku użytkownik przechodzi do nowego widoku z formularzem dodawania wyników.
5. Użytkownik może wyszukać badanie z katalogu poprzez nazwę lub tag i dodać je do listy „Wyniki do wprowadzenia”.
6. Formularz obsługuje:
   - badania jednoparametrowe (np. Glukoza) – pojedyncze pole wartości,
   - badania wieloparametrowe (np. Morfologia) – pola dla każdego parametru.
7. Jednostki (np. mg/dL, %), zakresy norm oraz typy pól (liczba, tekst, lista) są podpowiadane na podstawie definicji badania.
8. Użytkownik może dodać wiele badań do sesji przed wysłaniem formularza.
9. Walidacja formularza blokuje zapis przy brakujących wymaganych polach lub wartościach poza dopuszczalnym typem.
10. Po zatwierdzeniu wszystkie podane wyniki zapisują się w Firestore wraz z datą badania, a użytkownik otrzymuje potwierdzenie (toast).
11. W przypadku błędu zapisu użytkownik otrzymuje czytelny komunikat i może ponowić próbę.
12. Użytkownik może dodać do sesji badań notatkę oraz link do wyników badań.

## Główny scenariusz

1. Użytkownik znajduje się na dashboardzie.
2. Kliknie pływający przycisk akcji (FAB) „Dodaj wynik” w prawym dolnym rogu.
3. Aplikacja przechodzi do widoku z formularzem „Dodaj wyniki badań”.
4. W polu wyszukiwania wpisuje „lipidogram”, wybiera badanie z listy sugestii i dodaje do formularza.
5. Formularz wyświetla pola: Cholesterol całkowity, LDL, HDL, non-HDL, Trójglicerydy z jednostkami „mg/dL”.
6. Użytkownik wypełnia wartości, opcjonalnie zmienia datę wykonania badania.
7. Kliknie „Dodaj kolejne badanie”, szuka „Glukoza” i dodaje.
8. Formularz dodaje pole wartości dla glukozy (mg/dL).
9. Użytkownik może dodać do sesji badań notatkę, link do wyników badań, zmienić datę badania.
10. Po uzupełnieniu danych użytkownik klika „Zapisz wszystkie wyniki”.
11. System waliduje dane i zapisuje dwa nowe dokumenty wyników w Firestore.
12. Użytkownik widzi toast „Wyniki zapisane pomyślnie” i wraca do dashboardu z odświeżonymi danymi.

## Scenariusze alternatywne

A1. Użytkownik rezygnuje – kliknięcie „Anuluj” zamyka formularz bez zapisu.

A2. Walidacja – jeśli pole zostanie pozostawione puste lub wartość jest nienumeryczna dla pola liczbowego, pod polem pojawia się komunikat o błędzie i przycisk „Zapisz” jest nieaktywny.

## Uwagi

- Projekt formularza powinien być zoptymalizowany pod urządzenia mobilne (układ kolumn 1-kolumnowy, większe pola).
- Wyszukiwarka badań korzysta z lokalnie przechowywanego katalogu badań.
- Po dodaniu wyników odpowiednie wskaźniki (HS, CS) są aktualizowane w tle.
- Jednostki i zakresy norm pobierane z definicji testu w kolekcji `testsCatalog`. 