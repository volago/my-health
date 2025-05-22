import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogStore } from './state/catalog.store';
import { SearchFilterBarComponent } from './search-filter-bar/search-filter-bar.component';
import { TestListComponent } from './test-list/test-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'my-health-catalog-page',
  standalone: true,
  imports: [
    CommonModule,
    SearchFilterBarComponent,
    TestListComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './catalog-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPageComponent implements OnInit {
  protected readonly store = inject(CatalogStore);

  ngOnInit(): void {
    this.store.loadAllTests();
  }

  // Logic for isOffline would be more complex, e.g., listening to window online/offline events
  // and a service worker status. For now, it's a placeholder in the store.
} 