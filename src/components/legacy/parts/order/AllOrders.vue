<template>
  <div>
    <h2 class="title">
      Orders
    </h2>
    <order-filters
      :filters="params"
      @update="updateOrders"
    />
    <b-table
      :data="orders.data"
      :total="orders.total"
      :current-page="params.page"
      :per-page="params.limit"
      :loading="orders.loading"
      paginated
      backend-pagination
      :mobile-cards="false"
      :narrowed="$root.mobile"
      default-sort-direction="desc"
      default-sort="created"
      @page-change="onPageChange"
    >
      <template #default="props">
        <b-table-column
          field="created"
          label="Date"
        >
          <span
            v-if="$root.mobile"
            class="nobreak"
          >
            <router-link :to="{name: 'user', query: {uid: props.row.uid, orderId: props.row.orderId}}">{{ $moment(props.row.created).format('DD HH:mm') }}</router-link>
          </span>
          <span
            v-else
            class="nobreak"
          >{{ $moment(props.row.created).format('D MMM YYYY, HH:mm') }}</span>
        </b-table-column>

        <b-table-column
          field="orderId"
          label="ID"
          :visible="!$root.mobile"
        >
          <span class="no-break">
            <clipboard icon-only>{{ props.row.orderId }}</clipboard>
            <router-link :to="{name: 'user', query: {uid: props.row.uid, orderId: props.row.orderId}}">{{ props.row.orderId }}</router-link>
          </span>
          <span
            class="icon"
            v-if="!props.row.ownAddress"
          >
            <i class="fa fa-file-zip-o" />
          </span>
        </b-table-column>

        <b-table-column
          field="email"
          label="Email"
          :visible="!$root.mobile"
        >
          <email-link
            :user="props.row"
            :order-id="props.row.orderId"
          />
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
          sortable
        >
          <div class="nobreak">
            <template v-if="!$root.mobile">
              <b-tooltip
                position="is-left"
                :label="props.row.coinList"
                type="is-dark"
                :multilined="true"
              >
                {{ props.row.direction === 'buy' ? currency(props.row.total) : price(props.row.total) }} <sup>{{ props.row.coinCount }}</sup>
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
          sortable
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
            <b-tooltip
              position="is-left"
              :label="props.row.statusInfo"
              type="is-dark"
            >
              <b-tag :type="props.row.statusTag">
                {{ $root.mobile ? ' ' : props.row.status }}
              </b-tag>
            </b-tooltip>
          </template>
        </b-table-column>

        <b-table-column
          field="tier"
          label="Tier"
          :visible="!$root.mobile"
          sortable
        >
          {{ (props.row.tier) ? props.row.tier : '' }}
        </b-table-column>

        <b-table-column
          field="siteVersion"
          label="Version"
          :visible="!$root.mobile"
        >
          {{ props.row.siteVersion }}
        </b-table-column>
      </template>
    </b-table>
  </div>
</template>

<script>
import Clipboard from '../Clipboard.vue'
import EmailLink from '../user/EmailLink.vue'
import OrderFilters from './OrderFilters.vue'

export default {
  components: { Clipboard, EmailLink, OrderFilters },
  name: 'StuckedOrders',
  data () {
    return {
      params: {
        page: 1,
        limit: 15,
        filter: '',
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
    orders () {
      return this.$store.state.orders.orders
    }
  },
  methods: {
    updateOrders (params) {
      if (!params) {
        params = this.params
      } else {
        this.params = params
      }
      this.onPageChange(1)
    },
    onPageChange (page) {
      this.params.page = page
      this.$store.dispatch('orders/fetchOrders', this.params)
    }
  }
}
</script>

<style scoped>
.nobreak {
  word-break: keep-all;
  text-wrap: avoid;
  white-space: nowrap;
}

.tooltip::after {
  white-space: pre;
}

.tag {
  font-size: 80%;
}

sup {
  padding-left: 2px;
  font-size: 9px;
  color: #aaa;
}
</style>
