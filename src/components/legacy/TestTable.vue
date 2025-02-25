
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
      @filter="handleRow">
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
          <IconField>
            <InputIcon class="fa fa-search" />
            <InputText
              v-model="filters['global'].value"
              placeholder="Search" />
          </IconField>
        </div>
      </template>
      <Column
        field="created"
        header="Created"
        sortable />
      <Column
        field="lastLogin"
        header="Last login"
        sortable />
      <Column
        field="email"
        header="Email" />
      <Column
        field="contact"
        header="Contact" />
      <Column
        field="displayName"
        header="Name" />
      <Column
        field="verified"
        header="Verified" />
      <Column
        field="bankName"
        header="Bank name" />
      <Column
        field="status"
        header="SUS" />
      <Column
        field="tier"
        header="Tier" />
      <Column
        field="totalValue"
        header="Value"
        sortable />
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import { useUserService } from '@/service/useUserService'

defineEmits(['click'])

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
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'country.name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  representative: { value: null, matchMode: FilterMatchMode.IN },
  status: { value: null, matchMode: FilterMatchMode.EQUALS },
  verified: { value: null, matchMode: FilterMatchMode.EQUALS }
})

onMounted(() => {
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
    console.log(data)
    users.value = data.users
    total.value = data.numRows
    loading.value = false
  })
})

const handlePage = () => {
  console.log(111)
}

const handleRow = (e) => {
  console.log(222, e)
}

const handlePrevPage = () => {
  console.log('prev')
}
const handleNextPage = () => {
  console.log('next')
}
</script>
