import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "your_api_key",
    authDomain: "your_project_id.firebaseapp.com",
    projectId: "your_project_id",
    storageBucket: "your_project_id.appspot.com",
    messagingSenderId: "your_sender_id",
    appId: "your_app_id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let interval; // Declare interval variable

// Function to start the countdown
async function startCountdown() {
    try {
        const docRef = doc(db, "countdowns", "global-countdown");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const endTime = docSnap.data().timestamp.toDate(); // Assuming Firestore timestamp format
            interval = setInterval(() => updateCountdown(endTime), 1000); // Update every second
        } else {
            document.getElementById("countdown").innerText = "Countdown data not found.";
        }
    } catch (error) {
        console.error("Error loading countdown:", error);
        document.getElementById("countdown").innerText = "Error loading countdown.";
    }
}

// Function to update countdown
function updateCountdown(endTime) {
    const now = new Date().getTime();
    const distance = endTime - now;

    if (distance < 0) {
        clearInterval(interval);
        document.getElementById("countdown").innerText = "Countdown finished!";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("countdown").innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Start countdown on page load
window.onload = startCountdown;
