import { Card } from './Card';

/**
 * @class Player
 *
 * @property {String} id
 * @property {String} name
 * @property {Card[]} hand
 */
export class Player {

  /**
   * @param {String} id
   * @param {String} name
   * @param {Card[]} hand
   */
  constructor(id = uuidv4(), name, hand = []) {
    this.id = id;
    this.name = name;
    this.hand = hand;
  }

  serialized() {
    return {
      id: this.id,
      name: this.name,
      hand: this.hand.map(card => card.serialized())
    }
  }

  static hydrate(data) {
    return new Player(data.id, data.name, data.hand.map(card => Card.hydrate(card)));
  }
}