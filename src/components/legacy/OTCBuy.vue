<template>
  <div>
    <div
      v-if="order"
      :key="`${user.uid}-order`"
      class="content is-size-6"
    >
      <h4>Order items</h4>
      <div class="box">
        <b-table
          v-if="order.items.length"
          :data="order.items"
          :mobile-cards="true"
          class="is-size-7-mobile"
        >
          <template #default="props">
            <b-table-column
              field="symbol"
              label="Coin"
            >
              <div class="level">
                <div class="level-left">
                  <div class="level-item">
                    <img
                      :src="`https://static.easycrypto.nz/img/coins/${props.row.symbol}.png`"
                      style="width:32px;"
                    >
                  </div>
                  <div class="level-item">
                    {{ props.row.symbol }}
                  </div>
                </div>
              </div>
            </b-table-column>
            <b-table-column
              field="fiat"
              label="Fiat"
            >
              <b-field
                :message="error[props.row.symbol] && error[props.row.symbol]['amount']"
                :type="error[props.row.symbol] && error[props.row.symbol]['amount'] ? 'is-danger' : ''"
              >
                <b-input
                  v-model="props.row.amount"
                  :size="$root.mobile? 'is-small' : ''"
                  placeholder="Fiat"
                  style="min-width: 80px"
                />
              </b-field>
            </b-table-column>
            <b-table-column
              field="quote"
              label="Quote"
            >
              <span class="no-break">{{ niceNumber(quote(props.row.symbol, props.row.amount)) }} <span
                class="is-size-7 has-text-grey-light"
              >{{ props.row.symbol }}</span></span>
            </b-table-column>
            <b-table-column
              field="extra"
              label=" "
            >
              <span
                class="icon cursor has-text-grey-light"
                @click="removeItem(props.row.symbol)"
              ><i
                class="fa fa-trash"
              /></span>
            </b-table-column>
          </template>
        </b-table>
        <coin-dropdown
          :key="`${user.uid}-coin-dropdown`"
          label="Add coin"
          @select="addItem($event)"
        />
      </div>
      <h4>Cost</h4>
      <div class="box">
        <b-field label="Our fee">
          <b-slider
            v-model="margin"
            :custom-formatter="x => x + '%'"
            :max="10"
            :step="0.01"
          />
        </b-field>
        <table
          class="table"
          style="width:fit-content"
        >
          <tr>
            <td>Total</td>
            <td>{{ currency(total) }}</td>
          </tr>
          <tr>
            <td>Margin</td>
            <td>{{ margin }}%</td>
          </tr>
          <tr>
            <td>Fee</td>
            <td>{{ currency(fee, 2) }}</td>
          </tr>
        </table>
      </div>
      <template v-if="order.items.length">
        <h4>Delivery address{{ order.items.length > 1 ? 'es' : '' }}</h4>
        <div class="box">
          <div
            v-for="(item, i) in order.items"
            :key="item.symbol"
          >
            <hr v-if="i > 0">
            <h5>
              <img
                :src="`https://static.easycrypto.nz/img/coins/${item.symbol}.png`"
                style="width:24px;"
              >
              {{ item.symbol }} address
            </h5>
            <p v-if="haveAddresses(item.symbol)">
              <a @click="selectSymbol = item.symbol">
                <span class="icon"><i class="fa fa-th-list" /></span>
                Select address from {{ user.firstName }}'s previous orders</a>
            </p>
            <b-field
              :message="error[item.symbol] && error[item.symbol]['address']"
              :type="error[item.symbol] && error[item.symbol]['address'] ? 'is-danger' : ''"
            >
              <b-input
                v-model="item.address"
                :placeholder="`${item.symbol} address`"
              />
            </b-field>
            <b-field>
              <b-input
                v-model="item.memo"
                :placeholder="`${item.symbol} memo`"
              />
            </b-field>
          </div>
        </div>
        <h4>Create order</h4>
        <div class="box">
          <div class="buttons">
            <b-button
              :loading="creating"
              type="is-success"
              @click="validateAndCreateOrder"
            >
              Create order
            </b-button>
            <b-button
              :loading="creating"
              type="is-dark"
              @click="validateAndCreateOrder"
            >
              Create and hold
            </b-button>
          </div>
        </div>
      </template>
    </div>
    <b-modal
      :active="!!selectSymbol"
      @close="selectSymbol = null"
    >
      <div
        v-if="haveAddresses(selectSymbol)"
        class="box"
      >
        <b-table
          :data="udata.addresses[selectSymbol]"
          hoverable
          @click="selectAddress"
        >
          <template #default="props">
            <b-table-column
              field="date"
              label="Last used"
            >
              <span class="nobreak">{{ $moment(props.row.date).format('YYYY-MM-DD') }}</span>
            </b-table-column>
            <b-table-column
              field="count"
              label="Num orders"
            >
              {{ props.row.count }}
            </b-table-column>
            <b-table-column
              field="address"
              label="Address"
            >
              <span class="break">{{ props.row.address }}</span>
            </b-table-column>
            <b-table-column
              field="memo"
              label="Memo"
            >
              {{ props.row.memo }}
            </b-table-column>
          </template>
        </b-table>
      </div>
    </b-modal>
  </div>
</template>
<script>
import CoinDropdown from './parts/order/CoinDropdown.vue'

export default {
  name: 'OTCBuy',
  components: {CoinDropdown},
  props: ['user', 'udata'],
  data () {
    return {
      order: null,
      selectSymbol: null,
      margin: 1,
      creating: false,
      error: {}
    }
  },
  computed: {
    items () {
      return this.order ? this.order.items : []
    },
    total () {
      let total = 0
      for (let item of this.items) {
        total += this.toInt(item.amount)
      }
      return total
    },
    fee () {
      let fee = 0
      for (let item of this.items) {
        fee += item.amount * (this.margin / 100)
      }
      return fee
    },
    quoted () {
      let quotes = {}
      if (!this.order) {
        return quotes
      }
      for (let item of this.order.items) {
        let quote = ''
        let fiat = this.toInt(item.amount)
        let rates = this.$store.getters['coins/findRates'](item.symbol, fiat, this.toFloat(this.margin) / 100)
        if (rates.length) {
          quote = rates[0].amount
        }
        quotes[item.symbol] = quote
      }
      return quotes
    }
  },
  watch: {
    'user': {
      handler () {
        this.newOrder()
      },
      deep: true
    }
  },
  mounted () {
    this.newOrder()
  },
  methods: {
    haveAddresses (symbol) {
      let u = this.udata
      return symbol && u && u.hasOwnProperty('addresses') && u.addresses.hasOwnProperty(symbol)
    },
    quote (symbol, fiat) {
      let rates = this.$store.getters['coins/findRates'](symbol, this.toInt(fiat), this.toFloat(this.margin) / 100)
      return rates && rates.length ? rates[0].amount : ''
    },
    newOrder () {
      if (!this.user) {
        return
      }
      this.order = {
        orderId: null,
        time: this.$moment().format(),
        uid: this.user.uid,
        email: this.user.email,
        direction: 'buy',
        destination: 'ownAddress',
        items: [],
        flags: {
          checkoutStep: null,
          paymentMethod: null,
          paymentName: null,
          personalAccount: false
        },
        affiliatePay: 0,
        toPay: 0,
        fee: 0,
        total: 0
      }

      // Set the default margin to be BTC margin
      let btc = this.$store.getters['coins/coin']('BTC')
      this.margin = btc ? btc.ma * 100 : 1
    },
    addItem (symbol) {
      let coin = this.$store.getters['coins/coin'](symbol)
      if (!coin) {
        this.$buefy.toast.open(`Cannot find ${symbol} in coins database`)
        return
      }
      this.order.items.push({
        symbol: symbol,
        name: coin.name,
        amount: '',
        ma: coin.ma,
        final: null,
        quoted: null,
        address: null,
        memo: null,
        coinText: null
      })
    },
    removeItem (symbol) {
      let index = this.items.map(e => e.symbol).indexOf(symbol)
      if (index > -1) {
        this.order.items.splice(index, 1)
      }
    },
    selectAddress (row) {
      let index = this.order.items.map(e => e.symbol).indexOf(this.selectSymbol)
      this.order.items[index].address = row.address
      this.order.items[index].memo = row.memo
      this.selectSymbol = null
    },
    validateAndCreateOrder () {
      //check for blank amounts or addresses
      let message = ''
      this.error = {}
      for (let item of this.order.items) {
        if (!item.amount) {
          message = 'Invalid amount'
          this.$buefy.toast.open({
            message,
            type: 'is-danger',
            duration: 3000
          })
          this.error[item.symbol] = {
            amount: message
          }
        }
        if(!item.address) {
          message = 'Delivery address is required'
          this.error['address'] = message
          this.$buefy.toast.open({
            message,
            type: 'is-danger',
            duration: 3000
          })
          this.error[item.symbol] = {
            ...this.error[item.symbol],
            address: message
          }
        }
      }
      if (!Object.keys(this.error).length) {
        this.createOrder()
      }
    },
    createOrder (holdOrder = false) {
      if (this.creating) {
        return
      }
      let u = this.user
      let extra = holdOrder ? ', but will hold the order before sending' : ` and send it to ${u.displayName}`
      this.$buefy.dialog.confirm({
        title: 'Are you sure?',
        hasIcon: true,
        message: `Are you CERTAIN you want to create this order? It will immediately start converting ${this.currency(this.total)} into crypto${extra}.`,
        type: 'is-danger',
        onConfirm: async () => {
          this.creating = true
          // Add the quoted amounts to the order
          for (let item of this.order.items) {
            item.quoted = this.quote(item.symbol, item.amount)
            item.ma = this.toFloat(this.margin) / 100
          }
          try {
            let res = await this.ecApi('order-admin', 'createOrder', {
              uid: u.uid,
              siteVersion: null,
              email: u.email,
              total: this.total,
              toPay: this.total,
              hr: null, // High roller discount
              fee: 0,
              coins: this.order.items,
              ownAddress: true,
              method: 'otc',
              gaClientId: null
            })
            let orderId = res.orderId
            if (!orderId) {
              this.$buefy.toast.open('Failed to create order :(')
            } else {
              /*
              // PDB endpoint is not yet functional, as it needs to be correctly secured
              await this.pdbApi('/pdb/eca/mark-otc-as-paid', {
                orderId: orderId,
                // bankId: bank_row_id,
                amount: this.total,
                agent: this.$store.state.goauth.email
              }) */
              /*
              // This uses the old Auto0 role checking, so no longer functional
              // with Google auth.
              await this.apiv2('admin', 'otcPaid', {
                orderId: orderId,
                hold: holdOrder
              }) */
              this.$buefy.toast.open('Success!!')
              this.newOrder()
            }
          } catch (e) {
            this.$buefy.toast.open({
              message: e,
              type: 'is-danger'
            })
            console.log(e)
          }
          this.creating = false
        }
      })
    }
  }
}
</script>
