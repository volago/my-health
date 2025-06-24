import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Test } from '@my-health/domain'; // Assuming @my-health/domain is the correct path
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CatalogDataService {
  private readonly firestore = inject(Firestore);

  getTestsCatalog(): Observable<Test[]> {
    const testsCollection = collection(this.firestore, 'tests-catalog');
    // The plan specifies using { idField: 'id' } which maps the document ID to the 'id' field.
    // This is appropriate if 'id' in your model is meant to hold the Firestore document ID.
    return collectionData(testsCollection, { idField: 'id' }) as Observable<Test[]>;
  }
} 