<template>
  <h1>Lobby</h1>

  <p>Players:</p>
  <p>Current Player: {{ player.name }}</p>
  <p>Debugging game object:</p>
  <pre>{{ game }}</pre>
  <ul>
    <li v-for="play in game.players" :key="play.id">
      <span v-if="player.id !== play.id">{{ play.name }}</span>
      <span v-else>
        <input
            v-model="player.name"
            @blur="updatePlayerName(player.name)"
            placeholder="Enter your name"
        />
      </span>
    </li>
  </ul>
  <button class="play-button" @click="playGame">Play</button>
</template>

<script>
import { useStore } from '@/stores/store';
import { useRoute, useRouter } from 'vue-router';
import { toRefs, watchEffect } from 'vue';

export default {
  async setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const gameId = route.params.id;

    // Ensure game is joined before continuing
    await store.joinGame(gameId);

    // If game is still not available, redirect to home
    if (!store.game) {
      await router.push('/');
    }

    // Use toRefs to safely reference game and player
    const {game} = toRefs(store);
    const {player} = toRefs(store);

    // Automatically navigate to GameView if the game is launched
    watchEffect(() => {
      if (game.value && game.value.isGameLaunched) {
        router.push(`/game/${game.value.id}`);
      }
    });

    // Method to update the player's name in Firestore
    const updatePlayerName = async (newName) => {
      if (newName.trim() === '') return; // Prevent empty names

      // Update the player's name in Firestore
      await store.updatePlayerName(newName);

      console.log(`Player's name updated to: ${newName}`);
    };

    return {
      player,
      game,
      updatePlayerName
    };
  },
  methods: {
    async playGame() {
      await this.game.launchGame();
    }
  }
}
</script>
