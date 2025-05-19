const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
// Make sure to use a service account key or other credentials if running outside an emulated environment
// For emulators, initializing without arguments often works if GOOGLE_APPLICATION_CREDENTIALS is not set.
// However, to be explicit for emulator usage and avoid potential conflicts:
admin.initializeApp({
  projectId: 'demo-my-health-emulator', // Using a common placeholder for emulators
});

const db = admin.firestore();

// Explicitly point the Firestore client to the emulator
// This is more reliable than relying solely on the environment variable
db.settings({
  host: 'localhost:8080',
  ssl: false
});

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