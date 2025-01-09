import { defineStore } from 'pinia';
import { Game } from './Game';

export const useGameStore = defineStore('game', function() {
  const game = ref(null);

  /**
   * Initialize the game with player names.
   * @param {string[]} playerNames
   */
  const initializeGame = async (playerNames) => {
    // game.value = new Game(undefined, playerNames);
    game.value = await Game.createGame();
  }

  /**
   * Play cards for the current player.
   * @param {Card[]} cards
   */
  const playCards = (cards) => {
    const currentPlayer = game.value.players[game.value.currentPlayerIndex];
    currentPlayer.playCards(cards);

    // Check for round end
    if (currentPlayer.hand.length === 0) {
      console.log(`${currentPlayer.name} finished their cards!`);
    }

    game.value.nextTurn();
  }

  const currentPlayer = computed(() => {
    return game.value.players[game.value.currentPlayerIndex];
  });

  return {
    game,
    initializeGame,
    playCards,
    currentPlayer,
  };
});