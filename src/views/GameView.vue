<template>
  <div>
    <h1>Game View</h1>

    <div>
      <h2>Players</h2>
      <ul>
        <li v-for="(player, index) in game.players" :key="player.id">
          {{ player.name }}
          <span v-if="index === game.currentPlayerIndex">(Current Player)</span>
        </li>
      </ul>
    </div>

    <div>
      <h2>Current Cards</h2>
      <div v-if="game.currentCards && game.currentCards.length > 0">
        <p v-for="(card, index) in game.currentCards" :key="index">
          {{ card.rank }} of {{ card.suit }}
        </p>
      </div>
      <p v-else>No cards have been played yet.</p>
    </div>

    <div v-if="isCurrentPlayerTurn">
      <h2>Your Hand</h2>
      <ul>
        <li v-for="(card, index) in game.currentPlayer.hand" :key="index">
          <label>
            <input type="checkbox" v-model="selectedCards" :value="card" />
            {{ card.rank }} of {{ card.suit }}
          </label>
        </li>
      </ul>
      <button @click="playCards" :disabled="selectedCards.length === 0">Play Selected Cards</button>
      <button @click="skipTurn" class="skip-turn-btn">Skip Turn</button> <!-- Skip turn button -->
    </div>

    <div v-if="game.leaderboard.length > 0">
      <h2>Leaderboard</h2>
      <ol>
        <li v-for="(playerId, index) in game.leaderboard" :key="index">
          {{ game.players.find(p => p.id === playerId)?.name }}
        </li>
      </ol>
    </div>
  </div>
</template>

<script>
import { useStore } from '@/stores/store';
import { useRoute, useRouter } from 'vue-router';
import { ref, toRefs } from 'vue';

export default {
  async setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    const gameId = route.params.id;
    await store.joinGame(gameId);

    const { game } = toRefs(store);
    const { player } = toRefs(store);

    const selectedCards = ref([]);

    // Play selected cards
    const playCards = async () => {
      if (game.value && game.value.currentPlayer.id === player.value.id && selectedCards.value.length > 0) {
        await game.value.playCard(selectedCards.value);
        selectedCards.value = []; // Reset selected cards after play
      }
    };

    // Skip the current player's turn
    const skipTurn = async () => {
      if (game.value && game.value.currentPlayer.id === player.value.id) {
        await game.value.skipMyTurn();
      }
    };

    const isCurrentPlayerTurn = game.value.currentPlayer.id === player.value.id;

    return {
      game,
      player,
      selectedCards,
      playCards,
      isCurrentPlayerTurn,
      skipTurn // Returning the skipTurn method
    };
  },
};
</script>

<style scoped>
/* Ensure the body or html allows scrolling */
html, body {
  height: 100%; /* Make sure the page is at least as tall as the viewport */
  margin: 0; /* Remove any default margin */
  padding: 0; /* Remove any default padding */
  overflow-y: auto; /* Enable vertical scrolling */
}

/* Add some basic styling */
h2 {
  color: #333;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 10px 0;
}

/* Styling for Skip Turn button */
.skip-turn-btn {
  background-color: #e74c3c;
  margin-top: 10px;
}

.skip-turn-btn:hover {
  background-color: #c0392b;
}

.skip-turn-btn:disabled {
  background-color: #f2dede;
}

/* Allow scrolling on the game view container */
div {
  overflow-y: auto;
  max-height: 100vh; /* Prevent exceeding viewport height */
}
</style>
