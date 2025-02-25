<template>
  <div style="position: relative">
    <b-loading
      :is-full-page="false"
      :active="loading"
    />
    <h3
      class="title is-5 is-6-mobile"
      style="margin-top:1em;"
    >
      Login data
    </h3>
    <article
      v-if="uid"
      :class="{'message is-danger': dangerToDisplay}"
      style="margin-bottom:1.5em"
    >
      <div
        v-if="dangerToDisplay"
        class="message-header"
      >
        <p>Suspicious connections</p>
      </div>
      <b-table
        :data="filtered"
        :class="{'fit-table': !$root.mobile}"
        :per-page="10"
        :paginated="filtered.length > 10"
      >
        <template #default="props">
          <b-table-column label="Date">
            <span :class="{'no-break': !$root.mobile}">
              {{ $moment(props.row.date).format('D MMM \'YY, HH:mm') }}
              <span
                v-if="props.row.info"
                class="icon cursor has-text-grey-light"
                @click="showIpInfo(props.row.info)"
              ><i class="fa fa-question" /></span>
            </span>
          </b-table-column>
          <b-table-column label="IP">
            <clipboard :copy-value="props.row.ip">
              <truncate
                :length="20"
                :text="props.row.ip"
              />
            </clipboard>
          </b-table-column>
          <b-table-column label="Country">
            {{ lookup(props.row.countryCode) }}
            <span
              v-if="props.row.countryCode && props.row.countryCode !== $local.countryCode"
              class="icon has-text-danger"
            ><i class="fa fa-exclamation-triangle" /></span>
          </b-table-column>
          <b-table-column label="City">
            {{ props.row.city }}
          </b-table-column>
          <b-table-column label="Fraud">
            {{ props.row.fraudChance }}
            <span
              v-if="props.row.fraudChance >= fraudThreshold"
              class="icon has-text-danger"
            ><i class="fa fa-exclamation-triangle" /></span>
          </b-table-column>
          <b-table-column label="VPN">
            <span
              v-if="props.row.vpn"
              class="icon has-text-danger"
            ><i class="fa fa-exclamation-triangle" /></span>
          </b-table-column>
          <b-table-column label="Abuse">
            <span
              v-if="props.row.recentAbuse"
              class="icon has-text-danger"
            ><i class="fa fa-exclamation-triangle" /></span>
          </b-table-column>
          <b-table-column label="IPQ ID">
            <template v-if="props.row.ipqRequestId && $local.countryCode === 'NZ'">
              <a
                target="_blank"
                :href="`https://www.ipqualityscore.com/user/tracker/lookup/request?request_id=${props.row.ipqRequestId}`"
              >
                {{ props.row.ipqRequestId }}
                <span class="icon"><i class="fa fa-external-link-square" /></span>
              </a>
            </template>
            <template v-else>
              {{ props.row.ipqRequestId }}
            </template>
          </b-table-column>
        </template>
      </b-table>
      <b-modal :active.sync="ipInfoModal">
        <!-- Old data from IP-API.com -->
        <div class="box content">
          <h2>IP address info</h2>
          <tree-view
            :data="ipInfo"
            :options="{maxDepth: 1}"
          />
        </div>
      </b-modal>
    </article>
  </div>
</template>

<script>
import Truncate from '../../Truncate.vue'
import Clipboard from '../Clipboard.vue'
import lookup from 'country-code-lookup'

export default {
  name: 'IpTable',
  components: {Truncate, Clipboard},
  props: ['uid', 'dangerOnly'],
  data () {
    return {
      data: [],
      fraudThreshold: 70,
      ipInfo: null,
      ipInfoModal: false,
      loading: false
    }
  },
  computed: {
    dangerToDisplay () {
      return this.dangerOnly && this.filtered.length
    },
    filtered () {
      if (!this.data || !Array.isArray(this.data)) {
        return []
      }
      let data = []
      for (let row of this.data) {
        if (!this.dangerOnly) {
          data.push(row)
        } else if (
          // Danger rows
          (row.countryCode && row.countryCode !== this.$local.countryCode) ||
          row.vpn || row.recentAbuse ||
          row.fraudChance >= this.fraudThreshold
        ) {
          data.push(row)
        }
      }
      return data
    }
  },
  watch: {
    uid: {
      handler: 'getData',
      immediate: true
    }
  },
  methods: {
    async getData () {
      this.loading = true
      try {
        this.data = await this.ecApi('admin', 'getUserIPs', {uid: this.uid})
      } catch (e) {
        console.log(e)
        this.data = []
      }
      this.loading = false
    },
    showIpInfo (info) {
      this.ipInfo = JSON.parse(info)
      this.ipInfoModal = true
    },
    lookup (countryCode) {
      let country
      try {
        country = lookup.byIso(countryCode).country
      } catch (e) {
        // nothing
      }
      return country || countryCode
    }
  }
}
</script>
