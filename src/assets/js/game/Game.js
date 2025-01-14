import { db } from '../firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

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
  constructor(id) {
    this.id = id;

    this.players = [];
    this.currentPlayerIndex = 0;
    this.currentCard = null;
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


  static async createGame() {
    const id = uuidv4();
    const game = new Game(id);
    await setDoc(doc(db, 'games', id), game.serialized());

    return game;
  }

}