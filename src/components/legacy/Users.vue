<template>
  <h1 class="title">
    Users
  </h1>
  <UsersTable />
</template>

<script>
import EmailLink from './parts/user/EmailLink.vue'

export default {
  name: 'Users',
  components: { EmailLink },
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
