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
    createGame() {
      const store = useStore();
      store.createGame();
    }
  }
}
</script>