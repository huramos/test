import admin from 'firebase-admin';
import path from 'path';
import { envConfig } from './env.config';

// Initialize Firebase Admin
// You can use either a service account JSON file or environment variables

const initializeFirebase = () => {
  // Option 1: Using service account JSON file (recommended for production)
  if (envConfig.firebase.serviceAccountPath) {
    // Resolve path relative to project root (backend folder)
    const absolutePath = path.resolve(process.cwd(), envConfig.firebase.serviceAccountPath);
    const serviceAccount = require(absolutePath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: envConfig.firebase.projectId
    });
  }
  // Option 2: Using environment variables
  else if (envConfig.firebase.projectId && envConfig.firebase.clientEmail && envConfig.firebase.privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: envConfig.firebase.projectId,
        clientEmail: envConfig.firebase.clientEmail,
        privateKey: envConfig.firebase.privateKey.replace(/\\n/g, '\n')
      }),
      projectId: envConfig.firebase.projectId
    });
  }
  // Option 3: Using application default credentials (for Google Cloud environments)
  else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: envConfig.firebase.projectId
    });
  }

  console.log('🔥 Firebase Admin initialized');
};

// Initialize on import
initializeFirebase();

export const firebaseAdmin = admin;
export const firebaseAuth = admin.auth();
