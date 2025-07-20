import { createRouter, createWebHistory } from 'vue-router'
import Registracija from '../views/Registracija.vue'
import Prijava from '../views/Prijava.vue'
import Pocetna from '../views/Pocetna.vue'
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
    // {
    //   path: '/change-password',
    //   name: 'ChangePassword',
    //   component: ChangePasswordView
    // },
  ],
})



export default router
