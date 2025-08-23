import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-add-result-page',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './add-result-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddResultPageComponent {
  
  constructor(private router: Router) {}

  /**
   * Navigates back to dashboard
   */
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
