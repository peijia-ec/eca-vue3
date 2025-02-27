<template>
  <section
    v-if="data"
    :key="data.user.uid"
    class="">
    <b-tabs
      :size="$root.mobile ? 'is-small' : null"
      v-model="activeTab">
      <b-tab-item
        label="Details"
        icon="user">
        <div class="columns is-desktop">
          <div class="column is-half-desktop">
            <h2 class="title is-5">
              User Summary
              <b-button
                v-if="under18User(data.user.birthday)"
                type="is-warning is-rounded is-small">
                &lt; 18 years old
              </b-button>
              <b-button
                v-if="over70User(data.user.birthday)"
                type="is-warning is-rounded is-small">
                &gt;= 70 years old
              </b-button>
            </h2>
            <b-tooltip
              label="High value customer (HVC) status"
              type="is-dark">
              <b-tag
                v-if="data.user.notes"
                type="is-warning"
                size="is-large">
                {{ data.user.notes }}
              </b-tag>
            </b-tooltip>
            <p style="margin-top:8px">
              Lifetime value: {{ currency(data.user.totalBuy + data.user.totalSell) }}
              {{ matesTier(data.user.totalBuy + data.user.totalSell) }}
              <b-tooltip
                v-if="$local.countryCode === 'NZ'"
                :label="matesHint"
                multilined
                size="is-large"
                position="is-bottom"
                style="margin-left: 5px">
                <i class="fa fa-question-circle-o cursor" />
              </b-tooltip>
            </p>
            <user-banner
              :user="data.user"
              @updated="getUserData(data.user.uid)" />
            <div class="buttons is-small">
              <a
                v-if="data.user.dripId"
                class="button"
                target="_blank"
                :href="'https://www.getdrip.com/' + $local.drip + '/subscribers/' + data.user.dripId">
                <span class="icon"><i class="fa fa-tint" /></span>
                <span>Drip</span>
              </a>
              <a
                class="button"
                target="_blank"
                :href="'https://kyt.chainalysis.com/users/' + data.user.uid">
                <span>Chainalysis</span>
              </a>
              <a
                v-if="data.user.freshdeskId"
                class="button"
                target="_blank"
                :href="'https://easycrypto.freshdesk.com/a/contacts/' + data.user.freshdeskId">
                <span class="icon"><i class="fa fa-ticket" /></span>
                <span>Fresh</span>
              </a>
            </div>
            <div class="buttons">
              <AccountTypeDropdown
                :account-type="data.user.accountType"
                :uid="data.user.uid"
                @updated="getUserData(data.user.uid)" />
              <RiskTypeDropdown
                :risk-type="data.user.riskType"
                :uid="data.user.uid"
                @updated="getUserData(data.user.uid)" />
            </div>
            <UserSummary
              :user-data="this.data"
              @updated="getUserData(data.user.uid)"
              @getLimitsData="getLimitsData" />
            <br>
            <div class="content">
              <h2 class="title is-5">
                Nature and Purpose
              </h2>
              <div class="field">
                <h3 class="title is-6 is-marginless">
                  Latest Source Of Funds Verification
                </h3>
                <p class="is-marginless">
                  Purpose: {{ sourceOfFund.purpose }}
                </p>
                <p class="is-marginless">
                  Source: {{ sourceOfFund.source }}
                </p>
                <p class="is-marginless">
                  Requested Limit: {{ sourceOfFund.limit }}
                </p>
                <p
                  v-for="item in sourceOfFund.sourceFiles"
                  :key="item"
                  class="is-marginless">
                  Files:
                  <a
                    v-if="sourceOfFund.sourceFiles.length > 0"
                    :href="item">Link </a>
                </p>
              </div>
              <br>
              <div class="field">
                <h3 class="title is-6 is-marginless">
                  Privacy Coins
                </h3>
                <p class="is-marginless">
                  Purpose: {{ naturePurpose.privacy_coins.purpose }}
                </p>
                <p class="is-marginless">
                  Source: {{ naturePurpose.privacy_coins.source }}
                </p>
              </div>
              <br>
              <div class="field">
                <h3 class="title is-6 is-marginless">
                  Sign up
                </h3>
                <p class="is-marginless">
                  Purpose: {{ signupPurpose }}
                </p>
                <p class="is-marginless">
                  Source: {{ signupSource }}
                </p>
              </div>
            </div>
            <div class="field">
              <toggle-value
                icon="fa-user-secret"
                size="is-small"
                field="privacy"
                :current="privacyCoins"
                :uid="data.user.uid"
                text="privacy coins"
                @updated="getUserData(data.user.uid)" />
            </div>
            <br>
            <!--<div class="content">
              <h2>Totals</h2>
              <table class="table fit-table">
                <tr>
                  <td>Buy:</td>
                  <td class="has-text-right">{{ price(data.orderTotals.buy, 0) }}</td>
                </tr>
                <tr>
                  <td>Sell:</td>
                  <td class="has-text-right">{{ price(data.orderTotals.sell, 0) }}</td>
                </tr>
                <tr>
                  <td>Total:</td>
                  <td class="has-text-right">{{ price(data.orderTotals.buy + data.orderTotals.sell, 0) }}</td>
                </tr>
              </table>
            </div>-->
            <h2 class="title is-5">
              External services
            </h2>
            <b-table :data="data.externalIds">
              <template #default="props">
                <b-table-column
                  field="provider"
                  label="Provider">
                  {{ props.row.provider }}
                </b-table-column>
                <b-table-column
                  field="id"
                  label="ID">
                  {{ props.row.id }}
                </b-table-column>
              </template>
            </b-table>
          </div>
          <div class="column is-half">
            <compliance-log
              ref="compliancelog"
              :uid="data.user.uid"
              :compliance="data.user.complianceReview"
              @updated="getUserData(data.user.uid)" />
            <div class="field">
              <toggle-value
                size="is-small"
                field="scamTest"
                :current="data.user.scamTest"
                :uid="data.user.uid"
                text="passed scam test"
                @updated="getUserData(data.user.uid)" />
            </div>
            <AuthSignalLogs :uid="data.user.uid" />
            <br>
            <!--<b-table :data="data.suspectLogs"
                     :paginated="true"
                     :per-page="8"
                     pagination-size="is-small"
            >
              <template #default="props">
                <b-table-column field="date" label="Date">
                  {{ $moment(props.row.date).format('DD/MM/YY') }}
                </b-table-column>

                <b-table-column field="why" label="Why">
                  <pre>{{ props.row.why }}</pre>
                </b-table-column>

                <b-table-column field="who" label="Who">
                  {{ props.row.who.split('@')[0] }}
                </b-table-column>
              </template>
            </b-table>-->
            <template v-if="data.matchingUsers.length">
              <div
                class="notification is-danger"
                style="margin-top: 2em;">
                <p class="is-size-5">
                  WARNING! Matching users
                </p>
                <b-table :data="data.matchingUsers">
                  <template #default="props">
                    <b-table-column>
                      <router-link :to="{ name: 'user', query: { uid: props.row.uid } }">
                        {{ props.row.email }}
                      </router-link>
                    </b-table-column>
                  </template>
                </b-table>
              </div>
            </template>
            <template v-if="data.matchingFingerprints.length">
              <div
                class="notification is-warning"
                style="margin-top: 2em;">
                <p class="is-size-5">
                  WARNING! Matching fingerprints
                </p>
                <b-table :data="data.matchingFingerprints">
                  <template #default="props">
                    <b-table-column>
                      <router-link :to="{ name: 'user', query: { uid: props.row.uid } }">
                        {{ props.row.email }}
                      </router-link>
                    </b-table-column>
                  </template>
                </b-table>
              </div>
            </template>
          </div>
        </div>
        <!--<template v-if="data.verification">
          <h2 class="title is-4">Verification info:</h2>
          <p>Address: {{ data.verification.address }}</p>
          <br>
        </template>
        <template v-if="originPayload">
          <h2 class="title is-4">Origin data:</h2>
          <div class="columns">
            <div class="column">
              <origin-detail :payload="originPayload"></origin-detail>
            </div>
            <div class="column is-3">
              <origin-summary :payload="originPayload"></origin-summary>
            </div>
          </div>
        </template>-->
        <ip-table :uid="data.user.uid" />
      </b-tab-item>
      <b-tab-item
        label="Orders"
        icon="shopping-cart">
        <section>
          <div>
            <h2 class="title is-5">
              Orders
            </h2>
            <b-button
              type="is-text is-small has-text-primary"
              :loading="processingCsv"
              @click="downloadCsv">
              Download CSV of Completed Orders
            </b-button>
            <p v-if="!data.orders.length">
              No orders
            </p>
            <b-table
              :data="data.orders"
              paginated
              :per-page="50"
              :loading="ordersLoading">
              <template #default="props">
                <b-table-column
                  field="date"
                  label="Date">
                  <span class="nobreak">{{ $moment(props.row.created).format('DD/MM/YYYY HH:mm') }}</span>
                </b-table-column>

                <b-table-column
                  field="orderId"
                  label="ID">
                  <clipboard icon-only>
                    {{ props.row.orderId }}
                  </clipboard>
                  <router-link
                    :to="{ name: 'user', query: { uid: props.row.uid, orderId: props.row.orderId } }">
                    {{ props.row.orderId }}
                  </router-link>
                  <span
                    class="icon"
                    v-if="!props.row.ownAddress">
                    <i class="fa fa-file-zip-o" />
                  </span>
                </b-table-column>

                <b-table-column
                  field="total"
                  label="Total"
                  numeric>
                  {{ currency(props.row.total) }}
                </b-table-column>

                <b-table-column
                  field="coins"
                  label="Coins">
                  <div
                    v-for="(coin, i) of formatAddresses(props.row.coins)"
                    :key="'coinname' + i">
                    {{ coin[0] }}
                  </div>
                </b-table-column>

                <b-table-column label="Addr">
                  <div
                    v-for="(coin, i) of formatAddresses(props.row.coins)"
                    :key="'coinaddress' + i"
                    class="has-text-grey-light">
                    <b-tooltip :label="coin[2]">
                      <i>
                        <clipboard
                          :copy-value="coin[2]"
                          :icon="false">{{ coin[1] }}</clipboard>
                      </i>
                    </b-tooltip>
                  </div>
                </b-table-column>

                <b-table-column
                  field="method"
                  label="Method">
                  {{ props.row.method }}
                </b-table-column>

                <b-table-column
                  field="account"
                  label="Account">
                  <clipboard>{{ props.row.bankAccount }}</clipboard>
                </b-table-column>

                <b-table-column
                  field="name"
                  label="Name">
                  {{ props.row.bankName }}
                </b-table-column>

                <b-table-column
                  field="system"
                  label="System">
                  {{ props.row.new_core ? 'Core' : 'Legacy' }}
                </b-table-column>

                <b-table-column
                  field="status"
                  label="Status">
                  <template v-if="paymentStatus(props.row).status">
                    <b-tooltip
                      :label="paymentStatus(props.row).date"
                      type="is-dark">
                      <b-tag :type="paymentStatus(props.row).tag">
                        {{ paymentStatus(props.row).status }}
                      </b-tag>
                    </b-tooltip>
                  </template>
                </b-table-column>

                <b-table-column
                  field="ptrOwnAddress"
                  label="Own Address"
                  v-if="$local.countryCode === 'NZ'">
                  <span
                    class="icon"
                    v-if="props.row.direction !== 'sell' && props.row.coins">
                    {{ checkPtrRecord(props.row.coins) }}
                  </span>
                </b-table-column>

                <b-table-column
                  field="unusualActivity"
                  label="Unusual Activity">
                  <UnusualActivityDropdown
                    :order-id="props.row.orderId"
                    :unusual-activity="props.row.unusualActivity"
                    :loading="uaLoading"
                    @select="setUnusualActivity" />
                </b-table-column>
              </template>
            </b-table>
            <b-button
              type="is-primary"
              rounded
              class="sticky-update-btn"
              icon-left="refresh"
              @click="updateOrders"
              :class="{ 'is-loading': ordersLoading }">
              Refresh
            </b-button>
          </div>
        </section>
      </b-tab-item>
      <b-tab-item
        v-if="orderSelected"
        :label="selectedOrderId"
        icon="shopping-cart"
        :loading="ordersLoading">
        <Order
          :selected-order-id="selectedOrderId"
          @update="selectOrder" />
      </b-tab-item>
      <b-tab-item
        v-if="Object.keys(autobuys).length"
        label="Auto-Buy"
        icon="bolt">
        <UserAutobuys
          :autobuys="autobuys"
          :ptr-records="data.ptrRecords" />
      </b-tab-item>
      <b-tab-item
        label="Limits"
        icon="exclamation-circle">
        <UserLimits
          ref="limits"
          :uid="uid"
          :user="data.user" />
      </b-tab-item>
      <b-tab-item
        label="Limits V2"
        icon="exclamation-circle">
        <Limit :uid="data.user.uid" />
      </b-tab-item>
      <b-tab-item
        label="Tracker"
        icon="line-chart">
        <b-table :data="data.trackerManual">
          <template #default="props">
            <b-table-column
              field="date"
              label="Date">
              {{ props.row.date }}
            </b-table-column>
            <b-table-column
              field="fromSymbol"
              label="From">
              {{ props.row.fromAmount }} {{ props.row.fromSymbol }}
            </b-table-column>
            <b-table-column
              field="toSymbol"
              label="To">
              {{ props.row.toAmount }} {{ props.row.toSymbol }}
            </b-table-column>
          </template>
        </b-table>
      </b-tab-item>
      <b-tab-item
        label="Affiliate"
        icon="users">
        <template v-if="!!affiliate">
          <div class="content">
            <p>Current balance: {{ price(affiliate.balance) }}</p>
            <p>Number of earnings: {{ affiliate.count }}</p>
            <p>Number of affiliates: {{ affiliate.countAffs }}</p>
          </div>
          <h4 class="title is-6">
            Latest earnings:
          </h4>
          <b-table
            :data="affiliate.latest"
            :mobile-cards="false"
            class="fit-table">
            <template #default="props">
              <b-table-column
                field="date"
                label="Date">
                <span class="no-break">{{ $moment(props.row.date).format('MM-DD HH:mm') }}</span>
              </b-table-column>
              <b-table-column
                field="value"
                label="Value">
                {{ price(props.row.value) }}
              </b-table-column>
            </template>
          </b-table>
        </template>
        <p v-else>
          Unable to fetch data
        </p>
      </b-tab-item>
      <b-tab-item
        label="Customer Files"
        icon="file">
        <DocumentFiles :uid="data.user.uid" />
      </b-tab-item>
    </b-tabs>
    <section
      v-if="data.verification"
      class="section">
      <h2 class="title is-4">
        Verification documents
      </h2>
      <!-- Our manual verification images -->
      <VerificationImage
        title="ID image"
        :url="data.verification.idFront" />
      <VerificationImage
        v-if="data.verification.idBack"
        title="ID back"
        :url="data.verification.idBack" />
      <VerificationImage
        title="Selfie with note"
        :url="data.verification.photoWithId" />
      <!-- External verification documents, likely from Sumsub -->
      <VerificationImage
        v-for="(doc, i) in externalDocuments"
        :key="doc.link"
        :title="'Document #' + (i + 1)"
        :url="doc.link" />
    </section>
    <section
      v-if="hasAccess($roles.Admin)"
      class="section content">
      <h1>SQL quick commands</h1>
      <h4>Disable EC Wallet</h4>
      <pre><clipboard>UPDATE users SET ecWallet=0 WHERE uid='{{ uid }}';</clipboard></pre>
    </section>
  </section>
</template>

<script>
import Clipboard from './parts/Clipboard.vue'
import UserBanner from './parts/user/Banner.vue'
import UserLimits from './parts/user/UserLimits.vue'
import IpTable from './parts/user/IpTable.vue'
import ToggleValue from './parts/user/ToggleValue.vue'
import ComplianceLog from './parts/ComplianceLog.vue'
import VerificationImage from './parts/verification/VerificationImage.vue'
import verificationDocumentsMixin from './parts/verification/verificationDocumentsMixin'
import DocumentFiles from './parts/user/DocumentFiles.vue'
import UnusualActivityDropdown from './parts/user/UnusualActivityDropdown.vue'
import UserSummary from './parts/user/UserSummary.vue'
import UserAutobuys from './parts/user/UserAutobuys.vue'
import userMixin from './parts/user/userMixin'
import Order from './Order.vue'
import Limit from './limit/Limit.vue'
import AccountTypeDropdown from './parts/user/AccountTypeDropdown.vue'
import RiskTypeDropdown from './parts/user/RiskTypeDropdown.vue'
import AuthSignalLogs from './parts/AuthSignalLogs.vue'

export default {
  name: 'User',
  components: {
    DocumentFiles,
    VerificationImage,
    ComplianceLog,
    UserBanner,
    Clipboard,
    UserLimits,
    IpTable,
    ToggleValue,
    UnusualActivityDropdown,
    UserAutobuys,
    UserSummary,
    Order,
    Limit,
    AccountTypeDropdown,
    RiskTypeDropdown,
    AuthSignalLogs
  },
  mixins: [verificationDocumentsMixin, userMixin],
  data () {
    return {
      uid: null,
      data: null,
      autobuys: {},
      verificationData: null,
      verificationModal: false,
      idImage: null,
      showPah: false,
      showCompliance: false,
      sourceOfFund: { purpose: '', source: '', sourceFiles: [], limit: '' },
      naturePurpose: {
        signup: {
          purpose: '', source: ''
        },
        privacy_coins: {
          purpose: '', source: '', limit: ''
        }
      },
      ordersPage: 1,
      processing: false,
      fetching: false,
      affiliate: null,
      uaLoading: false,
      processingCsv: false,
      ordersCsv: [],
      ordersLoading: false,
      activeTab: 0,
      orderSelected: false,
      selectedOrderId: null,
      matesHint: 'Mates tier ranges \n MR #1 ($0 - $1000) = 0% \n MR #2 ($1001 - $10000 = 0%) \n Tier 1 (MR #3) $10,001 - $50,000 = 10% \n Tier 2 (MR #4) $50,001 - $100,000 = 15% \n Tier 3 (MR #5) $100,001+ = 20%'
    }
  },
  head () {
    let d = this.data
    let name = d ? `${d.user.firstName} ${d.user.lastName} (${d.user.email})` : 'User'
    return this.head(name)
  },
  computed: {
    signupPurpose () {
      let retPurpose = this.naturePurpose.signup.purpose
      if (this.naturePurpose.signup.purposeOther) {
        retPurpose += ' - ' + this.naturePurpose.signup.purposeOther
      }

      return retPurpose
    },
    signupSource () {
      let retSource = this.naturePurpose.signup.source
      if (this.naturePurpose.signup.sourceOther) {
        retSource += ' - ' + this.naturePurpose.signup.sourceOther
      }

      return retSource
    },
    originPayload () {
      let payload
      if (this.data && this.data.verification && this.data.verification.payload) {
        try {
          payload = JSON.parse(this.data.verification.payload)
        } catch (e) {
          // nothing
        }
      }
      return payload
    },
    privacyCoins () {
      let d = this.data
      return d && d.flags && d.flags.privacyCoins
    }
  },
  watch: {
    '$route.query.uid': {
      handler () {
        if (this.$route.query.uid) {
          this.getUserData(this.$route.query.uid)
        }
      },
      immediate: true
    },
    '$route.query.orderId' () {
      this.openOrder(this.$route.query.orderId)
    }
  },
  mounted () {
    if (this.$route.query.uid) {
      this.getUserData(this.$route.query.uid)
      this.sendApi(this.$local.adb, {
        action: 'getBalance',
        uid: this.$route.query.uid
      })
        .then((r) => {
          this.affiliate = r.data
        })
        .catch()
    }
    if (this.$route.query.orderId) {
      this.openOrder(this.$route.query.orderId)
    }
  },
  methods: {
    async setLimits () {
      if (!this.data || !this.data.limits) {
        return
      }
      this.processing = true
      try {
        await this.apiv2('admin', 'setUserLimits', {
          id: this.data.user.id,
          limits: this.data.limits
        })
        this.$buefy.toast.open('Limits have been set')
        this.processing = false
      } catch (e) {
        this.$buefy.toast.open(e)
        this.processing = false
      }
    },
    async getUserData (uid) {
      if (!uid && this.data && this.data.user) {
        // Refresh current user if there is one
        uid = this.data.user.uid
      }
      if (this.fetching || !uid) {
        return
      }
      this.fetching = true
      console.log(`Fetching data for UID ${uid}`)
      uid = uid.trim()
      try {
        let data = {}
        if (this.$local.vms.enable) {
          const [udbData, vmsData] = await Promise.all([
            this.ecApi('admin', 'getUser', { uid }),
            this.verifyApi(`verification/${uid}/${this.$local.countryCode}`, 'GET')
          ])
          udbData.user = { ...udbData.user, ...vmsData.data.data }
          data = udbData
        } else {
          data = await this.ecApi('admin', 'getUser', { uid })
        }
        if (!data.user) {
          return
        }
        this.uid = uid
        this.data = data
        this.$emit('updateHead')
        // refresh compliance logs for user updates
        if (this.$refs.compliancelog) {
          this.$refs.compliancelog.update()
        }

        // Get source of funds
        this.sourceOfFund = await this.ecApi('admin', 'getLatestSourceOfFund', { uid })

        // get nature and purpose
        this.naturePurpose = await this.ecApi('admin', 'getNatureAndPurposeInfo', { uid })

        // Process autobuys
        let ab = {}
        for (let row of data.autobuys) {
          if (!ab.hasOwnProperty(row.reference)) {
            ab[row.reference] = []
          }
          ab[row.reference].push(row)
        }
        this.autobuys = ab

        if (this.getVerificationProvider(this.data.verification).name === 'Sumsub') {
          await this.getExternalUserDocuments(this.data.user.uid, 'Sumsub')
        }
      } catch (e) {
        // nothing
        console.log(e)
      }
      if (this.data.user.ban_reason !== 'NULL') {
        this.data.user.ban_reason = JSON.parse(this.data.user.ban_reason)
      }
      this.fetching = false
    },
    toggleSuspicious () {
      if (this.processing) {
        return
      }
      let current = this.data.user.suspicious
      let text = (current) ? 'NOT suspicious' : 'suspicious'
      this.$buefy.dialog.prompt({
        message: 'Marking a user as suspicious means that none of their new transactions will get processed.<br><br>Why do you want to mark them as ' + text + '?',
        onConfirm: async (value) => {
          this.processing = true
          try {
            await this.ecApi('admin', 'setValue', {
              uid: this.uid,
              table: 'user',
              column: 'suspicious',
              what: 'Marking user as ' + text,
              who: this.$store.state.goauth.name,
              why: value,
              value: (current) ? 0 : 1
            })
            await this.getUserData(this.uid)
            this.$buefy.toast.open('Marked as ' + text)
          } catch (e) {
            // nothing
          }
          this.processing = false
        }
      })
    },
    paymentStatus (row) {
      let status, tag, date
      if (row.cancelled) {
        status = 'Canc'
        tag = 'is-white'
        date = row.cancelled
      } else if (row.completed) {
        status = 'Complete'
        tag = 'is-success'
        date = row.completed
      } else if (row.paid) {
        if (!row.processed && row.suspicious) {
          status = 'Suspicious'
          tag = 'is-danger'
          date = row.paid
        } else if (row.hold) {
          status = 'Held'
          tag = 'is-dark'
          date = row.hold
        } else if (!row.tier) {
          status = 'No tier'
          tag = 'is-warning'
          date = row.paid
        } else {
          status = 'Paid'
          tag = 'is-light'
          date = row.paid
        }
      }
      return {
        status: status,
        tag: tag,
        date: date
      }
    },
    changeOrdersPage (page) {
      this.ordersPage = page
    },
    formatAddresses (text) {
      let coins = []
      if (!text) {
        return coins
      }
      let rows = text.split(', ')
      for (let coin of rows) {
        if (!coin) {
          continue
        }
        // Split string on last space into coin / address
        let arr = coin.split(' ')
        let address = arr.pop()
        coin = arr.join(' ')
        coins.push([coin, address.substring(address.length - 4), address])
      }
      return coins
    },
    async setUnusualActivity ({ value, orderId }) {
      try {
        this.uaLoading = orderId
        const res = await this.apiv2('admin', 'setUnusualActivity', {
          uid: this.uid,
          orderId,
          unusualActivity: value
        })
        if (res) {
          const foundIndex = this.data.orders.findIndex(x => x.orderId === orderId)
          this.data.orders[foundIndex].unusualActivity = value
          this.$buefy.toast.open(`Updated Order ${orderId} unusual activity`)
          this.uaLoading = false
        }
      } catch (e) {
        this.$buefy.toast.open(e)
        this.uaLoading = false
      }
    },
    removeTrailingZeros (str) {
      if (typeof str === 'string' && str.match(/\.\d+?0+$/)) {
        return str.replace(/(.*?\d)0+$/, '$1')
      } else {
        return str
      }
    },
    async downloadCsv () {
      if (this.processingCsv) {
        return
      }
      this.processingCsv = true
      try {
        let res = await this.ecApi('order-admin', 'getOrdersCsv', {
          uid: this.uid
        })
        if (res.hasOwnProperty('orders')) {
          this.ordersCsv = res.orders
          let csvContent = 'data:text/csv;charset=utf-8,'
          this.ordersCsv.forEach((row) => {
            // Remove trailing zeros from fromAmount and toAmount
            row[5] = this.removeTrailingZeros(row[5])
            row[6] = this.removeTrailingZeros(row[6])
            csvContent += row.join(',') + '\r\n'
          })
          const encodedUri = encodeURI(csvContent)
          const link = document.createElement('a')
          const filename = 'Easy Crypto orders ' + this.$moment().format('YYYY-MM-DD')
          link.setAttribute('href', encodedUri)
          link.setAttribute('download', filename + '.csv')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } catch (e) {
        console.log(e)
      }
      this.processingCsv = false
    },
    getLimitsData () {
      this.$refs.limits.getData()
    },
    async updateOrders () {
      this.ordersLoading = true
      try {
        await this.getUserData()
      } catch (e) {
        console.error(e)
      }
      this.ordersLoading = false
    },
    selectOrder (orderId) {
      // add order ID to params
      this.$router.replace({ path: this.$route.fullPath, query: { orderId } })
      this.selectedOrderId = orderId
      this.orderSelected = true
      this.activeTab = 2
    },
    openOrder (orderId) {
      this.selectedOrderId = orderId
      this.orderSelected = true
      this.activeTab = 2
    },
    matesTier (value) {
      if (this.$local.countryCode !== 'NZ') {
        return ''
      }
      // returns the mates rates tier based off of user lifetime value
      if (this.data.user.customMargin) {
        return `Custom Margin Set (${this.data.user.customMargin})`
      } else if (value > 100000) {
        return '(Tier 3 @ 20%)'
      } else if (value > 50000) {
        return '(Tier 2 @ 15%)'
      } else if (value > 10000) {
        return '(Tier 1 @ 10%)'
      } else {
        return 'No tier'
      }
    },
    checkPtrRecord (coins) {
      const addresses = this.formatAddresses(coins)
      if (addresses.length <= 1) {
        // get single address only (not multicoin orders)
        const address = addresses[0][2]
        for (const record of this.data.ptrRecords) {
          if (record.address === address) {
            return record.ownAddress ? '✅' : '❌'
          }
        }
      }
    }
  }
}
</script>

<style scoped>
table {
  width: 100%;
}

.router-link-active {
  font-weight: normal;
  cursor: pointer !important;
}

.b-tooltip.is-multiline.is-large:after {
  white-space: pre-line;
}
</style>
