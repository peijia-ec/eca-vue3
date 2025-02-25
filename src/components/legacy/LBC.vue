<template>
  <div>
    <h1 class="title">
      LBC
    </h1>
    <button
      class="button"
      @click="loadOrders"
    >
      Refresh
    </button>
    <b-table
      :data="filteredList"
      :selected.sync="selected"
      :paginated="true"
      :per-page="8"
    >
      <template
        v-if="props.row.coins.length"
        #default="props"
      >
        <b-table-column
          field="created"
          label="Date"
        >
          <span class="no-break">{{ $moment(props.row.created).format('MM-DD') }}</span>
        </b-table-column>

        <b-table-column
          field="lbcId"
          label="Order ID"
        >
          {{ props.row.orderId }}
        </b-table-column>

        <b-table-column
          field="lbcId"
          label="Order #"
        >
          {{ props.row.lbcId }}
        </b-table-column>

        <b-table-column
          field="lbcUsername"
          label="Username"
        >
          {{ props.row.lbcUsername }}
        </b-table-column>

        <b-table-column
          field="tier"
          label="Tier"
        >
          {{ props.row.userTier }}
        </b-table-column>

        <b-table-column
          field="email"
          label="Email"
        >
          <router-link
            v-if="props.row.userEmail"
            :to="{name: 'user', query: {uid: props.row.uid}}"
          >
            <Truncate
              :text="props.row.userEmail"
              :length="($root.mobile) ? 12 : 18"
              :tooltip="!$root.mobile"
            />
          </router-link>
        </b-table-column>

        <b-table-column
          field="btc"
          label="BTC"
        >
          {{ props.row.coins[0].quoted }}
        </b-table-column>

        <b-table-column
          field="btc"
          label="NZD"
        >
          {{ props.row.coins[0].nzd }}
        </b-table-column>

        <b-table-column
          field="status"
          :label="($root.mobile) ? 'S' : 'Status'"
        >
          <template v-if="props.row.status">
            <template v-if="!$root.mobile">
              <b-tooltip
                position="is-left"
                :label="props.row.statusInfo"
                type="is-dark"
              >
                <b-tag :type="props.row.statusTag">
                  {{ props.row.status }}
                </b-tag>
              </b-tooltip>
            </template>
            <template v-else>
              <b-tag :type="props.row.statusTag">
&nbsp;
              </b-tag>
            </template>
          </template>
        </b-table-column>
      </template>
    </b-table>
    <section
      v-if="selected"
      style="margin-bottom: 50px;"
    >
      <div class="content">
        <h3>Order {{ selected.orderId }}</h3>
        <div class="field">
          <button
            class="button is-success"
            @click="markComplete"
          >
            Mark as complete
          </button>
        </div>
      </div>
    </section>
    <div
      v-if="!orderCreated"
      class="columns"
    >
      <div class="column">
        <b-field label="LBC username">
          <b-input v-model="order.lbcUsername" />
        </b-field>
        <b-field label="LBC order number">
          <b-input v-model="order.lbcId" />
        </b-field>
        <b-field label="NZD">
          <b-input
            v-model="order.coins[0].nzd"
            type="number"
            step="0.01"
          />
        </b-field>
        <b-field label="BTC">
          <b-input
            v-model="order.coins[0].quoted"
            type="number"
            step="0.00000001"
          />
        </b-field>
        <div class="buttons">
          <button
            class="button"
            @click="newOrder"
          >
            Clear
          </button>
          <button
            class="button is-success"
            @click="createOrder"
          >
            Create order
          </button>
        </div>
      </div>
      <div class="column" />
    </div>
    <div v-if="orderCreated">
      <article class="message is-success">
        <div class="message-body">
          <div class="content">
            <h2>Order {{ order.orderId }} created</h2>
            <p>
              Send them the verification image and make sure they put
              their LBC order number into the verification form!
            </p>
            <p><b>LBC order number {{ order.lbcId }}</b></p>
          </div>
        </div>
      </article>
      <div class="field">
        <button
          class="button"
          @click="orderCreated = false"
        >
          Make another!
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Truncate from './Truncate.vue'

export default {
  name: 'LBC',
  components: {Truncate},
  data () {
    return {
      orders: [],
      filter: '',
      order: {},
      selected: null,
      orderCreated: false
    }
  },
  computed: {
    filteredList: function () {
      return this.orders.filter((item) => {
        let fields = ['email', 'lbcId', 'lbcUsername', 'orderId']
        if (!this.filter) {
          return true
        }
        let filter = this.filter.toLowerCase()
        for (let field of fields) {
          if (item[field] && item[field].toString().toLowerCase().indexOf(filter) !== -1) {
            return true
          }
        }
      })
    }
  },
  created () {
    this.newOrder()
  },
  mounted () {
    this.loadOrders()
  },
  methods: {
    markComplete () {
      this.$buefy.dialog.confirm({
        message: 'Are you sure you want to mark order ' + this.selected.orderId + ' as completed?',
        onConfirm: () => {
          this.ecApi('admin', 'setValue', {
            orderId: this.selected.orderId,
            table: 'order',
            field: 'completed'
          })
            .then(() => {
              this.$buefy.toast.open('Marked as completed')
              this.loadOrders()
            })
        }
      })
    },
    newOrder () {
      this.order = {
        orderId: null,
        lbcUsername: '',
        lbcId: '',
        coins: [{
          coin: 'BTC',
          quoted: '',
          nzd: ''
        }]
      }
    },
    loadOrders () {
      this.ecApi('admin', 'getLbcOrders')
        .then((data) => {
          let orders = []
          for (let row of data.orders) {
            // Get order status
            let status, tag, info
            // let userInfo = row.uid + '\n' + row.displayName + '\n' + row.email + '\n' + 'Tier ' + row.tier
            let format = 'dddd Do MMMM, h:mm:ss a'
            if (row.completed) {
              status = 'Complete'
              tag = 'is-success'
              info = this.$moment(row.completed).format(format)
            } else if (row.hold) {
              status = 'Held'
              tag = 'is-dark'
              info = this.$moment(row.hold).format(format)
            } else if (row.cancelled) {
              status = 'Canc'
              tag = 'is-dark'
              info = this.$moment(row.cancelled).format(format)
            } else if (row.paid && !row.tier) {
              status = 'Hold'
              tag = 'is-warning'
              info = this.$moment(row.paid).format(format)
            } else if (row.paid) {
              status = 'Paid'
              tag = 'is-light'
              info = this.$moment(row.paid).format(format)
            }
            row.status = status
            row.statusInfo = info
            row.statusTag = tag

            if (row.email === 'lbc@easycrypto.nz') {
              row.email = ''
            }

            orders.push(row)
          }
          this.orders = orders
        })
    },
    createOrder () {
      if (this.processing) {
        return
      }
      this.processing = true
      let o = this.order
      if (
        !o.lbcUsername ||
        !o.lbcId ||
        !o.coins.length ||
        !o.coins[0].quoted ||
        !o.coins[0].nzd
      ) {
        return
      }
      let items = [{
        symbol: 'BTC',
        name: 'Bitcoin',
        amount: parseFloat(o.coins[0].nzd),
        quoted: parseFloat(o.coins[0].quoted),
        final: null,
        address: 'lbcOrder',
        memo: null
      }]
      this.ecApi('order-admin', 'createOrder', {
        uid: 'lbcUser',
        lbcId: this.order.lbcId,
        lbcUsername: this.order.lbcUsername,
        email: 'lbc@easycrypto.nz',
        total: parseFloat(this.order.coins[0].nzd),
        toPay: parseFloat(this.order.coins[0].nzd),
        coins: items,
        ownAddress: true,
        method: 'lbc',
        gaClientId: null
      })
        .then((data) => {
          this.order.orderId = data.orderId
          this.orderCreated = true
          this.loadOrders()
          this.$buefy.toast.open('Order created!')
          this.processing = false
        })
        .catch((r) => {
          console.log(r)
          switch (r) {
          case 'Error 7':
            this.$buefy.toast.open(r + ': Order number already exists!')
            break
          default:
            this.$buefy.toast.open(r)
          }
          this.processing = false
        })
    }
  }
}
</script>

<style scoped>

</style>
