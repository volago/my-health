import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TestCatalog } from '@my-health/domain';

@Component({
    selector: 'my-health-test-list-item',
    standalone: true,
    imports: [
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './test-list-item.component.html',
    styleUrl: './test-list-item.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestListItemComponent {
    testItem = input.required<TestCatalog>();
} 