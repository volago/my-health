import { Route } from '@angular/router';
import { ResultsComponent } from './results/results.component';

export const RESULTS_ROUTES: Route[] = [
  { 
    path: '', 
    component: ResultsComponent,
    children: [
      {
        path: 'add',
        loadComponent: () => import('./add-result-page/add-result-page.component').then(c => c.AddResultPageComponent)
      },
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadComponent: () => import('./results-list-page/results-list-page.component').then(c => c.ResultsListPageComponent)
      }
    ]
  }
];
