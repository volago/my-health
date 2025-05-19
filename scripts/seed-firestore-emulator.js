const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Ensure FIRESTORE_EMULATOR_HOST is set for firebase-admin to auto-detect and connect
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

// Initialize Firebase Admin SDK with the SAME Project ID as the Angular app
admin.initializeApp({
  projectId: 'my-health' // Matching Angular environment.ts
});

const db = admin.firestore();
// No need for db.settings() if FIRESTORE_EMULATOR_HOST is set and projectId matches

const dataFilePath = path.join(__dirname, '../.ai/data/tests-catalog.json');
const collectionName = 'tests-catalog';

async function seedDatabase() {
  try {
    const rawData = fs.readFileSync(dataFilePath, 'utf-8');
    const tests = JSON.parse(rawData);

    if (!Array.isArray(tests)) {
      console.error('Error: Data is not an array. Please check the JSON file format.');
      process.exit(1); // Exit with an error code
      return;
    }

    console.log(`Starting to seed collection '${collectionName}'...`);

    const batch = db.batch();
    let operationCount = 0;

    for (const test of tests) {
      if (test.testId) {
        const docRef = db.collection(collectionName).doc(test.testId);
        batch.set(docRef, test);
        operationCount++;
        console.log(`Preparing to add document with ID: ${test.testId}`);
      } else {
        console.warn('Skipping test item without a testId:', test);
      }
    }

    if (operationCount > 0) {
      await batch.commit();
      console.log(`Successfully seeded ${operationCount} documents into '${collectionName}'.`);

      // Verify by fetching the first document
      try {
        console.log(`Verifying data in '${collectionName}'...`);
        const snapshot = await db.collection(collectionName).limit(1).get();
        if (snapshot.empty) {
          console.log('Verification failed: No documents found in collection after seeding.');
        } else {
          console.log('Verification successful. First document data:', snapshot.docs[0].data());
        }
      } catch (readError) {
        console.error('Error trying to read data after seeding:', readError);
      }

    } else {
      console.log('No documents to seed.');
    }

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1); // Exit with an error code
  }
}

seedDatabase().then(() => {
  console.log('Database seeding process finished.');
  // Firebase Admin SDK keeps the process alive, explicitly exit for a script
  process.exit(0); 
}).catch((err) => {
  console.error('Unhandled error in seeding process:', err);
  process.exit(1); // Exit with an error code if seedDatabase itself threw an unhandled error
}); 