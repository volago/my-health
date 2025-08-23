import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-results-list-page',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './results-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsListPageComponent {
  
  constructor(private router: Router) {}

  /**
   * Navigates to add results page
   */
  navigateToAdd(): void {
    this.router.navigate(['/results/add']);
  }

  /**
   * Navigates back to dashboard
   */
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
