import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule, MatChipListboxChange } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TestTag } from '@my-health/domain';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CatalogStore } from '../state/catalog.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'my-health-search-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './search-filter-bar.component.html',
  styleUrls: ['./search-filter-bar.component.css']
})
export class SearchFilterBarComponent {
  private readonly store = inject(CatalogStore);

  // Read availableTags directly from the store
  readonly availableTags = this.store.availableTags;

  // Internal state for the search form control, initialized from store
  searchControl = new FormControl(this.store.searchTerm(), { nonNullable: true });

  // Internal signal for selected tags, initialized from store and for mat-chip-listbox
  // This ensures the chip list reflects the store state on init and updates it on change.
  selectedTagsSignal = signal<TestTag[]>(this.store.selectedTags());

  constructor() {
    // Sync searchControl with store changes and emit to store
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(term => {
      this.store.setSearchTerm(term);
    });

    // Effect to update local selectedTagsSignal if store changes externally (e.g., hydration, devtools)
    effect(() => {
      this.selectedTagsSignal.set(this.store.selectedTags());
    });
    
    // Effect to update searchControl if store changes externally (e.g. hydration, devtools)
    effect(() => {
      if (this.searchControl.value !== this.store.searchTerm()) {
        this.searchControl.setValue(this.store.searchTerm(), { emitEvent: false });
      }
    });
  }

  // Called when chip selection changes from the template
  onTagSelectionChange(event: MatChipListboxChange): void {
    const newSelectedTags = Array.isArray(event.value) ? event.value : (event.value ? [event.value] : []);
    this.store.setSelectedTags(newSelectedTags as TestTag[]);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }
} 