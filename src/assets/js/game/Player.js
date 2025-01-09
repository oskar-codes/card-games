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
}