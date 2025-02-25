import moment from 'dayjs'
import duration from 'dayjs/plugin/duration'
moment.extend(duration)

export function getAge (date) {
  date = moment(date)
  if (!date.isValid()) {
    return false
  } // invalid date, force refresh
  return moment.duration(moment().diff(date))
}

export function getQueryStringValue (key) {
  return decodeURIComponent(window.location.search.replace(new RegExp('^(?:.*[&\\?]' + encodeURIComponent(key).replace(/[.+*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$', 'i'), '$1'))
}

/**
 * Return web link to blockchain explorer
 *
 * @param symbol
 * @param address Optional address
 * @param txid Option transaction ID
 * @returns {string}
 */
export function blockchainLink (symbol, address = null, txid = null, network = null) {
  let value, type
  if (txid) {
    value = txid
    type = 'txid'
  } else {
    value = address
    type = 'address'
  }

  // BSC
  if(network === 'BSC') {
    return `https://bscscan.com/tx/${txid || address}`
  }
  // ERC20
  if(network === 'ETH'){
    if (txid) {
      return `https://etherscan.io/tx/${txid}`
    } else {
      return `https://etherscan.io/address/${address}`
    }
  }
  // MATIC
  if(network === 'MATIC') {
    if (txid) {
      return `https://polygonscan.com/tx/${txid}`
    } else {
      return `https://polygonscan.com/address/${address}`
    }
  }

  const erc20 = ['ETH', 'BAT', 'DAI', 'DENT', 'ENJ', 'FET', 'FTT', 'FUN', 'GNT', 'GVT', 'HOT', 'LINK', 'MANA',
    'MKR', 'NCASH', 'NPXS', 'OMG', 'POE', 'POLY', 'POWR', 'RCN', 'REP', 'REQ', 'TNT', 'TUSD', 'USDC', 'USDT', 'WABI',
    'WAN', 'WTC', 'ZRX', 'GRT']
  if (erc20.includes(symbol)) {
    if (txid) {
      return `https://etherscan.io/tx/${txid}`
    } else {
      return `https://etherscan.io/address/${address}`
    }
  }

  // TRX / TRC20
  const trx = ['TRX', 'WIN']
  if (trx.includes(symbol) || network === 'TRX') {
    if (txid) {
      return `https://tronscan.org/#/transaction/${txid}`
    } else {
      return `https://tronscan.org/#/address/${address}`
    }
  }

  switch (symbol) {
  case 'BTC':
  case 'ADA':
  case 'BCH':
  case 'BSV':
  case 'LTC':
  case 'DASH':
  case 'DOGE':
    return blockchairLink({
      symbol: symbol,
      value: value,
      type: type
    })
  case 'XLM':
    return blockchairLink({
      symbol: symbol,
      value: value,
      type: type,
      addressLabel: 'account'
    })
  case 'MATIC':
    if (txid) {
      return `https://polygonscan.com/tx/${txid}`
    } else {
      return `https://polygonscan.com/address/${address}`
    }
  case 'VET':
    if (txid) {
      return `https://explore.vechain.org/transactions/${txid}`
    } else {
      return `https://explore.vechain.org/accounts/${address}`
    }
  case 'XRP':
    if (txid) {
      return `https://xrpscan.com/tx/${txid}`
    } else {
      return `https://xrpscan.com/account/${address}`
    }
  case 'ZIL':
    if (txid) {
      return `https://mainnet.zillab.com/tx/${txid}`
    } else {
      return `https://mainnet.zillab.com/address/${address}`
    }
  case 'IOTA':
    if (txid) {
      return 'https://thetangle.org/transaction/' + txid
    } else {
      return 'https://thetangle.org/address/' + address
    }
  case 'XVG':
    return 'https://verge-blockchain.info/address/' + address
  case 'DGB':
    return `https://chainz.cryptoid.info/dgb/address.dws?${address}.htm`
  case 'EOS':
    return `https://bloks.io/account/${address}`
  case 'NANO':
    return `https://www.nanode.co/account/${address}`
  case 'FTM':
    if (txid) {
      return 'https://ftmscan.com/tx/' + txid
    } else {
      return 'https://ftmscan.com/address/' + address
    }
  case 'ETC':
    if (txid) {
      return 'https://www.oklink.com/en/etc/tx/' + txid
    } else {
      return 'https://www.oklink.com/en/etc/address/' + address
    }
  default:
    return ''
  }
}

function blockchairLink (o) {
  const slugs = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    XRP: 'ripple',
    BCH: 'bitcoin-cash',
    LTC: 'litecoin',
    BSV: 'bitcoin-sv',
    XLM: 'stellar',
    DASH: 'dash',
    DOGE: 'dogecoin',
    ADA: 'cardano'
  }

  let defaultOptions = {
    slug: slugs.hasOwnProperty(o.symbol) ? slugs[o.symbol] : null,
    type: 'address',
    value: null,
    addressLabel: 'address',
    transactionLabel: 'transaction'
  }

  // Merge the option arrays, overwriting the default options with user set options
  o = Object.assign(defaultOptions, o)

  let type = o.type === 'txid' ? o.transactionLabel : o.addressLabel

  return `https://blockchair.com/${o.slug}/${type}/${o.value}?from=easycrypto`
}

export function parseUserLimits (computedLimits, fiatSymbol) {
  computedLimits = JSON.parse(JSON.stringify(computedLimits))
  let x = {
    buy: [],
    sell: [],
    symbols: {},
    fiat: {
      bought: 0,
      sold: 0,
      used: 0,
      limit: 0,
      verified: 0,
      remaining: 0
    }
  }
  if (!computedLimits || !fiatSymbol) {
    return x
  }
  x.buy = computedLimits.filter(z => z.symbol === fiatSymbol)
  x.sell = computedLimits.filter(z => z.symbol !== fiatSymbol)
  for (let row of computedLimits) {
    if (row.symbol === fiatSymbol) {
      row.used = parseFloat(row.sold) - parseFloat(row.bought)
      row.limit = parseFloat(row.verified)
      x.fiat = row
    } else {
      row.used = parseFloat(row.sold)
      row.limit = parseFloat(row.remaining) + parseFloat(row.sold)
    }
    x.symbols[row.symbol] = row
  }
  return x
}
