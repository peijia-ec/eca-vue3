<template>
  <!-- <section class="section"> -->
  <h1 class="title">
    Users
  </h1>
  <TestTable />
  <!-- <b-field
      grouped
      group-multiline
    >
      <div class="control">
        <b-switch v-model="suspicious">
          Suspicious
        </b-switch>
      </div>
      <div class="control">
        <b-switch v-model="referral">
          Referrals
        </b-switch>
      </div>
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
      <b-field>
        <b-input
          v-model="search"
          placeholder="Filter..."
          type="search"
          @keyup.enter="loadAsyncData"
        />
        <p class="control">
          <button
            class="button is-primary"
            @click="loadAsyncData"
          >
            Update
          </button>
        </p>
      </b-field>
    </b-field>
    <b-table
    :data="users"
    :loading="loading"ƒ

      paginated
      backend-pagination
      :total="total"
      :per-page="perPage"
      backend-sorting

      :default-sort-direction="defaultSortOrder"
      :default-sort="[sortField, sortOrder]"
      @page-change="onPageChange"
      @sort="onSort"
    >
      <template #default="props">
        <b-table-column
          field="created"
          label="Created"
          sortable
        >
          <span class="nobreak">{{ $moment(props.row.created).format('YYYY-MM-DD') }}</span>
        </b-table-column>

        <b-table-column
          field="lastLogin"
          label="Last login"
          sortable
        >
          <span class="nobreak">{{ $moment(props.row.lastLogin).format('DD/MM HH:mm') }}</span>
        </b-table-column>

        <b-table-column
          field="email"
          label="Email"
        >
          <email-link :user="props.row" />
        </b-table-column>

        <b-table-column>
          <a
            v-if="props.row.dripId"
            target="_blank"
            :href="'https://www.getdrip.com/'+$local.drip+'/subscribers/' + props.row.dripId"
          ><span class="icon"><i class="fa fa-tint" /></span></a>
          <a
            v-if="props.row.freshdeskId"
            target="_blank"
            :href="'https://easycrypto.freshdesk.com/a/contacts/' + props.row.freshdeskId"
          ><span class="icon"><i class="fa fa-ticket" /></span></a>
        </b-table-column>

        <b-table-column
          field="displayName"
          label="Name"
        >
          {{ props.row.displayName }}
        </b-table-column>

        <b-table-column
          field="verified"
          label="Verified"
        >
          <template v-if="props.row.verificationMethod">
            <b-tag :type="props.row.verificationTag">
              {{ props.row.verificationMethod }}
            </b-tag>
          </template>
        </b-table-column>

        <b-table-column
          field="bankName"
          label="Bank name"
        >
          {{ props.row.bankName }}
        </b-table-column>

        <b-table-column
          field="status"
          label="SUS"
        >
          <template v-if="props.row.status">
            <template v-if="props.row.suspicious = 1 && props.row.reason">
              <b-tooltip
                :label="props.row.reason"
                multilined
              >
                <b-tag :type="props.row.statusTag">
                  {{ props.row.status }}
                </b-tag>
              </b-tooltip>
            </template>
            <template v-else>
              <b-tag :type="props.row.statusTag">
                {{ props.row.status }}
              </b-tag>
            </template>
          </template>
          <template v-else>
            <b-tooltip
              :label="props.row.susText"
              multilined
            >
              {{ props.row.sus }}
            </b-tooltip>
            <span
              v-if="props.row.sus <= -60"
              class="icon has-text-danger"
            ><i class="fa fa-exclamation-triangle" /></span>
          </template>
        </b-table-column>

        <b-table-column
          field="tier"
          label="Tier"
        >
          <template v-if="props.row.tier">
            <b-tag type="is-success">
              {{ props.row.tier }}
            </b-tag>
          </template>
        </b-table-column>

        <b-table-column
          field="totalOrders"
          label="Orders"
          sortable
        >
          {{ (props.row.totalOrders) ? props.row.totalOrders : '' }}
        </b-table-column>

        <b-table-column
          field="totalValue"
          label="Value"
          sortable
        >
          {{ (props.row.totalValue) ? currency(props.row.totalValue) : '' }}
        </b-table-column>
      </template>
    </b-table>
    <b-button
      type="is-primary"
      rounded
      class="sticky-update-btn"
      @click="loadAsyncData"
      icon-left="refresh"
      :class="{'is-loading': loading}"
    >
      Refresh
    </b-button> -->
  <!-- </section> -->
</template>

<script>
import EmailLink from './parts/user/EmailLink.vue'
import TestTable from './TestTable.vue'

export default {
  name: 'Users',
  components: { EmailLink, TestTable },
  data () {
    return {
      screenWidth: window.innerWidth,
      completedReady: false,
      data: [],
      orders: [],
      users: [],
      coins: {},
      total: 0,
      loading: false,
      page: 1,
      perPage: 15,
      search: null,
      suspicious: false,
      referral: false,
      method: 'all',
      orderId: null,
      sortField: 'lastLogin',
      sortOrder: 'desc',
      defaultSortOrder: 'desc'
    }
  },
  watch: {
    suspicious () {
      this.loadAsyncData()
    },
    referral () {
      this.loadAsyncData()
    },
    perPage () {
      this.loadAsyncData()
    },
    method () {
      this.loadAsyncData()
    }
  },
  mounted () {
    // this.loadAsyncData()
    window.addEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize (event) {
      this.screenWidth = window.innerWidth
    },
    loadAsyncData () {
      this.loading = true
      this.ecApi('admin', 'getAllUsers', {
        // aid: this.$auth.user.sub,
        page: this.page,
        perPage: this.perPage,
        search: this.search,
        suspicious: this.suspicious,
        referral: this.referral,
        method: this.method,
        sort: `${this.sortOrder === 'asc' ? '+' : '-'}${this.sortField}`
      })
        .then(async data => {
          let usersVms = []
          if (this.$local.vms.enable) {
            usersVms = (await this.verifyApi(`applications/${this.$local.countryCode}?externalIds=${data.users.map(u => u.uid).join(',')}`, 'GET')).data.data
          }

          const users = []
          for (let i = 0; i < data.users.length; i++) {
            const dataVms = usersVms.find(u => u.externalId === data.users[i].uid) || {}
            const row = { ...data.users[i], ...dataVms }
            // Get order status
            let status, tag
            if (row.fraud) {
              status = 'Fraud'
              tag = 'is-danger'
            } else if (row.suspicious) {
              status = 'Suspicious'
              tag = 'is-danger'
            }
            let verificationTag
            if (row.verificationMethod) {
              if (row.tier >= 1) {
                verificationTag = 'is-success'
              } else {
                verificationTag = 'is-danger'
              }
            }
            row.status = status
            row.statusTag = tag
            row.verificationTag = verificationTag
            users.push(row)
          }
          this.users = users
          this.total = data.numRows
          this.loading = false
        })
        .catch(err => console.log(err))
    },
    /*
     * Handle page-change event
     */
    onPageChange (page) {
      this.page = page
      this.loadAsyncData()
    },
    /*
     * Handle sort event
     */
    onSort (field, order) {
      this.sortField = field
      this.sortOrder = order
      this.loadAsyncData()
    }
  }
}
</script>

<style scoped>
.tag {
  font-size: 80%;
}

.tooltip:after {
  white-space: pre;
}

sup {
  padding-left: 2px;
  font-size: 9px;
  color: #aaa;
}
</style>
