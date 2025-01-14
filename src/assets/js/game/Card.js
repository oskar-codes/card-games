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

  /**
   * Convert a rank (1-13) into its corresponding string.
   * @param {number} rank - The rank of the card.
   * @returns {string}
   */
  static getRankSymbol(rank) {
    switch (rank) {
      case 11:
        return 'V'; // Jack
      case 12:
        return 'D'; // Queen
      case 13:
        return 'R'; // King
      default:
        return rank.toString(); // Numeric rank (1-10)
    }
  }

  /**
   * Convert a suit into its corresponding symbol.
   * @param {Suit} suit - The suit of the card.
   * @returns {string}
   */
  static getSuitSymbol(suit) {
    const suitSymbols = {
      hearts: '♥️',
      diamonds: '♦️',
      clubs: '♣️',
      spades: '♠️',
    };
    return suitSymbols[suit] || '';
  }

  /**
   * Convert rank and suit to a corresponding card image name.
   * @returns {string}
   */
  getCardImageName() {
    if (this.suit === 'joker') {
      return 'joker';
    }
    const rankStr = Card.getRankSymbol(this.rank);
    const suitStr = Card.getSuitSymbol(this.suit);
    return `${rankStr}${suitStr}`;
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