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
    this.currentCards = []; // should be null initially or a single card object
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
      currentCards: this.currentCards.map(card => card.serialized()),
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
    game.currentCards = data.currentCards ? data.currentCards.map(card => Card.hydrate(card)) : [];
    game.isGameLaunched = data.isGameLaunched !== undefined ? data.isGameLaunched : false;
    game.leaderboard = data.leaderboard || [];

    return game;
  }


  /**
   * Play a set of cards in the game.
   * @param {Card[]} cardSet - The set of cards to play
   * @returns {Promise<void>}
   */
  async playCard(cardSet) {
    if (!Array.isArray(cardSet) || cardSet.length === 0) {
      alert("Invalid card set");
      return;
    }

    // need to ensure all cards in the set are of the same rank
    const firstCardRank = cardSet[0].rank;
    const isValidSet = cardSet.every(card => card.rank === firstCardRank);

    if (!isValidSet) {
      alert("Invalid set: all cards must have the same rank");
      return;
    }

    // check if player has these cards in their hand

    const hand = this.currentPlayer.hand;
    console.log("Current Player hand : ", hand);
    console.log("CardSet to play : ", cardSet);
    const isPlayable = cardSet.every(card =>
        hand.some(h => h.rank === card.rank && h.suit === card.suit)
    );

    if (!isPlayable) {
      alert("Player does not have the required cards");
      return;
    }

    // check if the set can beat the current set of cards on the table
    if (this.currentCards.length > 0) {
      const currentSetRank = this.currentCards[0].rank;
      const rankValue = (rank) => (rank === 2 ? Infinity : rank);

      if (
          cardSet.length !== this.currentCards.length ||
          rankValue(firstCardRank) <= rankValue(currentSetRank)
      ) {
        alert("The card set cannot beat the current card set");
        return;
      }
    }

    // remove the cards from the player's hand
    cardSet.forEach(card => {
      const index = hand.findIndex(h => h.rank === card.rank && h.suit === card.suit);
      if (index !== -1) {
        hand.splice(index, 1);
      }
    });

    this.currentCards = cardSet;

    // if the player's hand is now empty, they finish the game
    if (hand.length === 0) {
      await this.playerFinishGame();
    } else {
      await this.nextTurn();
    }

    await this.updateGameOnFirestore();
  }

  /**
   * Skip the turn of the current player.
   * @returns {Promise<void>}
   */
  async skipMyTurn() {
    await this.nextTurn();
    await this.updateGameOnFirestore();
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
    this.currentCards = [];
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
