// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase initialization code (same as before)
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

// Function to fetch and display leaderboard data
async function fetchLeaderboard() {
    try {
        const querySnapshot = await getDocs(collection(db, "leaderboard"));
        const leaderboard = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            leaderboard.push({
                walletAddress: data.walletAddress,
                clicks: data.clicks
            });
        });

        // Sort leaderboard by clicks (highest first)
        leaderboard.sort((a, b) => b.clicks - a.clicks);

        // Display leaderboard on the page
        const leaderboardElement = document.getElementById("leaderboard");
        leaderboardElement.innerHTML = ''; // Clear any previous data
        leaderboard.forEach((user, index) => {
            const listItem = document.createElement("li");
            listItem.innerText = `${index + 1}. Wallet: ${user.walletAddress} - Clicks: ${user.clicks}`;
            leaderboardElement.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
    }
}

// Call the function to fetch and display leaderboard on page load
window.onload = fetchLeaderboard;
