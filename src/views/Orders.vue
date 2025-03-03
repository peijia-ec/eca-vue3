<script setup>

</script>

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
        <UnreceivedOrdersTable />
      </TabPanel>
      <TabPanel value="2">
        <AllOrdersTable />
      </TabPanel>
      <TabPanel value="3">
        <SnoozedOrdersTable />
      </TabPanel>
      <TabPanel value="4">
        <MissingAddressOrdersTable />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>
