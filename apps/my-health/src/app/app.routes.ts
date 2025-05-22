import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'catalog',
    loadChildren: () => import('@my-health/features/catalog').then(m => m.CATALOG_ROUTES)
  },
];
