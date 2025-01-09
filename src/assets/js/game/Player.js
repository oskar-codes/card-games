/**
 * @class Player
 *
 * @property {String} name
 * @property {Card[]} hand
 */
export class Player {

  /**
   * @param {String} name
   * @param {String} id
   * @param {Card[]} hand
   */
  constructor(name, id, hand = []) {
    this.name = name;
    this.id = id;
    this.hand = hand;
  }

  serialized() {
    return {
      name: this.name,
      hand: this.hand.map(card => card.serialized())
    }
  }
}