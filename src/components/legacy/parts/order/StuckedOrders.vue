<template>
  <div>
    <h2 class="title">
      Stuck orders
    </h2>
    <order-filters
      disable-order-status-filter
      disable-per-page-options
      :filters="params"
      @update="updateOrders"
    />
    <b-table
      :data="stuck.data"
      :total="stuck.total"
      :current-page="params.page"
      :per-page="15"
      :loading="stuck.loading"
      paginated
      :mobile-cards="false"
      :narrowed="$root.mobile"
      default-sort-direction="desc"
      default-sort="created"
    >
      <template #empty>
        <div
          v-if="!stuck.total"
          class="has-text-centered"
        >
          No records
        </div>
      </template>

      <template #default="props">
        <b-table-column
          field="date"
          label="Date"
        >
          <span class="nobreak">{{ $moment(props.row.created).format('D MMM, HH:mm') }}</span>
        </b-table-column>

        <b-table-column
          field="orderId"
          label="ID"
        >
          <router-link :to="{name: 'user', query: {uid: props.row.uid, orderId: props.row.orderId}}">
            {{ props.row.orderId }}
          </router-link>
        </b-table-column>

        <b-table-column
          field="email"
          label="Email"
        >
          <email-link
            :user="props.row"
            :order-id="props.row.orderId"
          />
        </b-table-column>

        <b-table-column
          field="coin"
          label="Coin"
        >
          <template v-if="props.row.coins.length === 1">
            {{ props.row.coins[0].coin }}
          </template>
          <template v-if="props.row.coins.length > 1">
            <span
              v-for="(coins, i) in props.row.coins"
              :key="coins + i"
            >
              {{ coins.coin }}
              <br v-if="i !== props.row.coins.length - 1">
            </span>
          </template>
        </b-table-column>

        <b-table-column
          label=" "
          :visible="!$root.mobile"
        >
          <span class="nobreak">
            <a
              v-if="props.row.dripId"
              target="_blank"
              :href="'https://www.getdrip.com/7831035/subscribers/' + props.row.dripId"
            ><span class="icon"><i class="fa fa-tint" /></span></a>
            <a
              v-if="props.row.freshdeskId"
              target="_blank"
              :href="'https://easycrypto.freshdesk.com/a/contacts/' + props.row.freshdeskId"
            ><span class="icon"><i class="fa fa-ticket" /></span></a>
          </span>
        </b-table-column>

        <b-table-column
          field="total"
          label="Total"
          numeric
        >
          <div class="nobreak">
            <template v-if="!$root.mobile">
              <b-tooltip
                position="is-left"
                :label="props.row.coinList"
                type="is-dark"
                :multilined="true"
              >
                {{ currency(props.row.total) }} <sup>{{ props.row.coinCount }}</sup>
              </b-tooltip>
            </template>
            <template v-else>
              <b-tooltip
                position="is-bottom"
                :label="props.row.mobileLabel"
                type="is-dark"
                :multilined="true"
              >
                {{ currency(props.row.total) }}
              </b-tooltip>
            </template>
            <template v-if="props.row.notAtQuote">
              <b-tooltip
                label="Not filled at quote"
                type="is-dark"
              >
                <span class="icon"><i class="fa fa-exclamation-triangle has-text-warning" /></span>
              </b-tooltip>
            </template>
            <span
              v-else-if="!props.row.completed"
              class="icon has-text-white"
            ><i class="fa fa-arrow-right" /></span>
            <span
              v-else-if="props.row.method === 'sell'"
              class="icon has-text-info"
            ><i class="fa fa-arrow-left" /></span>
            <span
              v-else
              class="icon has-text-success"
            ><i class="fa fa-arrow-right" /></span>
          </div>
        </b-table-column>

        <b-table-column
          field="toPay"
          label="ToPay"
          numeric
          :visible="!$root.mobile"
        >
          {{ currency(props.row.toPay) }}
        </b-table-column>

        <b-table-column
          field="portfolio"
          label="P"
          :visible="!$root.mobile"
        >
          <i
            v-if="!props.row.ownAddress"
            class="fa fa-file-zip-o"
          />
        </b-table-column>

        <b-table-column
          field="method"
          :label="($root.mobile) ? 'M' : 'Method'"
        >
          <template v-if="$root.mobile">
            {{ methods[props.row.method] }}
          </template>
          <template v-else>
            {{ props.row.method }}
          </template>
        </b-table-column>

        <b-table-column
          field="new_core"
          :label="($root.mobile) ? 'SYS' : 'System'"
        >
          <template v-if="$root.mobile">
            {{ props.row.new_core ? 'C' : 'L' }}
          </template>
          <template v-else>
            {{ props.row.new_core ? 'Core' : 'Legacy' }}
          </template>
        </b-table-column>

        <b-table-column
          field="status"
          :label="($root.mobile) ? 'S' : 'Status'"
        >
          <template v-if="props.row.status">
            <template v-if="!$root.mobile">
              <b-tag
                size="is-small"
                :type="props.row.statusTag"
              >
                {{ props.row.status }}
              </b-tag>
            </template>
            <template v-else>
              <b-tag :type="props.row.statusTag" />
            </template>
          </template>
        </b-table-column>

        <b-table-column
          field="tier"
          label="Tier"
          :visible="!$root.mobile"
        >
          {{ (props.row.tier) ? props.row.tier : '' }}
        </b-table-column>

        <b-table-column
          label="A"
          :visible="!$root.mobile"
        >
          <span
            title="Remove from this list"
            class="icon has-text-grey cursor"
            @click="snooze(props.row)"
          ><i class="fa fa-clock-o" /></span>
        </b-table-column>
      </template>
    </b-table>
  </div>
</template>

<script>
import EmailLink from '../user/EmailLink.vue'
import OrderFilters from './OrderFilters.vue'

export default {
  components: { EmailLink, OrderFilters },
  name: 'StuckedOrders',
  data () {
    return {
      params: {
        page: 1,
        limit: 300,
        filter: 'stuck',
        search: '',
        method: ''
      },
      methods: {
        'poli': 'P',
        'manual': 'm',
        'sell': 'S',
        'ap': 'A'
      }
    }
  },
  created () {
    this.$store.dispatch('orders/fetchOrders', this.params)
  },
  computed: {
    stuck () {
      return this.$store.state.orders.stuck
    },
  },
  methods: {
    async snooze (row) {
      try {
        await this.apiv2('admin', 'snooze', {
          type: 'order',
          orderId: row.orderId,
          snooze: true
        })
        this.$store.dispatch('orders/fetchOrders', this.params)
        this.$store.dispatch('orders/fetchOrders', {
          filter: 'snoozed'
        })
      } catch (e) {
        // nothing
      }
    },
    updateOrders (params) {
      if (!params) {
        params = this.params
      } else {
        this.params = params
      }
      this.$store.dispatch('orders/fetchOrders', this.params)
    },
  }
}
</script>

<style scoped>
.tag {
  font-size: 80%;
}

sup {
  padding-left: 2px;
  font-size: 9px;
  color: #aaa;
}
</style>
