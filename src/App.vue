<script setup>
import { ref, computed, inject } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import Navbar from './components/legacy/Navbar.vue'
import { useStore } from 'vuex'
import { useHead } from '@unhead/vue'
import local from '@/localisation'
import api from '@/api'

const store = useStore()
const gAuth = inject('gAuth')
const route = useRoute()
const router = useRouter()

// Reactive state
const email = ref(null)
const error = ref(null)
const loggingIn = ref(false)
const hasAuth = ref(false)

// Computed properties
const auth = computed(() => store.state.goauth)
const unread = computed(() => store.getters['info/unread'])

// Head management
useHead({
  title: () => `(${unread}) ECA Admin - Easy Crypto`
})

/**
 * Used to sign in into the system
 * @returns {*}
 */
function loginWithGoogle () {
  // Accessing $root through getCurrentInstance
  // If you rely on $root, you may need to refactor the approach
  // or use getCurrentInstance().proxy to access it (not recommended for production)
  // getCurrentInstance().proxy.$root.signIn()

  // Alternative: Inject and use a global method
  // const { signIn } = inject('auth')
  gAuth
    .signIn()
    .then(GoogleUser => {
      const idToken = GoogleUser.getAuthResponse().id_token
      login(idToken)
        .then(() => {
          if (store.state.goauth.roles === null) {
            signOut()
          } else {
            // Successfully logged in
            store.dispatch('updateAll')
            store.dispatch('getBanReasons')
            let roles = store.state.goauth.roles
            let allRoles = Role
            let arrRoles = []
            for (let i in allRoles) {
              arrRoles.push(allRoles[i])
            }
            if (typeof (roles) === 'string') {
              roles = roles.split(',')
              console.log('roles:' + roles)
              if (roles.some(res => arrRoles.includes(res))) {
                console.log('ok')
              } else {
                signOut()
              }
            } else {
              signOut()
            }
          }
        })
    })
    .catch(error => {
      console.log('error', error)
    })
}

/**
 * Used to sign in to the system
 * @returns {*}
 */
async function login (accessToken) {
  await api(local.authServer, {
    action: 'login',
    token: accessToken
  }, false).then((res) => {
    if (res.success && res.hasOwnProperty('data') && res.data) {
      let authdata = {
        email: res.data.email,
        name: res.data.name,
        photo: res.data.photo,
        roles: res.data.roles,
        token: res.data.accessToken,
        refresh: res.data.refreshToken
      }
      store.dispatch('goauth/update', authdata)
    }
  })
}

/**
 * Used to sign out from the system
 * @returns {*}
 */
async function signOut () {
  let res = await gAuth.signOut()
  if (res) {
    await store.dispatch('resetStore')
    if (route.fullPath !== '/') {
      await router.push({ path: '/' })
    }
  }
}
</script>

<template>
  <div id="app">
    <template v-if="$store.state.goauth.token">
      <Navbar />
      <div class="container">
        <router-view v-slot="{ Component }">
          <transition>
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
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
              <div class="field">
                <Button
                  type="is-primary"
                  outlined
                  @click="loginWithGoogle">
                  Sign In
                </Button>
              </div>
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
