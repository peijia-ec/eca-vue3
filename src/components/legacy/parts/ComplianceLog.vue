<template>
  <div style="position:relative">
    <b-loading
      :is-full-page="false"
      :active="loading" />
    <div class="level is-mobile">
      <div class="level-left">
        <div class="level-item">
          <p
            v-if="!readOnly"
            class="is-size-5"
            style="margin-bottom: 10px">
            Compliance logs
          </p>
        </div>
      </div>
      <div
        v-if="visible"
        class="level-right">
        <div class="level-item">
          <div class="tags has-addons">
            <span class="tag is-danger">Flagged for Compliance Review</span>
            <a
              class="tag is-delete"
              @click="removeReview" />
          </div>
        </div>
      </div>
    </div>

    <p v-if="user">
      {{ user.verifiedFirst }} {{ user.verifiedLast }}
    </p>
    <user-tags :user="user" />
    <div
      v-if="!readOnly"
      class="field"
      style="margin-top:10px">
      <button
        class="button is-primary is-small"
        @click="openModal">
        <span class="icon"><i class="fa fa-plus" /></span>
        <span>Take action</span>
      </button>
    </div>
    <p v-if="message">
      {{ message }}
    </p>
    <b-table
      :data="sorted"
      :paginated="true"
      pagination-size="is-small"
      backend-pagination
      :per-page="perPage"
      :total="total"
      @page-change="onPageChange">
      <template slot-scope="props">
        <b-table-column
          field="id"
          label=" "
          style="max-width: 600px;">
          <pre class="clean is-size-7">{{ props.row.why }}</pre>
          <p
            class="help has-text-grey-light"
            style="margin-top:1em">
            {{ props.row.what }}
          </p>
          <p class="help has-text-grey-light">
            {{ $moment(props.row.date).format('MMM D, YYYY, HH:mm') }} by {{ props.row.who.split('@')[0] }}
          </p>
        </b-table-column>


        <b-table-column
          field="pinned"
          label=" ">
          <span
            class="icon cursor"
            @click="pin(props.row)"><i
              class="fa fa-thumb-tack"
              :class="{ 'has-text-primary': props.row.pinned, 'has-text-grey-lighter': !props.row.pinned }" /></span>
          <span
            class="icon cursor has-text-grey-lighter"
            @click="deleteLog(props.row)"><i class="fa fa-trash" /></span>
        </b-table-column>
      </template>
    </b-table>
    <b-modal
      v-if="user"
      id="modal"
      :active.sync="show">
      <!-- Popup modal with a note field, and button options to set the customer status -->
      <div class="box content">
        <h3>{{ user.displayName }}</h3>
        <template v-if="orderId">
          <hr>
          <h4>Order actions for {{ orderId }}:</h4>
          <div class="field buttons">
            <b-button
              :loading="loading"
              size="is-small"
              @click="bankNameNoMatch">
              Send non-matching bank name email
            </b-button>
            <b-button
              :loading="loading"
              size="is-small"
              @click="snooze(orderId)">
              Snooze Order
            </b-button>
            <b-button
              :loading="loading"
              size="is-small"
              @click="kytHighRisk">
              Send KYT Email
            </b-button>
          </div>
          <hr>
          <h4>Customer actions:</h4>
        </template>
        <div
          v-if="!user.fraud"
          class="field">
          <b-button
            :loading="loading"
            size="is-small"
            @click="mlmStuckOrder">
            Send MLM education email and release orders
          </b-button>
        </div>
        <b-field label="Note">
          <b-input
            ref="notes"
            v-model="note"
            type="textarea" />
        </b-field>
        <h4>User</h4>
        <b-field>
          <b-radio-button
            v-model="flags.ban"
            size="is-small"
            :native-value="false"
            type="is-success">
            No ban
          </b-radio-button>
          <b-radio-button
            v-model="flags.ban"
            size="is-small"
            :native-value="true"
            type="is-danger">
            Ban account
          </b-radio-button>
        </b-field>
        <section v-if="flags.ban && !user.ban_reason">
          <b-field>
            <p>Reasons are:</p>
          </b-field>
          <b-field
            v-for="(res, index) in banReasons"
            :key="index"
            class="ban-field">
            <div class="checkbox-field">
              <b-checkbox
                v-model="selectedBanReason"
                :native-value="res.reason"
                :disabled="limitBanReasonToOne(res.reason)">
                {{ res.reason }}
              </b-checkbox>
              <b-tooltip
                :label="res.hint"
                multilined
                style="margin-left: .5em;"
                position="is-right"
                class="clean">
                <i class="fa fa-question-circle-o cursor" />
              </b-tooltip>
            </div>
            <!-- if ban reason already exist / else? -->
            <div
              v-show="selectedBanReason.includes(res.reason) && res.subOptions"
              style="margin: 1em;">
              <b-field
                v-for="(subRes, subIndex) in res.subOptions"
                :key="subIndex"
                class="ban-field">
                <b-checkbox
                  v-model="selectedBanReason"
                  :native-value="subRes.reason">
                  {{ subRes.reason }}
                </b-checkbox>
              </b-field>
            </div>
          </b-field>
          <p class="block">
            Please remember to fill out the Fraudulent Activity Form:
            <a href="https://forms.gle/y5JPZCyXCwHBhU938">https://forms.gle/y5JPZCyXCwHBhU938</a>
          </p>
        </section>
        <!-- if account is already banned show the reason but disable selections -->
        <section v-if="flags.ban && user.ban_reason">
          <b-field>
            <p v-if="user.ban_reason !== 'NULL'">
              <b>Account banned for:</b> {{ JSON.parse(user.ban_reason) }}
            </p>
            <p v-else>
              <b>Account banned for: {{ user.ban_reason }}</b>
            </p>
          </b-field>
          <p class="block">
            Please remember to fill out the Fraudulent Activity Form:
            <a href="https://forms.gle/y5JPZCyXCwHBhU938">https://forms.gle/y5JPZCyXCwHBhU938</a>
          </p>
        </section>
        <br>
        <div
          v-for="(name, key) in susFlagNames"
          :key="'susflag' + key"
          class="field">
          <b-checkbox
            v-model="user[key]"
            :true-value="1"
            :false-value="0">
            {{ name }}
          </b-checkbox>
        </div>
        <div class="field">
          <b-checkbox
            v-model="unusualActivity"
            :true-value="1"
            :false-value="0">
            Unusual Activity form completed
          </b-checkbox>
        </div>
        <div
          class="field"
          v-if="flags.ban">
          <b-checkbox
            v-model="dontUnsubscribe"
            :true-value="true"
            :false-value="false">
            Don't unsubscribe from emails
          </b-checkbox>
        </div>
        <br>
        <h4>Orders</h4>
        <b-field>
          <b-radio-button
            v-model="flags.orders"
            :disabled="flags.ban"
            size="is-small"
            native-value="process"
            type="is-success">
            Normal
          </b-radio-button>
          <b-radio-button
            v-model="flags.orders"
            :disabled="flags.ban"
            size="is-small"
            native-value="htr"
            type="is-warning">
            Hold til received
          </b-radio-button>
          <b-radio-button
            v-model="flags.orders"
            :disabled="flags.ban"
            size="is-small"
            native-value="hold"
            type="is-dark">
            Hold
          </b-radio-button>
          <b-radio-button
            v-model="flags.orders"
            :disabled="flags.ban"
            size="is-small"
            native-value="freeze"
            type="is-danger">
            Don't process
          </b-radio-button>
        </b-field>
        <div
          v-if="flags.orders === 'process' && user.pah && !user.suspicious"
          class="field">
          <b-checkbox v-model="flags.releaseOrders">
            Also release any held orders
          </b-checkbox>
        </div>
        <div
          v-if="errorMessage"
          class="field">
          <p class="error has-text-danger">
            {{ errorMessage }}
          </p>
        </div>
        <div class="field">
          <b-button
            type="is-primary"
            :loading="loading"
            @click="save">
            <span class="icon"><i class="fa fa-save" /></span>
            <span>Save</span>
          </b-button>
        </div>
        <ul class="help has-text-grey-dark">
          <li>To "process" an order means to convert from fiat to crypto</li>
          <li><b>Ban</b> means the user cannot create an order or verify their account</li>
          <li>
            <b>Hold til received</b> means process orders at the current market rate, and automatically deliver the order
            once funds are received
            in our bank account
          </li>
          <li><b>Hold</b> means process orders at the current market rate, but don't send to the customer until manually
            released</li>
          <li><b>Don't process</b> means to "freeze" the customer orders and DO NOT convert their fiat to crypto</li>
        </ul>
      </div>
    </b-modal>
  </div>
</template>

<script>
import UserTags from './user/UserTags.vue'
import { mapState } from 'vuex'

export default {
  name: 'ComplianceLog',
  components: { UserTags },
  props: {
    uid: String,
    readOnly: Boolean,
    orderId: String,
    closeModal: Function,
    complianceResponse: Function,
    compliance: Number,
    type: String,
    refresh: Number
  },
  data () {
    return {
      show: false,
      note: '',
      loading: false,
      log: [],
      perPage: 5,
      page: 1,
      total: 0,
      user: null,
      userOriginal: null,
      message: null,
      susFlagNames: {
        'ignore_ip': 'Ignore IP address',
        'complianceReview': 'Compliance review requested'
      },
      unusualActivity: false,
      flags: {
        ban: false,
        freeze: false,
        orders: 'process', // process, hold, htr (hold til received)
        releaseOrders: false
      },
      selectedBanReason: [],
      banReason: null,
      configs: {},
      complianceStatus: 0,
      visible: false,
      cancelReview: false,
      errorMessage: null,
      dontUnsubscribe: false,
      banReasons: [
        { reason: 'Money Mule', hint: 'These are people who are moving money for someone else - this could involve receiving money linked to criminal proceeds and sending it somewhere on instruction from a criminal (they may or may not know the funds are from a criminal, and may or may not be under duress). \n E.g. a family member being forced to move money for someone' },
        { reason: 'Scam', hint: 'A scam is when someone has been deceived into sending money or personal information under the guise of something else. \n\n 1. Fake investment opportunities \n 2. Fake job opportunities (these also fall under the money mule heading) \n 3. Fake relationships \n 4. Unsustainable network marketing structures \n 5. Fake support people (e.g. tech support) gaining access to a device using a software like teamviewer.', subOptions: [{ reason: 'Investment/broker scam' }, { reason: 'Job scam' }, { reason: 'Romance scam' }, { reason: 'MLM scam' }, { reason: 'Remote access scam' }] },
        { reason: 'Fraud', hint: 'A fraud is when someone is unknowingly targeted (e.g. hacking) \n\n 1. Stolen identity details are used to create a new account \n 2. A pre-existing account is hacked', subOptions: [{ reason: 'Fake ID' }, { reason: 'Compromised account' }, { reason: 'Unauthorized payment' }] },
        { reason: 'Outside risk profile', hint: 'When a customer performs an activity that sits outside our risk profile as a business (i.e. what we will accept/condone through our services). This includes when someone refuses to provide the information we need to carry out our compliance processes.' },
        { reason: 'Abusive/Threatening', hint: 'When someone becomes verbally abusive and/or threatening to our staff during communications online, over the phone or in person.' },
        { reason: 'Account issues', hint: 'When an account issue has meant this account is no longer active/required.', subOptions: [{ reason: 'Duplicate account' }, { reason: 'Customer wants to close account' }] },
        { reason: 'Temporary ban', hint: 'When an account needs to be disabled to prevent any further activity while we investigate something and/or wait for a response from a customer or other party (e.g. Police).' },
        { reason: 'Other', hint: 'When none of the above scenarios apply' }
      ]
    }
  },
  computed: {
    sorted () {
      // Sort with pinned items first
      return this.log.sort((a, b) => {
        return b.pinned - a.pinned || b.id - a.id
      })
    }
  },
  watch: {
    uid: {
      handler: 'update',
      immediate: true
    },
    refresh: {
      handler: 'update'
    },
    show (value) {
      if (value === false && this.type) {
        this.closeModal() // trigger function in parent element
      }
    },
    'selectedBanReason' (newVal) {
      if (newVal.includes('Duplicate account')) {
        this.dontUnsubscribe = true
      } else {
        this.dontUnsubscribe = false
      }
    },
    /**
     * Read the updated complianceStatus
     * @returns {*}
     */
    complianceStatus (value) {
      this.visible = value === 1
    }
  },
  mounted () {
    this.complianceStatus = this.compliance
  },
  methods: {
    /**
     * Function to remove compliance requested review
     * @returns {*}
     */
    async removeReview () {
      if (this.loading) {
        return
      }
      this.loading = true
      let updated = false
      this.cancelReview = true
      try {
        await this.apiv2('admin', 'complianceLog', {
          uid: this.uid,
          what: 'Removed compliance review request',
          who: this.$store.getters['goauth/logName'],
          why: 'Removed compliance review request',
          cancelReview: this.cancelReview
        })
        this.visible = false
        this.$emit('updated')
        updated = true
      } catch (e) {
        console.log(e)
      }
      this.loading = false
      if (updated) {
        await this.update()
      }
    },
    openModal (value) {
      this.show = true
      if (typeof (value) !== 'object') {
        this.flags.orders = 'hold'
        this.note = value.charAt(0).toUpperCase() + value.slice(1)
      }
      setTimeout(() => {
        // Set focus to notes field so user can start typing
        if (this.$refs.notes) {
          this.$refs.notes.focus()
        }
      }, 300)
    },
    async update () {
      if (this.loading || !this.uid) {
        return
      }
      this.loading = true
      try {
        let res = await this.apiv2('api-admin/index', 'user/getComplianceLogs', {
          page: this.page,
          limit: this.perPage,
          uid: this.uid
        })
        this.log = res.data
        this.total = res.total
        if (this.log.length) {
          this.user = this.log[0].user
          // Create a copy of the original user data, so that we can compare this later for any changes
          this.userOriginal = JSON.parse(JSON.stringify(this.user))
          this.flags = this.toFlags(this.user)
        }
        this.message = !this.log.length ? 'This user has no compliance notes yet.' : null
        this.complianceResponse()
      } catch (e) {
        // nothing
      }
      this.loading = false
    },
    fromFlags (f) {
      return {
        fraud: f.ban,
        sus: f.orders === 'freeze',
        pah: f.orders === 'hold',
        holdTilReceived: f.orders === 'htr'
      }
    },
    async bankNameNoMatch () {
      this.loading = true
      try {
        const orderId = this.orderId
        await this.apiv2('admin', 'bankNameNoMatch', {
          orderId: orderId
        })
        this.$buefy.toast.open({
          duration: 5000,
          message: 'Customer has been emailed',
          type: 'is-success'
        })
        this.$store.commit('orders/snooze', orderId)
      } catch (e) {
        console.log(e)
      }
      this.loading = false
    },
    async mlmStuckOrder () {
      this.loading = true
      try {
        await this.apiv2('admin', 'mlmStuckOrder', {
          uid: this.user.uid
        })
        this.$buefy.toast.open({
          duration: 5000,
          message: 'Customer has been emailed',
          type: 'is-success'
        })
      } catch (e) {
        console.log(e)
      }
      this.loading = false
    },
    toFlags (u) {
      let orders = 'process'
      if (u.suspicious) {
        orders = 'freeze'
      } else if (u.pah) {
        orders = 'hold'
      } else if (u.holdTilReceived) {
        orders = 'htr'
      }
      return {
        ban: !!u.fraud,
        orders: orders,
        releaseOrders: false
      }
    },
    async save () {
      if (this.loading) {
        return
      }
      this.loading = true
      let updated = false

      let u = this.user
      let f = this.flags

      // Generate the "What"
      let what = []
      if (f.ban && !u.fraud) {
        what.push('Banned account')
      }
      if (f.ban && this.dontUnsubscribe) {
        what.push('Don\'t unsubscribe from emails')
      }
      if (!f.ban && u.fraud) {
        what.push('Unbanned account')
      }
      if (f.orders === 'freeze' && !u.suspicious) {
        what.push('Froze orders')
      }
      if (f.orders !== 'freeze' && u.suspicious) {
        what.push('Unfroze orders')
      }
      if (f.orders === 'hold' && !u.pah) {
        what.push('Turned on Hold orders')
      }
      if (f.orders !== 'hold' && u.pah) {
        what.push('Turned off Hold orders')
      }
      if (f.orders === 'htr' && !u.holdTilReceived) {
        what.push('Turned on Hold Til Received')
      }
      if (f.orders !== 'htr' && u.holdTilReceived) {
        what.push('Turned off Hold Til Received')
      }

      // Create a list of the boolean SUS flags to update
      // These map to TINYINT(1) columns in MySQL
      let requestReview = false
      let susFlags = []
      for (let key of Object.keys(this.susFlagNames)) {
        susFlags.push({
          column: key,
          value: this.user[key]
        })
        if (this.user[key] !== this.userOriginal[key]) {
          // The ECA agent has updated this field, store it in the What
          let which = this.user[key] ? 'on' : 'off'
          what.push(`${this.susFlagNames[key]} turned ${which}`)
          // Is it a compliance review request?
          // If so, let the backend know to notify the team
          if (key === 'complianceReview' && this.user.complianceReview) {
            requestReview = true
          }
        }
      }

      // banning account requires banReason
      if (f.ban && !this.selectedBanReason.length && !this.user.ban_reason) {
        this.loading = false
        this.errorMessage = 'Please select a ban reason'
        setTimeout(() => {
          this.errorMessage = ''
        }, 3000)
        return
      }

      // Finalise the What field add orderId to logs if user is creating log via an order
      if (!what.length && this.orderId) {
        what.push('Created log entry for order ' + this.orderId)
      } else if (this.orderId) {
        what.push('Order number: ' + this.orderId)
      } else if (!what.length) {
        what.push('Created log entry')
      }
      what = what.join(', ')
      // If banning the user account, add the checked selections to the user note
      let note = ''
      if (f.ban && !u.fraud) {
        note += 'Banned account for '
        const banReason = this.selectedBanReason.length >= 2 ? `${this.selectedBanReason[0]}: ` : `${this.selectedBanReason[0]}`
        const subReason = this.selectedBanReason.slice(1).join('. ')
        // update the banReason for backend
        this.banReason = banReason + subReason
        note += this.banReason + '\n'
      }
      note += this.note
      // Separate log for unusual activity form completed if ticked
      if (this.unusualActivity) {
        try {
          await this.apiv2('admin', 'complianceLog', {
            uid: this.uid,
            what: 'Created log entry',
            who: this.$store.getters['goauth/logName'],
            why: 'Unusual activity form completed'
          })
        } catch (e) {
          console.error(e)
        }
      }
      this.unusualActivity = false

      if (f.ban && !this.user.ban_reason) {
        this.flags.banReason = this.banReason
      } else if (f.ban && this.user.ban_reason) {
        // if ban reason is already filled do not override with null value
        // for if user is creating a note and the account remains banned
        this.flags.banReason = JSON.parse(this.user.ban_reason)
      } else {
        // remove ban reason
        this.flags.banReason = null
      }
      try {
        await this.apiv2('admin', 'complianceLog', {
          uid: this.uid,
          what: what,
          who: this.$store.getters['goauth/logName'],
          why: note,
          requestReview: requestReview,
          flags: this.flags,
          susFlags: susFlags,
          dontUnsub: this.dontUnsubscribe
        })
        this.$emit('updated')
        this.show = false
        this.note = ''
        updated = true
      } catch (e) {
        console.log(e)
      }
      this.loading = false
      if (updated) {
        await this.update()
      }
    },
    pin (row) {
      let value = row.pinned ? 0 : 1
      this.apiv2('admin', 'compliancePin', {
        id: row.id,
        value: value
      })
      row = this.log.find(x => x.id === row.id)
      if (row) {
        row.pinned = value
      }
    },
    deleteLog (row) {
      this.$buefy.dialog.confirm({
        message: 'Are you sure you want to delete this entry?',
        confirmText: 'Delete',
        type: 'is-danger',
        onConfirm: async () => {
          if (this.loading) {
            return
          }
          this.loading = true
          let updated = false

          try {
            await this.apiv2('admin', 'delComplianceLog', {
              id: row.id,
              who: this.$store.state.goauth.name
            })
            this.$emit('updated')
            this.show = false
            this.note = ''
            updated = true
          } catch (e) {
            console.log(e)
          }
          this.loading = false
          if (updated) {
            await this.update()
          }
        }
      })
    },
    async snooze (orderId) {
      this.loading = true
      try {
        await this.apiv2('admin', 'snooze', {
          type: 'order',
          orderId: orderId,
          snooze: true
        })
        this.$buefy.toast.open({
          duration: 5000,
          message: 'Order has been snoozed',
          type: 'is-success'
        })
      } catch (e) {
        console.error(e)
      }
      this.loading = false
    },
    banSelection (reason) {
      return this.selectedBanReason.includes(reason)
    },
    limitBanReasonToOne (reason) {
      // limits user to one ban reason only (multiple sub reasons allowed)
      const selected = this.selectedBanReason.filter(res => res !== reason && this.banSelection(res))
      return selected.length > 0
    },
    async kytHighRisk () {
      this.loading = true
      try {
        await this.sendEmail({
          noreply: false,
          email: this.user.email,
          subject: 'Easy Crypto Order :)',
          body: `Hi ${this.user.firstName},
          
Thanks for your recent order.
        
Your account has been flagged for review by our system meaning that this order has been held pending review.
        
Unfortunately upon review I have some concerns about the address you've asked us to release funds to, so I wanted to check in with you before we release your crypto (as these transactions can't be reversed once they are released from us).
        
Can you please give me some more information on where you got this address and who it belongs to? :)`
        })
        await this.apiv2('admin', 'complianceLog', {
          uid: this.uid,
          what: 'KYT email sent',
          who: this.$store.getters['goauth/logName'],
          why: `KYT email sent for order ${this.orderId}`
        })
        this.$emit('updated')
        this.loading = false
      } catch (e) {
        console.error(e)
      }
    },
    onPageChange (page) {
      this.page = page
      this.update()
    },
  }
}
</script>

<style scoped>
.b-tooltip.is-multiline.is-medium:after {
  white-space: pre-line;
}

.ban-field {
  display: flex;
  flex-direction: column;
}

.checkbox-field {
  display: flex;
  align-items: center;
}
</style>
