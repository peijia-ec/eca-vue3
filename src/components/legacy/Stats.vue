<template>
  <div>
    <section class="section">
      <h2 class="title is-4">
        Coins last 30 days
      </h2>
      <b-table
        :data="coinlist"
        :loading="loading"
        :mobile-cards="false"
      >
        <template #default="props">
          <b-table-column label="Coin">
            {{ props.row.coin }}
          </b-table-column>
          <b-table-column
            label="Percentage"
            numeric
          >
            {{ (Math.round(props.row.percentage * 100) / 100).toFixed(2) }}
          </b-table-column>
          <b-table-column
            v-if="hasAccess($roles.Admin)"
            label="Total"
            numeric
          >
            {{ currency(props.row.total) }}
          </b-table-column>
          <b-table-column
            v-if="hasAccess($roles.Admin)"
            label="Profit"
            numeric
          >
            {{ currency(props.row.total * 0.018) }}
          </b-table-column>
        </template>
      </b-table>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Stats',
  data () {
    return {
      coinlist: [],
      loading: false
    }
  },
  mounted () {
    this.loadAsyncData()
  },
  methods: {
    loadAsyncData () {
      this.loading = true
      this.ecApi('admin', 'getCoinStats')
        .then((data) => {
          this.coinlist = data.stats
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>

</style>
