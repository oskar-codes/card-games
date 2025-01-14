/**
 * @class Card
 *
 * @property {Card.SUIT} suit
 * @property {number} rank
 */
export class Card {
  static SUIT = {
    HEARTS: 'hearts',
    DIAMONDS: 'diamonds',
    CLUBS: 'clubs',
    SPADES: 'spades'
  }

  static DECK = (() => {
    return Object.keys(Card.SUIT).map(suit => {
      return Array.from({ length: 13 }, (_, i) => new Card(suit, i + 1));
    }).flat();
  })();

  /**
   * @param {keyof Card.SUIT} suit
   * @param {number} rank
   */
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
  }

  serialized() {
    return {
      suit: this.suit,
      rank: this.rank
    }
  }

  static hydrate(data) {
    return new Card(data.suit, data.rank);
  }
}