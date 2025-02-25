<template>
  <div class="is-size-7">
    <b-loading
      :is-full-page="true"
      :active="loading"
    />
    <b-field
      grouped
      group-multiline
    >
      <b-select
        v-model="type"
        size="is-small"
      >
        <option value="all">
          Type
        </option>
        <option value="deposits">
          Deposits
        </option>
        <option value="withdrawals">
          Withdrawals
        </option>
      </b-select>
      <b-select
        v-model="status"
        size="is-small"
      >
        <option value="all">
          Status
        </option>
        <option value="unmatched">
          Unmatched
        </option>
      </b-select>
      <b-select
        v-model="perPage"
        size="is-small"
      >
        <option value="20">
          20 per page
        </option>
        <option value="50">
          50 per page
        </option>
        <option value="100">
          100 per page
        </option>
        <option value="200">
          200 per page
        </option>
      </b-select>
      <b-input
        v-model="filter"
        type="search"
        placeholder="Text"
        size="is-small"
      />
      <b-input
        v-model="searchMin"
        style="width:100px"
        type="number"
        placeholder="Min value"
        size="is-small"
      />
      <b-input
        v-model="searchMax"
        style="width:100px"
        type="number"
        placeholder="Max value"
        size="is-small"
      />
      <b-button
        :loading="loading"
        size="is-small"
        @click="loadData"
      >
        Re-download
      </b-button>
    </b-field>
    <b-table
      :data="list"
      :mobile-cards="false"
      :paginated="true"
      :per-page="perPage"
      default-sort="id"
      default-sort-direction="desc"
      pagination-position="both"
      pagination-size="is-small"
      narrowed
    >
      <template #default="props">
        <b-table-column
          field="date"
          label="Date"
          sortable
        >
          <span class="no-break">{{ $moment(props.row.date).format('DD/MM/YY') }}</span>
        </b-table-column>
        <b-table-column
          field="created"
          label="Added"
          sortable
        >
          <span class="no-break">{{ $moment(props.row.created).format('DD/MM/YY HH:mm') }}</span>
        </b-table-column>
        <b-table-column
          field="id"
          label="ID"
          sortable
        >
          <span class="has-text-grey-light">{{ props.row.id }}</span>
        </b-table-column>
        <b-table-column
          field="amount"
          label="Amount"
          class="has-text-right"
          sortable
          numeric
        >
          <span
            v-if="props.row.withdrawal"
            class="has-text-danger"
          >-{{ props.row.withdrawal }}</span>
          <span v-else>{{ props.row.deposit }}</span>
        </b-table-column>
        <b-table-column
          field="confirmations"
          label="C"
        >
          <template v-if="isConfirmed(props.row)">
            <template v-if="props.row.deposit && !props.row.orderId && !props.row.processed">
              <span
                title="Link this to an order"
                class="cursor icon has-text-info"
                @click="linkToOrder(props.row)"
              ><i class="fa fa-link" /></span>
              <span
                title="Mark this as processed"
                class="cursor icon has-text-info"
                @click="markAsProcessed(props.row)"
              ><i class="fa fa-check" /></span>
            </template>
            <span
              v-else
              :title="`${props.row.confirmations} confirmations`"
              class="icon has-text-grey-lighter"
            ><i class="fa fa-check" /></span>
          </template>
        </b-table-column>
        <b-table-column
          field="orderId"
          label="Order"
        >
          <router-link
            v-if="props.row.orderId"
            :to="{name: 'order', query: {orderId: props.row.orderId}}"
          >
            {{ props.row.orderId }}
          </router-link>
        </b-table-column>
        <b-table-column
          field="account"
          label="Account"
        >
          <span class="no-break">{{ props.row.account }}</span>
        </b-table-column>
        <b-table-column
          field="name"
          label="Name"
        >
          {{ props.row.name }}
        </b-table-column>
        <b-table-column
          field="description"
          label="Description"
        >
          <template v-if="isConfirmed(props.row) && !props.row.poli && !props.row.processed && props.row.deposit > 0">
            <!-- Non processed deposit - show possible matching words -->
            <span
              v-for="(word, i) in split(props.row.description)"
              :key="props.row.id + ' ' + i"
            >
              <router-link
                v-if="word.length === 6 && !word.match(/\W/g)"
                :to="{name: 'order', query: {orderId: word}}"
                class="has-text-danger"
              >{{ word }} </router-link>
              <template v-else>{{ word }} </template>
            </span>
          </template>
          <template v-else>
            {{ props.row.description }}
          </template>
        </b-table-column>
        <b-table-column label=".">
          <span
            v-if="props.row.ap"
            title="Auto-Buy"
            class="icon is-small has-text-success"
          ><i class="fa fa-bolt" /></span>
        </b-table-column>
      </template>
    </b-table>
    <b-modal :active.sync="showLinkToOrder">
      <div
        v-if="linkedOrder"
        class="box content"
      >
        <p><i>Please send this email to the user and get Alan to link up the orders. This process is not yet automatic for safety.</i></p>
        <p><b>Issue with order {{ linkedOrder.orderId }}</b></p>
        <p>Hi {{ linkedOrder.name }}</p>
        <p>On your recent deposit you accidentally used the reference number <b>"{{ linkedOrder.description }}"</b> - instead of the reference number <b>"{{ linkedOrder.orderId }}"</b>.</p>
        <p>Our systems are completely automated, so it was unable to match this order at the time of your deposit. I have matched it up manually and it is processing now :)</p>
        <p>In the future, please make sure to use the same reference number as on the order, and it will work straight away without any issues.</p>
        <p>Best regards</p>
        <p>Easy Crypto</p>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'Deposits',
  data () {
    return {
      loading: false,
      perPage: 20,
      type: 'all',
      status: 'all',
      searchMin: null,
      searchMax: null,
      filter: '',
      showLinkToOrder: false,
      linkedOrder: null,
      list: []
    }
  },
  watch: {
    // Watch all search filters and update the list on any changes
    ...['perPage', 'type', 'status', 'searchMin', 'searchMax', 'filter']
      .reduce((watchers, key) => ({
        ...watchers,
        [key] (newVal, oldVal) {
          this.filterList()
        }
      }), {}),
    '$store.state.info.bank': 'filterList'
  },
  mounted () {
    this.filterList()
  },
  methods: {
    split (text) {
      if (!text || !text.length) {
        return []
      } else {
        return text.split(' ')
      }
    },
    filterList () {
      console.log('Updating list')
      this.list = this.$store.state.info.bank.filter((x) => {
        let type = true
        let status = true
        let value = true
        let text = true
        let t = this.type
        if (t === 'deposits' && !x.deposit) {
          type = false
        }
        if (t === 'withdrawals' && !x.withdrawal) {
          type = false
        }
        if (this.status === 'unmatched' && (x.confirmations < this.$local.confirmations || x.orderId || (x.processed && !x.ap) || x.withdrawal)) {
          status = false
        }
        let min = parseFloat(this.searchMin)
        let max = parseFloat(this.searchMax)
        if (this.searchMin && (!x.deposit || x.deposit < min) && (!x.withdrawal || x.withdrawal < min)) {
          value = false
        }
        if (this.searchMax && (x.deposit > max || x.withdrawal > max)) {
          value = false
        }
        try {
          if (this.filter.trim() && `${x.id} ${x.orderId} ${x.account} ${x.description} ${x.name}`.search(new RegExp(this.filter, 'i')) === -1) {
            text = false
          }
        } catch (e) {
          // invalid regex
        }
        return type && status && value && text
      })
    },
    isConfirmed (row) {
      if (!row || !row.hasOwnProperty('confirmations')) {
        return false
      } else {
        return row.confirmations >= this.$local.confirmations
      }
    },
    linkToOrder (row) {
      let amount = this.currency(row.deposit)
      this.$buefy.dialog.prompt({
        title: `Deposit ${row.id}: ${amount}`,
        message: `Please enter the correct order number for this deposit for ${amount}?`,
        inputAttrs: {placeholder: 'e.g. ABC123'},
        confirmText: 'Next',
        onConfirm: async (value) => {
          try {
            this.loading = true
            let res = await this.ecApi('admin', 'getOrder', {
              orderId: value.toUpperCase().trim()
            })
            let order = res.order
            this.loading = false
            this.$buefy.dialog.confirm({
              message: `
              <p>Please check the details for order ${order.orderId}:</p>
              <table class="table">
              <thead><tr><th>Deposit</th><th>Order</th></tr></thead>
              <tbody><tr><td>${this.currency(row.deposit)}</td><td>${this.currency(order.total)}</td></tr></tbody>
              </table>
              `,
              confirmText: 'Looks good!',
              onConfirm: async () => {
                try {
                  this.loading = true
                  res = await this.pdbApi('/pdb/eca/unmatched-deposit-buy-order', {
                    orderId: order.orderId,
                    id: row.id
                  })
                  if (res) {
                    this.$store.commit('info/mutateArrayRowById', {
                      array: 'bank',
                      id: row.id,
                      update: {
                        orderId: order.orderId
                      }
                    })
                    this.$buefy.snackbar.open({
                      message: 'Deposit linked!',
                      type: 'is-success',
                      position: 'is-top'
                    })
                  }
                } catch (e) {
                  this.$buefy.toast.open(e)
                  console.log(e)
                }
                this.loading = false
              }
            })
          } catch (e) {
            this.loading = false
            this.$buefy.toast.open(e)
            console.log(e)
          }
        }
      })
    },
    async loadData () {
      if (this.loading) {
        return
      }
      this.loading = true
      await this.$store.dispatch('info/deposits')
      this.loading = false
    },
    markAsProcessed (row) {
      this.$buefy.dialog.confirm({
        message: 'Are you sure you want to mark this deposit as processed?',
        onConfirm: async () => {
          try {
            await this.sendApi(this.$local.pdb + '/pdb/eca/mark-bank-as-processed', {
              id: row.id
            })
            this.$store.commit('info/processBankRow', row.id)
            this.filterList()
            this.$buefy.toast.open('Done!')
          } catch (e) {
            console.log(e)
            this.$buefy.toast.open(e)
          }
        }
      })
    }
  }
}
</script>

<style scoped>
td {
  font-size: 10pt;
}
</style>
