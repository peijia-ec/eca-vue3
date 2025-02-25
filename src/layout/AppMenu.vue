<script setup>
import { ref } from 'vue'

import AppMenuItem from './AppMenuItem.vue'

const model = ref([
  {
    label: 'Home',
    items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
  },
  {
    label: 'Pages',
    items: [
      { label: 'Users', icon: 'pi pi-fw pi-users', to: '/users' },
      { label: 'Orders', icon: 'pi pi-fw pi-list', to: '/orders' },
      { label: 'OTC', icon: 'pi pi-fw pi-dollar', to: '/otc' },
      { label: 'Sell', icon: 'pi pi-fw pi-money-bill', to: '/sell' },
      { label: 'Payout', icon: 'pi pi-fw pi-receipt', to: '/payout' },
      { label: 'Bank', icon: 'pi pi-fw pi-building-columns', to: '/bank' },
      { label: 'Verify', icon: 'pi pi-fw pi-file-check', to: '/verify' },
      { label: 'Verify Bank', icon: 'pi pi-fw pi-building-columns', to: '/bank-verify' },
      { label: 'Errors', icon: 'pi pi-fw pi-exclamation-triangle', to: '/errors' },
      { label: 'Coins', icon: 'pi pi-fw pi-bitcoin', to: '/coins' },
      { label: 'Market', icon: 'pi pi-fw pi-chart-bar', to: '/market' },
      { label: 'Search', icon: 'pi pi-fw pi-search', to: '/search' },
      { label: 'GoAML', icon: 'pi pi-fw pi-flag', to: '/goaml' }
    ]
  }
])
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped>
</style>
