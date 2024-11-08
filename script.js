// Import the functions you need from the SDKs you need
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
let endTime = null;

// Function to connect Phantom Wallet and store data in Firestore
async function connectPhantom() {
    if (window.solana && window.solana.isPhantom) {
        try {
            await window.solana.connect();
            const publicKey = window.solana.publicKey.toString(); // Get the wallet address
            userPublicKey = publicKey;  // Save the public key
            console.log("Connected with public key:", publicKey);
            document.getElementById("message").innerText = `Connected with Phantom wallet: ${publicKey}`;

            // Fetch the current click count for this wallet from Firestore (if it exists)
            const userDoc = await getDoc(doc(db, "leaderboard", publicKey));
            if (userDoc.exists()) {
                clickCount = userDoc.data().clicks; // Update click count with the value from Firestore
                document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;
            } else {
                // If no document exists, set initial click count to 0
                clickCount = 0;
                document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;
                // Add a new document for this wallet with initial click count
                await setDoc(doc(db, "leaderboard", publicKey), {
                    walletAddress: publicKey,
                    clicks: clickCount
                });
            }

            // Fetch the global end time for the countdown
            fetchEndTime();

            // Hide the login button once connected
            document.getElementById("login-button").style.display = "none";

            // Fetch and display leaderboard after login
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
    if (userPublicKey) {
        // Increment click count
        clickCount++;
        document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;

        // Update the user's click count in Firestore
        try {
            await setDoc(doc(db, "leaderboard", userPublicKey), {
                clicks: clickCount
            }, { merge: true }); // Merge to update only the clicks field
        } catch (err) {
            console.error("Error updating clicks in Firestore:", err);
        }
    } else {
        alert("Please connect your wallet first.");
    }
}

// Function to fetch and display the leaderboard from Firestore
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

// Function to fetch the global end time for the countdown from Firestore
async function fetchEndTime() {
    try {
        const docRef = doc(db, "countdowns", "global-countdown");  // Your Firestore document for the countdown
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            endTime = docSnap.data().endTime;  // Get the end time from Firestore (as a timestamp)
            startCountdown();
        } else {
            console.log("No end time found in Firestore.");
        }
    } catch (error) {
        console.error("Error fetching end time:", error);
    }
}

// Function to start and update the countdown timer
function startCountdown() {
    const countdownElement = document.getElementById("countdown");

    // Update countdown every second
    const interval = setInterval(() => {
        if (endTime) {
            const now = new Date().getTime();
            const distance = endTime - now;  // Calculate the distance between now and the end time

            if (distance <= 0) {
                clearInterval(interval);  // Stop the countdown when it reaches 0
                countdownElement.innerHTML = "Countdown ended!";
            } else {
                // Calculate days, hours, minutes, and seconds remaining
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                // Display the result
                countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            }
        }
    }, 1000);  // Update every 1000ms (1 second)
}

// Event listener for the rock click
document.getElementById("rock").addEventListener("click", updateClicks);

// Event listener for the login button
document.getElementById("login-button").addEventListener("click", connectPhantom);

// Fetch and display leaderboard and end time on page load
window.onload = async () => {
    // Check if user is already connected (via localStorage or something else)
    if (window.solana && window.solana.isPhantom) {
        const publicKey = await window.solana.connect();
        userPublicKey = publicKey.publicKey.toString();

        // Fetch and display clicks for the connected wallet
        const userDoc = await getDoc(doc(db, "leaderboard", userPublicKey));
        if (userDoc.exists()) {
            clickCount = userDoc.data().clicks; // Load stored click count
            document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;
        }

        // Fetch leaderboard and end time after page reload
        fetchLeaderboard();
        fetchEndTime();
    }
};
