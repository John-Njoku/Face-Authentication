// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


// Your existing project's Firebase configuration for the new app
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBBW3uYWnESTNUPI6CocIUUt-OV3pYBo_0",
    authDomain: "face-authentication-2428e.firebaseapp.com",
    projectId: "face-authentication-2428e",
    storageBucket: "face-authentication-2428e.appspot.com",
    messagingSenderId: "769217507094",
    appId: "1:769217507094:web:5638f04d083e1a388a2a37"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firestore and get a reference to the service (optional)
const db = getFirestore(app);

export { auth, db };
