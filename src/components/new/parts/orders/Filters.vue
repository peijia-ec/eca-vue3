<script setup>
const props = defineProps({
  showOrderStatusFilter: String
})
const emit = defineEmits(['handleFetch'])

const ORDER_STATUSES = [
  { name: 'All orders', key: '' },
  { name: 'Paid', key: 'paid' },
  { name: 'Completed', key: 'completed' },
  { name: 'Incomplete', key: 'incomplete' },
  { name: 'Held', key: 'held' },
  { name: 'Not received', key: 'unpaid' },
  { name: 'Suspicious', key: 'suspicious' }
]

const PAYMENT_METHODS = [
  { name: 'All payments', key: '' },
  { name: 'PxPay', key: 'pxpay' },
  { name: 'Poli', key: 'poli' },
  { name: 'Indacoin', key: 'indacoin' },
  { name: 'Wyre', key: 'wyre' },
  { name: 'Manual', key: 'manual' },
  { name: 'Sell', key: 'sell' },
  { name: 'Auto-buy', key: 'ap' },
  { name: 'Changelly', key: 'changelly' },
  { name: 'Stripe', key: 'stripe' },
  { name: 'Eftpos', key: 'eftpos' },
  { name: 'Sell Swap', key: 'sell-swap' },
  { name: 'Buy Swap', key: 'buy-swap' },
  { name: 'Swap', key: 'swap' },
]

const search = ref('')
const selectedStatus = ref('')
const selectedMethod = ref('')

watch([selectedStatus, selectedMethod], () => {
  emit('handleFetch', {
    status: selectedStatus.value.key,
    method: selectedMethod.value.key
  })
})

const handleSearch = () => {
  emit('handleFetch', { search })
}
</script>

<template>
  <div class="flex justify-between items-center flex-wrap">
    <div class="flex items-center gap-2 mb-4 md:mb-0">
      <Select v-if="props.showOrderStatusFilter" v-model="selectedStatus" :options="ORDER_STATUSES" optionLabel="name"
        placeholder="Filter by status"
        class="w-full md:w-56" />
      <Select v-model="selectedMethod" :options="PAYMENT_METHODS" optionLabel="name" placeholder="Filter by payment"
        class="w-full md:w-56" />
    </div>
    <div class="flex">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="search"
          placeholder="Search"
          @keydown.enter="handleSearch" />
      </IconField>
      <Button icon="pi pi-refresh" variant="text" rounded class="ml-2" aria-label="Refresh"
        @click="emit('handleFetch')" />
    </div>
  </div>
</template>
