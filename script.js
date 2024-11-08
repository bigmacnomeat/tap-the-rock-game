// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
let clickCount = localStorage.getItem('clickCount') ? parseInt(localStorage.getItem('clickCount')) : 0;

// Target time (46 days and 5 hours from now)
// Check if a stored target time exists, otherwise calculate it
const targetTime = localStorage.getItem('targetTime') ? parseInt(localStorage.getItem('targetTime')) : (new Date().getTime() + (46 * 24 * 60 * 60 * 1000) + (5 * 60 * 60 * 1000));

// Function to format time as HH:MM:SS
function formatTime(ms) {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Function to update the countdown timer
function updateCountdown() {
    const now = new Date().getTime();
    const timeRemaining = targetTime - now;

    if (timeRemaining <= 0) {
        document.getElementById("timer").innerText = "Mining Drop Available Now!";
        clearInterval(countdownInterval); // Stop the countdown
    } else {
        document.getElementById("timer").innerText = formatTime(timeRemaining);
    }
}

// Update the countdown every second
const countdownInterval = setInterval(updateCountdown, 1000);

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

// Function to update clicks in Firestore and localStorage
async function updateClicks() {
    // Increment click count
    clickCount++;
    localStorage.setItem('clickCount', clickCount); // Store the updated click count in localStorage
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

// Function to load leaderboard from Firestore
async function loadLeaderboard() {
    try {
        const querySnapshot = await getDocs(collection(db, "leaderboard"));
        const leaderboardList = document.getElementById("leaderboard-list");
        leaderboardList.innerHTML = ""; // Clear the leaderboard

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const listItem = document.createElement("div");
            listItem.innerText = `${data.walletAddress}: ${data.clicks} clicks`;
            leaderboardList.appendChild(listItem);
        });
    } catch (err) {
        console.error("Error loading leaderboard:", err);
    }
}

// Event listener for the rock click
document.getElementById("rock").addEventListener("click", updateClicks);
// Event listener for the login button
document.getElementById("login-button").addEventListener("click", connectPhantom);

// Load leaderboard when the page is loaded
loadLeaderboard();
