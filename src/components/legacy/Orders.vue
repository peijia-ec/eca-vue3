<template>
  <Tabs value="0" class="rounded-md overflow-hidden">
    <TabList>
      <Tab value="0">
        Stuck orders
        <Tag v-if="$store.state.orders.stuck.total" :value="$store.state.orders.stuck.total" severity="danger" />
      </Tab>
      <Tab value="1">Unreceived payments</Tab>
      <Tab value="2">Orders</Tab>
      <Tab value="3">Snoozed</Tab>
      <Tab value="4">Held Orders: Delivery Address Needed</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="0">
        <StuckOrdersTable />
      </TabPanel>
      <TabPanel value="1">
        <p class="m-0">
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
          aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo
          enim
          ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui
          ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
        </p>
      </TabPanel>
      <TabPanel value="2">
        <p class="m-0">
          At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque
          corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in
          culpa
          qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et
          expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
        </p>
      </TabPanel>
      <TabPanel value="3">
        <p class="m-0">
          At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque
          corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in
          culpa
          qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et
          expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
        </p>
      </TabPanel>
      <TabPanel value="4">
        <p class="m-0">
          At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque
          corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in
          culpa
          qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et
          expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
        </p>
      </TabPanel>
    </TabPanels>
  </Tabs>


  <!-- <section class="section"> -->
  <!-- <stucked-orders ref="stuckOrders" /> -->

  <!-- <unreceived-orders ref="unreceivedOrders" />

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
    </b-button> -->
  <!-- </section> -->
</template>

<script>
import UnreceivedOrders from './parts/order/UnreceivedOrders.vue'
import AllOrders from './parts/order/AllOrders.vue'
import SnoozedOrders from './parts/order/SnoozedOrders.vue'
import MissingAddressOrders from './parts/order/MissingAddressOrders.vue'

export default {
  name: 'Orders',
  components: { UnreceivedOrders, AllOrders, SnoozedOrders, MissingAddressOrders },
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

