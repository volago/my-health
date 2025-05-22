import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogStore } from '../state/catalog.store';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // For potential skeleton/loading
import { TestCatalog } from '@my-health/domain'; // For type usage in template if needed, though store provides typed signals
import { TestListItemComponent } from '../test-list-item/test-list-item.component';

@Component({
  selector: 'my-health-test-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    TestListItemComponent
  ],
  templateUrl: './test-list.component.html',
  styleUrls: ['./test-list.component.css']
})
export class TestListComponent {
  protected readonly store = inject(CatalogStore);

  // No inputs needed as data comes from the store:
  // tests = this.store.filteredTests;
  // isLoading = this.store.isLoading;
} 