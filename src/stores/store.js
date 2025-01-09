import { Game } from '@/assets/js/game/Game'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStore = defineStore('store', () => {
  const game = ref(null)

  const createGame = async () => {
    game.value = await Game.createGame();
  }

  return {
    game,
    createGame
  }
})
