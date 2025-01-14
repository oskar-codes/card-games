import { db } from '../firebase';
import { onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Player } from './Player';

/**
 * @class Game
 *
 * @property {String} id
 * @property {Player[]} players
 * @property {Number} currentPlayerIndex
 * @property {Card} currentCard
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

}