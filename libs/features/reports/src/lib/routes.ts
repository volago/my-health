import { Route } from '@angular/router';
import { ReportsPageComponent } from './reports-page/reports-page.component';

export const REPORTS_ROUTES: Route[] = [
  {
    path: '',
    component: ReportsPageComponent,
    children: [
      {
        path: ':reportId',
        component: ReportsPageComponent, // Ten sam komponent dla widoku listy i szczegółów
      }
    ]
  },
]; 