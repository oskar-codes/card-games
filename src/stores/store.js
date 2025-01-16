import { Game } from '@/assets/js/game/Game';
import { Player } from '@/assets/js/game/Player';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/assets/js/firebase'; // Ensure you import your Firestore instance
import { onSnapshot, doc, setDoc } from 'firebase/firestore';


export const useStore = defineStore('store', () => {
  const game = ref(null);
  const player = ref(null);


  // Load local player from localStorage or create a new one
  const localPlayer = localStorage.getItem('local-player');
  if (localPlayer) {
    const data = JSON.parse(localPlayer);
    player.value = new Player(data.id ?? uuidv4(), data.name ?? 'Guest');
    console.log('Local Player (from localStorage):', player.value); // Log local player
  } else {
    player.value = new Player(uuidv4(), 'Guest');
    localStorage.setItem('local-player', JSON.stringify(player.value.serialized()));
    console.log('Local Player (new):', player.value); // Log new player
  }

  // Firestore listener for real-time game updates
  const addGameUpdateListener = () => {
    if (!game.value) {
      console.error("Game is not initialized.");
      return;
    }

    const gameDoc = doc(db, 'games', game.value.id);

    onSnapshot(gameDoc, (snapshot) => {
      const updatedGame = snapshot.data();
      if (updatedGame) {
        const hydratedUpdatedGame = Game.hydrate(updatedGame);
        console.log("Updated game data from Firestore:", hydratedUpdatedGame);
        game.value = hydratedUpdatedGame; // Ensure this updates reactively
      }
    });
  };

  // Create a new game and start listening for updates
  const createGame = async () => {
    game.value = await Game.createGame(player.value);
    console.log("Game created:", game.value);
    addGameUpdateListener(); // Start listening for updates
  };

  // Join an existing game and start listening for updates
  const joinGame = async (id) => {
    game.value = await Game.joinGame(id, player.value);
    console.log("Joined game:", game.value);
    addGameUpdateListener(); // Start listening for updates
  };

  // Update player's name and synchronize with Firestore
  const updatePlayerName = async (newName) => {
    // Update the player's name in the local player object
    player.value.name = newName;
    const playerToUpdate = game.value.players.find(play => play.id === player.value.id);
    playerToUpdate.name = newName;

    // Update the player name in Firestore
    await game.value.updateGameOnFirestore()

    console.log(`Player name updated in Firestore: ${newName}`);
  };

  return {
    game,
    player,
    createGame,
    joinGame,
    updatePlayerName,
  };
});
