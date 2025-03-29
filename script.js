async function fetchRandomWord() {
    try {
        const response = await fetch("https://random-word-api.herokuapp.com/word?number=1");
        const data = await response.json();
        return data[0];
    } catch (error) {
        console.error("Error fetching random word:", error);
        return "fallback"; // Default word in case of an error
    }
}

const cryptoWords = [
    "succinct", "bitcoin", "wallet", "blockchain", "staking", "zkproof", "gprove", 
    "airdrop", "ledger", "ethereum", "solana", "modular", "rollup", "ZK", 
    "prover", "validity", "zk", "zero", "knowledge", "prove"
];

let score = 0;
let timeLeft = 60;
let currentWord = "";
let scrambledWord = "";
let userInput = "";
let timer;
let scoreSheet = [];
let usedWords = new Set(); 
let gameActive = true; // Controls if game is active

async function startGame() {
    resetGame();
    await getNewWord();
    startTimer();
}

function resetGame() {
    document.getElementById("user-input").innerText = "";
    userInput = "";
    score = 0;
    timeLeft = 60;
    scoreSheet = [];
    usedWords.clear(); 
    gameActive = true; // Game is now active
    document.getElementById("score").innerText = "Score: 0";
    document.getElementById("timer").innerText = timeLeft;
    document.getElementById("game-over").style.display = "none"; 
    document.getElementById("restart-btn").style.display = "none"; 
    document.getElementById("prove-score").style.display = "none"; // Hide proof button at start
    document.getElementById("proof-message").innerText = ""; // Clear previous proof message
}

async function getNewWord() {
    if (!gameActive) return; // Stop if game is over

    let newWord;
    do {
        const isCryptoWord = Math.random() < 0.6; // 60% chance of crypto-related words
        newWord = isCryptoWord
            ? cryptoWords[Math.floor(Math.random() * cryptoWords.length)] // Take from crypto words
            : await fetchRandomWord();  // Otherwise fetch a random word
    } while (usedWords.has(newWord)); 

    currentWord = newWord;
    usedWords.add(currentWord); 
    scrambledWord = shuffleWord(currentWord);
    updateWordDisplay();
}

function shuffleWord(word) {
    return word.split('').sort(() => Math.random() - 0.5).join('');
}

function updateWordDisplay() {
    document.getElementById("scrambled-word").innerText = scrambledWord;
    generateLetterTiles(scrambledWord);
    document.getElementById("user-input").innerText = "";
    userInput = "";
}

function generateLetterTiles(word) {
    const letterContainer = document.getElementById("letter-tiles");
    letterContainer.innerHTML = "";
    word.split("").forEach(letter => {
        const tile = document.createElement("span");
        tile.innerText = letter;
        tile.classList.add("letter");
        tile.onclick = () => addLetterToInput(letter, tile);
        letterContainer.appendChild(tile);
    });
}

function addLetterToInput(letter, tile) {
    if (!gameActive) return; // Prevent input after game over
    userInput += letter;
    document.getElementById("user-input").innerText = userInput;
    tile.style.visibility = "hidden";
}

function clearInput() {
    if (!gameActive) return;
    userInput = "";
    document.getElementById("user-input").innerText = "";
    document.querySelectorAll(".letter").forEach(tile => {
        tile.style.visibility = "visible"; 
    });
}

async function checkWord() {
    if (!gameActive) return; // Stop checking words if game is over

    if (await isRealWord(userInput) || cryptoWords.includes(userInput.toLowerCase())) {
        if (!scoreSheet.some(entry => entry.word === userInput)) { 
            let wordScore = userInput.length * 10;
            score += wordScore;
            scoreSheet.push({ word: userInput, points: wordScore });
            document.getElementById("score").innerText = "Score: " + score;
        }

        setTimeout(getNewWord, 500);
    } else {
        alert("Invalid word! Try again.");
    }
}

async function isRealWord(word) {
    // Only check if the word is not a crypto-related word
    if (cryptoWords.includes(word.toLowerCase())) {
        return true;  // Skip dictionary check for crypto-related words
    }

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        return response.ok;
    } catch {
        return false;
    }
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            document.getElementById("timer").innerText = timeLeft;
        } else {
            clearInterval(timer);
            endGame(); 
        }
    }, 1000);
}

// ** Show Game Over & Restart Option **
function endGame() {
    gameActive = false; // Stop game
    document.getElementById("game-over").innerText = `Game Over! Your Score: ${score}`;
    document.getElementById("game-over").style.display = "block";
    document.getElementById("restart-btn").style.display = "block";
    document.getElementById("prove-score").style.display = "block"; // Show proof button
}

// ** Restart the game **
function restartGame() {
    startGame();
}

// ** SP1 Proof Integration **
async function generateSP1Proof() {
    document.getElementById("proof-message").innerText = "Generating SP1 Proof... ⏳";

    setTimeout(() => {
        const proof = `SP1-PROOF-${Math.random().toString(36).substring(7)}`;
        document.getElementById("proof-message").innerText = `Proof: ${proof}`;
        console.log("Generated SP1 Proof:", proof);
    }, 2000);
}

// Start game when page loads
startGame();
