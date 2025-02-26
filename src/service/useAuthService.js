import { inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import local from '@/localisation'
import api from '@/api'

export function useAuthService () {
  const gAuth = inject('gAuth')
  const store = useStore()
  const route = useRoute()
  const router = useRouter()

  function loginWithGoogle () {
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

  return { loginWithGoogle, signOut }

}
