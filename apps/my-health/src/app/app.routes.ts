import { Route } from '@angular/router';
import { redirectUnauthorizedTo, redirectLoggedInTo, AuthGuard } from '@angular/fire/auth-guard';

// Funkcja pomocnicza dla przekierowania niezalogowanych
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/auth/login']);
// Funkcja pomocnicza dla przekierowania zalogowanych z /auth do /catalog
const redirectLoggedInToCatalog = () => redirectLoggedInTo(['/catalog']);

export const appRoutes: Route[] = [
  {
    path: 'catalog',
    loadChildren: () => import('@my-health/features/catalog').then(m => m.CATALOG_ROUTES),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'auth',
    loadChildren: () => import('@my-health/features/auth').then(m => m.AUTH_ROUTES),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToCatalog }
  },
  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'catalog' // Lub można tu dać stronę 404 chronioną guardem
  }
];
