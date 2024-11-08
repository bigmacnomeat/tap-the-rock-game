// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration for your project
const firebaseConfig = {
    apiKey: "AIzaSyDscMKsp0HDin4CaNNjGL-XJ_LhWIUUTGE",
    authDomain: "miners-f274c.firebaseapp.com",
    projectId: "miners-f274c",
    storageBucket: "miners-f274c.appspot.com",
    messagingSenderId: "327650804954",
    appId: "1:327650804954:web:97225d969e840338e991e3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variables for tracking clicks and letters
let clickCount = 0;
let letterSequence = ["E", "N", "I", "E"];
let currentLetterIndex = 0;

// Function to update clicks, save to Firestore, and reveal letters every 1000 clicks
async function updateClicks() {
    clickCount++;
    document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;

    if (clickCount % 1000 === 0 && currentLetterIndex < letterSequence.length) {
        const letter = letterSequence[currentLetterIndex];
        document.getElementById("message").innerText = `Congratulations! You've unlocked: ${letter}`;
        currentLetterIndex++;
    }

    try {
        // Update the user's click count in Firestore
        await updateDoc(doc(db, "leaderboard", "user_id"), {
            clicks: clickCount
        });
    } catch (err) {
        console.error("Error updating clicks in Firestore:", err);
    }
}

// Function to connect to Phantom Wallet
async function connectPhantom() {
    if (window.solana && window.solana.isPhantom) {
        try {
            await window.solana.connect();
            const publicKey = window.solana.publicKey.toString();
            console.log("Connected with public key:", publicKey);
            document.getElementById("message").innerText = `Connected with Phantom wallet: ${publicKey}`;
            document.getElementById("login-button").style.display = "none";
            
            // Create a Firestore document for the user
            await addDoc(collection(db, "leaderboard"), {
                walletAddress: publicKey,
                clicks: clickCount
            });
        } catch (err) {
            console.error("Failed to connect:", err);
        }
    } else {
        alert("Phantom wallet not found. Please install Phantom to connect.");
    }
}

// Event listeners
document.getElementById("rock").addEventListener("click", updateClicks);
document.getElementById("login-button").addEventListener("click", connectPhantom);
