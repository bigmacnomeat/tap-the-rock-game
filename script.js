// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
let userPublicKey = null;

// Function to connect Phantom Wallet and store data in Firestore
async function connectPhantom() {
    if (window.solana && window.solana.isPhantom) {
        try {
            await window.solana.connect();
            userPublicKey = window.solana.publicKey.toString();
            document.getElementById("message").innerText = `Connected: ${userPublicKey}`;

            const userDoc = await getDoc(doc(db, "leaderboard", userPublicKey));
            if (userDoc.exists()) {
                clickCount = userDoc.data().clicks;
            } else {
                clickCount = 0;
                await setDoc(doc(db, "leaderboard", userPublicKey), {
                    walletAddress: userPublicKey,
                    clicks: clickCount
                });
            }
            document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;
            document.getElementById("login-button").style.display = "none";
            fetchLeaderboard();
        } catch (error) {
            console.error("Failed to connect:", error);
        }
    } else {
        alert("Phantom wallet not found. Please install Phantom to connect.");
    }
}

// Function to increment and save click count
async function updateClicks() {
    if (userPublicKey) {
        clickCount++;
        document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;

        try {
            await setDoc(doc(db, "leaderboard", userPublicKey), {
                walletAddress: userPublicKey,
                clicks: clickCount
            }, { merge: true });
        } catch (error) {
            console.error("Error updating clicks:", error);
        }
    } else {
        alert("Please connect your wallet first.");
    }
}

// Function to fetch and display leaderboard from Firestore
async function fetchLeaderboard() {
    try {
        const querySnapshot = await getDocs(collection(db, "leaderboard"));
        const leaderboard = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            leaderboard.push({ walletAddress: data.walletAddress, clicks: data.clicks });
        });

        leaderboard.sort((a, b) => b.clicks - a.clicks);
        
        const leaderboardElement = document.getElementById("leaderboard");
        leaderboardElement.innerHTML = '';
        leaderboard.forEach((user, index) => {
            const listItem = document.createElement("li");
            listItem.innerText = `${index + 1}. Wallet: ${user.walletAddress} - Clicks: ${user.clicks}`;
            leaderboardElement.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
    }
}

// Function to display countdown
async function displayCountdown() {
    try {
        // Fetch countdown document from Firestore
        const countdownDoc = await getDoc(doc(db, "countdowns", "mainCountdown"));
        
        if (countdownDoc.exists()) {
            const countdownEnd = countdownDoc.data().endTime.toDate(); // Convert Firestore timestamp to Date
            updateCountdown(countdownEnd); // Start countdown display
        } else {
            console.error("No countdown data found.");
        }
    } catch (error) {
        console.error("Error fetching countdown data:", error);
    }
}

// Helper function to update countdown every second
function updateCountdown(endTime) {
    const countdownElement = document.getElementById("countdown-display");
    
    setInterval(() => {
        const now = new Date();
        const timeRemaining = endTime - now;

        if (timeRemaining > 0) {
            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            countdownElement.innerText = `Countdown: ${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
            countdownElement.innerText = "Countdown: Time's up!";
        }
    }, 1000);
}

// Event listeners
document.getElementById("rock").addEventListener("click", updateClicks);
document.getElementById("login-button").addEventListener("click", connectPhantom);

// Load leaderboard and countdown on page load
window.onload = () => {
    fetchLeaderboard();
    displayCountdown(); // Initialize countdown display
};
