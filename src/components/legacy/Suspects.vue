<template>
  <section class="section">
    <h1 class="title">
      Suspects
      <button
        class="button is-small"
        @click="loadAsyncData"
      >
        Refresh
      </button>
    </h1>
    <b-table
      :data="list"
      :loading="loading"

      paginated
      backend-pagination
      :total="total"
      :per-page="perPage"
      @page-change="onPageChange"
    >
      <template #default="props">
        <b-table-column label="Email">
          <router-link :to="{name: 'order', query: {orderId: props.row.orderId}}">
            {{ props.row.emailStart }}
          </router-link>
        </b-table-column>
        <b-table-column label="Domain">
          {{ props.row.domain }}
        </b-table-column>
        <b-table-column label="OA">
          <span
            v-if="props.row.ownAddress"
            class="icon"
          ><i class="fa fa-2x has-text-danger fa-exclamation-triangle" /></span>
        </b-table-column>
        <b-table-column label="Bank">
          {{ bankName(props.row.bsb) }}
        </b-table-column>
        <b-table-column label="Coins">
          {{ props.row.coins }}
        </b-table-column>
        <b-table-column label="Total">
          <span
            class="price"
            :style="'background:rgba(255,60,60,' + ((props.row.total - 100) / 400) + ')'"
          >{{ currency(props.row.total) }}</span>
        </b-table-column>
        <b-table-column label="First">
          <Truncate :text="props.row.firstName" />
        </b-table-column>
        <b-table-column label="Last">
          <Truncate :text="props.row.lastName" />
        </b-table-column>
        <b-table-column label="B First">
          <Truncate :text="props.row.bankFirst" />
        </b-table-column>
        <b-table-column label="B Last">
          <Truncate :text="props.row.bankLast" />
        </b-table-column>
        <b-table-column label="Held">
          <b-tag
            v-if="!props.row.completed"
            type="is-warning"
          >
            Held
          </b-tag>
        </b-table-column>
      </template>
    </b-table>
  </section>
</template>

<script>
import Truncate from './Truncate.vue'

export default {
  name: 'Suspects',
  components: {Truncate},
  data () {
    return {
      trunc: 12,
      loading: false,
      page: 1,
      perPage: 15,
      list: [],
      total: 0,
      banks: {
        1: 'ANZ',
        4: 'ANZ',
        6: 'ANZ',
        11: 'ANZ',
        25: 'ANZ',
        12: 'ASB',
        24: 'ASB',
        2: 'BNZ',
        8: 'BNZ',
        31: 'CTB',
        30: 'HSBC',
        10: 'ICBC',
        38: 'KB',
        15: 'TSB',
        3: 'WP',
        13: 'WP',
        14: 'WP',
        16: 'WP',
        17: 'WP',
        18: 'WP',
        19: 'WP',
        20: 'WP',
        21: 'WP',
        22: 'WP',
        23: 'WP',
        27: 'WP'
      }
    }
  },
  mounted () {
    this.loadAsyncData()
  },
  methods: {
    truncate (val) {
      return (val.toString().length > this.trunc) ? val.toString().substring(0, this.trunc - 2) + '...' : val
    },
    bankName (bsb) {
      if (!bsb) {
        return ''
      }
      let num = bsb.toString().slice(0, -4)
      return (this.banks.hasOwnProperty(num)) ? this.banks[num] : num
    },
    loadAsyncData () {
      this.loading = true
      this.ecApi('admin', 'getSuspects', {
        page: this.page,
        perPage: this.perPage
      })
        .then((data) => {
          let orders = []
          for (let i = 0; i < data.orders.length; i++) {
            let order = data.orders[i]

            let email = order.email.split('@')
            order.domain = email[1].toLowerCase()
            order.emailStart = email[0].toLowerCase()

            orders.push(order)
          }
          this.total = data.numRows
          this.list = orders
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    onPageChange (page) {
      console.log(page)
      this.page = page
      this.loadAsyncData()
    }
  }
}
</script>

<style scoped>
    .price {
        padding: 5px 10px;
    }
</style>
