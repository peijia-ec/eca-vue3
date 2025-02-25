<template>
  <section class="section">
    <h1>{{ $local.countryCode }}</h1>
    <div v-if="info">
      <div class="columns">
        <div
          class="column"
          style="position:relative">
          <h3 class="is-size-6">
            <b>Issues</b>
          </h3>
          <b-loading
            :is-full-page="false"
            :active="!getAge($store.getters['info/isFresh']) || infoRefresh" />
          <table class="table">
            <tbody>
              <tr>
                <td>Verifications:</td>
                <td>
                  {{ info.verifications }}
                  <span
                    v-if="info.verifications"
                    class="icon has-text-danger"><i class="fa fa-exclamation-triangle" /></span>
                </td>
              </tr>
              <tr>
                <td>Bank verifications:</td>
                <td>
                  {{ info.bankVerifications }}
                  <span
                    v-if="info.bankVerifications"
                    class="icon has-text-danger"><i class="fa fa-exclamation-triangle" /></span>
                </td>
              </tr>
              <tr>
                <td>Upgrade verifications:</td>
                <td>
                  {{ info.upgrades }}
                  <span
                    v-if="info.upgrades"
                    class="icon has-text-danger"><i class="fa fa-exclamation-triangle" /></span>
                </td>
              </tr>
              <tr>
                <td>Stuck orders:</td>
                <td>
                  {{ $store.state.orders.stuck.total }}
                  <span
                    v-if="$store.state.orders.stuck.total"
                    class="icon has-text-danger"><i class="fa fa-exclamation-triangle" /></span>
                </td>
              </tr>
              <tr>
                <td>Unmatched deposits:</td>
                <td>
                  {{ $store.state.orders.unmatchedSellOrdersCount }}
                  <span
                    v-if="$store.state.orders.unmatchedSellOrdersCount"
                    class="icon has-text-danger"><i class="fa fa-exclamation-triangle" /></span>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="has-text-grey-light">
            Updated at {{ $moment($store.state.info.infoUpdated).format('HH:mm') }}
          </p>
        </div>
        <div
          v-if="hasAccess($roles.Admin)"
          class="column"
          style="position:relative">
          <b-loading
            :is-full-page="false"
            :active="infoRefresh" />
          <h3 class="is-size-6">
            <b>{{ floatSymbol }} balances</b>
            <span
              v-if="!infoRefresh"
              class="icon has-text-grey-light cursor"
              @click="refreshInfo"><i class="fa fa-refresh" /></span>
          </h3>
          <table class="table">
            <tbody>
              <tr
                v-for="(row, i) in $store.getters['info/balances'](floatSymbol)"
                :key="i">
                <td>{{ row.exchange }}</td>
                <td>{{ cryptoNum(row.balance) }}</td>
                <td class="has-text-grey-light">
                  {{ currency(row.balance * floatRate) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-if="hasAccess($roles.Admin)"
          class="column">
          <h3 class="is-size-6">
            <b>{{ $local.currency }} balances</b>
          </h3>
          <table class="table">
            <tr
              v-for="row in $store.getters['info/balances']($local.currency)"
              :key="row.exchange">
              <td>{{ row.exchange }}</td>
              <td>{{ price(row.balance) }}</td>
            </tr>
          </table>
        </div>
        <div v-if="$local.countryCode === 'ZA' && hasAccess($roles.Admin)">
          <h3 class="is-size-6">
            <b>BTC balances</b>
            <span
              v-if="!infoRefresh"
              class="icon has-text-grey-light cursor"
              @click="refreshInfo"><i class="fa fa-refresh" /></span>
          </h3>
          <table class="table">
            <tbody>
              <b-loading
                :active="infoRefresh"
                :is-full-page="false" />
              <tr
                v-for="(row, i) in $store.getters['info/balances']('BTC')"
                :key="i">
                <td>{{ row.exchange }}</td>
                <td>{{ cryptoNum(row.balance) }}</td>
                <td class="has-text-grey-light">
                  {{ currency(row.balance * btcFloatRate) }}
                </td>
              </tr>
            </tbody>
          </table>
          <h3 class="is-size-6">
            <b>Smile ID balance</b>
          </h3>
          <table class="table">
            <tbody>
              <tr>
                <td>Smile ID</td>
                <td>{{ price($store.getters['info/smileIdBalance']) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div
        v-if="info && info.day && info.day.count"
        class="columns">
        <div
          v-if="hasAccess($roles.Admin)"
          class="column is-one-half-desktop is-one-third-widescreen">
          <div class="content">
            <h3>Orders:</h3>
            <table class="table fit-table">
              <tbody>
                <tr>
                  <td>D</td>
                  <td class="has-text-right">
                    {{ info.day.count }}
                  </td>
                  <td class="has-text-right">
                    {{ currency(info.day.total) }}
                  </td>
                  <td>{{ niceNumber(info.day.btc, 2) }}</td>
                  <td class="has-text-right">
                    {{ niceNumber(info.day.margin, 2) }}%
                  </td>
                </tr>
                <tr>
                  <td>W</td>
                  <td class="has-text-right">
                    {{ info.week.count }}
                  </td>
                  <td class="has-text-right">
                    {{ currency(info.week.total) }}
                  </td>
                  <td>{{ niceNumber(info.week.btc, 2) }}</td>
                  <td class="has-text-right">
                    {{ niceNumber(info.week.margin, 2) }}%
                  </td>
                </tr>
                <tr>
                  <td>M</td>
                  <td class="has-text-right">
                    {{ info.month.count }}
                  </td>
                  <td class="has-text-right">
                    {{ currency(info.month.total) }}
                  </td>
                  <td>{{ niceNumber(info.month.btc, 2) }}</td>
                  <td class="has-text-right">
                    {{ niceNumber(info.month.margin, 2) }}%
                  </td>
                </tr>
                <tr>
                  <td>A</td>
                  <td class="has-text-right">
                    {{ info.allOrders.count }}
                  </td>
                  <td class="has-text-right">
                    {{ currency(info.allOrders.total) }}
                  </td>
                </tr>
              </tbody>
            </table>
            <h3>Profit:</h3>
            <p>Forecasting {{ currency(predictedSales) }} sales, <b>{{ currency(predicted) }} profit</b> for {{
              $moment().format('MMMM') }} ({{ currency(predicted / $moment().daysInMonth()) }} a day)</p>
            <table class="table fit-table">
              <tbody>
                <tr
                  v-for="(row, i) in info.profit.slice(0, 44)"
                  :key="i">
                  <td>{{ row.month }}</td>
                  <td><span
                      v-if="info.hasOwnProperty('months') && info.months.length >= i && info.months[i] && info.months[i].hasOwnProperty('total')">{{
                        currency(info.months[i].total) }}</span></td>
                  <td>{{ currency(row.profit) }}</td>
                  <td><span
                      v-if="info.hasOwnProperty('months') && info.months.length >= i && info.months[i] && info.months[i].hasOwnProperty('total')">{{
                        niceNumber(row.profit / info.months[i].total * 100, 2) }}%</span></td>
                </tr>
              </tbody>
            </table>
            <p>{{ currency(info.average) }} average order size (30 days)</p>
            <p>{{ currency(info.oneYearSales[0] / info.oneYearCust) }} average 1-year customer value ({{
              currency(info.oneYearSales[0] / info.oneYearCust * info.oneYearMargin) }} profit)</p>
            <p>{{ Math.round(info.allOrders.count / info.numCustomers * 10) / 10 }} orders per customer ({{
              info.numCustomers }} paying customers)</p>
            <br>
          </div>
        </div>
        <div class="column content">
          <h3>Live users: ({{ info.numUsers }})</h3>
          <table class="table fit-table">
            <!-- <tr v-for="(row, index) in info.activity" :key="'activity'+index">
              <td>{{ Math.round(row.seconds / 60) }} minutes ago</td>
              <td>
                <router-link :to="{name: 'user', query: {uid: row.uid}}">{{ row.displayName }}</router-link>
              </td>
              <td>{{ row.page }}</td>
              <td><span class="icon has-text-grey"><i class="fa" :class="row.mobile ? 'fa-mobile' : 'fa-laptop'"></i></span>{{ }}</td>
              <td>{{ row.version }}</td>
            </tr> -->
          </table>
        </div>
      </div>
    </div>
    <p class="field">
      <router-link
        v-if="routeAccess('ecbank')"
        class="button"
        :to="{ name: 'ecbank' }">
        EC Bank
      </router-link>
    </p>
    <p class="field">
      <router-link
        v-if="routeAccess('compliance')"
        class="button"
        :to="{ name: 'compliance' }">
        Compliance
      </router-link>
    </p>
    <p class="field">
      <router-link
        v-if="routeAccess('stats')"
        class="button"
        :to="{ name: 'stats' }">
        Coin stats
      </router-link>
    </p>
    <p class="field">
      <router-link
        v-if="routeAccess('verification')"
        class="button"
        :to="{ name: 'verification' }">
        Verification
      </router-link>
    </p>
    <p class="field">
      <router-link
        v-if="routeAccess('tools')"
        class="button"
        :to="{ name: 'tools' }">
        Test tools
      </router-link>
    </p>
    <p class="field">
      <router-link
        v-if="routeAccess('agents')"
        class="button"
        :to="{ name: 'agents' }">
        ECA Agents
      </router-link>
    </p>
  </section>
</template>

<script>
import { mapState } from 'vuex'
import { useRoleAccess } from '@/composables/useRoleAccess'

export default {
  name: 'Home',
  data () {
    return {
      infoRefresh: false
    }
  },
  setup () {
    const { routeAccess } = useRoleAccess()
    return {
      routeAccess
    }
  },
  computed: {
    ...mapState({
      info: state => state.info.info,
      predicted: state => state.info.predicted,
      predictedSales: state => state.info.predictedSales
    }),
    infoAge () {
      let now = this.$moment()
      let diff = this.$moment.duration(now.diff(this.$moment(this.$store.state.info.infoUpdated)))
      return Math.round(diff.asMinutes())
    },
    floatSymbol () {
      return this.$local.countryCode === 'NZ' || 'ZA' ? 'USDT' : 'BTC'
    },
    floatRate () {
      let c = this.$store.state.coins.coins
      return c.hasOwnProperty('BTC') ? c[this.floatSymbol].rate : 0
    },
    btcFloatRate () {
      let c = this.$store.state.coins.coins
      return c.hasOwnProperty('BTC') ? c['BTC'].rate : 0
    },
    margins () {
      let margins = {}
      if (!this.info.hasOwnProperty('margins')) {
        return margins
      }
      for (let row of this.info.margins) {
        margins[row.month] = row.margin
      }
      return margins
    }
  },
  mounted () {
    if (this.$store.state.goauth.token !== null) {
      setInterval(() => {
        // Send issue metrics data to Datadog
        this.apiv2('admin', 'updateDatadogMetrics', {
          metrics: [
            {
              name: 'eca.outstanding.verifications',
              value: (this.info.verifications + this.info.bankVerifications + this.info.upgrades)
            },
            {
              name: 'eca.outstanding.orders',
              value: this.$store.state.orders.stuck.total
            },
            {
              name: 'eca.outstanding.deposits',
              value: this.$store.getters['info/unmatchedDeposits']
            }
          ]
        })
          .then(r => console.log('dd metrics: ' + r))
          .catch(r => console.log('dd metrics: ' + r))
      }, 1000 * 60 * 5) // every 5 minutes
    }
  },
  methods: {
    async refreshInfo () {
      this.infoRefresh = true
      try {
        await this.$store.dispatch('info/update')
      } catch (e) {
        console.error(e)
      }
      this.infoRefresh = false
    }
  }
}
</script>

