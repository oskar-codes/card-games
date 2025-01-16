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
      <h2>Current Card</h2>
      <p v-if="game.currentCard">
        {{ game.currentCard.rank }} of {{ game.currentCard.suit }}
      </p>
      <p v-else>No card has been played yet.</p>
    </div>

    <div v-if="isCurrentPlayerTurn">
      <h2>Your Hand</h2>
      <ul>
        <li v-for="(card, index) in game.currentPlayer.hand" :key="index">
          <span>{{ card.rank }} of {{ card.suit }}</span>
          <button @click="playCard(card)">Play</button>
        </li>
      </ul>
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
import {toRefs} from "vue";

export default {
  async setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    // Ensure game is joined and updated
    const gameId = route.params.id;
    await store.joinGame(gameId);

    const {game} = toRefs(store);
    const {player} = toRefs(store);

    // Method to play a card
    const playCard = async (card) => {
      if (game.value && game.value.currentPlayer.id === player.value.id) {
        await game.playCard(card); // Play the selected card
        await store.updatePlayerName(player.value.name); // Update Firestore if necessary
      }
    };

    // Check if it's the current player's turn
    const isCurrentPlayerTurn = game.value.currentPlayer.id === player.value.id;

    return {
      game,
      player,
      playCard,
      isCurrentPlayerTurn
    };
  },
};
</script>

<style scoped>
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

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 10px 0;
}
</style>
