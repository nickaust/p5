// p5-game.js
const { MemoryGame } = require("./p5-class");

const game = new MemoryGame();

function startGame() {
  game.startNewGame();
  const gameState = game.getGameState();
  return {
    ...gameState,
    fullSet: game.getFullSet()
  };
}

function makeGuess(emoji) {
  const result = game.checkGuess(emoji);
  return {
    correct: result,
    gameState: game.getGameState(),
    fullSet: game.getFullSet()
  };
}

// Array of objects: history of guesses
const guessHistory = [];

// Add a guess to history
function addGuessToHistory(guess) {
  guessHistory.push({ guess, timestamp: new Date() });
}

// Destructuring example
function getLatestGuess() {
  const [{ guess } = {}] = guessHistory.slice(-1);
  return guess || null;
}

// Use map() to get all guesses
function getAllGuesses() {
  return guessHistory.map((entry) => entry.guess);
}

module.exports = {
  startGame,
  makeGuess,
  addGuessToHistory,
  getLatestGuess,
  getAllGuesses,
};

// Standalone test
if (require.main === module) {
  console.log("Starting game...");
  console.log(startGame());
  console.log("Making guess: 🍎");
  console.log(makeGuess("🍎"));
  addGuessToHistory("🍎");
  console.log("Guess history:", getAllGuesses());
}
