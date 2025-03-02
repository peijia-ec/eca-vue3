<script setup>
import Tag from 'primevue/tag'
import store from '@/store'
import dayjs from 'dayjs'
import { useUtils } from '@/composables/useUtils'

const params = ref({
  page: 1,
  limit: 300,
  filter: 'stuck',
  search: '',
  method: ''
})

const { currency } = useUtils()

const loading = ref(false)
const perPage = ref(15)
const suspicious = ref(false)
const referral = ref(false)

const columns = [{
  field: 'created',
  header: 'Date',
  formatter: (val) => dayjs(val).format('DD MMM, HH:mm'),
}, {
  field: 'orderId',
  header: 'ID'
}, {
  field: 'email',
  header: 'Email'
}, {
  field: 'coins',
  header: 'Coin',
  formatter: (val) => val.map(v => v.coin).join(', ')
}, {
  field: 'drip',
  header: 'Drip'
}, {
  field: 'total',
  header: 'Total',
  formatter: (val) => currency(val)
}, {
  field: 'toPay',
  header: 'To pay',
  formatter: (val) => currency(val)
}, {
  field: 'method',
  header: 'Method'
}, {
  field: 'new_core',
  header: 'System',
  formatter: (val) => val ? 'Core' : 'Legacy'
}, {
  field: 'status',
  header: 'Status',
  component: Tag,
  props: (val) => ({ value: val.status, severity: val.statusTag }),
}, {
  field: 'tier',
  header: 'Tier',
  component: Tag,
  props: (val) => ({ value: val.tier, severity: 'success' }),
}, {
  field: 'snooze',
  header: 'Snooze'
}]

onMounted(() => {
  handleFetch()
})

const stuckOrders = computed(() => store.state.orders.stuck || {})

watch([suspicious, referral, perPage], () => {
  handleFetch()
})

const handleFetch = async (newParams) => {
  if (newParams) {
    params.value = {
      ...params.value,
      ...newParams
    }
  }
  loading.value = true
  await store.dispatch('orders/fetchOrders', params.value)
  loading.value = false
}
</script>

<template>
  <DataTable
    :value="stuckOrders.data"
    :loading="!stuckOrders.data && loading"
    :paginator="true"
    :rows="perPage"
    :rows-per-page-options="[15, 30, 50, 100]"
    :total-records="stuckOrders.total">
    <template #header>
      <Filters @handleFetch="handleFetch" />
    </template>
    <Column
      v-for="col in columns"
      :key="col.field"
      :field="col.field"
      :header="col.header">
      <template #body="{ data }">
        <Skeleton v-if="loading"></Skeleton>
        <component
          v-else-if="col.component"
          :is="col.component"
          v-bind="col.props ? col.props(data) : {}" />
        <p v-else>{{ col.formatter ? col.formatter(data[col.field]) : data[col.field] }}</p>
      </template>
    </Column>
  </DataTable>
</template>
