import { Route } from '@angular/router';
import { CatalogPageComponent } from './catalog-page.component';

export const CATALOG_ROUTES: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    component: CatalogPageComponent
  },
]; 