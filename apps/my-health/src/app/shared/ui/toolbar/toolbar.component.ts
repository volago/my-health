import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
// Załóżmy, że AuthService istnieje i jest eksportowany z odpowiedniego miejsca
import { AuthService } from '@my-health/features/auth-api'; // Changed import path

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  @Output() toggleSidenav = new EventEmitter<void>();

  private authService = inject(AuthService); // Injected AuthService
  private router = inject(Router);

  // Dostęp do informacji o użytkowniku, np. czy jest zalogowany
  isLoggedIn = this.authService.isLoggedIn; // Using the signal directly
  // userName$ = this.authService.currentUser$.pipe(map(user => user?.displayName || 'Gość')); // Przykładowe

  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout(); // Call AuthService.logout()
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);
      // Można dodać obsługę błędów, np. wyświetlenie powiadomienia
    }
  }
} 