import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'lib-results',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './results.component.html',
})
export class ResultsComponent {}
