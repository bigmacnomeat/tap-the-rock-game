/// Connect to Phantom wallet and handle clicks
let clicks = 0;
let publicKey = null;
let leaderboard = [];  // For tracking leaderboard

// Initialize Firebase (you'll replace this with your actual Firebase config)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Connect to Phantom wallet
async function connectWallet() {
    const provider = window.solana;
    if (provider && provider.isPhantom) {
        try {
            const response = await provider.connect(); // Request connection
            publicKey = response.publicKey.toString(); // Save the public key
            document.getElementById("login-button").style.display = "none"; // Hide login button
            document.getElementById("rock").disabled = false; // Enable the rock button
        } catch (error) {
            console.error("Wallet connection failed:", error);
        }
    } else {
        alert("Phantom Wallet not found!");
    }
}

// Track click count and leaderboard updates
function handleClick() {
    if (!publicKey) {
        alert("Please connect your wallet first!");
        return;
    }

    clicks += 1;
    document.getElementById("clicks").innerText = `Clicks: ${clicks}`;

    // Handle letter progression
    const letters = ['E', 'N', 'I', 'E'];
    const index = Math.floor(clicks / 1000);
    if (index < letters.length) {
        document.getElementById("message").innerText = `Next Letter: ${letters[index]}`;
    }

    // Update Firebase with the new click count for the user
    firebase.database().ref('players/' + publicKey).set({
        clicks: clicks
    });

    // Update leaderboard
    updateLeaderboard();
}

// Fetch leaderboard from Firebase and update UI
function updateLeaderboard() {
    firebase.database().ref('players').orderByChild('clicks').limitToLast(10).once('value').then(snapshot => {
        leaderboard = [];
        snapshot.forEach(childSnapshot => {
            const player = childSnapshot.val();
            const playerEntry = {
                publicKey: childSnapshot.key,
                clicks: player.clicks
            };
            leaderboard.push(playerEntry);
        });
        leaderboard.sort((a, b) => b.clicks - a.clicks); // Sort leaderboard by clicks

        // Display leaderboard
        const leaderboardList = document.getElementById("leaderboard-list");
        leaderboardList.innerHTML = ''; // Clear current leaderboard
        leaderboard.forEach(entry => {
            const li = document.createElement("li");
            li.textContent = `${entry.publicKey}: ${entry.clicks} clicks`;
            leaderboardList.appendChild(li);
        });
    });
}

// Add event listeners
document.getElementById("login-button").addEventListener("click", connectWallet);
document.getElementById("rock").addEventListener("click", handleClick);
document.getElementById("rock").disabled = true; // Initially disable the rock button until wallet is connected
