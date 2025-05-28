import { Route } from '@angular/router';
import { DashboardViewComponent } from './dashboard-view.component';

export const DASHBOARD_ROUTES: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    component: DashboardViewComponent
  },
]; 