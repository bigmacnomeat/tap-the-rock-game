// Variables for tracking clicks and letters
let clickCount = 0;
let letterSequence = ["E", "N", "I", "E"];
let currentLetterIndex = 0;

// Function to update clicks and reveal letters every 1000 clicks
function updateClicks() {
    clickCount++;
    document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;

    if (clickCount % 1000 === 0 && currentLetterIndex < letterSequence.length) {
        const letter = letterSequence[currentLetterIndex];
        document.getElementById("message").innerText = `Congratulations! You've unlocked: ${letter}`;
        currentLetterIndex++;
    }
}

// Event listener for the "Tap the Rock" button
document.getElementById("rock").addEventListener("click", updateClicks);

// Function to connect to Phantom Wallet
async function connectPhantom() {
    if (window.solana && window.solana.isPhantom) {
        const wallet = window.solana;
        try {
            await wallet.connect();
            const publicKey = wallet.publicKey.toString();
            console.log("Connected with public key:", publicKey);
            document.getElementById('message').innerText = 'Connected with Phantom wallet!';
            document.getElementById('login-button').style.display = 'none';
        } catch (err) {
            console.error('Failed to connect:', err);
        }
    } else {
        alert('Phantom wallet not found. Please install Phantom to connect.');
    }
}

// Event listener for the "Login with Phantom" button
document.getElementById("login-button").addEventListener("click", connectPhantom);
