import { Card } from './Card';

export class Player {
  /**
   * @param {String} name
   * @param {Card[]} hand
   * @param {String} role - Player's role: President, Scum, etc.
   */
  constructor(name, hand = []) {
    this.name = name;
    this.hand = hand;
    this.role = null; // Role to be assigned after each round
  }

  /**
   * Sort cards in hand by rank (ascending).
   */
  sortHand() {
    this.hand.sort((a, b) => a.rank - b.rank);
  }

  /**
   * Play cards and remove them from the hand.
   * @param {Card[]} cardsToPlay
   */
  playCards(cardsToPlay) {
    this.hand = this.hand.filter(
        (card) =>
            !cardsToPlay.some(
                (playedCard) => playedCard.rank === card.rank && playedCard.suit === card.suit
            )
    );
  }

  /**
   * Serialize player data for state handling.
   */
  serialized() {
    return {
      name: this.name,
      hand: this.hand.map((card) => card.toJSON),
      role: this.role,
    };
  }
}