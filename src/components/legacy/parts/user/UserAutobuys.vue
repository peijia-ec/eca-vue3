<template>
  <section>
    <b-collapse
      class="card ab-card"
      animation="slide"
      v-for="(row, i) in Object.keys(userAutobuys)"
      :key="i"
      :open="row !== 'deleted'"
    >
      <template #trigger="card">
        <div
          class="card-header ab-header"
          role="button"
        >
          <h2 class="card-header-title">
            {{ userAutobuys[row].title }}
          </h2>
          <a class="card-header-icon">
            <b-icon
              :icon="card.open ? 'chevron-up' : 'chevron-down'"
            />
          </a>
        </div>
      </template>
      <div
        v-for="id in Object.keys(userAutobuys[row].orders)"
        :key="'EC'+id"
      >
        <h2 class="ab-title">
          <clipboard :icon="false">
            {{ apName(id) }}
          </clipboard>
        </h2>
        <b-table :data="userAutobuys[row].orders[id]">
          <template #default="props">
            <b-table-column
              field="symbol"
              label="Symbol"
            >
              {{ props.row.symbol }}
            </b-table-column>
            <b-table-column
              field="percentage"
              label="%"
            >
              {{ props.row.percentage }}
            </b-table-column>
            <b-table-column
              field="address"
              label="Address"
            >
              <BlockChainLink
                :symbol="props.row.symbol"
                :address="props.row.address"
              />
            </b-table-column>
            <b-table-column
              field="created"
              label="Date Created"
            >
              {{ props.row.updated_at }}
            </b-table-column>
            <b-table-column
              field="updated"
              label="Date Updated"
            >
              {{ props.row.updated }}
            </b-table-column>
          </template>
        </b-table>
      </div>
      <br>
    </b-collapse>
  </section>
</template>

<script>
import BlockChainLink from '../BlockchainLink.vue'
import Clipboard from '../Clipboard.vue'

export default {
  name: 'UserAutobuys',
  components: { BlockChainLink, Clipboard },
  props: {
    autobuys: {
      type: Object
    }
  },
  data () {
    return {
      userAutobuys: {
        active: {
          title: 'Active Auto-Buys',
          orders: {}
        },
        deleted: {
          title: 'Deleted Auto-Buys',
          orders: {}
        }
      }
    }
  },
  created () {
    //split autobuy orders into active and deleted
    for(let row in this.autobuys){
      if(this.autobuys[row][0].enabled){
        this.userAutobuys.active.orders[row] = this.autobuys[row]
      } else {
        this.userAutobuys.deleted.orders[row] = this.autobuys[row]
      }
    }
  }
}
</script>

<style scoped>
.ab-card {
  margin-bottom: 40px;
}
.ab-title {
  font-size: 1.5rem;
  padding: 10px;
}
.ab-header {
  background-color: rgb(243, 243, 243);
}
</style>
