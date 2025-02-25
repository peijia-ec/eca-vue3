import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '../auth'
import { Role } from '../role'

const router = createRouter({
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  },
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/components/legacy/Home.vue'),
      meta: { authorize: [] }
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/components/legacy/Orders.vue'),
      meta: { authorize: [] }
    },
    {
      path: '/sell',
      name: 'Sell',
      component: () => import('@/components/legacy/Sell.vue'),
      meta: { authorize: [] }
    },
    {
      path: '/payout',
      name: 'BatchPayouts',
      component: () => import('@/components/legacy/BatchPayouts.vue'),
      meta: { authorize: [Role.Admin] }
    },
    {
      path: '/bank',
      name: 'bank',
      component: () => import('@/components/legacy/Bank.vue'),
      meta: { authorize: [] }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/components/legacy/Users.vue'),
      meta: { authorize: [] }
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/components/legacy/User.vue'),
      meta: { authorize: [] }
    },
    {
      path: '/otc',
      name: 'otc',
      component: () => import('@/components/legacy/OTC.vue'),
      meta: { authorize: [Role.Admin] }
    },
    {
      path: '/coins',
      name: 'Coins',
      component: () => import('@/components/legacy/Coins.vue'),
      meta: { authorize: [] }
    },
    {
      path: '/market',
      name: 'market',
      component: () => import('@/components/legacy/Market.vue'),
      meta: { authorize: [Role.Admin] }
    },
    {
      path: '/affiliates',
      name: 'affiliates',
      component: () => import('@/components/legacy/Affiliates.vue'),
      meta: { authorize: [] }
    },
    {
      path: '/order',
      name: 'order',
      component: () => import('@/components/legacy/Order.vue'),
      meta: { authorize: [] }
    },
    {
      path: '/lbc',
      name: 'LBC',
      component: () => import('@/components/legacy/LBC.vue'),
      meta: { authorize: [] }
    },
    {
      path: '/verification',
      name: 'verification',
      component: () => import('@/components/legacy/Verification.vue'),
      meta: { authorize: [Role.Compliance] }
    },
    {
      path: '/bank-verify',
      name: 'BankVerify',
      component: () => import('@/components/legacy/BankVerify.vue'),
      meta: { authorize: [Role.Compliance] }
    },
    {
      path: '/errors',
      name: 'Errors',
      component: () => import('@/components/legacy/Errors.vue'),
      meta: { authorize: [] }
    },
    {
      path: '/suspects',
      name: 'suspects',
      component: () => import('@/components/legacy/Suspects.vue'),
      meta: { authorize: [] }
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('@/components/legacy/Stats.vue'),
      meta: { authorize: [] }
    },
    {
      path: '/suspect-orders',
      name: 'suspectorders',
      component: () => import('@/components/legacy/SuspectOrders.vue'),
      meta: { authorize: [] }
    },
    {
      path: '/tools',
      name: 'tools',
      component: () => import('@/components/legacy/Tools.vue'),
      meta: { authorize: [Role.Admin] }
    },
    {
      path: '/ec-bank',
      name: 'ecbank',
      component: () => import('@/components/legacy/EcBank.vue'),
      meta: { authorize: [Role.Admin] }
    },
    {
      path: '/compliance',
      name: 'compliance',
      component: () => import('@/components/legacy/Compliance.vue'),
      meta: { authorize: [Role.Compliance] }
    },
    {
      path: '/agents',
      name: 'agents',
      component: () => import('@/components/legacy/EcaAgents.vue'),
      meta: { authorize: [Role.Admin] }
    },
    {
      path: '/goaml',
      name: 'goaml',
      component: () => import('@/components/legacy/GoAML.vue'),
      meta: { authorize: [Role.Compliance] }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/components/legacy/Search.vue'),
      meta: { authorize: [] }
    },
    {
      path: '/:pathMatch(.*)*', redirect: '/'
    }
  ]
})

router.beforeEach(authGuard)

export default router
