<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-4">
        OTC Order
      </h1>
      <find-user @selected="selectUser" />
      <template v-if="user">
        <div class="columns is-7 is-variable">
          <div class="column">
            <div class="content">
              <h2>
                <span class="icon"><i class="fa fa-address-card-o" /></span>&nbsp;&nbsp;User details
              </h2>
              <h3>{{ user.displayName }}</h3>
              <p>
                <router-link :to="{name: 'user', query: {uid: user.uid}}">
                  {{ user.email }}
                </router-link>
              </p>
              <table
                class="table"
                style="width: fit-content"
              >
                <tr>
                  <td><b>Total buy:</b></td>
                  <td>{{ user.totalBuy }}</td>
                </tr>
                <tr>
                  <td><b>Total sell:</b></td>
                  <td>{{ user.totalSell }}</td>
                </tr>
              </table>
            </div>
            <compliance-log :uid="user.uid" />
          </div>
          <div class="column is-7">
            <b-tabs
              expanded
              type="is-toggle"
            >
              <b-tab-item label="Buy">
                <OTCBuy
                  :user="user"
                  :udata="udata"
                />
              </b-tab-item>
              <b-tab-item label="Sell">
                <OTCSell :user="user" />
              </b-tab-item>
            </b-tabs>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script>
import FindUser from './parts/user/FindUser.vue'
import ComplianceLog from './parts/ComplianceLog.vue'
import OTCSell from './OTCSell.vue'
import OTCBuy from './OTCBuy.vue'

export default {
  name: 'OTC',
  components: {OTCBuy, FindUser, ComplianceLog, OTCSell},
  data () {
    return {
      user: null,
      udata: null
    }
  },
  methods: {
    async selectUser (user) {
      this.user = user
      try {
        // Fetch the extended user data
        this.udata = await this.ecApi('admin', 'getUser', {
          uid: user.uid
        })
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
