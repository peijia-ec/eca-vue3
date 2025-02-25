import api from '@/api'

import { getAge } from './helpers'

import local from '@/localisation'
import moment from 'dayjs'
import minMax from 'dayjs/plugin/minMax'

moment.extend(minMax)

const initialState = () => {
  return {
    info: null,
    infoUpdated: null,
    banner: null,
    killBuying: '0',
    killSelling: '0',
    killTrading: '0',
    holdAll: '0',
    predicted: 0,
    predictedSales: 0,
    balances: [],
    deposits: [],
    depositsUpdated: null,
    bank: [],
    smileIdBalance: 0
  }
}

const getters = {
  isFresh (state) {
    return state.infoUpdated && state.depositsUpdated &&
      getAge(moment.min(moment(state.infoUpdated), moment(state.depositsUpdated))).asMinutes() < 1.5
  },
  unmatchedDeposits: (state) => {
    let unmatched = 0
    for (let row of state.deposits) {
      if (!row.cleared && !row.emailed && !row.internal && !row.orderId) {
        unmatched++
      }
    }
    return unmatched
  },
  /**
   * Get the total value of all fiat transactions that are not processed
   * @param state
   * @returns {number}
   */
  receivedNotProcessed: (state) => {
    let total = 0
    for (let row of state.bank) {
      if (!row || !row.deposit) {
        continue
      }
      if (row.confirmations < local.confirmations || !row.processed) {
        const amount = parseFloat(row.deposit)
        total += isNaN(amount) ? 0 : amount
      }
    }
    return total
  },
  unread: (state, getters, rootState) => {
    let i = state.info
    if (!i) {
      return 0
    } else {
      return i.verifications + i.bankVerifications + i.upgrades + rootState.orders.stuck.total + getters.unmatchedDeposits
    }
  },
  coinBalances: (state) => {
    let balances = {}
    for (let row of state.balances) {
      if (!balances.hasOwnProperty(row.currency)) {
        balances[row.currency] = row.balance
      } else {
        balances[row.currency] += row.balance
      }
    }
    balances = Object.keys(balances).map(function (data) {
      return {
        currency: data,
        balance: balances[data]
      }
    })
    balances.sort((a, b) => a.currency.localeCompare(b.currency))
    return balances
  },
  balance: (state) => (symbol) => {
    let balance = 0
    for (let row of state.balances) {
      if (symbol === row.currency) {
        balance += parseFloat(row.balance)
      }
    }
    return balance
  },
  balances: (state) => (symbol, exchange) => {
    let data = []
    for (let row of state.balances) {
      if (
        (!exchange || exchange === row.exchange) &&
        (!symbol || symbol === row.currency)
      ) {
        data.push(row)
      }
    }
    return data
  },
  smileIdBalance: (state) => {
    return state.smileIdBalance
  }
}

const mutations = {
  update (state, data) {
    // Convert 1/0 values to true/false
    for (let key in data) {
      if (!data.hasOwnProperty(key)) {
        continue
      }
      if (data[key] === '1') {
        data[key] = true
      }
      if (data[key] === '0') {
        data[key] = false
      }
    }
    state.info = data
    state.infoUpdated = moment().format()

    state.killBuying = data.killBuying
    state.killSelling = data.killSelling
    state.killTrading = data.killTrading
    state.banner = data.banner

    // Profit prediction
    // Based on profit so far this month + remaining hours * hourly profit for last 7 days
    if (data.profit && data.profit.length && data.hasOwnProperty('profitHour')) {
      let hoursLeft = moment().endOf('month').diff(moment(), 'hours')
      let thisMonth = parseFloat(data.profit[0].profit)
      let predictedRemaining = hoursLeft * data.profitHour
      state.predicted = thisMonth + predictedRemaining
    }
    // Sales prediction
    // Based on sales so far this month + remaining hours * hourly sales for last 7 days
    if (data.months && data.months.length && data.hasOwnProperty('salesHour')) {
      const hoursLeft = moment().endOf('month').diff(moment(), 'hours')
      const thisMonth = parseFloat(data.months[0].total)
      const predictedRemaining = hoursLeft * data.salesHour
      state.predictedSales = thisMonth + predictedRemaining
    }
  },
  balances (state, balances) {
    state.balances = balances
  },
  deposits (state, payload) {
    state.deposits = payload.deposits
    state.bank = payload.bank.map(row => {
      // Create a numeric deposit/withdrawal field for sorting purposes
      row.amount = +row.deposit - +row.withdrawal
      return row
    })
    state.depositsUpdated = moment().format()
  },
  smileIdBalance (state, balance) {
    state.smileIdBalance = balance
  },
  processBankRow (state, id) {
    for (let row of state.bank) {
      if (row.id === id) {
        row.processed = true
        break
      }
    }
  },
  mutateArrayRowById (state, payload) {
    if (!payload.array || !payload.id || !payload.update) {
      return
    }
    if (!Array.isArray(state[payload.array])) {
      return
    }
    // Update the array
    let index = state[payload.array].findIndex(x => x.id === payload.id)
    for (let key of Object.keys(payload.update)) {
      state[payload.array][index][key] = payload.update[key]
    }
  },
  resetState (state) {
    Object.assign(state, initialState())
  }
}

const actions = {
  async update ({ commit, dispatch }) {
    try {
      let res = await api('admin', {
        action: 'getInfo',
        version: 1
      })
      if (res.success && res.hasOwnProperty('data') && res.data) {
        commit('update', res.data)
      }
    } catch (e) {
      console.log(e)
    }

    // Get balances
    try {
      let res = await api(local.rates + '/api.php', {
        action: 'getBalances'
      }, false)
      let balances = []
      if (res.success && res.hasOwnProperty('data')) {
        let wanted = ['BTC', local.currency, 'USD', 'USDT']
        for (let row of res.data) {
          if (!wanted.includes(row.symbol)) {
            continue
          }
          if (row.exchange === 'bitx') {
            continue
          }
          balances.push({
            exchange: row.exchange,
            currency: row.symbol,
            balance: row.balance
          })
        }
        balances.sort((a, b) => a.currency.localeCompare(b.currency)) // sort by coin
        balances.sort((a, b) => a.exchange.localeCompare(b.exchange)) // then by exchange
        commit('balances', balances)
      }
    } catch (e) {
      console.log(e)
    }

    // Get deposits
    dispatch('deposits')

    if (local.countryCode === 'ZA') {
      dispatch('getSmileIdBalance')
    }
  },
  async deposits ({ commit }) {
    try {
      let data = await api(local.pdb + '/pdb/eca/get-deposit')
      if (data.success) {
        commit('deposits', data.data)
      }
    } catch (e) {
      console.log(e)
    }
  },
  async getSmileIdBalance ({ commit }) {
    try {
      const res = await api('smileid', {
        action: 'CheckSmileIDBalance',
        version: 2
      })
      if (res.success) {
        commit('smileIdBalance', res.data.wallet_balance)
      }
    } catch (e) {
      console.log(e)
    }
  },
  reset ({ commit }) {
    commit('resetState')
  }
}

export default {
  namespaced: true,
  state: initialState(),
  getters,
  actions,
  mutations
}
