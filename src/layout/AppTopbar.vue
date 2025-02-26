<script setup>
import { useLayout } from '@/layout/composables/layout'
import { useAuthService } from '@/service/useAuthService'
// import AppConfigurator from './AppConfigurator.vue'

const { signOut } = useAuthService()
const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout()
</script>

<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
        <i class="pi pi-bars"></i>
      </button>
      <router-link to="/" class="layout-topbar-logo">
        <img src="/logo.png" alt="logo" class="w-8 mr-1" />

        <span>ECA {{ $local.countryCode }}</span>
      </router-link>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
          <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
        </button>
        <!-- <div class="relative">
          <button
            v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            type="button"
            class="layout-topbar-action layout-topbar-action-highlight">
            <i class="pi pi-palette"></i>
          </button>
          <AppConfigurator />
        </div> -->
      </div>

      <button
        class="layout-topbar-menu-button layout-topbar-action"
        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }">
        <img
          v-if="$store.state.goauth.token"
          :src="$store.state.goauth.photo"
          style="border-radius: 50%"
          referrerPolicy="no-referrer">
      </button>

      <div class="layout-topbar-menu hidden">
        <div class="layout-topbar-menu-content">
          <button type="button" class="layout-topbar-action" @click="signOut">
            <i class="pi pi-sign-out"></i>
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
