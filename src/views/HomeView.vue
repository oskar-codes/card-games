<template>
  <main lang="en" class="home">
    <div class="screen main">
      <div class="play-container">
        <header>President Online</header>
        <button class="play-button">Play</button>
        <div class="cards-container" @mousemove="handleMouseMove">
          <img
              v-for="(card, index) in cards"
              :key="index"
              :src="getCardImage(card)"
              class="card"
              :style="cardStyles[index]"
              @mouseenter="handleCardHover(index)"
              @mouseleave="handleCardLeave(index)"
          />
        </div>
      </div>

      <p class="credits">By Oskar Zanota & Aurélien Domenget</p>
    </div>
  </main>
</template>

<script>
import { ref, onMounted } from "vue";

export default {
  setup() {
    const cards = ref([
      "A♥️", "2♥️", "3♥️", "4♥️", "5♥️", "6♥️", "7♥️", "8♥️", "9♥️", "10♥️", "V♥️", "D♥️", "R♥️",
      "A♠️", "2♠️", "3♠️", "4♠️", "5♠️", "6♠️", "7♠️", "8♠️", "9♠️", "10♠️", "V♠️", "D♠️", "R♠️",
      "A♦️", "2♦️", "3♦️", "4♦️", "5♦️", "6♦️", "7♦️", "8♦️", "9♦️", "10♦️", "V♦️", "D♦️", "R♦️",
      "A♣️", "2♣️", "3♣️", "4♣️", "5♣️", "6♣️", "7♣️", "8♣️", "9♣️", "10♣️", "V♣️", "D♣️", "R♣️",
    ]);

    const cardStyles = ref([]);
    const mousePosition = ref({ x: 0, y: 0 });
    const hoveringCardIndex = ref(null);

    // Function to dynamically fetch card image path
    const getCardImage = (card) => `/images/cards/${card}.png`;

    // Function to generate random styles for each card
    const generateRandomStyle = (index) => ({
      position: "absolute",
      top: `${Math.random() * 90}vh`,
      left: `${Math.random() * 90}vw`,
      transform: `rotate(${Math.random() * 360}deg)`,
      transition: `all ${Math.random() * 3 + 2}s linear ${Math.random() * index / 10}s`,
    });

    // Function to update card positions periodically
    const randomizeCards = () => {
      cardStyles.value = cards.value.map((_, index) => generateRandomStyle(index));
    };

    onMounted(() => {
      // Initialize styles and start periodic updates
      randomizeCards();
      setInterval(randomizeCards, 4000); // Update every 4 seconds
    });

    // Handle mouse move event
    const handleMouseMove = (event) => {
      mousePosition.value = {
        x: event.clientX,
        y: event.clientY,
      };

      // Update the card style based on mouse position if a card is being hovered
      if (hoveringCardIndex.value !== null) {
        cardStyles.value[hoveringCardIndex.value] = {
          ...cardStyles.value[hoveringCardIndex.value],
          top: `${mousePosition.value.y - 60}px`,
          left: `${mousePosition.value.x - 40}px`,
          transition: "none", // Disable transition while moving with the mouse
        };
      }
    };

    // Handle card hover event
    const handleCardHover = (index) => {
      hoveringCardIndex.value = index;
    };

    // Handle card leave event
    const handleCardLeave = (index) => {
      hoveringCardIndex.value = null;
      randomizeCards(); // Restore random position once hover ends
    };

    return {
      cards,
      cardStyles,
      getCardImage,
      handleMouseMove,
      handleCardHover,
      handleCardLeave,
    };
  },
};
</script>

<style scoped>
/* General styling */
#app {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.home {
  background-color: black;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.screen.main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background-color: var(--color-background);
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

header {
  font-size: 3rem;
  margin-bottom: 2rem;
  color: #fff;
}

/* Play button styling */
.play-container {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: red;
  color: white;
  font-size: 2rem;
  border: none;
  border-radius: 50%;
  padding: 20px 40px;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
}

.play-button:hover {
  transform: translate(-50%, -50%) scale(1.1);
  transition: all 0.3s ease;
}

/* Card container styling */
.cards-container {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

/* Card styles */
.card {
  width: 80px;
  height: 120px;
  pointer-events: none;
}
</style>
