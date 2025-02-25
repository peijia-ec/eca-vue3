const data = {
  countryCode: {
    NZ: 'NZ',
    AU: 'AU',
    ZA: 'ZA',
    NG: 'NG',
    BR: 'BR'
  },
  country: {
    NZ: 'New Zealand',
    AU: 'Australia',
    BR: 'Brasil'
  },
  timezone: {
    NZ: 'Pacific/Auckland',
    AU: 'Australia/Brisbane',
    ZA: 'Africa/Johannesburg',
    NG: 'Africa/Lagos',
    BR: 'America/Sao_Paulo'
  },
  currency: {
    NZ: 'NZD',
    AU: 'AUD',
    ZA: 'ZAR',
    NG: 'NGN',
    BR: 'BRL'
  },
  locale: {
    NZ: 'en-NZ',
    AU: 'en-AU',
    ZA: 'en-ZA',
    NG: 'en-NG',
    BR: 'en-BR'
  },
  confirmations: {
    NZ: 4,
    AU: 0,
    ZA: 2,
    BR: 2
  },
  site: {
    NZ: 'https://easycrypto.com/nz',
    AU: 'https://easycrypto.com/au',
    NG: 'https://easycrypto.com/ng',
    ZA: 'https://easycrypto.com/za',
    BR: 'https://easycrypto.com/br'
  },
  adb: {
    NZ: 'https://adb.easycrypto.nz',
    AU: 'https://adb.easycrypto.com.au',
    NG: 'https://nga.easycrypto.ai',
    ZA: 'https://zaa.easycrypto.ai',
    BR: 'https://bra.easycrypto.ai'
  },
  pgen: {
    NZ: 'https://pgen.easycrypto.nz',
    AU: 'https://p.easycrypto.com.au'
  },
  rates: {
    NZ: 'https://r.easycrypto.nz',
    AU: 'https://r.easycrypto.com.au',
    NG: 'https://r.kiwikrypto.com.ng',
    ZA: 'https://zar.easycrypto.ai',
    BR: 'https://brr.easycrypto.ai'
  },
  drip: {
    NZ: '7831035',
    AU: '6178750',
    ZA: '9681152',
    BR: ''
  }
}

const local = {}
const country = import.meta.env.VITE_EC_COUNTRY
for (let field in data) {
  if (!data[field]) {
    continue
  }
  const hasValue = data[field][country] != null && data[field][country] !== ''
  local[field] = hasValue ? data[field][country] : data[field].NZ
  local.vms = {
    url: import.meta.env.VITE_VMS_URL,
    enable: import.meta.env.VITE_IS_ENABLE_VMS
  }
  local.authServer = import.meta.env.VITE_AUTH_SERVER

  local.api = import.meta.env.VITE_UDB_ENDPOINT
  local.pdb = import.meta.env.VITE_PDB_ENDPOINT
}

local.apiBaseUrl = import.meta.env.VITE_UDBV2_ENDPOINT

export default local
