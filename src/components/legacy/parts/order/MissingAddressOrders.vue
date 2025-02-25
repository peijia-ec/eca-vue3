<template>
  <div>
    <h2 class="title">
      Held Orders: Delivery Address Needed
    </h2>
    <order-filters
      disable-order-status-filter
      :filters="params"
      @update="updateOrders"
    />
    <b-table
      :data="missingAddressOrders.data"
      :total="missingAddressOrders.total"
      :per-page="params.limit"
      :loading="missingAddressOrders.loading"
      paginated
      backend-pagination
      :mobile-cards="false"
      :narrowed="$root.mobile"
      @page-change="onPageChange"
    >
      <template #empty>
        <div
          v-if="!missingAddressOrders.total"
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
          <span class="nobreak">{{ $moment(props.row.created).format('D MMM YY, HH:mm') }}</span>
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
          :visible="!$root.mobile"
        >
          <span class="no-break">
            <clipboard icon-only>{{ props.row.email }}</clipboard>
            <router-link :to="{name: 'user', query: {uid: props.row.uid}}">
              <Truncate
                :length="16"
                :text="props.row.email"
                :active="$root.mobile"
              />
            </router-link>
          </span>
        </b-table-column>
        <b-table-column
          field="total"
          label="Total"
          numeric
        >
          {{ currency(props.row.total) }}
        </b-table-column>
        <b-table-column
          field="method"
          label="Method"
        >
          {{ props.row.method }}
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
      </template>
    </b-table>
  </div>
</template>

<script>
import Truncate from '../../Truncate.vue'
import Clipboard from '../Clipboard.vue'
import OrderFilters from './OrderFilters.vue'

export default {
  name: 'UnreceivedOrders',
  components: {Truncate, Clipboard, OrderFilters},
  data () {
    return {
      params:  {
        page: 1,
        limit: 15,
        filter: 'missingAddress',
        method: '',
        sort: {column: 'created', direction: 'desc'}
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
    missingAddressOrders () {
      return this.$store.state.orders.missingAddress
    },
  },
  methods: {
    updateOrders (params) {
      if (!params) {
        params = this.params
      } else {
        this.params = params
      }
      this.$store.dispatch('orders/fetchOrders', this.params)
    },
    onPageChange (page) {
      this.params.page = page
      this.$store.dispatch('orders/fetchOrders', this.params)
    }
  },
}
</script>
