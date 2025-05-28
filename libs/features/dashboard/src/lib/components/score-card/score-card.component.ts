import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ScoreCardData } from '../../dashboard.models';

@Component({
  selector: 'lib-score-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './score-card.component.html',
  styleUrls: ['./score-card.component.scss']
})
export class ScoreCardComponent {
  data = input.required<ScoreCardData>();

  cardClasses = computed(() => {
    const color = this.data().color;
    // Klasy Tailwind dla tła i ramki karty
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-300';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-300';
      case 'red':
        return 'bg-red-50 border-red-300';
      case 'grey':
      default:
        return 'bg-gray-50 border-gray-300';
    }
  });

  valueClasses = computed(() => {
    const color = this.data().color;
    // Klasy Tailwind dla koloru tekstu wartości
    switch (color) {
      case 'green':
        return 'text-green-700';
      case 'yellow':
        return 'text-yellow-700';
      case 'red':
        return 'text-red-700';
      case 'grey':
      default:
        return 'text-gray-700';
    }
  });

  titleClasses = computed(() => {
    const color = this.data().color;
        // Klasy Tailwind dla koloru tekstu tytułu
    switch (color) {
      case 'green':
        return 'text-green-800';
      case 'yellow':
        return 'text-yellow-800';
      case 'red':
        return 'text-red-800';
      case 'grey':
      default:
        return 'text-gray-800';
    }
  });
} 