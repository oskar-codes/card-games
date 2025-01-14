import { db } from '../firebase';
import { onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Player } from './Player';
import {Card} from "@/assets/js/game/Card.js";

/**
 * @class Game
 *
 * @property {String} id
 * @property {Player[]} players
 * @property {Number} currentPlayerIndex
 * @property {Card} currentCard
 * @property {String[]} leaderboard
 */
export class Game {

  /**
   * @param {String} id
   */
  constructor(id, players = []) {
    this.id = id;

    this.players = players;
    this.currentPlayerIndex = 0;
    this.currentCard = null;

    this.unsubscribeListener = null;
    this.leaderboard = []; // list of player ids in ascendant order first winner to last loser

  }

  serialized() {
    return {
      id: this.id,
      players: this.players.map(player => player.serialized()),
      currentPlayerIndex: this.currentPlayerIndex,
      currentCard: this.currentCard ? this.currentCard.serialized() : null
    }
  }

  static hydrate(data) {
    const game = new Game(data.id, data.players.map(player => Player.hydrate(player)));
    game.currentPlayerIndex = data.currentPlayerIndex;
    game.currentCard = data.currentCard ? Card.hydrate(data.currentCard) : null;

    return game;
  }

  /**
   * Deal shuffled cards to players and reset for a new round.
   */
  async startNewRound() {
    const shuffledDeck = this.shuffleDeck(Card.DECK);
    // deal all cards to players
    while (shuffledDeck.length) {
      this.players.forEach((player) => {
        if (shuffledDeck.length) {
          player.hand.push(shuffledDeck.pop());
        }
      });
    }

    await this.updateGameOnFirestore();
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

  async updateGameOnFirestore() {
    await setDoc(doc(db, 'games', this.id), this.serialized());
  }


  static async createGame(host) {
    const id = uuidv4();
    const game = new Game(id, host ? [host] : []);
    await setDoc(doc(db, 'games', id), game.serialized());

    game.addUpdateListener();

    return game;
  }

  static async joinGame(id, player) {
    const docRef = doc(db, 'games', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const game = Game.hydrate(data);

      // Add player to game if not already in game
      if (!game.players.find(p => p.id === player.id)) {
        game.players.push(player);
        await game.updateGameOnFirestore();
      }

      game.addUpdateListener();

      return game;
    }

    return null;
  }

  addUpdateListener() {
    if (this.unsubscribeListener) {
      return;
    }

    const docRef = doc(db, 'games', this.id);
    this.unsubscribeListener = onSnapshot(docRef, (doc) => {
      const data = doc.data();
      const hydrated = Game.hydrate(data);

      // Assign each players individually
      this.players = [];
      hydrated.players.forEach(player => {
        this.players.push(player);
      });
      
      this.currentPlayerIndex = hydrated.currentPlayerIndex;
      this.currentCard = hydrated.currentCard;
    });
  }
  /**
   * Move to the next player's turn, skipping players already in the leaderboard.
   * If all players are in the leaderboard, end the game.
   */
  async nextTurn() {
    const playersInGame = this.players.filter(player => !this.leaderboard.includes(player.id));

    // if all players are in the leaderboard -> end the game
    if (playersInGame.length === 0) {
      this.endGame();
      return;
    }

    // find next eligible player
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    } while (playersInGame.includes(this.currentPlayerIndex.id));
    await this.updateGameOnFirestore();
  }

  async playerFinishGame(){
    this.leaderboard.push(this.players[this.currentPlayerIndex].id);
    await this.updateGameOnFirestore()
  }

  endGame(){
    // end the game and show the results
  }

}