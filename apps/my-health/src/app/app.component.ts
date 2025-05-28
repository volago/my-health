import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Firestore, doc, getDoc, collection, setDoc, serverTimestamp } from '@angular/fire/firestore';
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
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'my-health';
  firestore: Firestore = inject(Firestore);
  testDoc: any = null;
  loading = true;
  error: string | null = null;
  creatingDoc = false;
  debugInfo = '';

  ngOnInit(): void {
    // Logowanie informacji o stanie Firestore
    //console.log('Firestore instance:', this.firestore);
    try {
      const collectionRef = collection(this.firestore, 'test');
      // console.log('Collection reference created:', collectionRef);
    } catch (e) {
      // console.error('Error creating collection reference:', e);
    }
    
    // this.fetchTestDocument();
  }

  async fetchTestDocument(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      this.debugInfo = '';
      
      // console.log('Fetching document from test collection...');
      
      // Reference to the 'test' collection
      const testCollection = collection(this.firestore, 'test');
      // console.log('Collection reference:', testCollection);
      
      // Get reference to a document with ID 'first' (you may need to adjust this ID)
      const docRef = doc(testCollection, 'first');
      // console.log('Document reference:', docRef);
      
      // Get the document
      // console.log('Getting document...');
      const docSnap = await getDoc(docRef);
      // console.log('Document snapshot:', docSnap);
      
      if (docSnap.exists()) {
        this.testDoc = docSnap.data();
        // console.log('Document data:', this.testDoc);
        this.debugInfo = `Document successfully retrieved. Path: ${docRef.path}`;
      } else {
        this.error = 'No such document! The "test" collection or "first" document might not exist.';
        // console.log('No such document!');
        this.debugInfo = `Document not found. Path attempted: ${docRef.path}`;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.error = `Error fetching document: ${errorMsg}`;
      // console.error('Error fetching document:', error);
      this.debugInfo = `Error type: ${error?.constructor?.name || 'Unknown'}, Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`;
    } finally {
      this.loading = false;
    }
  }

  async createTestDocument(): Promise<void> {
    try {
      this.creatingDoc = true;
      this.error = null;
      this.debugInfo = '';
      
      // console.log('Creating test document...');
      
      // Reference to the 'test' collection and the 'first' document
      const docRef = doc(this.firestore, 'test', 'first');
      // console.log('Document reference for creation:', docRef);
      
      // Sample data to write
      const data = {
        name: 'Test Document',
        value: Math.floor(Math.random() * 100),
        createdAt: serverTimestamp(),
        isActive: true,
        testString: 'This is a test',
        testArray: [1, 2, 3],
        testObject: {
          foo: 'bar',
          baz: 123
        }
      };
      
      // console.log('Data to write:', data);
      
      // Write to Firestore
      // console.log('Writing to Firestore...');
      await setDoc(docRef, data);
      // console.log('Document successfully written!');
      this.debugInfo = `Document successfully created at path: ${docRef.path}`;
      
      // Fetch the document again to display it
      await this.fetchTestDocument();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.error = `Error creating document: ${errorMsg}`;
      // console.error('Error creating document:', error);
      this.debugInfo = `Error type: ${error?.constructor?.name || 'Unknown'}, Stack: ${error instanceof Error ? error.stack : 'No stack trace'}`;
    } finally {
      this.creatingDoc = false;
    }
  }
}
