<script setup>
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import dayjs from 'dayjs'
import { useUserService } from '@/service/useUserService'
import { useUtils } from '@/composables/useUtils'
import DripButton from './parts/users/DripButton.vue'

const { fetchAllUsers } = useUserService()

const loading = ref(false)
const page = ref(1)
const perPage = ref(15)
const search = ref(null)
const method = ref('all')
const sortField = ref('lastLogin')
const sortOrder = ref('desc')
const suspicious = ref(false)
const referral = ref(false)
const total = ref(0)
const users = ref()

const { currency } = useUtils()

const columns = [{
  field: 'created',
  header: 'Created',
  sortable: true,
  formatter: (val) => dayjs(val).format('YYYY-MM-DD'),
}, {
  field: 'lastLogin',
  header: 'Last login',
  sortable: true,
  formatter: (val) => dayjs(val).format('YYYY-MM-DD hh:mm'),
}, {
  field: 'email',
  header: 'Email',
  component: Button,
  props: (val) => ({ label: val.email, class: 'p-0', color: 'primary', variant: 'link' })
}, {
  field: 'drip',
  header: 'Drip',
  component: DripButton,
  props: (val) => ({ hideIf: !val.dripId, dripId: val.dripId })
}, {
  field: 'displayName',
  header: 'Name'
}, {
  field: 'verificationMethod',
  header: 'Verified',
  component: Tag,
  props: (val) => ({ value: val.verificationMethod, severity: 'success' }),
}, {
  field: 'bankName',
  header: 'Bank name'
}, {
  field: 'sus',
  header: 'SUS',
  component: Tag,
  props: (val) => ({
    value: susLabel(val),
    severity: val.fraud || val.suspicious ? 'danger' : 'secondary'
  }),
}, {
  field: 'tier',
  header: 'Tier',
  component: Tag,
  props: (val) => ({
    value: val.tier,
    severity: val.tier > 0 ? 'success' : 'secondary'
  }),
}, {
  field: 'totalValue',
  header: 'Value',
  formatter: (val) => currency(val),
}]

onMounted(() => {
  handleFetch()
})

watch([suspicious, referral, perPage], () => {
  handleFetch()
})

const handlePage = (pagination) => {
  page.value = pagination.page + 1
  handleFetch()
}

const handleSort = (sort) => {
  sortField.value = sort.sortField
  sortOrder.value = sort.sortOrder === 1 ? 'asc' : 'desc'
  handleFetch()
}

const handlePerPage = (num) => {
  perPage.value = num
  handleFetch()
}

const susLabel = ({ fraud, suspicious, sus }) => {
  if (fraud) {
    return 'Fraud'
  } else if (suspicious) {
    return 'Suspicious'
  }
  return sus
}

const handleFetch = () => {
  loading.value = true
  fetchAllUsers({
    page: page.value,
    perPage: perPage.value,
    search: search.value,
    method: method.value,
    suspicious: suspicious.value,
    referral: referral.value,
    sortField: sortField.value,
    sortOrder: sortOrder.value
  }).then(data => {
    users.value = data.users
    total.value = data.numRows
    loading.value = false
  })
}
</script>

<template>
  <div class="card">
    <DataTable
      :value="users"
      :loading="!users && loading"
      :lazy="true"
      :paginator="true"
      :rows="perPage"
      :rows-per-page-options="[15, 30, 50, 100]"
      :total-records="total"
      @page="handlePage"
      @sort="handleSort"
      @update:rows="handlePerPage">
      <template #header>
        <div class="flex justify-between items-center flex-wrap">
          <div class="flex items-center gap-2 mb-4 md:mb-0">
            <ToggleSwitch
              v-model="suspicious"
              input-id="input-suspicious" />
            <label
              for="input-suspicious"
              class="mr-2">Suspicious</label>
            <ToggleSwitch
              v-model="referral"
              input-id="input-referral" />
            <label for="input-referral">Referral</label>
          </div>
          <div class="flex">
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="search"
                placeholder="Search"
                @keydown.enter="handleFetch" />
            </IconField>
            <Button icon="pi pi-refresh" variant="text" rounded class="ml-2" aria-label="Refresh" @click="handleFetch" />
          </div>
        </div>
      </template>
      <Column
        v-for="col in columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :sortable="col.sortable">
        <template #body="{ data }">
          <Skeleton v-if="loading"></Skeleton>
          <component
            v-else-if="col.component && !col.props(data).hideIf"
            :is="col.component"
            v-bind="col.props ? col.props(data) : {}" />
          <p v-else>{{ col.formatter ? col.formatter(data[col.field]) : data[col.field] }}</p>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
