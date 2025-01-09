import { defineStore } from 'pinia';
import { Game } from './Game';

export const useGameStore = defineStore('game', {
  state: () => ({
    game: null,
  }),

  actions: {
    /**
     * Initialize the game with player names.
     * @param {string[]} playerNames
     */
    initializeGame(playerNames) {
      this.game = new Game(undefined, playerNames);
    },

    /**
     * Play cards for the current player.
     * @param {Card[]} cards
     */
    playCards(cards) {
      const currentPlayer = this.game.players[this.game.currentPlayerIndex];
      currentPlayer.playCards(cards);

      // Check for round end
      if (currentPlayer.hand.length === 0) {
        console.log(`${currentPlayer.name} finished their cards!`);
      }

      this.game.nextTurn();
    },
  },

  getters: {
    /**
     * Get the current player.
     */
    currentPlayer(state) {
      return state.game.players[state.game.currentPlayerIndex];
    },
  },
});