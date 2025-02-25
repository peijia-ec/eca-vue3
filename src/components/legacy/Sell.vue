<template>
  <div>
    <section class="section">
      <h2 class="title is-4">
        TXID Match
      </h2>
      <b-field label="TXID">
        <b-input v-model="txid" />
      </b-field>
      <b-field label="Email or UID">
        <b-input v-model="email" />
      </b-field>
      <div class="field">
        <button
          class="button is-small"
          @click="resetLinkFields"
        >
          Clear fields
        </button>
      </div>
      <b-table
        v-if="depositsFromTxid.length > 1"
        :data="depositsFromTxid"
        :mobile-cards="false"
        default-sort="date"
        default-sort-direction="desc"
        :paginated="true"
        :per-page="12"
        :selected.sync="depositFromTxid"
      >
        <template #default="props">
          <b-table-column
            field="created"
            label="Date"
          >
            <span class="no-break">{{ $moment(props.row.date).format('MM-DD HH:mm') }}</span>
          </b-table-column>
          <b-table-column label="Exchange">
            {{ props.row.exchange }}
          </b-table-column>
          <b-table-column label="Order">
            <router-link
              v-if="props.row.orderId"
              :to="{name: 'order', query: {orderId: props.row.orderId}}"
            >
              {{ props.row.orderId }}
            </router-link>
          </b-table-column>
          <b-table-column label="S">
            <span
              v-if="props.row.internal"
              class="icon"
            ><i class="fa fa-bank has-text-grey" /></span>
            <span
              v-else-if="props.row.cancelled"
              class="icon"
            ><i class="fa fa-ban has-text-danger" /></span>
            <span
              v-else-if="props.row.cleared"
              class="icon"
            ><i class="fa fa-check has-text-success" /></span>
            <span
              v-if="props.row.emailed"
              class="icon"
            ><i class="fa fa-envelope has-text-primary" /></span>
          </b-table-column>
          <b-table-column label="Coin">
            {{ props.row.coin }}
          </b-table-column>
          <b-table-column
            label="Amount"
            numeric
          >
            <template v-if="props.row.txId.startsWith('Internal transfer')">
              {{ cryptoNum(props.row.amount) }}
              <span
                title="Binance internal transfer"
                class="icon has-text-info"
              ><i class="fa fa-exchange" /></span>
            </template>
            <a
              v-else-if="blockchainLink(props.row.coin, null, props.row.txId)"
              :href="blockchainLink(props.row.coin, null, props.row.txId)"
              target="_blank"
            >
              {{ cryptoNum(props.row.amount) }}
              <span class="icon"><i class="fa fa-external-link-square" /></span>
            </a>
            <span v-else>{{ cryptoNum(props.row.amount) }}</span>
          </b-table-column>
          <b-table-column
            label="Live value"
            numeric
          >
            {{ price($store.getters['coins/sellRate'](props.row.coin) * props.row.amount) }}
          </b-table-column>
          <b-table-column label="Actions">
            <span
              title="Internal transaction"
              class="cursor icon is-small has-text-grey-lighter"
              @click="setInternal(props.row)"
            ><i class="fa fa-bank" /></span>
          </b-table-column>
        </template>
      </b-table>
      <b-table
        :data="ordersMatchingTxid"
        :mobile-cards="false"
        :paginated="true"
        :per-page="12"
        :selected.sync="order"
      >
        <template #default="props">
          <b-table-column
            field="created"
            label="Date"
          >
            <span class="no-break">{{ $moment(props.row.created).format('MM-DD HH:mm') }}</span>
          </b-table-column>
          <b-table-column label="Diff">
            {{ $moment(props.row.created).from(depositFromTxid.date, true) }}
            <template v-if="$moment(props.row.created) > $moment(depositFromTxid.date)">
              after <span class="icon has-text-danger"><i class="fa fa-exclamation-triangle" /></span>
            </template>
            <template v-else>
              before
            </template>
          </b-table-column>
          <b-table-column label="ID">
            {{ props.row.orderId }}
          </b-table-column>
          <b-table-column
            label="Amount"
            numeric
          >
            {{ cryptoNum(props.row.final) }}
          </b-table-column>
          <b-table-column
            label="Difference"
            numeric
          >
            {{ cryptoNum(props.row.final - depositFromTxid.amount) }}
          </b-table-column>
        </template>
      </b-table>
      <template v-if="orderMatchingTxidFound">
        <template v-if="!refundOrderFromTxid">
          No matching refund order found. Please use the advanced table below to look into this.
        </template>
        <template v-else>
          <div class="content">
            <p>The system has processed this customer deposit in order {{ refundOrderFromTxid.orderId }}.</p>
            <p>Please click the button to deliver the processed funds to the customer.</p>
            <div class="field">
              <button
                class="button is-success"
                :class="{'is-loading': loading}"
                @click="manualOrderLink('top')"
              >
                Link system order to customer
              </button>
            </div>
          </div>
          <article class="message is-primary">
            <div class="message-body content is-size-7">
              <p>Hi {{ order.firstName }}</p>
              <p>Thanks for sending that through, your order is all sorted now :)</p>
              <p>
                It was a simple issue - your sell order on our site was for {{ parseFloat(order.final) }} {{ order.coin }}
                but the deposit you made was for {{ parseFloat(depositFromTxid.amount) }} {{ depositFromTxid.coin }}.
              </p>
              <p>Our systems are completely automated, so because the amounts didn't match the deposit couldn't be associated with your order.</p>
              <p>I've matched them manually and the funds are on the way to your bank account.</p>
              <p>
                Please note that there is no difference in the rate due to this. We process every incoming deposit the instant it arrives -
                we just didn't know which order to associate the final amount with.
              </p>
              <p>
                In the future just make sure that your deposit matches the amount you specified in your order, and your order will process straight through without any issues.
                You might need to take the withdrawal fee of your exchange or your wallet into account.
              </p>
              <p>Best regards</p>
              <p>Easy Crypto</p>
            </div>
          </article>
        </template>
      </template>
    </section>
    <h2 class="title is-4">
      Deposits
    </h2>
    <b-field grouped>
      <b-input
        v-model="filterDeposits"
        placeholder="Search..."
        type="search"
        icon="search"
      />
      <b-checkbox v-model="unmatchedOnly">
        Unmatched only
      </b-checkbox>
      <b-button
        size="is-small"
        @click="$store.dispatch('info/deposits')"
      >
        Refresh
      </b-button>
    </b-field>
    <b-table
      :data="filteredDeposits"
      :mobile-cards="false"
      default-sort="date"
      default-sort-direction="desc"
      :paginated="true"
      :per-page="12"
      :selected.sync="deposit"
      :loading="ordersLoading"
    >
      <template #default="props">
        <b-table-column
          field="created"
          label="Date"
        >
          <span class="no-break">{{ $moment(props.row.date).format('MM-DD HH:mm') }}</span>
        </b-table-column>
        <b-table-column label="Exchange">
          {{ props.row.exchange }}
        </b-table-column>
        <b-table-column label="Order">
          <router-link
            v-if="props.row.orderId"
            :to="{name: 'order', query: {orderId: props.row.orderId}}"
          >
            <b-icon
              v-if="refundOrderIds.includes(props.row.orderId)"
              icon="exclamation-triangle"
              type="is-danger"
            />
            {{ props.row.orderId }}
          </router-link>
        </b-table-column>
        <b-table-column label="S">
          <span
            v-if="props.row.internal"
            class="icon"
          ><i class="fa fa-bank has-text-grey" /></span>
          <span
            v-else-if="props.row.cancelled"
            class="icon"
          ><i class="fa fa-ban has-text-danger" /></span>
          <span
            v-else-if="props.row.cleared"
            class="icon"
          ><i class="fa fa-check has-text-success" /></span>
          <span
            v-if="props.row.emailed"
            class="icon"
          ><i class="fa fa-envelope has-text-primary" /></span>
        </b-table-column>
        <b-table-column label="Coin">
          {{ props.row.coin }}
        </b-table-column>
        <b-table-column
          label="Amount"
          numeric
        >
          <template v-if="props.row.txId.startsWith('Internal transfer')">
            <!-- Binance internal transfer -->
            {{ cryptoNum(props.row.amount) }}
            <span
              title="Binance internal transfer"
              class="icon has-text-info"
            ><i class="fa fa-exchange" /></span>
          </template>
          <a
            v-else-if="blockchainLink(props.row.coin, null, props.row.txId)"
            :href="blockchainLink(props.row.coin, null, props.row.txId)"
            target="_blank"
          >
            {{ cryptoNum(props.row.amount) }}
            <span class="icon"><i class="fa fa-external-link-square" /></span>
          </a>
          <span v-else>{{ cryptoNum(props.row.amount) }}</span>
        </b-table-column>
        <b-table-column
          label="Live value"
          numeric
        >
          {{ price($store.getters['coins/sellRate'](props.row.coin) * props.row.amount) }}
        </b-table-column>
        <b-table-column label="Actions">
          <span
            title="Internal transaction"
            class="cursor icon is-small has-text-grey-lighter"
            @click="setInternal(props.row)"
          ><i class="fa fa-bank" /></span>
        </b-table-column>
      </template>
    </b-table>
    <h2 class="title is-4">
      Sell orders
    </h2>
    <b-field grouped>
      <b-select v-model="searchSymbol">
        <option :value="null">
          Symbol
        </option>
        <option
          v-for="symbol in sellCoins"
          :key="symbol"
        >
          {{ symbol }}
        </option>
      </b-select>
      <b-select v-model="filterOrderMethod">
        <option :value="null">
          Method
        </option>
        <option
          v-for="orderMethod in orderMethods"
          :key="orderMethod"
        >
          {{ orderMethod }}
        </option>
      </b-select>
      <b-input
        v-model="searchMin"
        placeholder="Minimum value"
      />
      <b-input
        v-model="searchMax"
        placeholder="Maximum value"
      />
      <b-checkbox v-model="autoMatch">
        Auto-match
      </b-checkbox>
    </b-field>
    <b-table
      :data="filteredSell"
      :mobile-cards="false"
      :paginated="true"
      :per-page="12"
      :selected.sync="order"
      :loading="ordersLoading"
    >
      <template #default="props">
        <b-table-column
          field="created"
          label="Date"
        >
          <span class="no-break">{{ $moment(props.row.created).format('MM-DD HH:mm') }}</span>
        </b-table-column>
        <b-table-column label="Diff">
          <template v-if="deposit">
            <!-- Show relative time difference -->
            {{ $moment(props.row.created).from(deposit.date, true) }}
            <template v-if="$moment(props.row.created) > $moment(deposit.date)">
              after <span class="icon has-text-danger"><i class="fa fa-exclamation-triangle" /></span>
            </template>
            <template v-else>
              before
            </template>
          </template>
        </b-table-column>
        <b-table-column label="ID">
          {{ props.row.orderId }}
        </b-table-column>
        <b-table-column label="Method">
          {{ props.row.method }}
        </b-table-column>
        <b-table-column
          field="email"
          label="Email"
        >
          <email-link :user="props.row" />
        </b-table-column>
        <b-table-column label="Coin">
          {{ props.row.coin }}
        </b-table-column>
        <b-table-column>
          <span
            v-if="props.row.completed"
            class="icon"
          ><i class="fa fa-check has-text-success" /></span>
          <span
            v-else-if="props.row.cancelled"
            class="icon"
          ><i class="fa fa-ban has-text-grey-lighter" /></span>
        </b-table-column>
        <b-table-column
          label="Amount"
          numeric
        >
          {{ cryptoNum(props.row.final) }}
        </b-table-column>
        <b-table-column
          label="Difference"
          numeric
        >
          <span
            v-if="deposit && deposit.coin === props.row.coin"
            class="has-text-grey-light"
          >
            {{ cryptoNum(props.row.final - deposit.amount) }}
          </span>
        </b-table-column>
      </template>
    </b-table>
    <div
      v-if="deposit && !deposit.orderId"
      class="field"
    >
      <button
        :class="{'is-loading': processing}"
        class="button is-danger"
        @click="processUnknownDeposit"
      >
        <span class="icon"><i class="fa fa-chevron-right" /></span>
        <span>Process to {{ $local.currency }} without linking to an order</span>
      </button>
    </div>
    <section
      v-if="toLink"
      class="section"
    >
      <div class="content">
        <h3>Linking an invalid deposit</h3>
        <article
          v-if="$moment(deposit.date) < $moment(order.created)"
          class="message is-danger"
        >
          <div class="message-body">
            <span class="icon"><i class="fa fa-exclamation-triangle" /></span>
            The order was created {{ timeDiff }} AFTER the deposit! This is almost certainly a fraudulent order.
          </div>
        </article>
        <p v-else>
          <span class="icon has-text-success"><i class="fa fa-check" /></span>
          The order was created {{ timeDiff }} before the deposit.
        </p>
        <p>
          The deposit you've selected was for <span class="has-text-info">{{ deposit.amount }} {{ deposit.coin }}</span><br>
          This <b>{{ order.method }}</b> order you've selected was for {{ order.final }} {{ order.coin }}
        </p>
        <p>
          <b>This is a difference of {{ niceNumber(Math.abs(deposit.amount - order.final)) }} {{ order.coin }}</b>
          ({{ currency($store.getters['coins/scaleRate'](order.coin) * Math.abs(deposit.amount - order.final), 2) }} {{ $local.currency }})
          <b>, or {{ (Math.abs(deposit.amount / order.final - 1) * 100).toFixed(1) }}%</b>
        </p>
        <div class="field">
          <button
            class="button"
            :class="{'is-loading': loading, 'is-success': order.method !== 'sell-swap', 'is-info': order.method === 'sell-swap'}"
            @click="manualOrderLink"
          >
            Link {{ order.method === 'sell-swap' ? 'Sell-Swap' : 'Sell Deposit' }} to customer
          </button>
        </div>
        <template v-if="!order.completed && !deposit.cleared">
          <p>If you continue, the user will have their order changed to be <span class="has-text-info">{{ deposit.amount }} {{ deposit.coin }}</span></p>
          <div class="buttons">
            <button
              class="button is-primary"
              :class="{'is-loading': processing}"
              @click="emailMatch"
            >
              <span class="icon"><i class="fa fa-question" /></span>
              <span>Possible match email</span>
            </button>
            <button
              class="button is-danger"
              :class="{'is-loading': processing}"
              @click="link"
            >
              Link orders
            </button>
            <button
              class="button is-danger"
              :class="{'is-loading': processing}"
              @click="link(true)"
            >
              <span class="icon"><i class="fa fa-envelope" /></span>
              <span>Link and Email</span>
            </button>
          </div>
        </template>
        <h4>Text to copy/paste when a user has sent through a TXID:</h4>
        <article class="message is-primary">
          <div class="message-body content is-size-7">
            <p>Hi {{ order.firstName }}</p>
            <p>Thanks for sending that through, your order is all sorted now :)</p>
            <p>
              It was a simple issue - your sell order on our site was for {{ parseFloat(order.final) }} {{ order.coin }}
              but the deposit you made was for {{ parseFloat(deposit.amount) }} {{ deposit.coin }}.
            </p>
            <p>Our systems are completely automated, so because the amounts didn't match the deposit couldn't be associated with your order.</p>
            <p>I've matched them manually and the funds are on the way to your bank account.</p>
            <p>
              Please note that there is no difference in the rate due to this. We process every incoming deposit the instant it arrives -
              we just didn't know which order to associate the final amount with.
            </p>
            <p>
              In the future just make sure that your deposit matches the amount you specified in your order, and your order will process straight through without any issues.
              You might need to take the withdrawal fee of your exchange or your wallet into account.
            </p>
            <p>Best regards</p>
            <p>Easy Crypto</p>
          </div>
        </article>
        <h4>Text that will be sent when clicking the <b>Link and Email</b> button:</h4>
        <article class="message">
          <div class="message-body content is-size-7">
            <p>Hi {{ order.firstName }}</p>
            <p>There was a small issue with your recent sell order {{ order.orderId }}:</p>
            <p>
              The order was for {{ parseFloat(order.final) }} {{ order.coin }}
              but the deposit you made was for {{ parseFloat(deposit.amount) }} {{ deposit.coin }}.
            </p>
            <p>Our systems are completely automated, so because the amounts didn't match the order was not picked up by the system.</p>
            <p>I've matched them manually and the order is now being processed :)</p>
            <p>In the future just make sure that your deposit matches the amount you specified in your order, and your order will process straight away.</p>
            <p>Thanks</p>
            <p>Alan</p>
          </div>
        </article>
      </div>
    </section>
    <b-button
      type="is-primary"
      rounded
      class="sticky-update-btn"
      icon-left="refresh"
      @click="refreshPage"
      :class="{'is-loading': ordersLoading}"
    >
      Refresh
    </b-button>
  </div>
</template>

<script>
import EmailLink from './parts/user/EmailLink.vue'
import { blockchainLink } from '@/../ec_modules/helpers'

export default {
  name: 'Sell',
  components: {EmailLink},
  data () {
    return {
      orders: [],
      refundOrderIds: [],
      deposit: null,
      filterDeposits: '',
      unmatchedOnly: true,
      order: null,
      processing: false,
      txid: '',
      email: '',
      depositFromTxid: null,
      refundOrderFromTxid: null,
      searchSymbol: null,
      searchMin: '',
      searchMax: '',
      autoMatch: true,
      goAuthAccessToken: this.$store.state.goauth.token,
      loading: false,
      filterOrderMethod: null,
      orderMethods: ['sell', 'otc-sell', 'sell-swap'],
      ordersLoading: false
    }
  },
  computed: {
    /**
     * Fetch the list of deposits that match the full or partial TXID inserted in the this.txid <input>
     * @return {array}
     */
    depositsFromTxid () {
      if (!this.txid || this.txid.length < 5) {
        return []
      } else {
        return this.$store.state.info.deposits.filter(
          x => x.txId.search(new RegExp(this.txid.trim(), 'i')) !== -1
        )
      }
    },
    /**
     * Fetch a list of orders matching both this.txid and also the email/UID from this.email
     * @return {array}
     */
    ordersMatchingTxid () {
      if (!this.email || !this.depositsFromTxid.length) {
        return []
      } else {
        return this.orders.filter(x => x.coin === this.depositFromTxid.coin && (x.email === this.email || x.uid === this.email))
      }
    },
    /**
     * Have we found an order that matches the TXID?
     * @return {boolean}
     */
    orderMatchingTxidFound () {
      return this.depositFromTxid && this.order && (this.order.email === this.email || this.order.uid === this.email) && this.order.coin === this.depositFromTxid.coin
    },
    filteredDeposits () {
      return this.$store.state.info.deposits.filter(x => {
        let textFilter = !this.filterDeposits.trim() || `${x.orderId} ${x.coin} ${x.amount} ${x.txId}`.search(new RegExp(this.filterDeposits.trim(), 'i')) !== -1
        let unmatched = !this.unmatchedOnly || (this.refundOrderIds.includes(x.orderId) && !x.internal)
        return textFilter && unmatched
      })
    },
    sellCoins () {
      let symbols = []
      for (let order of this.orders) {
        symbols.push(order.coin)
      }
      return symbols.sort().filter(function (item, pos, ary) {
        return !pos || item !== ary[pos - 1]
      })
    },
    filteredSell () {
      let showFilled = true
      // Create autoMatch values
      if (this.deposit && this.autoMatch) {
        this.searchSymbol = this.deposit.coin
        let units = Math.pow(10, 4)
        this.searchMin = Math.round(this.deposit.amount * 0.9 * units) / units
        this.searchMax = Math.round(this.deposit.amount * 1.1 * units) / units
        showFilled = false
      }
      return this.orders.filter((order) => {
        let symbolMatch = false
        let minMatch = false
        let maxMatch = false
        let methodMatch = false
        if (!this.searchSymbol || order.coin.indexOf(this.searchSymbol) !== -1) {
          symbolMatch = true
        }
        if (!this.searchMin || parseFloat(order.final) >= parseFloat(this.searchMin)) {
          minMatch = true
        }
        if (!this.searchMax || parseFloat(order.final) <= parseFloat(this.searchMax)) {
          maxMatch = true
        }
        if (!this.filterOrderMethod
          || (this.filterOrderMethod === 'sell-swap' && order.method === 'sell-swap')
          || (this.filterOrderMethod === 'sell' && order.method === 'sell')
          || (this.filterOrderMethod === 'otc-sell' && order.method === 'otc-sell')) {
          methodMatch = true
        }
        let searchFilled = showFilled || !order.filled
        return symbolMatch && minMatch && maxMatch && searchFilled && methodMatch
      })
    },
    toLink () {
      let o = this.order
      let d = this.deposit
      return o && d && o.coin === d.coin
    },
    sql () {
      if (!this.toLink) {
        return
      }
      let o = this.order
      let d = this.deposit
      return o.orderId + ' ' + d.id
    },
    timeDiff () {
      if (!this.toLink) {
        return null
      }
      return this.$moment(this.order.created).from(this.$moment(this.deposit.date), true)
    }
  },
  watch: {
    depositsFromTxid () {
      if (this.depositsFromTxid.length === 1) {
        this.depositFromTxid = this.depositsFromTxid[0]
      } else {
        this.depositFromTxid = null
      }
    },
    /**
     * Fetch the live order data when an unmatched deposit is created
     */
    depositFromTxid () {
      if (this.depositFromTxid && this.depositFromTxid.orderId) {
        this.ecApi('admin', 'getOrder', {
          orderId: this.depositFromTxid.orderId
        })
          .then((res) => {
            if (res.order && res.order.uid === 'sauwgyXf5VWDCwa9IglQCAQXCtI3') { // refund user
              this.refundOrderFromTxid = res.order
            } else {
              this.refundOrderFromTxid = null
            }
          })
          .catch((e) => {
            console.log(e)
            this.refundOrderFromTxid = null
          })
      } else {
        this.refundOrderFromTxid = null
      }
    },
    deposit () {
      this.order = null
    },
    autoMatch () {
      if (this.autoMatch) {
        this.searchMin = ''
        this.searchMax = ''
      }
    },
    searchMin () {
      if (this.searchMin.length) {
        this.autoMatch = false
      }
    },
    searchMax () {
      if (this.searchMax.length) {
        this.autoMatch = false
      }
    }
  },
  mounted () {
    this.unmatchedOnly = this.$local.countryCode === 'NZ'
    this.loadQueue()
    // this.auth0get()
  },
  methods: {
    resetLinkFields () {
      this.email = ''
      this.txid = ''
    },
    /**
     * Manually link a refund sell order to a customer sell order
     * @returns {Promise<void>}
     */
    async manualOrderLink (location = '') {
      if (this.loading) {
        return
      }
      let completedOrderId
      if (location === 'top') {
        completedOrderId = this.refundOrderFromTxid.orderId
      } else {
        completedOrderId = this.deposit.orderId
      }
      this.loading = true
      try {
        await this.apiv2('admin', 'matchUnknownDeposit', {
          theirId: this.order.orderId,
          ourId: completedOrderId
        })
        if (this.order.method !== 'sell-swap') {
          // Update the order in PDB (Only create payout when method is sell)
          await this.pdbApi('/pdb/eca/match-unknown-sell-order', {
            orderId: completedOrderId
          })
        }
        // Remove it from the array of refund order IDs to remove it from the displayed list
        let idx
        while ((idx = this.refundOrderIds.indexOf(completedOrderId)) > -1) {
          this.refundOrderIds.splice(idx, 1)
        }
        this.$buefy.snackbar.open('Order successfully linked!')
      } catch (e) {
        console.log(e)
      }
      this.loading = false
    },
    /* async auth0get () {
      const accessToken = await this.$auth.getTokenSilently()
      this.auth0accessToken = accessToken
      // console.log(accessToken)
    }, */
    blockchainLink (...args) {
      return blockchainLink(...args)
    },
    link (sendEmail = false) {
      if (this.processing) {
        return
      }
      this.$buefy.dialog.confirm({
        message: 'Are you 100% sure you want to link this deposit to this order? If the order has already been processed ... THIS WILL PROCESS IT AGAIN!!',
        onConfirm: () => {
          this.processing = true
          this.apiv2('admin', 'linkSellOrders', {
            depositId: this.deposit.id,
            orderId: this.order.orderId,
            sendEmail: sendEmail
          })
            .then(() => {
              this.$store.commit('info/mutateArrayRowById', {
                array: 'deposits',
                id: this.deposit.id,
                update: {
                  orderId: this.order.orderId
                }
              })
              this.$buefy.toast.open('Orders linked!')
              this.processing = false
            })
            .catch((e) => {
              console.log(e)
              this.processing = false
            })
        }
      })
    },
    emailMatch () {
      if (this.processing) {
        return
      }
      this.sendEmail({
        noreply: false,
        email: this.order.email,
        subject: `Issue with order ${this.order.orderId}`,
        body: `Hi ${this.order.firstName}

Hope you're having a great day :)

You recently created a sell order for ${parseFloat(this.order.final)} ${this.order.coin}.

We haven't yet received any deposits for that amount. Is it possible you accidentally sent the wrong amount to us?

If you think this has happened, could you please send through some screenshots of your wallet clearly showing the outgoing transaction amount, along with the transaction hash / TXID.

It's important when creating a sell order through us that you send the amount you specify in the order - as our systems are completely automated. Your order won't automatically process if the deposit amount does not match the amount you set in your order.

If you haven't sent through any deposit, then please ignore this email.`
      })
        .then(() => {
          return this.sendApi(this.$local.pdb + '/pdb/eca/mark-email', {
            id: this.deposit.id,
            accessToken: this.goAuthAccessToken
          })
        })
        .then(() => {
          this.$buefy.toast.open('Email sent!')
        })
        .catch(e => console.log(e))
    },
    async loadQueue () {
      let data = await this.ecApi('admin', 'getSellOrders')
      this.orders = data.orders || []
      this.refundOrderIds = data.refundOrderIds || []
    },
    setInternal (row) {
      this.sendApi(this.$local.pdb + '/pdb/eca/set-internal', {
        id: row.id,
        value: !row.internal,
        accessToken: this.goAuthAccessToken
      })
        .then((r) => {
          this.$store.dispatch('info/deposits')
        })
        .catch(r => console.log(r))
    },
    async processUnknownDeposit () {
      if (this.processing) {
        return
      }
      this.processing = true
      let d = this.deposit
      this.$buefy.dialog.confirm({
        message: `Are you sure you want to process this deposit? This will create an automatic internal sell order and convert the ${d.amount} ${d.coin} to ${this.$local.currency}.`,
        onConfirm: async () => {
          try {
            let res = await this.apiv2('admin', 'processUnknownDeposit', {
              exchange: d.exchange,
              symbol: d.coin,
              amount: d.amount,
              date: d.date
            })
            if (res && res.orderId) {
              this.$buefy.toast.open('Order is now processing :)')
              this.$store.commit('info/mutateArrayRowById', {
                array: 'deposits',
                id: d.id,
                update: {
                  orderId: res.orderId
                }
              })
            }
          } catch (e) {
            console.log(e)
          }
        }
      })
      this.processing = false
    },
    async refreshPage () {
      this.ordersLoading = true
      try {
        await this.$store.dispatch('info/deposits')
        await this.loadQueue()
      } catch (e) {
        console.error(e)
      }
      this.ordersLoading = false
    }
  }
}
</script>
