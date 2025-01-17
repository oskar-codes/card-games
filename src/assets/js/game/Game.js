import { db } from '../firebase';
import { onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Player } from './Player';
import { Card } from "@/assets/js/game/Card.js";

/**
 * @class Game
 *
 * @property {String} id
 * @property {Player[]} players
 * @property {Number} currentPlayerIndex
 * @property {Card|null} currentCard
 * @property {String[]} leaderboard
 */
export class Game {

  /**
   * @param {String} id
   * @param {Player[]} players
   * @param host
   */
  constructor(id, players = [], host) {
    this.id = id;
    this.players = players;
    this.currentPlayerIndex = 0;
    this.currentCard = null; // should be null initially or a single card object
    this.host = host;
    this.isGameLaunched = false;

    this.unsubscribeListener = null;
    this.leaderboard = []; // list of player ids in ascendant order first winner to last loser
  }

  /**
   * Serializes the game state.
   * @returns {Object} Serialized game data
   */
   serialized() {
    return {
      id: this.id,
      players: this.players.map(play => {return play.serialized()}),
      currentPlayerIndex: this.currentPlayerIndex,
      currentCard: this.currentCard ? this.currentCard.serialized() : null,
      host: this.host ? this.host.serialized() : null,
      leaderboard: this.leaderboard,
      isGameLaunched: this.isGameLaunched,
    };
  }


  /**
   * Hydrates game data from a serialized format.
   * @param {Object} data - The serialized game data
   * @returns {Game} The hydrated game instance
   */
  static hydrate(data) {
    const game = new Game(data.id, data.players.map(player => Player.hydrate(player)), data.host ? Player.hydrate(data.host) : null);
    game.currentPlayerIndex = data.currentPlayerIndex;
    game.currentCard = data.currentCard ? Card.hydrate(data.currentCard) : null;
    game.isGameLaunched = data.isGameLaunched !== undefined ? data.isGameLaunched : false;
    game.leaderboard = data.leaderboard || [];

    return game;
  }


  /**
   * Play a card in the game.
   * @param {Card} card - The card to play
   */
  async playCard(card) {
    const cardIndex = this.currentPlayer.hand.findIndex(c => c.rank === card.rank && c.suit === card.suit);
    if (cardIndex === -1) {
      return;
    }

    this.currentPlayer.hand.splice(cardIndex, 1);
    this.currentCard = card;
    if (this.currentPlayer.hand.length === 0) {
      await this.playerFinishGame();
    } else {
      await this.nextTurn();
    }
  }

  get currentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  /**
   * Shuffle the deck using Fisher-Yates (Durstenfeld) algorithm.
   * @param {Card[]} deck - The deck of cards
   * @returns {Card[]} The shuffled deck
   */
  shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async updateGameOnFirestore() {
    await setDoc(doc(db, 'games', this.id), this.serialized());
  }

  static async createGame(host) {
    const id = uuidv4();
    if (!host){
      alert("The game have no host...");
    }
    const game = new Game(id, [host], host);
    await setDoc(doc(db, 'games', id), game.serialized());
    return game;
  }

  async launchGame() {
    const shuffledDeck = this.shuffleDeck(Card.DECK);
    this.players.forEach((player) => {
      player.hand = []; // reset player's hand
    });

    while (shuffledDeck.length) {
      this.players.forEach((player) => {
        if (shuffledDeck.length) {
          player.hand.push(shuffledDeck.pop());
        }
      });
    }
    this.currentPlayerIndex = 0;
    this.currentCard = null;
    this.leaderboard = [];
    this.isGameLaunched = true;

    await this.updateGameOnFirestore();
  }

  static async joinGame(id, player) {
    const docRef = doc(db, 'games', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const game = Game.hydrate(data);

      if (!game.players.find(p => p.id === player.id) && !game.isGameLaunched) {
        game.players.push(player);
        await game.updateGameOnFirestore();
      }
      return game;
    }
    return null;
  }

  async nextTurn() {
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    } while (this.leaderboard.includes(this.players[this.currentPlayerIndex].id));

    await this.updateGameOnFirestore();
  }

  async playerFinishGame() {
    this.leaderboard.push(this.players[this.currentPlayerIndex].id);
    await this.updateGameOnFirestore();

    // end the game if all players have finished
    if (this.leaderboard.length === this.players.length) {
      this.endGame();
    }
  }

  endGame() {
    console.log("Game has ended");
  }
}
