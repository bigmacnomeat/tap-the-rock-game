// Import Firebase and Firestore functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variables for tracking clicks
let clickCount = 0;
let userPublicKey = null;

// Connect Phantom Wallet
async function connectPhantom() {
    if (window.solana && window.solana.isPhantom) {
        try {
            await window.solana.connect();
            const publicKey = window.solana.publicKey.toString();
            userPublicKey = publicKey;
            document.getElementById("message").innerText = `Connected with Phantom wallet: ${publicKey}`;

            const userDoc = await getDoc(doc(db, "leaderboard", publicKey));
            if (userDoc.exists()) {
                clickCount = userDoc.data().clicks;
                document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;
            } else {
                await setDoc(doc(db, "leaderboard", publicKey), { walletAddress: publicKey, clicks: 0 });
            }

            document.getElementById("login-button").style.display = "none";
            fetchLeaderboard();
        } catch (err) {
            console.error("Failed to connect:", err);
        }
    } else {
        alert("Phantom wallet not found.");
    }
}

// Update clicks in Firestore
async function updateClicks() {
    if (userPublicKey) {
        clickCount++;
        document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;
        try {
            await setDoc(doc(db, "leaderboard", userPublicKey), { clicks: clickCount }, { merge: true });
        } catch (err) {
            console.error("Error updating clicks in Firestore:", err);
        }
    } else {
        alert("Please connect your wallet first.");
    }
}

// Fetch and display the leaderboard
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

// Event listeners
document.getElementById("login-button").addEventListener("click", connectPhantom);
document.getElementById("rock").addEventListener("click", updateClicks);

window.onload = () => {
    fetchLeaderboard();
};
