<template>
  <div>
    <b-table
      :data="list"
      :paginated="true"
      per-page="15"
    >
      <template #default="props">
        <b-table-column
          field="created"
          label="Date"
        >
          <span class="no-break">{{ $moment(props.row.date).format('MM-DD') }}</span>
        </b-table-column>
        <b-table-column
          field="orderId"
          label="Order"
        >
          <router-link :to="{name: 'order', query: {orderId: props.row.orderId}}">
            {{ props.row.orderId }}
          </router-link>
        </b-table-column>
        <b-table-column label="Earned">
          {{ price(props.row.value) }}
        </b-table-column>
        <b-table-column label="Who earned">
          <router-link :to="{name: 'user', query: {uid: props.row.uid}}">
            <Truncate
              :length="16"
              :text="props.row.uid"
              :active="$root.mobile"
            />
          </router-link>
        </b-table-column>
        <b-table-column label="Who bought">
          <router-link :to="{name: 'user', query: {uid: props.row.customer}}">
            <Truncate
              :length="16"
              :text="props.row.customer"
              :active="$root.mobile"
            />
          </router-link>
        </b-table-column>
      </template>
    </b-table>
  </div>
</template>

<script>
import Truncate from './Truncate.vue'
import CryptoJS from 'crypto-js'

export default {
  name: 'Affiliates',
  components: {Truncate},
  data () {
    return {
      list: [],
      loading: false
    }
  },
  mounted () {
    this.loadData()
  },
  methods: {
    loadData () {
      this.loading = true
      let nonce = new Date().getTime()
      let hash = CryptoJS.SHA256(nonce + this.$root.token).toString()
      this.sendApi(this.$local.adb, {
        action: 'getAll',
        nonce: nonce,
        hash: hash
      })
        .then((res) => {
          /* let uids =
          for (let row of res.data) {

          } */
          this.list = res.data
          this.loading = false
        })
        .catch((e) => {
          console.log(e)
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>

</style>
