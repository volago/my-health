import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
// Załóżmy, że AuthService istnieje i jest eksportowany z odpowiedniego miejsca
// import { AuthService } from '@my-health/auth'; // Przykładowa ścieżka, dostosuj w razie potrzeby

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

  // private authService = inject(AuthService); // Odkomentuj i dostosuj, gdy AuthService będzie gotowy
  private router = inject(Router);

  // Dostęp do informacji o użytkowniku, np. czy jest zalogowany
  // isLoggedIn$ = this.authService.isLoggedIn$; // Przykładowe użycie, jeśli AuthService dostarcza Observable
  // userName$ = this.authService.currentUser$.pipe(map(user => user?.displayName || 'Gość')); // Przykładowe

  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }

  async logout(): Promise<void> {
    try {
      // await this.authService.logout(); // Odkomentuj, gdy AuthService będzie gotowy
      // console.log('Wylogowano pomyślnie');
      await this.router.navigate(['/auth/login']); // Przekierowanie po wylogowaniu
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);
      // Można dodać obsługę błędów, np. wyświetlenie powiadomienia
    }
  }
} 