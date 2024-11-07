// Firebase setup (replace with your Firebase config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let publicKey = null;
let clickCount = 0;
let lettersRevealed = "";

// Initialize click data and setup listeners
async function initializeGame() {
  document.getElementById("rock").disabled = false;
  document.getElementById("rock").addEventListener("click", handleClick);
  await updateLeaderboard();
}

async function connectWallet() {
  try {
    const provider = window.solana;
    if (provider.isPhantom) {
      const response = await provider.connect();
      publicKey = response.publicKey.toString();
      document.getElementById("login-button").style.display = "none";
      initializeGame();
    } else {
      alert("Phantom Wallet not found!");
    }
  } catch (error) {
    console.error("Wallet connection failed:", error);
  }
}

// Handle clicks, track, and store in Firebase
async function handleClick() {
  clickCount++;
  document.getElementById("click-count").innerText = clickCount;

  // Reveal letters every 1000 clicks
  const letters = ["E", "N", "I", "E"];
  const letterIndex = Math.floor(clickCount / 1000) - 1;
  if (clickCount % 1000 === 0 && letterIndex < letters.length) {
    lettersRevealed += letters[letterIndex];
    document.getElementById("letters").innerText = lettersRevealed;
  }

  // Update click count in Firebase
  if (publicKey) {
    await db.ref("players/" + publicKey).set({
      clicks: clickCount,
    });
    await updateLeaderboard();
  }
}

// Fetch and display the leaderboard
async function updateLeaderboard() {
  const snapshot = await db.ref("players").orderByChild("clicks").limitToLast(10).get();
  const leaderboard = [];
  snapshot.forEach(player => {
    leaderboard.push({ publicKey: player.key, clicks: player.val().clicks });
  });
  leaderboard.sort((a, b) => b.clicks - a.clicks);

  // Update leaderboard display
  const leaderboardElement = document.getElementById("leaderboard");
  leaderboardElement.innerHTML = leaderboard
    .map((player, index) => `<li>#${index + 1} - ${player.publicKey}: ${player.clicks} clicks</li>`)
    .join("");
}

document.getElementById("login-button").addEventListener("click", connectWallet);
