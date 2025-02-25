<template>
  <div class="content is-size-6">
    <h4>Order Item</h4>
    <div class="box">
      <div class="columns">
        <div class="column">
          Coin
        </div>
        <div class="column">
          <coin-dropdown
            v-if="!sellOrder.symbol"
            :key="`${user.uid}-coin-dropdown`"
            label="Add coin"
            @select="addItemSell"
          />
          <div
            v-else
            class="level"
          >
            <div class="level-left">
              <div class="level-item">
                <img
                  :src="`https://static.easycrypto.nz/img/coins/${sellOrder.symbol}.png`"
                  alt
                  style="width:32px;"
                >
              </div>
              <div class="level-item">
                {{ sellOrder.symbol }}
              </div>
              <span
                class="icon cursor has-text-grey-light"
                @click="removeItemSell()"
              >
                <em class="fa fa-trash" /></span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="sellOrder.symbol">
        <div class="columns">
          <div class="column">
            Crypto
          </div>
          <div class="column">
            <b-input
              v-model="sellOrder.amount"
              :size="$root.mobile? 'is-small' : ''"
              placeholder="Enter crypto amount"
              style="min-width: 80px"
            />
          </div>
        </div>
        <div class="columns">
          <div class="column">
            Quoted
          </div>
          <div class="column">
            {{ price(sellOrder.quoted) }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="sellOrder.symbol">
      <h4>Cost</h4>
      <div class="box">
        <b-slider
          v-model="margin"
          :custom-formatter="x => x + '%'"
          :max="5"
          :step="0.01"
        />
        <div class="columns">
          <div class="column">
            Total
          </div>
          <div class="column">
            {{ price(sellOrder.total) }}
          </div>
        </div>
        <div class="columns">
          <div class="column">
            Margin
          </div>
          <div class="column">
            {{ margin }}%
          </div>
        </div>
        <div class="columns">
          <div class="column">
            Fee
          </div>
          <div class="column">
            {{ price(sellOrder.fee) }}
          </div>
        </div>
      </div>
      <h4>Bank Account</h4>
      <div class="box">
        <b-field>
          <b-select
            v-model="sellOrder.bankAccount"
            expanded
            placeholder="Select bank account"
          >
            <option
              v-for="val in bankAccountList"
              :key="val"
              :value="val"
            >
              {{ val }}
            </option>
          </b-select>
        </b-field>
      </div>
      <h4>Create Order</h4>
      <div class="box">
        <div class="buttons">
          <b-button
            :loading="creating"
            type="is-success"
            @click="createOtcSellOrder"
          >
            Create order
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import CoinDropdown from './parts/order/CoinDropdown.vue'

export default {
  name: 'OTC',
  components: {CoinDropdown},
  props: {
    user: Object
  },
  data () {
    return {
      bankAccountList: [],
      sellOrder: {
        uid: this.user.uid,
        bankAccount: null,
        total: null,
        fee: null,
        ma: null,
        fb: null,
        symbol: null,
        name: null,
        amount: null,
        quoted: null,
        address: null,
        memo: null,
        exchange: null
      },
      margin: 0,
      creating: false
    }
  },
  watch: {
    'user': {
      handler () {
        this.getBankAccount(this.user.uid)
        this.removeItemSell()
      },
      deep: true
    },
    'margin': function (val) {
      this.sellOrder.ma = val / 100
      this.sellOrder.fee = this.sellOrder.total * this.sellOrder.ma
      this.sellOrder.quoted = this.sellOrder.total * (1 - this.sellOrder.ma)
    },
    'sellOrder.amount': {
      handler (val) {
        if (val) {
          this.sellOrder.total = this.$store.getters['coins/sellRate'](this.sellOrder.symbol) * val
          this.sellOrder.fee = this.sellOrder.total * this.sellOrder.ma
          this.sellOrder.quoted = this.sellOrder.total * (1 - this.sellOrder.ma)
        }
      },
      immediate: true
    }
  },
  mounted () {
    if (!this.user) {
      return
    }
    this.getBankAccount(this.user.uid)
  },
  methods: {
    getBankAccount (uid) {
      this.ecApi('order-admin', 'getBankAccount', {uid}).then(res => {
        if (res) {
          this.bankAccountList = res.bankAccount
        }
      }).catch(e => {
        this.$buefy.toast.open({
          message: e,
          type: 'is-danger'
        })
      })
    },
    createOtcSellOrder () {
      if (!this.validation()) {
        return
      }
      this.creating = true
      this.ecApi('order-admin', 'createOtcSell', this.sellOrder).then(res => {
        if (res) {
          this.$buefy.toast.open({
            message: res.message,
            type: 'is-success'
          })

          this.apiv2('mail', 'pendingSell', {
            orderId: res.orderId,
            isOtc: true
          })
            .then(() => {
              this.$buefy.toast.open('OTC Sell order pending email sent to user!')
            })
            .catch(e => {
              this.$buefy.toast.open({
                message: 'Failed to send OTC Sell order pending email to user. ' + e,
                type: 'is-danger'
              })
            })
        }
      }).catch(e => {
        this.$buefy.toast.open({
          message: e,
          type: 'is-danger'
        })
      }).finally(() => {
        this.creating = false
      })
    },
    validation () {
      let message = ''
      if (!this.sellOrder.amount) {
        message = 'Please enter crypto amount'
      }
      if (!this.sellOrder.bankAccount) {
        message = 'Please select bank account'
      }
      if (message) {
        this.$buefy.toast.open({
          message,
          type: 'is-danger'
        })
        return false
      }
      return true
    },
    addItemSell (symbol) {
      let coin = this.$store.getters['coins/coin'](symbol)
      let coinSettings = this.$store.getters['coins/coinSettings']

      if (!coin) {
        this.$buefy.toast.open(`Cannot find ${symbol} in coins database`)
        return
      }

      this.margin = coin.ma * 100
      this.sellOrder.name = coin.name
      this.sellOrder.ma = coin.ma
      this.sellOrder.symbol = symbol
      this.sellOrder.address = coin.sellAddress
      this.sellOrder.memo = coin.sellMemo
      this.sellOrder.fb = coinSettings.fb
      this.sellOrder.exchange = coin.q
    },
    removeItemSell () {
      this.margin = null
      Object.keys(this.sellOrder).forEach(key => {
        key === 'uid' ? this.sellOrder[key] = this.user.uid : this.sellOrder[key] = null
      })
    }
  }
}
</script>
