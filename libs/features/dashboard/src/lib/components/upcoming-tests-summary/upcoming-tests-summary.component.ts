import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UpcomingTestMockData } from '../../dashboard.models';

@Component({
  selector: 'lib-upcoming-tests-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './upcoming-tests-summary.component.html',
  styleUrls: ['./upcoming-tests-summary.component.scss']
})
export class UpcomingTestsSummaryComponent {
  upcomingTests = input.required<UpcomingTestMockData[]>();
} 