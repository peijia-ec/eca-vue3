<template>
  <section class="section">
    <h2 class="title">
      Search
    </h2>
    <p>Search for autobuy, poli, bank account, crypto address or txid - buy and sell.</p><br>
    <b-field grouped>
      <b-select v-model="perPage">
        <option
          v-for="option in perPageOptions"
          :key="option"
          :value="option"
        >
          {{ option + ' per page' }}
        </option>
      </b-select>
      <b-select
        v-model="reference"
        @input="changeReferenceOption"
      >
        <option value="poli">
          POLi
        </option>
        <option value="autobuy">
          Autobuy
        </option>
        <option value="bankAccount">
          Bank account
        </option>
        <option value="cryptoAddress">
          Crypto address
        </option>
        <option value="txidsell">
          TXID - Sell
        </option>
        <option value="txidbuy">
          TXID - Buy
        </option>
        <option value="orderId">
          Order Id
        </option>
      </b-select>
      <b-input
        v-model="search"
        placeholder="Filter..."
        type="search"
      />
      <b-button
        @click="searchReference"
        class="is-primary"
      >
        Search
      </b-button>
    </b-field>
    <b-table
      :data="rowDisplay"
      :key="dataKey"
      :loading="loading"
      :per-page="perPage"
      paginated
    >
      <template #empty>
        <div
          v-if="data.length === 0"
          class="has-text-centered"
        >
          No Records
        </div>
      </template>
      <template #default="props">
        <!-- autobuy display -->
        <template v-if="reference === 'autobuy'">
          <b-table-column
            field="reference"
            label="Reference"
          >
            {{ 'EC' + props.row.reference }}
          </b-table-column>
          <b-table-column
            field="uid"
            label="UID"
          >
            <router-link
              :to="{name: 'user', query: {uid: props.row.uid}}"
            >
              {{ props.row.uid }}
            </router-link>
          </b-table-column>
          <b-table-column
            field="enabled"
            label="Enabled"
          >
            {{ props.row.enabled }}
          </b-table-column>
        </template>
        <!-- crypto address, TXID sell, bank account & Poli display -->
        <template v-else>
          <b-table-column
            field="date"
            label="Date"
          >
            {{ props.row.date }}
          </b-table-column>
          <b-table-column
            field="orderId"
            label="Order ID"
          >
            <router-link
              :to="{name: 'user', query: {uid: props.row.uid, orderId: props.row.orderId}}"
            >
              {{ props.row.orderId }}
            </router-link>
          </b-table-column>
          <b-table-column
            field="uid"
            label="UID"
          >
            <router-link
              :to="{name: 'user', query: {uid: props.row.uid}}"
            >
              {{ props.row.uid }}
            </router-link>
          </b-table-column>
          <b-table-column
            v-if="reference === 'cryptoAddress'"
            field="address"
            label="Address"
          >
            {{ props.row.direction === 'sell' ? props.row.sell_address : props.row.buy_address }}
          </b-table-column>
          <b-table-column
            v-if="reference === 'cryptoAddress' && props.row.memo"
            field="memo"
            label="Memo"
          >
            {{ props.row.memo }}
          </b-table-column>
          <b-table-column
            v-if="reference === 'cryptoAddress'"
            field="direction"
            label="Direction"
          >
            {{ props.row.direction }}
          </b-table-column>
          <b-table-column
            v-if="reference === 'bankAccount'"
            field="bankAccount"
            label="Bank Account"
          >
            {{ props.row.bankAccount }}
          </b-table-column>
          <b-table-column
            v-if="reference === 'poli'"
            field="poli"
            label="Poli ID"
          >
            {{ props.row.poliId }}
          </b-table-column>
          <b-table-column
            v-if="reference === 'txidsell' || reference === 'txidbuy' || reference === 'orderId'"
            field="coins"
            label="Coin"
          >
            {{ getCoinsString(props.row.coins) }}
          </b-table-column>
          <b-table-column
            field="status"
            label="Status"
          >
            <template v-if="props.row.status">
              <b-tooltip
                position="is-left"
                :label="props.row.statusInfo"
                type="is-dark"
              >
                <b-tag :type="props.row.statusTag">
                  {{ props.row.status }}
                </b-tag>
              </b-tooltip>
            </template>
          </b-table-column>
        </template>
      </template>
    </b-table>
  </section>
</template>

<script>
import moment from 'moment-timezone'

export default {
  name: 'Search',
  data () {
    return {
      perPage: 25,
      perPageOptions: [25,50,75,100],
      search: '',
      reference: 'poli',
      loading: false,
      data: [],
      dataKey: 0
    }
  },
  computed: {
    rowDisplay() {
      if (this.data.length < 1) {
        return [];
      }
      if (this.reference === 'autobuy') {
        return this.data
      }
      let orders = []
      const coins = this.$store.state.coins.coins

      for (let i = 0; i < this.data.length; i++) {
        let row = this.data[i]
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
            if (coins.hasOwnProperty(e.coin) && coins[e.coin].delayed) {
              status = 'Delayed'
              tag = 'is-warning'
              delayedCoins.push(e.coin)
            }
          }
          let delayed = delayedCoins.length > 0

          if (!row.processed && row.suspicious) {
            status = 'Suspicious'
            tag = 'is-danger'
            info = 'Paid ' + moment(row.paid).format(format)
          } else if (row.holdTilReceived && !row.received) {
            status = 'Bank'
            tag = 'is-warning'
            info = 'Held until payment received'
          } else if (row.invalidAddress) {
            status = 'Invalid'
            tag = 'is-warning'
            info = 'Invalid address or memo in order'
          } else if (!delayed && row.hold && row.processed) {
            status = 'Held'
            tag = 'is-dark'
            info = 'Held ' + moment(row.hold).format(format)
          } else {
            if (!status) {
              status = 'Paid'
              tag = 'is-light'
              info = 'Paid ' + moment(row.paid).format(format)
            }

            if (delayed) {
              info = delayedCoins.join(', ')
            }
          }
        }
        row.status = status
        row.statusInfo = info
        row.statusTag = tag
        orders.push(row)
      }
      return orders
    }
  },
  methods: {
    getCoinsString(coins) {
      if (!coins || !Array.isArray(coins)) {
        return ''; // Handle cases where coins might be missing or not an array
      }
      return coins.map(coin => coin.coin).join(', ');
    },
    async searchReference () {
      this.loading = true
      let reference = this.reference
      let search = this.search
      if(this.reference === 'txidsell') {
        try {
          let res = await this.pdbApi('/pdb/eca/get-deposit-bytxidsell', {
            txid: search
          })
          search = res.orderId
          reference = 'orderId'
        } catch (e) {
          this.$buefy.toast.open('txid error: ' + e)
          this.loading = false
          console.error(e)
        }
      }
      try {
        let res = await this.apiv2('api-admin/index', 'search/reference', {
          params: {
            page: 1,
            limit: 250,
            input: search,
            reference: reference,
            sort: {
              direction: 'desc'
            }
          }
        })
        this.data = res.data
        this.dataKey++
        this.loading = false
      } catch (e) {
        this.$buefy.toast.open(e)
        this.loading = false
        console.error(e)
      }
    },
    changeReferenceOption () {
      this.data = []
    }
  }
}
</script>
