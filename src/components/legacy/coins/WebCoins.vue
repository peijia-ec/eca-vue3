<template>
  <div>
    <h1 class="title is-6">
      Available Coins in Web Exchange
    </h1>

    <b-loading :active.sync="processing" />
    <b-field
      grouped
      group-multiline
    >
      <div class="control is-flex">
        <b-switch v-model="enabledOnly">
          Enabled
        </b-switch>
      </div>
      <div class="control is-flex">
        <b-switch v-model="sourceableOnly">
          Sourceable
        </b-switch>
      </div>
      <b-input
        v-model="filter"
        type="search"
        placeholder="Filter..."
      />
    </b-field>

    <b-table
      :data="coinList"
      :paginated="true"
      :per-page="20"
      default-sort="symbol"
    >
      <template #default="props">
        <b-table-column
          field="symbol"
          label="Symbol"
          sortable
        >
          {{ props.row.symbol }}
        </b-table-column>

        <b-table-column
          field="name"
          label="Name"
          sortable
        >
          {{ props.row.name }}
        </b-table-column>

        <b-table-column
          field="exchanges"
          label="Exchanges"
        >
          <template v-if="props.row.exchanges.length">
            {{ props.row.exchanges.join(', ') }}
          </template>
          <template v-else>
            <a @click="addExchange(props.row)">Add...</a>
          </template>
        </b-table-column>

        <b-table-column
          field="website"
          label="Web"
        >
          <span
            :title="props.row.website || 'Website'"
            class="icon cursor"
            :class="fadeIcon(props.row.website, 'info')"
            @click="setValue(props.row, 'website')"
          ><i class="fa fa-globe" /></span>
        </b-table-column>

        <b-table-column
          field="website"
          label="Wal"
        >
          <span
            :title="props.row.wallet || 'Wallet'"
            class="icon cursor"
            :class="fadeIcon(props.row.wallet, 'info')"
            @click="setValue(props.row, 'wallet')"
          ><i class="fa fa-suitcase" /></span>
        </b-table-column>

        <b-table-column
          field="enabled"
          label="En"
        >
          <span
            title="Enabled"
            class="icon cursor"
            :class="fadeIcon(props.row.enabled, 'success')"
            @click="toggle(props.row, 'enabled')"
          ><i class="fa fa-check" /></span>
        </b-table-column>
      </template>
    </b-table>
    <tree-view
      :data="$store.state.coins.rates"
      :options="{ maxDepth: 0 }"
    />
    <b-modal :active.sync="showAddExchange">
      <div class="box content">
        <h2>Add exchange for {{ coin.name }}</h2>
        <div class="field">
          <div class="select">
            <select v-model="selectExchange">
              <option
                v-for="exchange in activeExchanges"
                :key="exchange.id"
                :value="exchange.id"
              >
                {{ exchange.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="field">
          <button
            class="button is-success"
            @click="addExchange"
          >
            Add exchange
          </button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'WebCoins',
  data () {
    return {
      coins: [],
      exchanges: [],
      coinsExchanges: [],
      enabledOnly: true,
      sourceableOnly: true,
      filter: null,
      processing: false,
      showAddExchange: false,
      coin: {
        symbol: null,
        name: null,
        exchanges: []
      },
      selectExchange: null
    }
  },
  computed: {
    coinList () {
      let list = []
      for (let coin of this.coins) {
        // Free-text search
        if (this.filter) {
          let f = this.filter.toLowerCase()
          if (coin.name.toLowerCase().indexOf(f) === -1 &&
            coin.symbol.toLowerCase().indexOf(f) === -1 &&
            coin.exchanges.join(', ').toLowerCase().indexOf(f) === -1
          ) {
            continue
          }
        }
        let exchanges = []
        for (let exchange of this.coinsExchanges) {
          if (exchange.symbol === coin.symbol) {
            exchanges.push(exchange.exchange)
          }
        }
        coin.exchanges = exchanges
        if (
          (!this.enabledOnly || coin.enabled) &&
          (!this.sourceableOnly || exchanges.length)
        ) {
          list.push(coin)
        }
      }
      return list
    },
    activeExchanges () {
      return this.exchanges.filter((x) => {
        return x.enabled
      })
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    getData () {
      this.processing = true
      this.sendApi(this.$local.rates + '/api.php', {
        action: 'getCoinsFull'
      }, false)
        .then((res) => {
          if (res.hasOwnProperty('data') && res.data.hasOwnProperty('coins')) {
            this.coins = res.data.coins
            this.exchanges = res.data.exchanges
            this.coinsExchanges = res.data.coinsExchanges
          }
          this.processing = false
        })
        .catch((r) => {
          console.log(r)
          this.processing = false
        })
    },
    fadeIcon (testVal, colour) {
      return testVal ? 'has-text-' + colour : 'has-text-grey-lighter'
    },
    toggle (coin, field) {
      if (this.processing) {
        return
      }
      this.processing = true
      this.sendApi(this.$local.rates + '/api.php', {
        action: 'updateCoin',
        symbol: coin.symbol,
        field: field
      }, false)
        .then(() => {
          coin[field] = !coin[field]
          this.processing = false
        })
        .catch((r) => {
          console.log(r)
          this.processing = false
        })
    },
    setValue (coin, field) {
      this.$buefy.dialog.prompt({
        message: `Set the ${field}:`,
        inputAttrs: {
          value: coin[field]
        },
        onConfirm: (value) => {
          if (this.processing) {
            return
          }
          this.processing = true
          this.sendApi(this.$local.rates + '/api.php', {
            action: 'updateCoin',
            field: field,
            symbol: coin.symbol,
            value: value
          }, false)
            .then((res) => {
              coin[field] = value
              this.processing = false
            })
            .catch((r) => {
              console.log(r)
              this.$buefy.toast.open('Failed to set ' + field)
              this.processing = false
            })
        }
      })
    },
    addExchange (coin) {
      if (typeof coin === 'object' && coin.hasOwnProperty('symbol')) {
        // Pop the modal
        this.coin = coin
        this.showAddExchange = true
        return
      }

      // Test data
      if (!this.selectExchange || !this.coin.symbol) {
        return
      }

      if (this.processing) {
        return
      }
      this.processing = true

      // Save the info to DB
      this.coin.exchanges = [this.selectExchange]
      this.sendApi(this.$local.rates + '/api.php', {
        action: 'updateCoin',
        field: 'exchange',
        symbol: this.coin.symbol,
        exchanges: this.coin.exchanges
      }, false)
        .then((res) => {
          this.showAddExchange = false
          this.processing = false
        })
        .catch((r) => {
          console.log(r)
          this.$buefy.toast.open('Failed to add exchange')
          this.processing = false
        })
    }
  }
}
</script>
