import { Game } from '@/assets/js/game/Game'
import { Player } from '@/assets/js/game/Player'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export const useStore = defineStore('store', () => {
  const game = ref(null);
  const player = ref(null);

  const localPlayer = localStorage.getItem('local-player');
  if (localPlayer) {
    const data = JSON.parse(localPlayer);
    player.value = new Player(data.id ?? uuidv4(), data.name ?? 'Guest');
  } else {
    player.value = new Player(uuidv4(), 'Guest');
    localStorage.setItem('local-player', JSON.stringify(player.value.serialized()));
  }

  const createGame = async () => {
    game.value = await Game.createGame(player.value);
  }

  const joinGame = async (id) => {
    game.value = await Game.joinGame(id, player.value);
  }

  return {
    game,
    createGame,
    joinGame
  }
})
