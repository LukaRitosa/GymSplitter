import { createRouter, createWebHistory } from 'vue-router'
import Registracija from '../views/Registracija.vue'
import Prijava from '../views/Prijava.vue'
import Pocetna from '../views/Pocetna.vue'
import Test from '../views/Test.vue'
import Vjezbe from '../views/Vjezbe.vue'
// import ChangePasswordView from '../views/ChangePasswordView.vue' 


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Prijava',
      component: Prijava,
    },
    {
      path: '/registracija',
      name: 'Registracija',
      component: Registracija,
    },
    {
       path: '/pocetna',
       name: 'Pocetna',
       component: Pocetna,
     },
     {
       path: '/test',
       name: 'Test',
       component: Test
     },
     {
       path: '/vjezbe',
       name: 'Vjezbe',
       component: Vjezbe
     },
  ],
})



export default router
