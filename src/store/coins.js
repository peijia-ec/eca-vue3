import local from '@/localisation'
import moment from 'dayjs'
import duration from 'dayjs/plugin/duration'
moment.extend(duration)

const maxPriceAge = 5 // in minutes

const state = {
  coins: {},
  rates: [],
  restrictedCoins: {
    tier20: [],
    tier30: []
  },
  buffer: 0.006,
  sellBuffer: 0.05,
  fiatBuffer: 0.04,
  margin: 0.01,
  updated: null,
  updating: false,
  buyMargin: 0
}
const defaultState = JSON.parse(JSON.stringify(state))

const getters = {
  coin: (state) => (symbol) => {
    return state.coins.hasOwnProperty(symbol) ? state.coins[symbol] : {
      symbol: 'ZZZ',
      name: 'Not found',
      rate: 0
    }
  },
  coinSettings: (state) => {
    return {
      fb: state.fiatBuffer
    }
  },
  sorted: (state) => {
    let list = Object.keys(state.coins)
    // Sort alphabetically by coin name
    list.sort(function (a, b) {
      let nameA = state.coins[a].name.toLowerCase()
      let nameB = state.coins[b].name.toLowerCase()
      if (nameA < nameB) {
        return -1
      } else if (nameA > nameB) {
        return 1
      } else {
        return 0
      }
    })
    return list.map(x => state.coins[x])
  },
  fiat: () => {
    // Simple array of the single fiat currency, so we can easily migrate to multiple in the future
    return [{
      symbol: local.currency,
      name: local.currency
    }]
  },
  live: (state) => {
    if (!state.updated) {
      return false
    }
    let age = moment.duration(moment().diff(moment(state.updated)))
    return age.asMinutes() < maxPriceAge
  },
  list: (state) => {
    let list = Object.keys(state.coins)
    // Sort alphabetically by coin name
    list.sort(function (a, b) {
      let nameA = state.coins[a].name.toLowerCase()
      let nameB = state.coins[b].name.toLowerCase()
      if (nameA < nameB) {
        return -1
      } else if (nameA > nameB) {
        return 1
      } else {
        return 0
      }
    })
    return list
  },
  listSell: (state, getters) => {
    let list = []
    for (let symbol of getters.list) {
      if (state.coins[symbol].hasOwnProperty('sellAddress') && state.coins[symbol].sellAddress) {
        list.push(symbol)
      }
    }
    return list
  },
  names: (state, getters) => {
    let coinNames = []
    for (let symbol of getters.list) {
      coinNames.push(state.coins[symbol].name)
    }
    return coinNames.join(', ')
  },
  paths: (state) => {
    let paths = []
    for (let symbol in state.coins) {
      if (!state.coins.hasOwnProperty(symbol)) {
        continue
      }
      paths.push('\'/buy-sell/' + symbol.toLowerCase() + '-' + state.coins[symbol].name.toLowerCase().replace(/[^\w ]/g, '').replace(/ /g, '-') + '\'')
    }
    return paths.join(', ')
  },
  rate: (state, getters) => (symbol) => {
    if (state.coins.hasOwnProperty(symbol)) {
      // Get our Buy rate if possible
      let rate = getters.scaleRate(symbol, false)
      if (rate) {
        return rate
      }
    }
    return 0
  },
  scaleRate: (state, getters) => (symbol, includeNetworkFee = true) => {
    if (!state.coins.hasOwnProperty(symbol)) {
      return
    }
    let rate = state.coins[symbol].rate
    if (!rate || isNaN(rate)) {
      return 0
    }

    let multiplier = 1
    let xVal = 2000
    let newRate = rate
    if (rate < xVal) {
      multiplier = xVal / rate
      newRate = xVal
    }
    let rates = getters.findRates(symbol, newRate, undefined, includeNetworkFee)

    if (rates && rates.length && rates[0].amount) {
      return rate / rates[0].amount * multiplier
    } else {
      return rate
    }
  },
  sellRate: (state, getters) => (symbol) => {
    return getters.scaleRate(symbol) ? getters.scaleRate(symbol) * (1 - state.sellBuffer) : 0
  },
  findRates: (state) => (symbol, fiat, margin, includeNetworkFee = true) => {
    if (!state.coins.hasOwnProperty(symbol)) {
      return []
    }
    /*
Root level:

za = paths 120
zb = paths 300
zc = paths 750
zd = paths 1500
ze = paths 5000

Inside each path:

a = type
b = 'exchange' type
c = exchange fee
d = rate
e = min exchange
f = min withdraw
g = withdraw fee
h = 'transfer' type
i = deposit fee
j = steps
k = 'onramp' type
     */

    let percentPadding = 0.15 // check the final rate less this percentage and see if it still works
    let rates = []

    fiat = parseFloat(fiat)
    if (isNaN(fiat) || fiat === 0) {
      return []
    } // no NZD specified

    // Use a custom margin if specified
    let ma = typeof margin === 'undefined' ? state.coins[symbol].ma : margin
    let of = fiat * ma
    fiat = fiat - of

    // Get quote buffer - first attempt from API info
    let buffer = state.buffer
    fiat -= buffer * fiat // buffer of safety for quoted price

    // Use pre-calculated paths for speed
    let paths = []
    if (fiat < 200) {
      paths = state.coins[symbol].za
    } else if (fiat < 500) {
      paths = state.coins[symbol].zb
    } else if (fiat < 1000) {
      paths = state.coins[symbol].zc
    } else if (fiat < 3000) {
      paths = state.coins[symbol].zd
    } else {
      paths = state.coins[symbol].ze
    }
    if (!paths || !paths.length) {
      return []
    }

    for (let y = 0; y < paths.length; y++) {
      // For each pathway
      let pathGood = true
      let amount = fiat
      let steps = paths[y].j
      if (!steps || !steps.length) {
        continue
      }

      let x = 0
      while (x < steps.length && pathGood) {
        let step = steps[x]

        if (step.a === 'h') {
          // Transfer between exchanges

          // Check if there is a deposit fee
          if (step.i) {
            amount -= step.i
            if (amount < 0) {
              pathGood = false
            }
          }
        } else {
          // Standard transaction

          amount /= step.d

          // Subtract exchange fee
          if (step.c) {
            amount -= amount * step.c
          }
          // Withdraw fee (on the last step of the chain)
          if (includeNetworkFee && x === steps.length - 1 && step.g) {
            amount -= step.g
          }
          // Can we withdraw it?
          if (step.f && amount * (1 - percentPadding) <= step.f) {
            pathGood = false
          }
          // Check if less than minimum transaction size
          if (step.e && amount * (1 - percentPadding) <= step.e) {
            pathGood = false
          }
          // Check if negative value
          if (amount < 0) {
            pathGood = false
          }
          // Store the path data
        }
        x++
      }
      // If the path still works, store it
      if (pathGood) {
        rates.push({
          amount: amount,
          steps: steps
        })
      }
    }
    // Sort the returned array by best value
    if (rates && rates.length) {
      rates.sort(function (a, b) {
        return a['amount'] < b['amount']
      })
    }

    return rates
  }
}

const mutations = {
  coins (state, payload) {
    state.coins = payload.coins
    state.restrictedCoins = payload.restrictedCoins
    state.updated = payload.time
    state.updating = false
    console.log('Coins updated')
  },
  rates (state, payload) {
    state.rates = payload
  },
  buffers (state, payload) {
    if (!isNaN(parseFloat(payload.buffer))) {
      state.buffer = parseFloat(payload.buffer)
    }
    if (!isNaN(parseFloat(payload.sellBuffer))) {
      state.sellBuffer = parseFloat(payload.sellBuffer)
    }
    if (!isNaN(parseFloat(payload.fiatBuffer))) {
      state.fiatBuffer = parseFloat(payload.fiatBuffer)
    }
    if (!isNaN(parseFloat(payload.buyMargin))) {
      state.buyMargin = parseFloat(payload.buyMargin)
    }
  },
  updating (state, value) {
    state.updating = value
  },
  resetState (state) {
    let temp = JSON.parse(JSON.stringify(defaultState))
    for (let key in temp) {
      if (!temp.hasOwnProperty(key)) {
        continue
      }
      state[key] = temp[key]
    }
  }
}

const actions = {
  init ({state, commit, dispatch}) {
    commit('updating', false)
    dispatch('update')
  },
  async update ({state, commit, rootState}) {
    if (state.updating) {
      return
    }
    commit('updating', true)

    let cb = Math.floor(new Date().getTime() / 1000 / 60)

    let data
    try {
      let resp = await fetch(`${local.rates}/cb/${cb}/coins.csv`)
      data = await resp.json()
    } catch (e) {
      // nothing
      console.log(e)
    }
    if (!data || typeof data !== 'object' || !data.hasOwnProperty('coins')) {
      // invalid data
      console.log('Failed to get new coin data')
      commit('updating', false)
      return
    }
    let coins = data.coins

    // Set settings
    let settings = data.settings
    commit('buffers', {
      buffer: settings.bu,
      sellBuffer: settings.sp,
      fiatBuffer: settings.fb,
      buyMargin: settings.bm
    })

    // Save the updated coins
    commit('coins', {
      settings: settings,
      coins: coins,
      time: moment().format()
    })

    // Get the backend rates DB
    let rates
    try {
      let resp = await fetch(`${local.rates}/cb/${cb}/backenddb.csv`)
      rates = await resp.json()
    } catch (e) {
      // nothing
    }
    if (!rates) {
      return
    }
    commit('rates', rates)
  },
  reset ({commit}) {
    commit('resetState')
  }
}

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
