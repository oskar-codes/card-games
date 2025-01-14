/**
 * @class Player
 *
 * @property {String} name
 * @property {Card[]} hand
 */
export class Player {

  /**
   * @param {String} name
   * @param {Card[]} hand
   */
  constructor(name, hand = []) {
    this.name = name;
    this.hand = hand;
  }

  serialized() {
    return {
      name: this.name,
      hand: this.hand.map(card => card.serialized())
    }
  }

  static hydrate(data) {
    return new Player(data.id, data.name, data.hand.map(card => Card.hydrate(card)));
  }
}