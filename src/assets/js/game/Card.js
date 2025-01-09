/**
 * @class Card
 *
 * @typedef {'hearts' | 'diamonds' | 'clubs' | 'spades' | 'joker'} Suit
 *
 * @property {Suit} suit
 * @property {number} rank
 */
export class Card {
  static SUIT = Object.freeze({
    HEARTS: 'hearts',
    DIAMONDS: 'diamonds',
    CLUBS: 'clubs',
    SPADES: 'spades',
  });

  /**
   * @param {Suit} suit
   * @param {number} rank
   */
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
  }

  /**
   * Optionally include jokers or allow the deck structure to be overridden.
   * @type {Card[]}
   */
  static get DECK() {
    return this.generateDeck();
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

  /**
   * Generate a default deck of cards. Can be overridden in subclasses.
   * @returns {Card[]}
   */
  static generateDeck() {
    const suits = Object.values(this.SUIT);
    let deck = suits
        .filter((suit) => suit !== 'joker') // Exclude joker from main suits
        .flatMap((suit) =>
            Array.from({ length: 13 }, (_, i) => this.createCard(suit, i + 1))
        );

    // Add jokers if needed (2 jokers by default)
    deck = this.includeJokers
        ? [...deck, this.createCard('joker', 0), this.createCard('joker', 0)]
        : deck;

    return deck;
  }

  /**
   * Factory method for creating cards. Can be overridden in subclasses.
   * @param {Suit} suit
   * @param {number} rank
   * @returns {Card}
   */
  static createCard(suit, rank) {
    return new this(suit, rank);
  }

  /**
   * Specify whether jokers should be included in the deck.
   * Can be overridden or modified as needed.
   * @type {boolean}
   */
  static get includeJokers() {
    return false;
  }

  /**
   * Serialize card data to JSON.
   * @returns {{suit: Suit, rank: number}}
   */
  get toJSON() {
    return {
      suit: this.suit,
      rank: this.rank,
    };
  }
}