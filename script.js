// Firebase imports and setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to retrieve and display the countdown
async function displayCountdown() {
    const countdownDocRef = doc(db, "countdowns", "global-countdown");
    const countdownDoc = await getDoc(countdownDocRef);

    if (countdownDoc.exists()) {
        const endTime = countdownDoc.data().endTime.toDate(); // Convert Firestore Timestamp to JavaScript Date

        const updateCountdown = () => {
            const now = new Date();
            const timeRemaining = endTime - now;

            if (timeRemaining > 0) {
                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                document.getElementById("countdown").innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            } else {
                document.getElementById("countdown").innerText = "Countdown Ended";
                clearInterval(countdownInterval);
            }
        };

        updateCountdown(); // Initial call to display immediately
        const countdownInterval = setInterval(updateCountdown, 1000); // Update every second
    } else {
        console.error("No countdown data found.");
        document.getElementById("countdown").innerText = "Countdown data not available.";
    }
}

// Call the function to display the countdown
displayCountdown();
