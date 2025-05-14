export const environment = {
    production: false,
    firebase: {
      apiKey: 'your-api-key', // Replace with a mock API key or leave as is for emulators
      authDomain: 'localhost',
      projectId: 'my-health', // Replace with your Firebase project ID or a mock one
      storageBucket: 'my-health.appspot.com', // Replace or use mock
      messagingSenderId: 'your-messaging-sender-id', // Replace or use mock
      appId: 'your-app-id', // Replace or use mock
      measurementId: 'your-measurement-id', // Replace or use mock
      // Emulator settings
      useEmulators: true,
      emulatorHosts: {
        auth: 'http://localhost:9099',
        firestore: 'http://localhost:8080',
        functions: 'http://localhost:5001',
        database: 'http://localhost:9000',
        hosting: 'http://localhost:5000',
        storage: 'http://localhost:9199',
        // pubsub: 'http://localhost:8085' // Uncomment if you use Pub/Sub emulator
      }
    },
    // Add other environment-specific variables here
  }; 