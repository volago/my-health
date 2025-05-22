import { computed, inject } from '@angular/core';
import { TestCatalog, TestTag, TEST_TAGS } from '@my-health/domain';
import { EMPTY, catchError, switchMap, tap } from 'rxjs';
import { CatalogDataService } from '../services/catalog-data.service';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

export interface CatalogState {
  allTests: TestCatalog[];
  searchTerm: string;
  selectedTags: TestTag[];
  isLoading: boolean;
  error: string | null;
  isOffline: boolean; // Placeholder
  readonly availableTags: TestTag[];
}

const initialState: CatalogState = {
  allTests: [],
  searchTerm: '',
  selectedTags: [],
  isLoading: false,
  error: null,
  isOffline: false,
  availableTags: [...TEST_TAGS],
};

export const CatalogStore = signalStore(
  { providedIn: 'root' }, 
  withState(initialState),
  withComputed(({ allTests, searchTerm, selectedTags }) => ({
    filteredTests: computed(() => {
      const tests = allTests();
      const term = searchTerm().toLowerCase();
      const tags = selectedTags();

      if (!tests) return [];
      let filtered = tests;
      if (term) {
        filtered = filtered.filter(test => test.name.toLowerCase().includes(term));
      }
      if (tags.length > 0) {
        filtered = filtered.filter(test => tags.some(tag => test.tags.includes(tag)));
      }
      return filtered;
    }),
  })),
  withMethods((store, catalogDataService = inject(CatalogDataService)) => ({
    loadAllTests: rxMethod<void>(
      switchMap(() => {
        patchState(store, { isLoading: true, error: null });
        return catalogDataService.getTestsCatalog().pipe(
          tap({
            next: (tests: TestCatalog[]) => patchState(store, { allTests: tests, isLoading: false }),
            error: (err: Error) => {
              console.error('Error loading tests catalog:', err);
              patchState(store, { error: 'Failed to load tests catalog.', isLoading: false });
            },
          }),
          catchError(() => {
            // Error is handled in tap, ensure the stream completes or returns a fallback
            patchState(store, { isLoading: false, error: 'An unexpected error occurred.' });
            return EMPTY; // Or of(undefined) / of(null) if preferred
          })
        );
      })
    ),
    setSearchTerm(searchTerm: string): void {
      patchState(store, { searchTerm });
    },
    setSelectedTags(selectedTags: TestTag[]): void {
      patchState(store, { selectedTags });
    },
  }))
);

// To trigger initial load, a component injecting the store can call loadAllTests(),
// or the store itself could have an 'onInit' hook if using a class-based store approach
// with ngrx/signals. For a functional signalStore, this is typically component-driven. 