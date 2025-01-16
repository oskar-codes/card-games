import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LobbyView from '../views/LobbyView.vue'
import GameView from '../views/GameView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/lobby/:id',
      name: 'lobby',
      component: LobbyView,
    },
    {
      path: '/game/:id',
      name: 'game',
      component: GameView,
    }
  ],
})

export default router
