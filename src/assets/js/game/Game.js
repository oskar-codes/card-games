import { v4 as uuidv4 } from 'uuid';
import { Card } from './Card';
import { Player } from './Player';

export class Game {
  /**
   * @property {String} id
   * @property {Player[]} players
   * @property {Number} currentPlayerIndex
   * @property {Card[]} deck
   */
  constructor(id = uuidv4(), players) {
    this.id = id;

    // Initialize players with given names
    this.players = players;

    this.currentPlayerIndex = 0; // First player starts
    this.deck = Card.DECK;
  }

  /**
   * Deal shuffled cards to players and reset for a new round.
   */
  startNewRound() {
    const shuffledDeck = this.shuffleDeck(this.deck); // Shuffle the deck

    // Deal all cards to players
    while (shuffledDeck.length) {
      this.players.forEach((player) => {
        if (shuffledDeck.length) {
          player.hand.push(shuffledDeck.pop());
        }
      });
    }

    // Sort each player's cards
    this.players.forEach((player) => player.sortHand());
  }

  /**
   * Shuffle the deck using Fisher-Yates (Durstenfeld) algorithm.
   * @param {Card[]} deck
   * @returns {Card[]}
   */
  shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Move to the next player's turn.
   */
  nextTurn() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  /**
   * Assign roles (President, Vice President, etc.) after each round.
   */
  assignRoles() {
    // Assume players are sorted by finishing order
    const roles = ['President', 'Vice President', 'Neutral', 'Scum'];
    this.players.forEach((player, index) => {
      player.role = roles[index] || 'Neutral'; // Default to Neutral for extra players
    });
  }

  /**
   * Serialize game state, including player hands and roles.
   */
  serialized() {
    return {
      id: this.id,
      players: this.players.map((player) => player.serialized()),
      currentPlayerIndex: this.currentPlayerIndex,
    };
  }
}