// p5-server.js
const express = require('express');
const { startGame, makeGuess } = require('./p5-game'); // Single import line
const app = express();
const port = 4000;

// Serve static files from the "public" folder
app.use(express.static('public'));

// Parse JSON in request bodies
app.use(express.json());

// GET route 1: Start a new game
app.get('/api/game/start', (req, res) => {
  const gameState = startGame();
  res.json(gameState);
});

// GET route 2: Get current game state
app.get('/api/game/state', (req, res) => {
  res.json({ message: "Current game state endpoint" });
});

// POST route: Submit a guess
app.post('/api/game/guess', (req, res) => {
  const { emoji } = req.body;
  const result = makeGuess(emoji);
  res.json(result);
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
