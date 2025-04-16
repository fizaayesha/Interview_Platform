// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyD8vyLEoeMT9YFDtdDPdEqMGTn6i3c9QkU",
  authDomain: "interviewpanel-bb84c.firebaseapp.com",
  projectId: "interviewpanel-bb84c",
  storageBucket: "interviewpanel-bb84c.firebasestorage.app",
  messagingSenderId: "767948751708",
  appId: "1:767948751708:web:7b7f218a048ac57a54b799",
  measurementId: "G-1Z1TT6D08Y",
};

// Initialize Firebase
const app = !getApps.length ?  initializeApp(firebaseConfig) :getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

