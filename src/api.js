import store from './store'

// const local = require('./localisation').default
// let localConfig = (await import('./src/localisation2')).default
import local from './localisation'

const api = function (location, data = {}, auth = true, requestMethod = 'POST') {
  return new Promise((resolve, reject) => {
    if (!store || !store.state.hasOwnProperty('goauth')) {
      reject(new Error('GOAuth not loaded when sending API call'))
    }

    let tries = 6
    if (!location) {
      reject(new Error('No API specified'))
    }
    let headers = {
      'Content-type': 'application/json'
    }
    if (auth) {
      headers.Authorization = 'Bearer ' + store.state.goauth.token
    }

    let version = data.version && data.version === 2 ? 'apiv2' : 'api'
    let url = local.api + '/' + version + '/' + location + '.php'
    if (location.substring(0, 4) === 'http') {
      url = location
    }

    if (url.startsWith(local.api)) {
      // Add authorisation headers
      headers.Authorization = 'Bearer ' + store.state.goauth.token
    }

    let request = {
      method: requestMethod,
      headers: headers
    }
    if (requestMethod === 'POST') {
      request.body = JSON.stringify(data)
    }

    let makeReq = () => {
      fetch(url, request)
        .then((resp) => resp.text())
        .then((json) => {
          try {
            json = JSON.parse(json)
            resolve(json)
          } catch (e) {
            console.log(json)
            console.log(e)
          }
        })
        .catch((e) => {
          console.log(e)
          tries--
          if (tries) {
            console.log('Error communicating with API, retrying... ' + tries)
            setTimeout(() => {
              makeReq()
            }, 1000)
          } else {
            console.log('Out of tries :(')
            reject(new Error('Error contacting API'))
          }
        })
    }
    makeReq()
  })
}

export default api
