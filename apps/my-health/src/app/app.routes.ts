import { Route } from '@angular/router';
import { redirectUnauthorizedTo, redirectLoggedInTo, AuthGuard } from '@angular/fire/auth-guard';
import { EmptyComponent } from './shared/ui/empty/empty.component';

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
    path: 'dashboard',
    loadChildren: () => import('@my-health/features/dashboard').then(m => m.DASHBOARD_ROUTES),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'reports',
    loadChildren: () => import('@my-health/features/reports').then(m => m.REPORTS_ROUTES),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'ai-reports',
    component: EmptyComponent,
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
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard' // Lub można tu dać stronę 404 chronioną guardem
  }
];
