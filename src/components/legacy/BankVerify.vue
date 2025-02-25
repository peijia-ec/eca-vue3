<template>
  <section class="section">
    <b-table
      :data="queue"
      :paginated="true"
      :per-page="12"
    >
      <template #default="props">
        <b-table-column
          field="created"
          label="Date"
        >
          <span class="no-break">{{ $moment(props.row.created).format('MM-DD') }}</span>
        </b-table-column>

        <b-table-column
          field="email"
          label="Email"
        >
          <router-link :to="{name: 'user', query: {uid: props.row.uid}}">
            {{ props.row.email }}
          </router-link>
        </b-table-column>

        <b-table-column
          field="firstName"
          label="Display name"
        >
          {{ props.row.firstName }} {{ props.row.lastName }}
        </b-table-column>

        <b-table-column
          field="lastName"
          label="Verified name"
        >
          {{ props.row.verifiedFirst }} {{ props.row.verifiedLast }}
        </b-table-column>

        <b-table-column
          field="lastName"
          label="Bank name"
        >
          {{ props.row.bank }}
        </b-table-column>

        <b-table-column
          field="account"
          label="Account"
        >
          <clipboard>{{ formatAccount(props.row) }}</clipboard>
          <span
            v-if="$local.countryCode === 'NZ'"
            class="cursor has-text-grey-light"
            @click="editAccount(props.row)"
          >
            <b-icon icon="pencil" />
          </span>
        </b-table-column>

        <b-table-column label="Doc">
          <a
            target="_blank"
            :href="storage + props.row.document"
          >Image</a>
        </b-table-column>

        <b-table-column
          field="tier"
          label="Tier"
        >
          <b-tag
            v-if="$local.countryCode === 'NZ' && props.row.tier === 10"
            type="is-warning"
          >
            {{ props.row.tier }}
          </b-tag>
          <span v-else>{{ props.row.tier }}</span>
        </b-table-column>

        <b-table-column label="Action">
          <div class="buttons">
            <a
              class="button is-success is-small"
              :class="{'is-loading': processing}"
              @click="approve(props.row)"
            >Approve</a>
            <a
              v-if="props.row.tier === 10"
              class="button is-warning is-small"
              :class="{'is-loading': processing}"
              @click="approve(props.row, true)"
            >Approve &amp; T20</a>
            <a
              class="button is-danger is-small"
              :class="{'is-loading': processing}"
              @click="deny(props.row)"
            >DENY!</a>
          </div>
        </b-table-column>
      </template>
    </b-table>
    <div
      v-if="row"
      :key="row.id"
    >
      <user-notes
        :uid="row.uid"
        :data="user.notes"
      />
      <h2
        class="title is-4 is-5-mobile"
        style="margin-top:1em;"
      >
        Tier {{ user.forTier }} verification
      </h2>
      <!-- Manual -->
      <template v-if="type === 'manual'">
        <template v-if="!user.hasOwnProperty('forTier')">
          <b-field
            horizontal
            label="First name"
          >
            <b-input v-model="user.firstName" />
          </b-field>

          <b-field
            horizontal
            label="Last name"
          >
            <b-input v-model="user.lastName" />
          </b-field>

          <b-field
            horizontal
            label="ID number"
          >
            <b-input
              v-model="user.idNumber"
              readonly
            />
          </b-field>

          <b-field
            horizontal
            label="Birthday"
          >
            <b-input v-model="birthday" />
          </b-field>

          <b-field
            horizontal
            label="Address"
          >
            <b-input
              v-model="user.address"
              readonly
            />
          </b-field>

          <b-field
            horizontal
            label="Suburb"
          >
            <b-input
              v-model="user.suburb"
              readonly
            />
          </b-field>

          <b-field
            horizontal
            label="City"
          >
            <b-input
              v-model="user.city"
              readonly
            />
          </b-field>

          <b-field
            horizontal
            label="Postcode"
          >
            <b-input
              v-model="user.postcode"
              readonly
            />
          </b-field>

          <b-field
            horizontal
            label="Purpose"
          >
            <b-input
              v-model="user.purpose"
              readonly
            />
          </b-field>

          <div class="content is-size-5">
            <p>
              <a
                target="_blank"
                :href="storage + user.idFront"
              >ID photo</a>
            </p>
            <p>
              <a
                target="_blank"
                :href="storage + user.photoWithId"
              >User photo</a>
            </p>
          </div>
        </template>
        <template v-if="user.forTier === 20">
          <b-field
            horizontal
            label="First name"
          >
            <b-input v-model="user.firstName" />
          </b-field>

          <b-field
            horizontal
            label="Last name"
          >
            <b-input v-model="user.lastName" />
          </b-field>

          <b-field
            horizontal
            label="ID number"
          >
            <b-input
              v-model="user.idNumber"
              readonly
            />
          </b-field>

          <b-field
            horizontal
            label="Birthday"
          >
            <b-input v-model="birthday" />
          </b-field>

          <b-field
            horizontal
            label="Address"
          >
            <b-input
              v-model="user.address"
              readonly
            />
          </b-field>

          <b-field
            horizontal
            label="Suburb"
          >
            <b-input
              v-model="user.suburb"
              readonly
            />
          </b-field>

          <b-field
            horizontal
            label="City"
          >
            <b-input
              v-model="user.city"
              readonly
            />
          </b-field>

          <b-field
            horizontal
            label="Postcode"
          >
            <b-input
              v-model="user.postcode"
              readonly
            />
          </b-field>

          <b-field
            horizontal
            label="Purpose"
          >
            <b-input
              v-model="user.purpose"
              readonly
            />
          </b-field>

          <b-field
            horizontal
            label="Origin reason"
          >
            <b-input
              v-model="user.originReason"
              readonly
            />
          </b-field>

          <b-field
            v-if="user.other"
            horizontal
            label="Other"
          >
            <b-input
              v-model="user.other"
              readonly
            />
          </b-field>

          <div class="content is-size-5">
            <p>
              <a
                target="_blank"
                :href="storage + user.fileFront"
              >ID photo</a>
            </p>
            <p>
              <a
                target="_blank"
                :href="storage + user.fileNote"
              >Photo with ID</a>
            </p>
            <p>
              <a
                target="_blank"
                :href="storage + user.fileAddress"
              >Address</a>
            </p>
          </div>
        </template>
        <template v-if="user.forTier === 30">
          <div class="content is-size-5">
            <h4>Purpose of trading</h4>
            <pre>{{ user.statementPurpose }}</pre>
            <h4>Overview of transactions</h4>
            <pre>{{ user.statementOverview }}</pre>
            <p>
              <a
                target="_blank"
                :href="storage + user.filePassport"
              >Passport photo</a>
            </p>
            <p>
              <a
                target="_blank"
                :href="storage + user.fileNoteT2"
              >Photo with passport</a>
            </p>
            <p>
              <a
                target="_blank"
                :href="storage + user.fileEvidence"
              >Source of funds</a>
            </p>
            <p>
              <a
                target="_blank"
                :href="storage + user.fileStatements"
              >Bank statements</a>
            </p>
          </div>
        </template>
      </template>
      <div class="buttons">
        <button
          class="button"
          @click="verify"
        >
          Verify!
        </button>
        <template v-if="type === 'manual'">
          <button
            class="button is-danger"
            @click="deny"
          >
            Deny
          </button>
        </template>
        <button
          class="button is-danger"
          @click="del"
        >
          Delete
        </button>
      </div>
    </div>
    <b-button
      type="is-primary"
      rounded
      class="sticky-update-btn"
      icon-left="refresh"
      @click="loadQueue"
      :class="{'is-loading': processing}"
    >
      Refresh
    </b-button>
  </section>
</template>

<script>
import Clipboard from './parts/Clipboard.vue'
import UserNotes from './parts/UserNotes.vue'

export default {
  name: 'Verification',
  components: {Clipboard, UserNotes},
  data () {
    return {
      storage: '',
      queue: [],
      row: null,
      processing: false
    }
  },
  mounted () {
    this.loadQueue()
  },
  methods: {
    approve (row, t20 = false) {
      this.$buefy.dialog.confirm({
        message: 'Are you sure you want to approve ' + row.firstName + ' ' + row.lastName + '?',
        onConfirm: () => {
          this.processing = true
          this.apiv2('admin', 'approveBank', {
            id: row.id,
            uid: row.uid,
            t20: t20,
            who: this.$store.getters['auth0/logName']
          })
            .then(() => {
              this.$buefy.toast.open('Bank is verified and the user has been emailed!')
              const index = this.queue.findIndex(x => x.id === row.id)
              this.queue.splice(index, 1)
              this.processing = false
            })
            .catch((err) => {
              this.processing = false
              console.log(err)
            })
        }
      })
    },
    deny (row) {
      if (this.processing) {
        return
      }
      this.processing = true
      this.sendEmail({
        noreply: false,
        email: row.email,
        subject: 'Bank account verification',
        body: `Hi ${row.firstName},

Thanks for sending through your bank verification document :)

Unfortunately, the document you provided doesn't clearly show the necessary information for us to verify your bank account. To successfully verify your account, please ensure your document includes:

- Your full name as it appears on your government-issued ID 
- Your full bank account number
- A clear date that the document was issued (this must be within the last 12 months)

Please ensure the information is easily readable.

Any questions please let one of our team know.`
      })
        .then(() => {
          return this.apiv2('admin', 'denyBank', {
            id: row.id,
            uid: row.uid,
            who: this.$store.getters['auth0/logName']
          })
        })
        .then(() => {
          const index = this.queue.findIndex(x => x.id === row.id)
          this.queue.splice(index, 1)
          this.processing = false
        })
        .catch(() => {
          this.processing = false
        })
    },
    async loadQueue () {
      this.row = null
      this.processing = true
      try {
        const data = await this.ecApi('admin', 'getBankQueue')
        this.queue = data.queue
      } catch (e) {
        console.log(e)
      }
      this.processing = false
    },
    formatAccount (row) {
      let result = row.account
      if (row.suffix || row.suffix === 0) {
        result += '-' + row.suffix.toString().padStart(2, '0')
      }
      return result
    },
    editAccount (row) {
      this.$buefy.dialog.prompt({
        title: 'Edit account number',
        message: 'What is the correct account number?',
        inputAttrs: {
          value: this.formatAccount(row)
        },
        onConfirm: async (value) => {
          try {
            await this.apiv2('admin', 'editBankAccount', {
              id: row.id,
              account: value
            })
            this.$buefy.toast.open('Account number updated')
            const queueItem = this.queue[this.queue.findIndex(x => x.id === row.id)]
            queueItem.account = value
            queueItem.suffix = null // so that it will display in the correct format. This won't affect the verification
          } catch (e) {
            console.log(e)
          }
        }
      })
    },
    verify () {
      let tier = (this.user.hasOwnProperty('forTier')) ? this.user.forTier : 20
      this.saveOdata()
      this.user.birthday = this.$moment(this.birthday, 'DD-MM-YYYY').format('YYYY-MM-DD') // birthday back to ISO format
      this.$buefy.dialog.confirm({
        message: 'Are you sure you want to verify ' + this.user.firstName + ' ' + this.user.lastName + '?',
        onConfirm: () => {
          this.ecApi('admin', 'manuallyVerify', {
            uid: this.user.uid,
            type: this.type,
            userdata: this.user,
            tier: tier
          })
            .then(() => {
              this.$buefy.toast.open('Account is verified and the user has been emailed!')
              this.loadQueue()
            })
            .catch(err => console.log(err))
        }
      })
    }
  }
}
</script>

<style scoped>
  pre {
    font-family: Lato, sans-serif;
  }

  .no-break {
    word-break: keep-all;
    white-space: nowrap;
  }

  .id-photo {
    max-width: 400px;
    max-height: 400px;
  }
</style>
