<template>
  <div>
    <section class="section">
      <h1 class="title">
        Suspect Orders
      </h1>
      <div class="content">
        <p>Orders marked as "Hold" on this screen are ones that are held indefinitely. They are NOT standard T0 holds.</p>
      </div>
      <b-field
        grouped
        group-multiline
      >
        <b-select v-model="perPage">
          <option value="15">
            15 per page
          </option>
          <option value="30">
            30 per page
          </option>
          <option value="50">
            50 per page
          </option>
          <option value="100">
            100 per page
          </option>
        </b-select>
      </b-field>
      <b-table
        :data="list"
        :loading="loading"

        paginated
        checkable
        :checked-rows.sync="selected"
        backend-pagination
        :total="total"
        :per-page="perPage"
        @page-change="onPageChange"
      >
        <template #default="props">
          <b-table-column label="Date">
            <template v-if="props.row.suspicious && props.row.reason && !props.row.fraud">
              <b-tooltip :label="props.row.reason">
                <span style="background: #fdd;">{{ $moment(props.row.created).format('DD/MM HH:mm') }}</span>
              </b-tooltip>
            </template>
            <template v-else>
              {{ $moment(props.row.created).format('DD/MM HH:mm') }}
            </template>
          </b-table-column>
          <b-table-column label="ID">
            <router-link :to="{name: 'order', query: {orderId: props.row.orderId}}">
              {{ props.row.orderId }}
            </router-link>
          </b-table-column>
          <b-table-column label="Email">
            <template v-if="props.row.fraud">
              <FraudUser :data="props.row" />
            </template>
            <template v-else>
              <router-link :to="{name: 'user', query: {uid: props.row.uid}}">
                {{ props.row.email }}
              </router-link>
            </template>
          </b-table-column>
          <b-table-column label="Total">
            {{ currency(props.row.total) }}
          </b-table-column>
          <b-table-column label="Coins">
            {{ props.row.items.map(e => e.coin).join(', ') }}
          </b-table-column>
          <b-table-column label="Filled">
            {{ props.row.items.map(e => e.filled).join(', ') }}
          </b-table-column>
          <b-table-column label="B First">
            <Truncate :text="props.row.bankFirst" />
          </b-table-column>
          <b-table-column label="B Last">
            <Truncate :text="props.row.bankLast" />
          </b-table-column>
          <b-table-column
            field="status"
            label="Status"
          >
            <b-tag :type="props.row.statusTag">
              {{ props.row.status }}
            </b-tag>
          </b-table-column>
        </template>
      </b-table>
    </section>
    <section class="section">
      <div class="content">
        <h1>Selected data:</h1>
        <template v-if="selected.length">
          <p class="field">
            <button
              class="button is-danger"
              @click="cancelOrders"
            >
              Cancel orders
            </button>
          </p>
          <p class="field">
            <button
              class="button is-danger"
              @click="markFraud"
            >
              Mark as fraud
            </button>
          </p>
          <h2>Totals</h2>
          <p>NZD: {{ currency(selectedNzd) }}</p>
          <p
            v-for="(amount, coin) in filledAmounts"
            :key="coin"
          >
            {{ coin }}: {{ amount }}
          </p>
          <b-field label="Recovered total NZD">
            <b-input
              v-model="recoveredNzd"
              style="width:150px"
            />
          </b-field>
          <b-table
            :data="selected"
            style="width:fit-content"
          >
            <template #default="props">
              <b-table-column label="Name">
                {{ props.row.bankFirst }} {{ props.row.bankLast }}
              </b-table-column>
              <b-table-column label="Account">
                {{ formatBank(props.row.bsb, props.row.account, props.row.suffix, props.row.bankAccount) }}
              </b-table-column>
              <b-table-column label="Original">
                {{ currency(props.row.total) }}
              </b-table-column>
              <b-table-column label="Recovered">
                {{ price((parseFloat(recoveredNzd) / selectedNzd * parseFloat(props.row.total)) - surcharge) }}
              </b-table-column>
            </template>
          </b-table>
        </template>
      </div>
    </section>
  </div>
</template>

<script>
import Truncate from './Truncate.vue'
import FraudUser from './parts/FraudUser.vue'

export default {
  name: 'Suspectorders',
  components: {Truncate, FraudUser},
  data () {
    return {
      surcharge: 20,
      loading: false,
      page: 1,
      perPage: 15,
      list: [],
      total: 0,
      selected: [],
      recoveredNzd: null
    }
  },
  computed: {
    selectedNzd () {
      return this.selected.map(o => o.total).reduce((sum, acc) => {
        return sum + acc
      })
    },
    filledAmounts () {
      let coins = {}
      if (!this.selected.length) {
        return coins
      }
      for (let i = 0; i < this.selected.length; i++) {
        for (let j = 0; j < this.selected[i].items.length; j++) {
          let item = this.selected[i].items[j]
          if (!item.filled) {
            continue
          }
          if (!coins.hasOwnProperty(item.coin)) {
            coins[item.coin] = 0
          }
          coins[item.coin] += parseFloat(item.filled)
        }
      }
      return coins
    }
  },
  watch: {
    perPage () {
      this.loadAsyncData()
    }
  },
  mounted () {
    this.loadAsyncData()
  },
  methods: {
    loadAsyncData () {
      this.loading = true
      this.ecApi('admin', 'getSuspectOrders', {
        page: this.page,
        perPage: parseInt(this.perPage, 10)
      })
        .then((data) => {
          let orders = []
          for (let i = 0; i < data.orders.length; i++) {
            let row = data.orders[i]
            let status
            let tag
            let date
            if (row.cancelled) {
              status = 'Canc'
              tag = 'is-white'
              date = row.cancelled
            } else if (row.completed) {
              status = 'Done'
              tag = 'is-success'
              date = row.completed
            } else if (row.hold) {
              status = 'Hold'
              tag = 'is-warning'
              date = row.paid
            } else if (row.paid) {
              status = 'Paid'
              tag = 'is-light'
              date = row.paid
            }
            row.status = status
            row.statusDate = this.$moment(date).format('dddd Do MMMM, h:mm:ss a')
            row.statusTag = tag

            orders.push(row)
          }
          this.total = data.numRows
          this.list = orders
          this.loading = false
        })
        .catch((e) => {
          console.error(e)
          this.loading = false
        })
    },
    onPageChange (page) {
      this.page = page
      this.loadAsyncData()
    },
    cancelOrders () {
      if (!this.selected.length) {
        return
      }
      let orderIds = this.selected.map(e => e.orderId)
      this.$buefy.dialog.confirm({
        message: 'Are you sure you want to cancel these orders?',
        onConfirm: () => {
          this.ecApi('admin', 'invalidateOrders', {
            orders: orderIds
          })
            .then(() => {
              this.$buefy.toast.open('Done!')
              this.loadAsyncData()
            })
        }
      })
    },
    markFraud () {
      if (!this.selected.length) {
        return
      }
      let uids = this.selected.map(e => e.uid)
      this.$buefy.dialog.prompt({
        message: 'Are you SURE you want to mark the selected users as fraudulent accounts? Please give the reason:',
        inputAttrs: {
          value: 'Known fraud account'
        },
        onConfirm: (value) => {
          this.ecApi('admin', 'setFraudUsers', {
            uids: uids,
            what: 'Fraud account',
            who: this.$store.state.goauth.name,
            why: value
          })
            .then(() => {
              this.$buefy.toast.open('Marked as fraud accounts')
              this.loadAsyncData()
              this.selected = []
            })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
