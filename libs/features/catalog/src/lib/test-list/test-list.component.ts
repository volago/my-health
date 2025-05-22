import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogStore } from '../state/catalog.store';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // For potential skeleton/loading
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
  styleUrls: ['./test-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestListComponent {
  protected readonly store = inject(CatalogStore);
} 