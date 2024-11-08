// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDscMKsp0HDin4CaNNjGL-XJ_LhWIUUTGE",
    authDomain: "miners-f274c.firebaseapp.com",
    projectId: "miners-f274c",
    storageBucket: "miners-f274c.firebasestorage.app",
    messagingSenderId: "327650804954",
    appId: "1:327650804954:web:97225d969e840338e991e3"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to fetch countdown from Firestore
async function fetchCountdown() {
    try {
        const countdownDoc = await getDoc(doc(db, "countdowns", "global-countdown"));
        if (countdownDoc.exists()) {
            const endTime = countdownDoc.data().endTime;
            if (endTime) {
                startCountdown(endTime);
            } else {
                console.error("No endTime field found in Firestore.");
                document.getElementById("countdown").innerText = "No countdown available.";
            }
        } else {
            console.error("No countdown data found.");
            document.getElementById("countdown").innerText = "No countdown data found.";
        }
    } catch (error) {
        console.error("Error fetching countdown data:", error);
        document.getElementById("countdown").innerText = "Failed to load countdown.";
    }
}

// Function to start the countdown
function startCountdown(endTime) {
    function updateCountdown() {
        const now = Date.now();
        const remainingTime = endTime - now;

        if (remainingTime <= 0) {
            document.getElementById("countdown").innerText = "Countdown completed!";
            clearInterval(interval);
            return;
        }

        const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
        const seconds = Math.floor((remainingTime / 1000) % 60);
        document.getElementById("countdown").innerText = `Time left: ${hours}h ${minutes}m ${seconds}s`;
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
}

// Fetch countdown on page load
window.onload = fetchCountdown;
