<template>
  <div>
    <section
      v-if="complianceReview"
      class="section"
    >
      <h2 class="title">
        Accounts requiring review
      </h2>
      <b-table
        :data="complianceReview.filter(x => x.complianceReview !== 0)"
        :loading="loading"
      >
        <template #default="props">
          <b-table-column label="Email">
            <email-link
              :user="props.row"
              :truncate="false"
            />
          </b-table-column>
          <b-table-column label="Name">
            {{ props.row.displayName }}
          </b-table-column>
          <b-table-column label="A">
            <button
              class="button is-small"
              @click="markComplete(props.row)"
            >
              Mark complete
            </button>
          </b-table-column>
        </template>
      </b-table>
    </section>
    <section class="section">
      <h2 class="title">
        Compliance orders
      </h2>
      <b-field
        grouped
        group-multiline
      >
        <b-select v-model="month">
          <option
            v-for="row in dates"
            :key="row.start"
            :value="row"
          >
            {{ row.name }}
          </option>
        </b-select>
      </b-field>
      <b-table
        :data="list"
        :loading="loading"
      >
        <template #default="props">
          <b-table-column label="Email">
            <email-link
              :user="props.row"
              :truncate="false"
            />
          </b-table-column>
          <b-table-column label="Name">
            {{ props.row.displayName }}
          </b-table-column>
          <b-table-column label="Orders">
            {{ props.row.numOrders }}
          </b-table-column>
        </template>
      </b-table>
      <br>
    </section>
  </div>
</template>

<script>
import EmailLink from './parts/user/EmailLink.vue'

export default {
  name: 'Compliance',
  components: {EmailLink},
  data () {
    return {
      month: null,
      loading: false,
      showCompliance: true,
      list: [],
      complianceReview: []
    }
  },
  computed: {
    dates () {
      let dates = []
      let start = this.$moment()
      let end = this.$moment().add(1, 'month')
      for (let i = 0; i < 12; i++) {
        dates.push({
          name: start.format('MMMM YYYY'),
          start: start.format('YYYY-MM-01'),
          end: end.format('YYYY-MM-01')
        })
        start.subtract(1, 'month')
        end.subtract(1, 'month')
      }
      return dates
    }
  },
  watch: {
    month () {
      this.loadData()
    }
  },
  mounted () {
    this.month = this.dates[0]
  },
  methods: {
    async markComplete (row) {
      row.complianceReview = 0
      try {
        await this.apiv2('admin', 'removeComplianceReview', {
          uid: row.uid
        })
      } catch (e) {
        console.log(e)
        row.complianceReview = 1
      }
    },
    async loadData () {
      this.loading = true
      try {
        let data = await this.ecApi('admin', 'getComplianceOrders', {
          month: this.month
        })
        if (data && data.hasOwnProperty('users')) {
          this.list = data.users
        }
      } catch (e) {
        console.log(e)
      }
      try {
        let data = await this.ecApi('admin', 'getComplianceReview')
        if (data && data.hasOwnProperty('users')) {
          this.complianceReview = data.users
        }
      } catch (e) {
        console.log(e)
      }
      this.loading = false
    }
  }
}
</script>
