import local from '@/localisation'

export function useUtils () {
  const cryptoNum = (amount, precision = 8) => {
    return Math.round(amount * Math.pow(10, precision)) / Math.pow(10, precision)
  }

  const toInt = (number) => {
    number = parseInt(number, 10)
    if (!number || isNaN(number)) {
      number = 0
    }
    return number
  }

  const toFloat = (number) => {
    number = parseFloat(number)
    if (!number || isNaN(number)) {
      number = 0
    }
    return number
  }

  const currency = (number, digits = 0) => {
    number = toFloat(number)
    let currency = new globalThis.Intl.NumberFormat(local.locale, {
      style: 'currency',
      currency: local.currency,
      useGrouping: true,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    })
    return currency.format(number)
  }

  const price = (number, decimals = 2) => {
    if (isNaN(number)) {
      return ''
    }

    let currency = new Intl.NumberFormat('en-NZ', {
      style: 'decimal',
      useGrouping: true,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
    return '$' + currency.format(number)
  }

  const niceNumber = (amount, digits = null) => {
    let style = { style: 'decimal' }
    if (digits !== null) {
      digits = toInt(digits)
    } else if (!amount || isNaN(amount) || amount === 0 || amount < 0) {
      // No number
      return null
    } else if (amount < 1) {
      let zeros
      if (amount < 1 / Math.pow(10, 5)) {
        // Truncate at 8 decimal places
        zeros = 8
      } else {
        // Otherwise floor to 4 significant figures
        zeros = -1 - Math.floor(Math.log10(amount % 1))
        zeros += 5
      }
      amount = Math.floor(amount * Math.pow(10, zeros))
      if (amount) {
        let length = zeros - amount.toString().length
        amount = '0.' + Array(length + 1).join('0') + amount
      } else {
        amount = 0
      }
      return amount
    } else if (amount < 10) {
      // Less than 10 is 4 decimal places
      amount = Math.floor(amount * 1000) / 1000 // round down
      digits = 4
    } else if (amount < 100) {
      // Less than 100 is 3 decimal places
      amount = Math.floor(amount * 1000) / 1000 // round down
      digits = 3
    } else {
      // Otherwise 2 decimal places with grouping
      amount = Math.floor(amount * 100) / 100 // round down
      digits = 2
    }
    return new globalThis.Intl.NumberFormat(local.locale, Object.assign({
      useGrouping: true,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }, style)).format(amount)
  }

  return { cryptoNum, currency, price, niceNumber }
}
