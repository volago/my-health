import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { ToolbarComponent } from './shared/ui/toolbar/toolbar.component';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatSidenavModule,
    MatListModule,
    ToolbarComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent { }
