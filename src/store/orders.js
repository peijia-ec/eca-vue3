import { getField, updateField } from 'vuex-map-fields'
import api from '@/api'
import moment from 'dayjs'

const initialState = () => {
  return {
    orders: {
      loading: false,
      data: [],
      nextPage: null,
      prevPage: null,
      total: 0,
      totalPage: 0
    },
    stuck: {
      loading: false,
      data: [],
      nextPage: null,
      prevPage: null,
      total: 0,
      totalPage: 0
    },
    snoozed: {
      loading: false,
      data: [],
      nextPage: null,
      prevPage: null,
      total: 0,
      totalPage: 0
    },
    unreceivedOrders: {
      loading: false,
      data: [],
      nextPage: null,
      prevPage: null,
      total: 0,
      totalPage: 0
    },
    missingAddress: {
      loading: false,
      data: [],
      nextPage: null,
      prevPage: null,
      total: 0,
      totalPage: 0
    },
    unmatchedSellOrdersCount: 0
  }
}

const truncate = function (val) {
  let length = 20
  return (val && val.length > length) ? val.substr(0, length) + '...' : val
}

const niceNumber = function (amount, digits) {
  if (digits === undefined) {
    digits = 4
  }
  amount = parseFloat(amount)
  if (!amount || isNaN(amount) || amount === 0 || amount < 0) {
    // No number
    return null
  } else if (amount < 1) {
    // Less than one, return 4 significant digits
    amount = amount.toPrecision(digits)
    if (amount < 1 / Math.pow(10, 5)) {
      // and cut the number off at 8 decimal places
      amount = Math.round(amount * Math.pow(10, 8))
      if (amount) {
        let length = 8 - amount.toString().length
        amount = '0.' + Array(length + 1).join('0') + amount
      } else {
        amount = 0
      }
    }
    return amount
  } else if (amount < 10) {
    // Less than 10 is 3 decimal places
    return new Intl.NumberFormat('en-NZ', {
      style: 'decimal',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount)
  } else {
    // Otherwise 2 decimal places with grouping
    return new Intl.NumberFormat('en-NZ', {
      style: 'decimal',
      useGrouping: true,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }
}

const price = function (number) {
  if (isNaN(number)) {
    return ''
  }

  let currency = new Intl.NumberFormat('en-NZ', {
    style: 'decimal',
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return '$' + currency.format(number)
}

const formatOrdersData = ({ data, rootState }) => {
  let orders = []

  for (let i = 0; i < data.length; i++) {
    let row = data[i]
    // Get order status
    let status, tag, info
    let format = 'dddd Do MMMM, h:mm:ss a'
    if (row.cancelled) {
      status = 'Canc'
      tag = 'is-white'
      info = moment(row.cancelled).format(format)
    } else if (row.completed) {
      status = 'Complete'
      tag = 'is-success'
      info = moment(row.completed).format(format)
    } else if (row.paid && !row.completed) {
      // Check for delayed order
      // Check for delayed coins
      let delayedCoins = []
      for (let e of row.coins) {
        if (rootState.coins.coins.hasOwnProperty(e.coin) && rootState.coins.coins[e.coin].delayed) {
          status = 'Delayed'
          tag = 'is-warning'
          delayedCoins.push(e.coin)
        }
      }
      let delayed = delayedCoins.length > 0

      if (!row.processed && row.suspicious) {
        status = 'Suspicious'
        tag = 'danger'
        info = 'Paid ' + moment(row.paid).format(format)
      } else if (row.holdTilReceived && !row.received) {
        status = 'Bank'
        tag = 'warn'
        info = 'Held until payment received'
      } else if (row.invalidAddress) {
        status = 'Invalid'
        tag = 'warn'
        info = 'Invalid address or memo in order'
      } else if (!delayed && row.hold && row.processed) {
        status = 'Held'
        tag = 'contrast'
        info = 'Held ' + moment(row.hold).format(format)
      } else {
        if (!status) {
          status = 'Paid'
          tag = 'secondary'
          info = 'Paid ' + moment(row.paid).format(format)
        }

        if (delayed) {
          info = delayedCoins.join(', ')
        }
      }
    }

    // Parse sell total price
    if (row.direction === 'sell') {
      let sellTotal = 0
      for (let item of row.coins) {
        sellTotal += parseFloat(item.filled) || parseFloat(item.quoted)
      }
      row.total = sellTotal
    }

    row.notAtQuote = false
    if (row.direction === 'buy') {
      row.coinList = row.coins.map(e => e.coin + ' ' + e.nzd + '\n' + parseFloat(e.quoted).toPrecision(5) + ' -> ' + parseFloat(e.filled).toPrecision(5)).join('\n')
      // Check for any discrepency between quoted and filled
      if (row.method !== 'manual' && row.completed) {
        for (let coin of row.coins) {
          if ((1 - Math.abs(coin.filled / coin.quoted)) * 100 > 0.15) {
            row.notAtQuote = true
          }
        }
      }
    } else if (row.direction === 'sell') {
      row.coinList = row.coins.map(e => e.coin + ' ' + niceNumber(e.final) + '\n' + price(e.quoted) + ' -> ' + price(e.filled)).join('\n')
    }
    row.coinCount = row.coins.length
    row.status = status
    row.statusInfo = info
    row.statusTag = tag
    // row.tier = (row) ? row.tier : '--'
    row.mobileLabel = row.orderId + '\n' + truncate(row.email) + '\n' + truncate(row.displayName) + '\n' + row.coinList
    orders.push(row)
  }
  return orders
}

const getters = {
  getField
}

const mutations = {
  init (state) {
    state.filter = null
  },
  setValue (state, payload) {
    for (let key of Object.keys(payload)) {
      state[key] = payload[key]
    }
  },
  updateField,
  resetState (state) {
    Object.assign(state, initialState())
  },
  snooze (state, orderId) {
    // Add the snoozed value
    let index = state.orders.data.findIndex(x => x.orderId === orderId)
    if (index > -1) {
      state.orders[index].snoozed = moment().format()
    }
    // Remove from stuck orders
    index = state.stuck.findIndex(x => x.orderId === orderId)
    if (index > -1) {
      state.stuck.splice(index, 1)
    }
  }
}

const actions = {
  reset ({ commit }) {
    commit('resetState')
  },
  async fetchOrders ({ state, commit, rootState }, params) {
    let orderKey = 'orders'
    const filters = ['stuck', 'snoozed', 'missingAddress']
    if (filters.includes(params.filter)) {
      orderKey = params.filter
    }

    commit('setValue', {
      [orderKey]: {
        ...state[orderKey],
        loading: true
      }
    })

    let res = await api('api-admin/index', {
      action: 'order/getOrders',
      version: 2,
      params
    })

    let data = res.data.data
    const orders = formatOrdersData({ data, rootState })
    let updatedObj = {
      [orderKey]: {
        ...res.data,
        data: orders,
        loading: false
      }
    }

    commit('setValue', {
      ...state,
      ...updatedObj
    })
  },
  async fetchUnreceivedOrders ({ state, commit, rootState }, params) {
    commit('setValue', {
      unreceivedOrders: {
        ...state.unreceivedOrders,
        loading: true
      }
    })

    let res = await api('api-admin/index', {
      action: 'order/getUnreceivedOrders',
      version: 2,
      params
    })

    let unreceivedOrders = res.data

    commit('setValue', {
      ...state,
      unreceivedOrders,
      loading: false
    })
  },
  async fetchDashboard ({ state, commit }) {
    let res = await api('api-admin/index', {
      action: 'order/getStuckAndUnmatchedSellCount',
      version: 2
    })

    let { stuckOrders: total, unmatchedSellOrders } = res.data

    commit('setValue', {
      stuck: {
        ...state.stuck,
        total
      },
      unmatchedSellOrdersCount: unmatchedSellOrders
    })
  }
}

export default {
  namespaced: true,
  state: initialState(),
  getters,
  actions,
  mutations
}
