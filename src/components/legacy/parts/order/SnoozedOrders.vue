<template>
  <section>
    <h2 class="title">
      Snoozed
    </h2>
    <order-filters
      disable-order-status-filter
      disable-per-page-options
      :filters="params"
      @update="updateOrders"
    />
    <b-table
      :data="snoozed.data"
      :total="snoozed.total"
      :current-page="params.page"
      :per-page="15"
      :loading="snoozed.loading"
      paginated
      :mobile-cards="false"
      :narrowed="$root.mobile"
      default-sort-direction="desc"
      default-sort="created"
    >
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

        <b-table-column
          field="status"
          label="Status"
        >
          <b-tag
            v-if="props.row.status"
            :type="props.row.statusTag"
          >
            {{ props.row.status }}
          </b-tag>
        </b-table-column>
        <b-table-column
          field="snoozed"
          label="Snoozed"
        >
          <span class="nobreak">{{ $moment(props.row.snoozed).format('D MMM, HH:mm') }}</span>
        </b-table-column>
      </template>
    </b-table>
  </section>
</template>

<script>
import EmailLink from '../user/EmailLink.vue'
import OrderFilters from './OrderFilters.vue'

export default {
  components: { EmailLink, OrderFilters },
  name: 'SnoozedOrders',
  data () {
    return {
      params: {
        page: 1,
        limit: 300,
        filter: 'snoozed',
        search: '',
        method: ''
      }
    }
  },
  created () {
    this.$store.dispatch('orders/fetchOrders', this.params)
  },
  computed: {
    snoozed () {
      return this.$store.state.orders.snoozed
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
    }
  }
}
</script>

<style scoped>
.tag {
  font-size: 80%;
}
</style>
