// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration for your project
const firebaseConfig = {
    apiKey: "AIzaSyDscMKsp0HDin4CaNNjGL-XJ_LhWIUUTGE",
    authDomain: "miners-f274c.firebaseapp.com",
    projectId: "miners-f274c",
    storageBucket: "miners-f274c.firebasestorage.app",
    messagingSenderId: "327650804954",
    appId: "1:327650804954:web:97225d969e840338e991e3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variables for tracking clicks
let clickCount = 0;

// Function to connect Phantom Wallet and store data in Firestore
async function connectPhantom() {
    if (window.solana && window.solana.isPhantom) {
        try {
            await window.solana.connect();
            const publicKey = window.solana.publicKey.toString(); // Get the wallet address
            console.log("Connected with public key:", publicKey);
            document.getElementById("message").innerText = `Connected with Phantom wallet: ${publicKey}`;

            // Add document to Firestore (leaderboard collection)
            await setDoc(doc(db, "leaderboard", publicKey), {
                walletAddress: publicKey, // Use the wallet address as the document ID
                clicks: clickCount // Initialize clicks to 0
            });
            
            document.getElementById("login-button").style.display = "none"; // Hide the login button once connected

        } catch (err) {
            console.error("Failed to connect:", err);
        }
    } else {
        alert("Phantom wallet not found. Please install Phantom to connect.");
    }
}

// Function to update clicks in Firestore
async function updateClicks() {
    // Increment click count
    clickCount++;
    document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;

    // Update the user's click count in Firestore
    try {
        await setDoc(doc(db, "leaderboard", window.solana.publicKey.toString()), {
            clicks: clickCount
        }, { merge: true }); // Merge to update only the clicks field
    } catch (err) {
        console.error("Error updating clicks in Firestore:", err);
    }
}

// Event listener for the rock click
document.getElementById("rock").addEventListener("click", updateClicks);
// Event listener for the login button
document.getElementById("login-button").addEventListener("click", connectPhantom);
