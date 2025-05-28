import { collection, Firestore, query, orderBy, limit, getDocs, Timestamp } from '@angular/fire/firestore';
import { inject, Injectable } from '@angular/core';
import { TestResult } from '../test-result.model'; // Zakładam, że ten model istnieje w ../test-result.model.ts

@Injectable({ providedIn: 'root' })
export class TestResultsService {
  private firestore = inject(Firestore);

  async fetchRecentResults(userId: string, count: number): Promise<TestResult[]> {
    const resultsCollection = collection(this.firestore, `users/${userId}/results`);
    const q = query(resultsCollection, orderBy('createdAt', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
          resultId: doc.id,
          testId: data['testId'],
          createdAt: (data['createdAt'] as Timestamp).toDate(), // Konwersja Timestamp na Date
          parameters: data['parameters'] // Zakładając, że TestResultParameter[] jest pod 'parameters'
      } as TestResult;
    });
  }
} 