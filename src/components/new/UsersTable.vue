
<template>
  <div class="card">
    <DataTable
      :value="users"
      :lazy="true"
      :paginator="true"
      :rows="perPage"
      :rows-per-page-options="[15, 30, 50, 100]"
      :total-records="total"
      @page="handlePage"
      @sort="handleSort"
      @update:rows="handlePerPage">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
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
          <template v-else>
            <Tag v-if="isTag(col.field) && data[col.field]" :value="data[col.field]" severity="success" />
            <p v-else-if="col.field === 'created'">{{ dayjs(data.created).format('YYYY-MM-DD') }}</p>
            <p v-else-if="col.field === 'lastLogin'">{{ dayjs(data.lastLogin).format('YYYY-MM-DD hh:mm') }}</p>
            <div v-else-if="col.field === 'sus'">
              <Tag v-if="data['fraud'] || data['suspicious']" :value="susLabel(data)" severity="danger" />
              <p v-else>{{ data['sus'] }}</p>
            </div>
            <p v-else-if="col.field === 'totalValue'">{{ `$${data.totalValue}` }}</p>
            <div v-else-if="col.field === 'drip'">
              <Button
                v-if="data.dripId" as="a" :href="'https://www.getdrip.com/' + $local.drip + '/subscribers/' + data.dripId"
                icon="pi pi-envelope" severity="info" size="small" rounded variant="outlined" aria-label="Drip" />
            </div>
            <p v-else-if="col.field === 'email'">
              <Button :label="data[col.field]" class="p-0" color="primary" variant="link" />
            </p>
            <p v-else>{{ data[col.field] }}</p>
          </template>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useUserService } from '@/service/useUserService'
import dayjs from 'dayjs'

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

const columns = [{
  field: 'created',
  header: 'Created',
  sortable: true
}, {
  field: 'lastLogin',
  header: 'Last login',
  sortable: true
}, {
  field: 'email',
  header: 'Email'
}, {
  field: 'drip',
  header: 'Drip'
}, {
  field: 'displayName',
  header: 'Name'
}, {
  field: 'verificationMethod',
  header: 'Verified'
}, {
  field: 'bankName',
  header: 'Bank name'
}, {
  field: 'sus',
  header: 'SUS'
}, {
  field: 'tier',
  header: 'Tier'
}, {
  field: 'totalValue',
  header: 'Value'
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

const isTag = (field) => {
  return field === 'tier' || field === 'verificationMethod'
}

const susLabel = ({ fraud, suspicious }) => {
  if (fraud) {
    return 'Fraud'
  } else if (suspicious) {
    return 'Suspicious'
  }
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
