<template>
  <section class="section">
    <b-table
      :data="table"
      :paginated="true"
      :per-page="20"
    >
      <template #default="props">
        <b-table-column label="Date">
          {{ props.row.time }}
        </b-table-column>

        <b-table-column label="Order">
          <router-link
            v-if="props.row.orderId"
            :to="{name: 'order', query: {orderId: props.row.orderId}}"
          >
            {{ props.row.orderId }}
          </router-link>
        </b-table-column>

        <b-table-column label="Error">
          {{ props.row.error }}
        </b-table-column>
      </template>
    </b-table>
  </section>
</template>

<script>
export default {
  name: 'Errors',
  data () {
    return {
      table: []
    }
  },
  mounted () {
    this.loadQueue()
  },
  methods: {
    loadQueue () {
      this.row = null
      this.ecApi('admin', 'getErrors')
        .then((data) => {
          this.table = data.errors
        })
    }
  }
}
</script>
