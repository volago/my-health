import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'catalog',
    loadChildren: () => import('@my-health/features/catalog').then(m => m.CATALOG_ROUTES)
  },
  {
    path: 'auth',
    loadChildren: () => import('@my-health/features/auth').then(m => m.AUTH_ROUTES)
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' }
];
