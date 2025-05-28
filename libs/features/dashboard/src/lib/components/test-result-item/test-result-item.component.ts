import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { TestResultItemData } from '../../dashboard.models';

@Component({
  selector: 'lib-test-result-item',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './test-result-item.component.html',
  styleUrls: ['./test-result-item.component.scss']
})
export class TestResultItemComponent {
  item = input.required<TestResultItemData>();
} 