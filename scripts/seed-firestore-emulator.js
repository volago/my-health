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

// Configuration for tests-recommendations
const recommendationsDataFilePath = path.join(__dirname, '../.ai/data/tests-recommendations.json');
const recommendationsCollectionName = 'tests-recommendations';
const recommendationsDocId = 'default'; // Fixed ID for the single recommendations document

async function seedDatabase() {
  try {
    // --- Seeding tests-catalog --- 
    const rawCatalogData = fs.readFileSync(dataFilePath, 'utf-8');
    const tests = JSON.parse(rawCatalogData);

    if (!Array.isArray(tests)) {
      console.error('Error: Data for tests-catalog is not an array. Please check the JSON file format.');
      // Decide if we should exit or continue with other collections
    } else {
      console.log(`Starting to seed collection '${collectionName}'...`);
      const catalogBatch = db.batch();
      let catalogOperationCount = 0;

      for (const test of tests) {
        if (test.testId) {
          const docRef = db.collection(collectionName).doc(test.testId);
          catalogBatch.set(docRef, test);
          catalogOperationCount++;
          console.log(`Preparing to add document to '${collectionName}' with ID: ${test.testId}`);
        } else {
          console.warn(`Skipping test item in '${collectionName}' without a testId:`, test);
        }
      }

      if (catalogOperationCount > 0) {
        await catalogBatch.commit();
        console.log(`Successfully seeded ${catalogOperationCount} documents into '${collectionName}'.`);
        // Verify tests-catalog
        try {
          console.log(`Verifying read access for '${collectionName}'...`);
          const snapshot = await db.collection(collectionName).limit(1).get();
          if (snapshot.empty) {
            console.warn(`Verification for '${collectionName}' read failed: No documents found after seeding.`);
          } else {
            console.log(`Verification for '${collectionName}' read successful.`);
          }
        } catch (readError) {
          console.error(`Error trying to read data from '${collectionName}' after seeding:`, readError);
        }
      } else {
        console.log(`No documents to seed into '${collectionName}'.`);
      }
    }

    // --- Seeding tests-recommendations --- 
    console.log(`Starting to seed document '${recommendationsDocId}' in collection '${recommendationsCollectionName}'...`);
    const rawRecommendationsData = fs.readFileSync(recommendationsDataFilePath, 'utf-8');
    const recommendations = JSON.parse(rawRecommendationsData);

    // Assuming recommendations is a single object to be stored in one document
    const recommendationsDocRef = db.collection(recommendationsCollectionName).doc(recommendationsDocId);
    await recommendationsDocRef.set(recommendations);
    console.log(`Successfully seeded document '${recommendationsDocId}' into '${recommendationsCollectionName}'.`);

    // Verify tests-recommendations
    try {
      console.log(`Verifying read access for '${recommendationsCollectionName}' (document: '${recommendationsDocId}')...`);
      const docSnap = await db.collection(recommendationsCollectionName).doc(recommendationsDocId).get();
      if (docSnap.exists) {
        console.log(`Verification for '${recommendationsCollectionName}' read successful.`);
      } else {
        console.warn(`Verification for '${recommendationsCollectionName}' read failed: Document '${recommendationsDocId}' not found.`);
      }
    } catch (readError) {
      console.error(`Error trying to read data from '${recommendationsCollectionName}' after seeding:`, readError);
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