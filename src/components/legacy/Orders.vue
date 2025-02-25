<template>
  <section class="section">
    <stucked-orders ref="stuckOrders" />

    <unreceived-orders ref="unreceivedOrders" />

    <all-orders ref="allOrders" />

    <snoozed-orders ref="snoozedOrders" />

    <missing-address-orders ref="missingAddressOrders" />
    <b-button
      type="is-primary"
      rounded
      class="sticky-update-btn"
      @click="updatePage"
      icon-left="refresh"
    >
      Refresh
    </b-button>
  </section>
</template>

<script>
import UnreceivedOrders from './parts/order/UnreceivedOrders.vue'
import AllOrders from './parts/order/AllOrders.vue'
import StuckedOrders from './parts/order/StuckedOrders.vue'
import SnoozedOrders from './parts/order/SnoozedOrders.vue'
import MissingAddressOrders from './parts/order/MissingAddressOrders.vue'

export default {
  name: 'Orders',
  components: { UnreceivedOrders, AllOrders, StuckedOrders, SnoozedOrders, MissingAddressOrders},
  data () {
    return {
      screenWidth: window.innerWidth
    }
  },
  mounted () {
    window.addEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize (event) {
      this.screenWidth = window.innerWidth
    },
    updatePage () {
      this.$refs.stuckOrders.updateOrders()
      this.$refs.allOrders.updateOrders()
      this.$refs.unreceivedOrders.updateOrders()
      this.$refs.snoozedOrders.updateOrders()
      this.$refs.missingAddressOrders.updateOrders()
    }
  }
}
</script>

