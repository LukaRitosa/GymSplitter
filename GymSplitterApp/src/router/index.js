import { createRouter, createWebHistory } from 'vue-router'
import Registracija from '../views/Registracija.vue'
import Prijava from '../views/Prijava.vue'
import Pocetna from '../views/Pocetna.vue'
import Test from '../views/Test.vue'
import Vjezbe from '../views/Vjezbe.vue'
import adminPrijava from '../views/AdminPrijava.vue'
import Admin from '../views/Admin.vue'
import VjezbaMarer from '../views/VjezbaMaker.vue'
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
    {
      path: '/adminPrijava',
      name: 'adminPrijava',
      component: adminPrijava,
    },
    {
      path: '/admin',
      name: 'Admin',
      component: Admin,
      beforeEnter: (to, from, next) => {
      const isAdmin = localStorage.getItem('admin') === 'true'

      if (isAdmin) {
        next() 
      } else {
        next('/adminPrijava')
      }
      }
    },
    {
      path: '/vjezbaMaker',
      name: 'VjezbaMaker',
      component: VjezbaMarer,
      beforeEnter: (to, from, next) => {
      const isAdmin = localStorage.getItem('admin') === 'true'

      if (isAdmin) {
        next() 
      } else {
        next('/adminPrijava')
      }
      }
    },
  ],
})



export default router
