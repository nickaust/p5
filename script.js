class GameClient {
  constructor() {
    this.cardsContainer = document.getElementById("cards");
    this.optionsContainer = document.getElementById("options");
    this.levelElement = document.getElementById("level");
    this.scoreElement = document.getElementById("score");
    this.messageElement = document.getElementById("message");
    this.startBtn = document.getElementById("start-btn");

    this.memoryTimeout = 3000; // 3 seconds to memorize
    this.memoryPhase = false;

    this.resetUI();
  }

  resetUI() {
    this.cardsContainer.innerHTML = "";
    this.optionsContainer.innerHTML = "";
    this.levelElement.textContent = "1";
    this.scoreElement.textContent = "0";
    this.messageElement.textContent = "Click 'Start Game' to play!";
    this.startBtn.style.display = "block";
  }

  async startGame() {
    try {
      const response = await fetch("/api/game/start");
      const gameState = await response.json();

      this.startBtn.style.display = "none";
      this.memoryPhase = true;
      this.renderMemoryPhase(gameState.fullSet);

      setTimeout(() => {
        this.memoryPhase = false;
        this.renderGame(gameState);
      }, this.memoryTimeout);
    } catch (error) {
      this.showMessage("Failed to start game. Please refresh!");
    }
  }

  renderMemoryPhase(fullSet) {
    this.cardsContainer.innerHTML = fullSet
      .map(emoji => `<div class="emoji-card">${emoji}</div>`)
      .join("");
    this.optionsContainer.innerHTML = "";
    this.messageElement.textContent = "Memorize the emojis!";
  }

  renderGame(gameState) {
    if (this.memoryPhase) return;

    this.levelElement.textContent = gameState.level;
    this.scoreElement.textContent = gameState.score;
    this.messageElement.textContent = "Which emoji is missing?";

    // Render remaining cards
    this.cardsContainer.innerHTML = gameState.cards
      .map(emoji => `<div class="emoji-card">${emoji}</div>`)
      .join("");

    // Render clickable options
    this.optionsContainer.innerHTML = gameState.options
      .map(emoji => `
        <button class="emoji-option" data-emoji="${emoji}">
          ${emoji}
        </button>
      `).join("");

    // Add click handlers
    document.querySelectorAll(".emoji-option").forEach(button => {
      button.addEventListener("click", e => this.handleGuess(e));
    });
  }

  async handleGuess(event) {
    if (this.memoryPhase) return;

    const button = event.target;
    button.disabled = true;
    const emoji = button.dataset.emoji;

    try {
      const response = await fetch("/api/game/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });

      if (!response.ok) throw new Error('API error');
      const result = await response.json();

      if (result.correct) {
        this.showMessage("✅ Correct! Next level...");
        // Show memory phase for the next round
        this.memoryPhase = true;
        this.renderMemoryPhase(result.fullSet);
        setTimeout(() => {
          this.memoryPhase = false;
          this.renderGame(result.gameState);
        }, this.memoryTimeout);
      } else {
        this.showMessage(
          "❌ Wrong! The missing emoji was: " + result.gameState.removedCard +
          ". Click 'Start Game' to play again!"
        );
        document.querySelectorAll(".emoji-option").forEach(btn => btn.disabled = true);
        this.startBtn.style.display = "block";
      }

      // Update score/level from the backend response
      this.levelElement.textContent = result.gameState.level;
      this.scoreElement.textContent = result.gameState.score;

    } catch (error) {
      this.showMessage("Failed to submit guess. Try again!");
    } finally {
      button.disabled = false;
    }
  }

  showMessage(text) {
    this.messageElement.textContent = text;
  }
}

window.addEventListener("load", () => {
  const client = new GameClient();
  client.startBtn.addEventListener("click", () => {
    client.resetUI();
    client.startGame();
  });
});
