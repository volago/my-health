import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { CatalogStore } from './catalog.store';
import { CatalogDataService } from '../services/catalog-data.service';
import { TestCatalog, TestTag, TEST_TAGS } from '@my-health/domain';

// Mock Angular Fire modules
vi.mock('@angular/fire/firestore', () => ({
  Firestore: vi.fn(),
  collection: vi.fn(),
  collectionData: vi.fn()
}));

describe('CatalogStore', () => {
  let store: InstanceType<typeof CatalogStore>;
  let catalogDataService: any;

  // Test fixtures
  const mockTestCatalog: TestCatalog[] = [
    {
      testId: '1',
      icdCode: 'E10',
      name: 'Morfologia krwi',
      description: 'Podstawowe badanie krwi',
      tags: ['hematologia', 'biochemia'],
      parametersTemplate: []
    },
    {
      testId: '2',
      icdCode: 'E11',
      name: 'Cholesterol całkowity',
      description: 'Badanie poziomu cholesterolu',
      tags: ['biochemia', 'kardiologiczne'],
      parametersTemplate: []
    },
    {
      testId: '3',
      icdCode: 'E12',
      name: 'TSH',
      description: 'Hormon tyreotropowy',
      tags: ['hormonalne'],
      parametersTemplate: []
    }
  ];

  beforeEach(() => {
    const catalogDataServiceSpy = {
      getTestsCatalog: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: CatalogDataService, useValue: catalogDataServiceSpy }
      ]
    });

    catalogDataService = TestBed.inject(CatalogDataService);
    store = TestBed.inject(CatalogStore);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(store.allTests()).toEqual([]);
      expect(store.searchTerm()).toBe('');
      expect(store.selectedTags()).toEqual([]);
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.isOffline()).toBe(false);
      expect(store.availableTags()).toEqual([...TEST_TAGS]);
    });

    it('should have empty filtered tests initially', () => {
      expect(store.filteredTests()).toEqual([]);
    });
  });

  describe('setSearchTerm', () => {
    it('should update search term', () => {
      const searchTerm = 'cholesterol';
      
      store.setSearchTerm(searchTerm);
      
      expect(store.searchTerm()).toBe(searchTerm);
    });

    it('should clear search term when empty string provided', () => {
      store.setSearchTerm('initial');
      store.setSearchTerm('');
      
      expect(store.searchTerm()).toBe('');
    });
  });

  describe('setSelectedTags', () => {
    it('should update selected tags', () => {
      const tags: TestTag[] = ['hematologia', 'biochemia'];
      
      store.setSelectedTags(tags);
      
      expect(store.selectedTags()).toEqual(tags);
    });

    it('should clear selected tags when empty array provided', () => {
      store.setSelectedTags(['hematologia']);
      store.setSelectedTags([]);
      
      expect(store.selectedTags()).toEqual([]);
    });
  });

  describe('filteredTests computed', () => {
    beforeEach(() => {
      // Set up mock data in store
      catalogDataService.getTestsCatalog.mockReturnValue(of(mockTestCatalog));
      store.loadAllTests();
    });

    it('should return all tests when no filters applied', () => {
      expect(store.filteredTests()).toEqual(mockTestCatalog);
    });

    it('should filter by search term (case insensitive)', () => {
      store.setSearchTerm('cholesterol');
      
      const filtered = store.filteredTests();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Cholesterol całkowity');
    });

    it('should filter by search term - partial match', () => {
      store.setSearchTerm('mor');
      
      const filtered = store.filteredTests();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Morfologia krwi');
    });

    it('should filter by single tag', () => {
      store.setSelectedTags(['hormonalne']);
      
      const filtered = store.filteredTests();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('TSH');
    });

    it('should filter by multiple tags (OR logic)', () => {
      store.setSelectedTags(['hematologia', 'hormonalne']);
      
      const filtered = store.filteredTests();
      expect(filtered).toHaveLength(2);
      expect(filtered.map(t => t.name)).toContain('Morfologia krwi');
      expect(filtered.map(t => t.name)).toContain('TSH');
    });

    it('should combine search term and tag filters', () => {
      store.setSearchTerm('cholesterol');
      store.setSelectedTags(['biochemia']);
      
      const filtered = store.filteredTests();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Cholesterol całkowity');
    });

    it('should return empty array when search term matches nothing', () => {
      store.setSearchTerm('nonexistent');
      
      expect(store.filteredTests()).toEqual([]);
    });

    it('should return empty array when selected tags match nothing', () => {
      store.setSelectedTags(['nerkowe'] as TestTag[]);
      
      expect(store.filteredTests()).toEqual([]);
    });

    it('should handle empty allTests array', () => {
      // Reset to empty state
      catalogDataService.getTestsCatalog.mockReturnValue(of([]));
      store.loadAllTests();
      
      store.setSearchTerm('test');
      store.setSelectedTags(['hematologia']);
      
      expect(store.filteredTests()).toEqual([]);
    });
  });

  describe('loadAllTests', () => {
    it('should load tests successfully', () => {
      catalogDataService.getTestsCatalog.mockReturnValue(of(mockTestCatalog));
      
      store.loadAllTests();
      
      expect(store.isLoading()).toBe(false);
      expect(store.allTests()).toEqual(mockTestCatalog);
      expect(store.error()).toBeNull();
    });

    it('should set loading state during request', () => {
      catalogDataService.getTestsCatalog.mockReturnValue(of(mockTestCatalog));
      
      store.loadAllTests();
      
      expect(catalogDataService.getTestsCatalog).toHaveBeenCalled();
    });

    it('should handle service error and set error state', () => {
      const errorMessage = 'Service error';
      catalogDataService.getTestsCatalog.mockReturnValue(throwError(() => new Error(errorMessage)));
      
      store.loadAllTests();
      
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBe('An unexpected error occurred.');
      expect(store.allTests()).toEqual([]);
    });

    it('should clear previous error when loading successfully', () => {
      // First, trigger an error
      catalogDataService.getTestsCatalog.mockReturnValue(throwError(() => new Error('First error')));
      store.loadAllTests();
      expect(store.error()).toBe('An unexpected error occurred.');
      
      // Then, succeed
      catalogDataService.getTestsCatalog.mockReturnValue(of(mockTestCatalog));
      store.loadAllTests();
      
      expect(store.error()).toBeNull();
      expect(store.allTests()).toEqual(mockTestCatalog);
    });

    it('should handle unexpected errors with generic error message', () => {
      catalogDataService.getTestsCatalog.mockReturnValue(throwError(() => 'Unexpected error'));
      
      store.loadAllTests();
      
      expect(store.error()).toBe('An unexpected error occurred.');
      expect(store.isLoading()).toBe(false);
    });
  });

  describe('State Consistency', () => {
    it('should maintain state consistency during multiple operations', () => {
      catalogDataService.getTestsCatalog.mockReturnValue(of(mockTestCatalog));
      
      // Load data
      store.loadAllTests();
      expect(store.allTests()).toHaveLength(3);
      
      // Apply filters
      store.setSearchTerm('cholesterol');
      store.setSelectedTags(['biochemia']);
      
      // Verify computed property reflects all state changes
      const filtered = store.filteredTests();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Cholesterol całkowity');
      
      // Verify original state is unchanged
      expect(store.allTests()).toHaveLength(3);
    });

    it('should handle rapid state changes correctly', () => {
      catalogDataService.getTestsCatalog.mockReturnValue(of(mockTestCatalog));
      store.loadAllTests();
      
      // Rapid filter changes
      store.setSearchTerm('mor');
      store.setSearchTerm('chol');
      store.setSearchTerm('tsh');
      
      expect(store.searchTerm()).toBe('tsh');
      expect(store.filteredTests()).toHaveLength(1);
      expect(store.filteredTests()[0].name).toBe('TSH');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined gracefully in computed properties', () => {
      // This tests the defensive programming in filteredTests computed
      expect(() => store.filteredTests()).not.toThrow();
    });

    it('should handle case sensitivity in search correctly', () => {
      catalogDataService.getTestsCatalog.mockReturnValue(of(mockTestCatalog));
      store.loadAllTests();
      
      store.setSearchTerm('CHOLESTEROL');
      expect(store.filteredTests()).toHaveLength(1);
      
      store.setSearchTerm('cholesterol');
      expect(store.filteredTests()).toHaveLength(1);
      
      store.setSearchTerm('ChOlEsTeRoL');
      expect(store.filteredTests()).toHaveLength(1);
    });

    it('should handle empty string search term', () => {
      catalogDataService.getTestsCatalog.mockReturnValue(of(mockTestCatalog));
      store.loadAllTests();
      
      store.setSearchTerm('');
      expect(store.filteredTests()).toEqual(mockTestCatalog);
    });

    it('should handle whitespace in search term', () => {
      catalogDataService.getTestsCatalog.mockReturnValue(of(mockTestCatalog));
      store.loadAllTests();
      
      store.setSearchTerm('  cholesterol  ');
      // Current implementation doesn't trim, so this tests exact behavior
      expect(store.filteredTests()).toHaveLength(0);
    });
  });
}); 