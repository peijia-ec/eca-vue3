<template>
  <div>
    <div class="columns">
      <div
        v-for="type in columns"
        :key="type"
        class="column"
      >
        <div class="box is-size-7">
          <!--<h2 class="title is-4">Buying limits</h2>
          <div class="field">
            <button :class="{'is-loading': processing}" :disabled="processing" class="button" @click="addNewLimit('buy')">Add new entry</button>
          </div>-->
          <!--<p class="help has-text-grey-light">(leave blank for standard limit)</p>
               <p><b>Hard limits:</b></p>
               <b-field label="Daily">
                 <b-input v-model="buy.buyDay" size="is-small"></b-input>
               </b-field>
               <p><b>Soft limits:</b> (admin notification only)</p>
               <b-field label="Monthly">
                 <b-input v-model="buy.buyMonth" size="is-small"></b-input>
               </b-field>
               <b-field label="Yearly">
                 <b-input v-model="buy.buyYear" size="is-small"></b-input>
               </b-field>
               <b-field label="Total">
                 <b-input v-model="buy.buyTotal" size="is-small"></b-input>
               </b-field>
               <div class="field">
                 <button @click="setLimits" :class="{'is-loading': processing}" class="button is-primary">Set limits</button>
               </div>-->
          <h2 class="title is-4">
            {{ ucFirst(type) }}ing limits
          </h2>
          <b-table
            :data="summary[type]"
            :mobile-cards="false"
          >
            <template #default="props">
              <b-table-column
                field="symbol"
                label="Symbol"
              >
                {{ props.row.symbol }}
              </b-table-column>
              <b-table-column
                field="amount"
                label="Amount"
              >
                {{ props.row.amount }}
              </b-table-column>
            </template>
          </b-table>
          <b-collapse
            v-if="entries[type].length"
            :open="false"
            aria-id="showEntries"
          >
            <a
              slot="trigger"
              aria-controls="showEntries"
            >Show individual entries</a>
            <b-table
              :data="entries[type]"
              :mobile-cards="false"
            >
              <template #default="props">
                <b-table-column
                  field="date"
                  label="Date"
                >
                  {{ $moment(props.row.date).format("YYYY-MM-DD") }}
                </b-table-column>
                <b-table-column
                  field="symbol"
                  label="Symbol"
                >
                  {{ props.row.symbol }}
                </b-table-column>
                <b-table-column
                  field="amount"
                  label="Amount"
                >
                  {{ props.row.amount }}
                </b-table-column>
                <b-table-column
                  field="comment"
                  label="N"
                >
                  <b-tooltip
                    :label="props.row.comment"
                    :multilined="true"
                    position="is-left"
                  >
                    <span class="icon has-text-grey-light"><i class="fa fa-file-text-o" /></span>
                  </b-tooltip>
                </b-table-column>
              </template>
            </b-table>
          </b-collapse>
          <br>
          <div class="field">
            <button
              :class="{ 'is-loading': busy }"
              :disabled="busy"
              class="button"
              @click="addNewLimit(type)"
            >
              Add new entry
            </button>
          </div>
          <div
            v-if="computed[type].length"
            style="margin-top: 1.5em"
          >
            <h3 class="title is-5">
              {{ tableHeaders[type].title }} {{ type === 'sell' ? `(${customerTotalSellLimits})` : '' }}
              <b-tooltip
                v-if="type === 'sell'"
                label="This is the Current Sell limit a customer sees / has available left to make sell orders. It based on the Base Sell Limit + Total Market Value of Coins bought in EC - Historical Sell. Note: If this is a Negative number, a customer only sees it as a 0"
                multilined
                style="margin-left: 5px"
              >
                <i class="fa fa-question-circle-o cursor" />
              </b-tooltip>
            </h3>
            <b-table
              :data="computed[type]"
              :mobile-cards="false"
            >
              <template #default="props">
                <b-table-column
                  field="symbol"
                  label="Symbol"
                >
                  {{ props.row.symbol }}
                </b-table-column>
                <b-table-column
                  field="bought"
                  :label="tableHeaders[type].bought"
                  numeric
                >
                  {{ cryptoNum(props.row.bought, 5) }}
                </b-table-column>
                <b-table-column
                  field="sold"
                  :label="tableHeaders[type].sold"
                  numeric
                >
                  {{ cryptoNum(props.row.sold, 5) }}
                </b-table-column>
                <b-table-column
                  field="remaining"
                  :label="tableHeaders[type].remaining"
                  numeric
                >
                  {{ cryptoNum(props.row.remaining, 5) }}
                </b-table-column>
                <b-table-column
                  v-if="type ==='sell'"
                  field="value"
                  label="Value"
                  numeric
                >
                  <template #header="{ column }">
                    <span class="row-centered">
                      {{ column.label }}
                      <b-tooltip
                        label="Today's NZD value of the remaining crypto amount"
                        multilined
                        style="margin-left: 5px"
                      >
                        <i class="fa fa-question-circle-o cursor" />
                      </b-tooltip>
                    </span>
                  </template>
                  <span class="has-text-grey-light">{{
                    currency(
                      props.row.remaining *
                        $store.getters['coins/rate'](props.row.symbol)
                    )
                  }}</span>
                </b-table-column>
              </template>
              <template
                #footer
                v-if="type === 'sell'"
              >
                <div class="has-text-right">
                  Total: {{ currency(totalSellLimitsRemaining) }}
                </div>
              </template>
            </b-table>
          </div>
          <template v-if="type === 'buy'">
            <br>
            <h4 class="title is-5">
              <b>Hard limits:</b>
            </h4>
            <b-field label="Daily">
              <b-input
                v-model="buy.buyDay"
                :disabled="fetching"
                size="is-small"
              />
            </b-field>
            <div class="field">
              <button
                :class="{ 'is-loading': processing }"
                class="button is-primary"
                @click="setLimits"
              >
                Set limits
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
    <b-modal :active.sync="newLimit.show">
      <div class="box">
        <h4 class="title is-5">
          {{
            newLimit.type === "buy"
              ? "Set new overall buy limit"
              : "Add new crypto amount"
          }}
        </h4>
        <b-field label="Symbol">
          <b-select v-model="newLimit.symbol">
            <option
              v-for="coin in coinList"
              :key="coin.symbol"
              :value="coin.symbol"
            >
              {{ coin.name }} ({{ coin.symbol }})
            </option>
          </b-select>
        </b-field>
        <b-field label="Amount">
          <b-input
            v-model="newLimit.amount"
            type="number"
            step="0.00000001"
            :placeholder="fiatLimitPlaceholder"
          />
        </b-field>
        <b-field label="Comment">
          <b-input
            v-model="newLimit.comment"
            type="textarea"
          />
        </b-field>
        <div class="field">
          <button
            :class="{ 'is-loading': busy }"
            :disabled="busy"
            class="button is-success"
            @click="addLimit"
          >
            Add
          </button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { parseUserLimits } from '@/../ec_modules/helpers'

export default {
  name: 'UserLimits',
  props: ['uid', 'user'],
  data () {
    return {
      columns: ['buy', 'sell'],
      entries: {
        buy: [],
        sell: []
      },
      limit: null,
      computed: {
        buy: [],
        sell: []
      },
      buy: {
        buyDay: null,
        buyMonth: null,
        buyYear: null,
        buyTotal: null
      },
      tableHeaders:{
        buy: {
          title: 'Total completed orders',
          bought: 'Sell orders',
          sold: 'Buy orders',
          remaining: 'Remaining buy limit'
        },
        sell: {
          title: 'Available for sell orders',
          bought: 'Bought',
          sold: 'Sold',
          remaining: 'Remaining'
        }
      },
      processing: false,
      fetching: false,
      showCryptoDetail: false,
      newLimit: {
        show: false,
        type: 'sell',
        symbol: '',
        amount: '',
        comment: ''
      }
    }
  },
  computed: {
    busy () {
      return this.processing || this.fetching
    },
    fiatLimitPlaceholder () {
      try {
        let currentTotal = this.summary.buy.find(x => x.symbol === this.newLimit.symbol).amount
        return `Their current limit is ${this.currency(currentTotal)}`
      } catch (e) {
        return ''
      }
    },
    coinList () {
      return this.newLimit.type === 'sell' ? this.$store.getters['coins/sorted'] : this.$store.getters['coins/fiat']
    },
    fiat () {
      // return an array to future-proof for multiple fiat currencies
      return [this.$local.currency]
    },
    summary () {
      let sell = {}
      let buy = {}
      for (let row of this.entries.buy) {
        // Fiat
        if (!buy.hasOwnProperty(row.symbol)) {
          buy[row.symbol] = 0
        }
        buy[row.symbol] += parseFloat(row.amount)
      }
      for (let row of this.entries.sell) {
        // Crypto
        if (!sell.hasOwnProperty(row.symbol)) {
          sell[row.symbol] = 0
        }
        sell[row.symbol] += parseFloat(row.amount)
      }
      return {
        buy: Object.keys(buy).map(x => ({
          symbol: x,
          amount: buy[x]
        })),
        sell: Object.keys(sell).map(x => ({
          symbol: x,
          amount: sell[x]
        }))
      }
    },
    totalSellLimitsRemaining () {
      const data = this.computed.sell
      let sum = 0
      data.forEach(item => {
        sum += item.remaining * this.$store.getters['coins/rate'](item.symbol)
      });
      return sum
    },
    customerTotalSellLimits () {
      const sellLimit = this.user.tier < 20 ? 1000 : 100000
      const displaySellLimit = this.totalSellLimitsRemaining + sellLimit - this.user.totalSell
      return this.currency(displaySellLimit)
    }
  },
  watch: {
    uid: {
      handler: function () {
        this.getData()
      },
      immediate: true
    }
  },
  methods: {
    addNewLimit (type) {
      this.newLimit.type = type
      this.newLimit.symbol = type === 'sell' ? 'BTC' : this.coinList[0].symbol
      this.newLimit.show = true
    },
    async addLimit () {
      if (this.processing) {
        return
      }
      this.processing = true
      try {
        let c = this.newLimit
        // For buy limits we need to make an adjustment transaction from the total limit
        if (c.type === 'buy') {
          let currentTotal = 0
          try {
            currentTotal = this.summary.buy.find(x => x.symbol === c.symbol).amount
          } catch (e) {
            // nothing
          }
          c.amount = c.amount - currentTotal // adjustment transaction
        }
        await this.apiv2('admin', 'addCryptoSellLimit', {
          uid: this.uid,
          symbol: c.symbol,
          amount: c.amount,
          comment: c.comment,
          type: c.type.charAt(0).toUpperCase() + c.type.slice(1)
        })
        c.symbol = ''
        c.amount = ''
        c.comment = ''
        await this.getData()
        this.newLimit.show = false
      } catch (e) {
        console.log(e)
      }
      this.processing = false
    },
    async getData () {
      if (!this.uid) {
        return
      }
      if (this.fetching) {
        return
      }
      this.fetching = true
      try {
        let res = await this.apiv2('admin', 'getUserLimits', {
          uid: this.uid
        })
        this.computed = parseUserLimits(res.computed, this.$local.currency)
        this.entries.buy = res.crypto.filter(x => this.fiat.includes(x.symbol))
        this.entries.sell = res.crypto.filter(x => !this.fiat.includes(x.symbol))
        this.buy = res.buy
      } catch (e) {
        console.log(e)
      }
      this.fetching = false
    },
    async setLimits () {
      if (!this.buy) {
        return
      }
      if (this.processing) {
        return
      }
      this.processing = true
      console.log(this.buy)
      try {
        let res = await this.apiv2('admin', 'setUserLimits', {
          uid: this.uid,
          limits: this.buy
        })
        console.log(res)
        this.$buefy.toast.open('Limits have been set')
      } catch (e) {
        this.$buefy.toast.open(e)
      }
      this.processing = false
    }
  }
}
</script>
