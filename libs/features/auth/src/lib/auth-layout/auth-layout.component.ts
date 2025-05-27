import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Needed for <router-outlet>

@Component({
  selector: 'lib-auth-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './auth-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {}