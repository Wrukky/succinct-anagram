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
    "airdrop", "ledger", "ethereum", "solana", "l2", "modular", "rollup", "zk", 
    "prover", "validity", "proof", "zero", "knowledge", "prove"
];

let score = 0;
let timeLeft = 60;
let currentWord = "";
let scrambledWord = "";
let userInput = "";
let timer;
let scoreSheet = [];
let usedWords = new Set(); // Track words already used

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
    usedWords.clear(); // Clear used words
    document.getElementById("score").innerText = "Score: 0";
}

async function getNewWord() {
    let newWord;
    do {
        const isCryptoWord = Math.random() < 0.6; // 60% chance of a crypto-related word
        newWord = isCryptoWord
            ? cryptoWords[Math.floor(Math.random() * cryptoWords.length)]
            : await fetchRandomWord();
    } while (usedWords.has(newWord)); // Ensure it's a new word

    currentWord = newWord.toLowerCase(); // Normalize case
    usedWords.add(currentWord); // Mark word as used
    updateWordDisplay();
}

function shuffleWord(word) {
    return word.split('').sort(() => Math.random() - 0.5).join('');
}

function updateWordDisplay() {
    console.log("Current Word:", currentWord); // Debugging log
    scrambledWord = shuffleWord(currentWord); // Scramble the word

    if (!scrambledWord) {
        console.error("Error: Scrambled word is empty!");
        return;
    }

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
    userInput += letter;
    document.getElementById("user-input").innerText = userInput;
    tile.style.visibility = "hidden";
}

function clearInput() {
    userInput = "";
    document.getElementById("user-input").innerText = "";
    document.querySelectorAll(".letter").forEach(tile => {
        tile.style.visibility = "visible"; // Make letters visible again
    });
}

async function checkWord() {
    if (await isRealWord(userInput)) {
        if (!scoreSheet.some(entry => entry.word === userInput)) { // Check if the word was used before
            let wordScore = userInput.length * 10;
            score += wordScore;
            scoreSheet.push({ word: userInput, points: wordScore });
            document.getElementById("score").innerText = "Score: " + score;
        }

        // Immediately remove current word and show a new one
        setTimeout(getNewWord, 500);
    } else {
        alert("Invalid word! Try again.");
    }
}

async function isRealWord(word) {
    const whitelistedWords = new Set([
        "succinct", "bitcoin", "wallet", "blockchain", "staking", "zkproof", "gprove", 
        "airdrop", "ledger", "ethereum", "solana", "l2", "modular", "rollup", "zk", 
        "prover", "validity", "proof", "zero", "knowledge", "prove"
    ]);

    // Ensure case insensitivity
    const lowerWord = word.toLowerCase();

    // If it's in the whitelist, return true immediately
    if (whitelistedWords.has(lowerWord)) {
        return true;
    }

    // Otherwise, check in the dictionary API
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${lowerWord}`);
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
            showScoreSheet();
        }
    }, 1000);
}

// ** Show Score Sheet at the End **
function showScoreSheet() {
    let message = "Game Over! Your Score: " + score + "\n\n";
    scoreSheet.forEach(entry => {
        message += `${entry.word}: +${entry.points} points\n`;
    });
    alert(message);
}

// ** SP1 Proof Integration **
async function generateSP1Proof() {
    document.getElementById("proof-message").innerText = "Generating SP1 Proof... ⏳";

    // Simulate proof generation
    setTimeout(() => {
        const proof = `SP1-PROOF-${Math.random().toString(36).substring(7)}`;
        document.getElementById("proof-message").innerText = `Proof: ${proof}`;
        console.log("Generated SP1 Proof:", proof);
    }, 2000);
}

// Start game when page loads
startGame();
