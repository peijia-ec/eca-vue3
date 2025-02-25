<template>
  <div>
    <div v-if="error">
      <div class="notification is-danger">
        {{ error }}
      </div>
    </div>
    <div
      class="columns"
      v-if="!error && limits"
    >
      <div class="column">
        <div class="block">
          <h2 class="subtitle">
            Tier Limits ({{ limits.limit.tier }})
          </h2>
          <table class="table is-bordered">
            <tbody>
              <tr>
                <td>
                  This year:
                </td>
                <td class="has-text-right">
                  {{ currency(limits.limit.limit365) }}
                </td>
              </tr>
              <tr>
                <td>
                  This month:
                </td>
                <td class="has-text-right">
                  {{ currency(limits.limit.limit30) }}
                </td>
              </tr>
              <tr>
                <td>
                  Today:
                </td>
                <td class="has-text-right">
                  {{ currency(limits.limit.limit1) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="block">
          <h2 class="subtitle">
            Recent Spend Data
          </h2>
          <table class="table is-bordered">
            <tbody>
              <tr>
                <td>
                  This year:
                </td>
                <td class="has-text-right">
                  {{ currency(limits.userLimit.totalSpend365) }}
                </td>
              </tr>
              <tr>
                <td>
                  This month:
                </td>
                <td class="has-text-right">
                  {{ currency(limits.userLimit.totalSpend30) }}
                </td>
              </tr>
              <tr>
                <td>
                  Today:
                </td>
                <td class="has-text-right">
                  {{ currency(limits.userLimit.totalSpend1) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="block">
          <h2 class="subtitle">
            Total Completed Orders
          </h2>
          <table class="table is-bordered">
            <tbody>
              <tr>
                <td>
                  Total Buy Orders:
                </td>
                <td class="has-text-right">
                  {{ currency(limits.userLimit.totalBuyAllTime) }}
                </td>
              </tr>
              <tr>
                <td>
                  Total Sell Orders:
                </td>
                <td class="has-text-right">
                  {{ currency(limits.userLimit.totalSellAllTime) }}
                </td>
              </tr>
              <tr>
                <td>
                  Total Spend Orders:
                </td>
                <td class="has-text-right">
                  {{ currency(limits.userLimit.totalSpendAllTime) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="block">
          <h2 class="subtitle">
            Remaining Limits
          </h2>
          <table class="table is-bordered">
            <tbody>
              <tr>
                <td>
                  This year:
                </td>
                <td class="has-text-right">
                  {{ currency(limits.remaining365) }}
                </td>
              </tr>
              <tr>
                <td>
                  This month:
                </td>
                <td class="has-text-right">
                  {{ currency(limits.remaining30) }}
                </td>
              </tr>
              <tr>
                <td>
                  Today:
                </td>
                <td class="has-text-right">
                  {{ currency(limits.remaining1) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="column">
        <div class="box">
          <ul>
            <li>
              <span class="icon-text">
                <span
                  class="icon has-text"
                  :class="{'has-text-success': limits.userLimit.idVerification}"
                >
                  <i class="fa fa-check" />
                </span>
                <span>ID verified</span>
              </span>
            </li>
            <li>
              <span class="icon-text">
                <span
                  class="icon has-text"
                  :class="{'has-text-success': limits.userLimit.addressVerification}"
                >
                  <i class="fa fa-check" />
                </span>
                <span>Address verified</span>
              </span>
            </li>
            <li>
              <span class="icon-text">
                <span
                  class="icon has-text"
                  :class="{'has-text-success': limits.userLimit.sofVerification1}"
                >
                  <i class="fa fa-check" />
                </span>
                <span>SOF/C verified</span>
              </span>
            </li>
            <li>
              <span class="icon-text">
                <span
                  class="icon has-text"
                  :class="{'has-text-success': limits.userLimit.sofVerification2}"
                >
                  <i class="fa fa-check" />
                </span>
                <span>Advanced EDD performed</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Limit',
  props: {
    uid: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      limits: null,
      error: null
    }
  },
  mounted() {
    this.fetchUser()
  },
  methods: {
    async fetchUser() {
      try {
        const res = await this.apiv2('api-admin/index', 'limit/getUserLimit', {
          uid: this.uid
        })
        this.limits = res
      } catch (e) {
        this.error = e
        console.error(e)
      }
    },
  }
}
</script>
