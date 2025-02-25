<template>
  <div>
    <h2 class="title">
      Unreceived Payments
    </h2>
    <order-filters
      disable-order-status-filter
      :filters="params"
      @update="updateOrders"
    />
    <b-table
      :data="unreceivedOrders.data"
      :total="unreceivedOrders.total"
      :per-page="params.limit"
      :loading="unreceivedOrders.loading"
      paginated
      backend-pagination
      :mobile-cards="false"
      :narrowed="$root.mobile"
      @page-change="onPageChange"
    >
      <template #empty>
        <div
          v-if="!unreceivedOrders.total"
          class="has-text-centered"
        >
          No records
        </div>
      </template>

      <template #default="props">
        <b-table-column
          field="orderId"
          label="ID"
        >
          <span class="no-break">
            <clipboard icon-only>{{ props.row.orderId }}</clipboard>
            <router-link :to="{name: 'user', query: {uid: props.row.uid, orderId: props.row.orderId}}">{{ props.row.orderId }}</router-link>
          </span>
        </b-table-column>

        <b-table-column
          field="processed"
          label="Processed"
          sortable
        >
          <span class="no-break">{{ $moment(props.row.processed).format('DD MMM YY, HH:mm') }}</span>
        </b-table-column>

        <b-table-column
          field="toPay"
          label="Total"
          numeric
          sortable
        >
          {{ currency(props.row.toPay) }}
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
          field="bankAccount"
          label="Bank"
          :visible="!$root.mobile"
        >
          {{ props.row.bankAccount }}
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
        method: '',
        sort: {column: 'processed', direction: 'desc'}
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
    this.$store.dispatch('orders/fetchUnreceivedOrders', this.params)
  },
  computed: {
    unreceivedOrders () {
      return this.$store.state.orders.unreceivedOrders
    },
  },
  methods: {
    updateOrders (params) {
      if (!params) {
        params = this.params
      } else {
        this.params = params
      }
      this.$store.dispatch('orders/fetchUnreceivedOrders', this.params)
    },
    onPageChange (page) {
      this.params.page = page
      this.$store.dispatch('orders/fetchUnreceivedOrders', this.params)
    },
  },
}
</script>
