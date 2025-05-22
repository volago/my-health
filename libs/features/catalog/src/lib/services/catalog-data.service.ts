import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { TestCatalog } from '@my-health/domain'; // Assuming @my-health/domain is the correct path

@Injectable({
  providedIn: 'root'
})
export class CatalogDataService {
  private readonly firestore = inject(Firestore);

  getTestsCatalog(): Observable<TestCatalog[]> {
    const testsCollection = collection(this.firestore, 'tests-catalog');
    // The plan specifies using { idField: 'testId' } which maps the document ID to the 'testId' field.
    // This is appropriate if 'testId' in your model is meant to hold the Firestore document ID.
    return collectionData(testsCollection, { idField: 'testId' }) as Observable<TestCatalog[]>;
  }
} 