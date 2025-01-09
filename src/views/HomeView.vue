<template>
  <main>
    <button @click="createGame">
      Create Game
    </button>
  </main>
</template>

<script>
import { useStore } from '@/stores/store';

export default {
  methods: {
    async createGame() {
      const store = useStore();
      await store.createGame();
      this.$router.push(`/lobby/:${store.game.id}`);
    }
  }
}
</script>