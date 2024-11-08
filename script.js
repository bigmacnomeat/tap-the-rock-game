// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration
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
            const publicKey = window.solana.publicKey.toString();
            document.getElementById("message").innerText = `Connected with Phantom wallet: ${publicKey}`;

            const userDoc = await getDoc(doc(db, "leaderboard", publicKey));
            if (userDoc.exists()) {
                clickCount = userDoc.data().clicks;
                document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;
            } else {
                clickCount = 0;
                document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;
                await setDoc(doc(db, "leaderboard", publicKey), { walletAddress: publicKey, clicks: clickCount });
            }

            document.getElementById("login-button").style.display = "none";
            fetchLeaderboard();
        } catch (err) {
            console.error("Failed to connect:", err);
        }
    } else {
        alert("Phantom wallet not found. Please install Phantom to connect.");
    }
}

// Function to update clicks in Firestore
async function updateClicks() {
    clickCount++;
    document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;
    try {
        await setDoc(doc(db, "leaderboard", window.solana.publicKey.toString()), { clicks: clickCount }, { merge: true });
    } catch (err) {
        console.error("Error updating clicks in Firestore:", err);
    }
}

// Function to fetch and display the leaderboard
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
        console.error("Error fetching leaderboard data:", error);
    }
}

// Event listener for the rock click
document.getElementById("rock").addEventListener("click", updateClicks);

// Event listener for the login button
document.getElementById("login-button").addEventListener("click", connectPhantom);

// Countdown Timer Logic
const countdownTarget = new Date("December 24, 2024 15:00:00").getTime();
const countdownElement = document.getElementById("countdown");

function updateCountdown() {
    const now = new Date().getTime();
    const distance = countdownTarget - now;

    if (distance <= 0) {
        countdownElement.innerHTML = "The event has started!";
    } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        countdownElement.innerHTML = `Time left: ${days}d ${hours}h ${minutes}m`;
    }
}

// Update countdown every minute
setInterval(updateCountdown, 60000);
updateCountdown();  // Initial call to display immediately

// Fetch and display leaderboard on page load
window.onload = fetchLeaderboard;
