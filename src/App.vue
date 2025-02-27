<script setup>
import { computed, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useStore } from 'vuex'
import { useHead } from '@unhead/vue'
import Login from './views/Login.vue'
import { useAuthService } from './service/useAuthService'

const store = useStore()
const { refreshToken } = useAuthService()

const unread = computed(() => store.getters['info/unread'])

// Head management
useHead({
  title: () => `(${unread}) ECA Admin - Easy Crypto`
})

// Todo: move to new api interceptor
onMounted(() => {
  setInterval(() => {
    // Regularly update all stores
    // this.updateAllStore()
    // Renew token
    refreshToken()
  }, 5 * 60 * 1000)
})

</script>

<template>
  <div id="app">
    <template v-if="$store.state.goauth.token">
      <router-view />
    </template>
    <template v-if="!$store.state.goauth.token">
      <section class="hero is-fullheight">
        <div class="hero-body">
          <div
            class="container has-text-centered"
            style="max-width:400px !important;">
            <div v-if="$store.state.goauth.email && !$store.state.goauth.token">
              Session found, if this page not redirecting please refresh.
            </div>
            <div v-else>
              <Login />
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
