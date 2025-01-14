<template>
  <h1>Lobby</h1>

  <p>Players:</p>
  <ul>
    <li v-for="player in game.players" :key="player.id">
      {{ player.name }}
    </li>
  </ul>
</template>

<script>
import { useStore } from '@/stores/store';
import { useRoute } from 'vue-router';

export default {
  async setup() {
    const store = useStore();
    
    const route = useRoute();
    const gameId = route.params.id;

    await store.joinGame(gameId);

    if (!store.game) {
      this.$router.push('/');
    }

    return {
      game: store.game,
    };
  },
}
</script>