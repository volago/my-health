const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Ensure FIRESTORE_EMULATOR_HOST is set for firebase-admin to auto-detect and connect
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'; // Added for Auth emulator

// Initialize Firebase Admin SDK with the SAME Project ID as the Angular app
admin.initializeApp({
  projectId: 'my-health' // Matching Angular environment.ts
});

const db = admin.firestore();
const auth = admin.auth(); // Added auth service
// No need for db.settings() if FIRESTORE_EMULATOR_HOST is set and projectId matches

const dataFilePath = path.join(__dirname, '../.ai/data/tests-catalog.json');
const collectionName = 'tests-catalog';

// Configuration for tests-recommendations
const recommendationsDataFilePath = path.join(__dirname, '../.ai/data/tests-recommendations.json');
const recommendationsCollectionName = 'tests-recommendations';
const recommendationsDocId = 'default'; // Fixed ID for the single recommendations document

async function seedUser(auth, db, { email, password, displayName, birthYear, sex, detailLevel }) {
  let userRecord;
  try {
    console.log(`Attempting to create user: ${email}`);
    userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: true, // Assuming verified for simplicity in emulator
      disabled: false,
    });
    console.log('Successfully created new user:', userRecord.uid);

    const userProfileData = {
      userId: userRecord.uid,
      createdAt: new Date(), // Using Firestore Server Timestamp might be better in prod
      lastLogin: new Date(), // Using Firestore Server Timestamp might be better in prod
      birthYear: birthYear,
      sex: sex, 
      detailLevel: detailLevel,
    };

    const userProfileRef = db.collection('user-profile').doc(userRecord.uid);
    await userProfileRef.set(userProfileData);
    console.log(`Successfully created user profile for ${userRecord.uid} in 'user-profile' collection.`);

    // Verify user profile creation
    try {
      console.log(`Verifying read access for 'user-profile' document: ${userRecord.uid}...`);
      const docSnap = await db.collection('user-profile').doc(userRecord.uid).get();
      if (docSnap.exists) {
        console.log(`Verification for 'user-profile' read successful for user ${userRecord.uid}.`);
      } else {
        console.warn(`Verification for 'user-profile' read failed: Document ${userRecord.uid} not found.`);
      }
    } catch (readError) {
      console.error(`Error trying to read data from 'user-profile' after seeding for user ${userRecord.uid}:`, readError);
    }
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.warn(`User with email ${email} already exists. Skipping user creation. Attempting to fetch existing user.`);
      try {
        userRecord = await auth.getUserByEmail(email);
        console.log('Successfully fetched existing user:', userRecord.uid);
        const userProfileRef = db.collection('user-profile').doc(userRecord.uid);
        const userProfileSnap = await userProfileRef.get();
        if (!userProfileSnap.exists) {
          console.log(`User profile for ${userRecord.uid} does not exist. Creating it now.`);
          const userProfileData = {
            userId: userRecord.uid,
            createdAt: new Date(),
            lastLogin: new Date(),
            birthYear: birthYear,
            sex: sex,
            detailLevel: detailLevel,
          };
          await userProfileRef.set(userProfileData);
          console.log(`Successfully created user profile for existing user ${userRecord.uid}.`);
        } else {
          console.log(`User profile for ${userRecord.uid} already exists. Skipping profile creation.`);
        }
      } catch (fetchError) {
        console.error('Error fetching existing user by email:', fetchError);
      }
    } else {
      console.error('Error creating user or user profile:', error);
      throw error; // Re-throw error to be caught by seedDatabase if not handled here
    }
  }
  return userRecord; // Return userRecord for potential further use
}

async function seedDatabase() {
  try {
    // --- Create User and User Profile ---
    await seedUser(auth, db, {
      email: 'john-smith-45@example.com',
      password: 'JohnJohnJohn3',
      displayName: 'john-smith-45',
      birthYear: 1980,
      sex: 'Male', // Assuming 'Male' is a valid value for your Sex enum/type
      detailLevel: 'Recommended' // Assuming 'Recommended' is a valid value for DetailLevel
    });
    // --- End Create User and User Profile ---

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