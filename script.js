// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration for the project
const firebaseConfig = {
    apiKey: "AIzaSyDscMKsp0HDin4CaNNjGL-XJ_LhWIUUTGE",
    authDomain: "miners-f274c.firebaseapp.com",
    projectId: "miners-f274c",
    storageBucket: "miners-f274c.appspot.com",
    messagingSenderId: "327650804954",
    appId: "1:327650804954:web:97225d969e840338e991e3"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let clickCount = 0;

// Function to connect Phantom Wallet and store data in Firestore
async function connectPhantom() {
    if (window.solana && window.solana.isPhantom) {
        try {
            await window.solana.connect();
            const publicKey = window.solana.publicKey.toString(); 
            document.getElementById("message").innerText = `Connected with Phantom wallet: ${publicKey}`;

            // Fetch or initialize click count from Firestore
            const userDoc = await getDoc(doc(db, "leaderboard", publicKey));
            if (userDoc.exists()) {
                clickCount = userDoc.data().clicks;
                document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;
            } else {
                clickCount = 0;
                document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;
                await setDoc(doc(db, "leaderboard", publicKey), { walletAddress: publicKey, clicks: clickCount });
            }

            // Hide login button and fetch leaderboard
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
        await setDoc(doc(db, "leaderboard", window.solana.publicKey.toString()), {
            clicks: clickCount
        }, { merge: true });
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

        // Sort leaderboard and display on page
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

// Event listeners
document.getElementById("login-button").addEventListener("click", connectPhantom);
document.getElementById("rock").addEventListener("click", updateClicks);
window.onload = fetchLeaderboard;
