<template>
  <div
    class="box content"
    style="width: 40%"
  >
    <b-loading
      :is-full-page="true"
      :active="loading"
    />
    <h2>User bank account(s)</h2>
    <b-input
      v-model="searchQuery"
      type="text"
      placeholder="Search by account number"
    />
    <b-table
      :data="filteredBankData"
    >
      <template #default="props">
        <b-table-column label="Account Number">
          {{ props.row.displayNumber }}
        </b-table-column>
        <b-table-column label="Action">
          <span
            class="icon cursor"
            @click="deleteBankAccount(props.row.displayNumber, props.row.id)"
          >
            <b-button
              class="is-small"
              type="is-danger"
            >
              <i class="fa fa-trash" />
            </b-button>
          </span>
        </b-table-column>
      </template>
    </b-table>
    <b-button
      class="button"
      @click="$emit('update')"
    >
      Close
    </b-button>
  </div>
</template>

<script>

export default {
  name: 'EditUserBankAccount',
  props: {
    bankData: {
      type: Array,
      required: false
    }
  },
  data () {
    return {
      deleteModal: false,
      searchQuery: '',
      loading: false
    }
  },
  computed: {
    filteredBankData () {
      const query = this.searchQuery.trim()
      if(query === '') {
        return this.bankData
      } else {
        return this.bankData.filter(account => account.account.includes(query))
      }
    }
  },
  methods: {
    deleteBankAccount (acc, id) {
      this.$buefy.dialog.confirm({
        message: 'Delete ' + acc + '?',
        onConfirm: async () => {
          this.loading = true
          try {
            await this.apiv2('api-admin/index', 'user/deleteBankAccount', {
              id: id,
            })
            this.loading = false
            this.$buefy.toast.open('Done!')
            this.$emit('update')
          } catch (e) {
            console.error(e)
          }
        }
      })
    }
  }
}
</script>
