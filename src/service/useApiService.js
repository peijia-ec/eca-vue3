import store from '@/store'
import sendApi from '@/api'
import local from '@/localisation'

export function useApiService () {

  const ecApi = (api, action, data = {}) => {
    return new Promise((resolve, reject) => {
      // data.nonce = new Date().getTime()
      // data.hash = CryptoJS.SHA256(data.nonce + this.$root.token).toString()
      let url = (api.substring(0, 4) === 'http') ? api : local.api + '/api/' + api + '.php'
      data.action = action
      // Add the name of the agent making the change
      if (!data.hasOwnProperty('who')) {
        data.who = store.getters['goauth/logName']
      }
      if (!store.state.goauth.token) {
        console.log('No token!!')
        reject(new Error('No token'))
      }
      data.accessToken = store.state.goauth.token
      sendApi(url, data)
        .then((json) => {
          if (json.hasOwnProperty('success') && json.success === true && json.hasOwnProperty('data')) {
            resolve(json.data)
          } else {
            reject(json.message)
          }
        })
        .catch(e => reject(e))
    })
  }

  const apiv2 = (api, action, data = {}) => {
    return new Promise((resolve, reject) => {
      // data.nonce = new Date().getTime()
      // data.hash = CryptoJS.SHA256(data.nonce + this.$root.token).toString()
      let url = local.api + '/apiv2/' + api + '.php'
      data.action = action
      // data.user = this.$auth.user
      data.accessToken = store.state.goauth.token
      // Add the name of the agent making the change
      if (!data.hasOwnProperty('who')) {
        data.who = store.getters['goauth/logName']
      }
      if (!store.state.goauth.token) {
        console.log('No token!!')
        reject(new Error('No token'))
      }
      sendApi(url, data)
        .then((json) => {
          if (json.hasOwnProperty('success') && json.success === true && json.hasOwnProperty('data')) {
            resolve(json.data)
          } else {
            console.log(json)
            reject(json.message)
          }
        })
        .catch(e => reject(e))
    })
  }

  return { ecApi, apiv2 }
}
