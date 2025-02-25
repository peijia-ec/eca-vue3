<template>
  <section>
    <b-collapse
      class="card"
      animation="slide"
      v-for="(row, i) in Object.keys(userFields)"
      :key="i"
      @updated="userInfo"
      :open="row === 'general'"
    >
      <template #trigger="card">
        <div
          class="card-header"
          role="button"
        >
          <p class="card-header-title">
            {{ userFields[row].title }}
          </p>
          <a class="card-header-icon">
            <b-icon
              :icon="card.open ? 'chevron-up' : 'chevron-down'"
            />
          </a>
        </div>
      </template>
      <div class="card-content">
        <table class="table">
          <tr
            v-for="(item) in Object.keys(userFields[row].items)"
            :key="item"
          >
            <td style="width: 30%">
              {{ userFields[row].items[item] }}
            </td>
            <td style="width: 10%">
              <b-tooltip
                v-if="helpHints[item]"
                :label="helpHints[item]"
                multilined
              >
                <i class="fa fa-question-circle-o cursor" />
              </b-tooltip>
            </td>
            <td
              class="break-all"
              style="width: 50%"
            >
              <pre
                v-if="item === 'sellLimitsRemoved'"
                class="clean is-size-7"
              >Yes</pre>
              <pre
                v-if="item === 'w2aTestGroup'"
                class="clean is-size-7"
              >{{ userW2AGroup || 'N/A' }}</pre>
              <div
                v-if="item === 'bankAccount'"
                class="clean is-size-7"
              >
                <div
                  v-for="(acc, index) in userInfo[item]"
                  :key="index"
                >
                  {{ acc.displayNumber }}
                </div>
              </div>
              <pre
                v-else-if="item === 'susText'"
                class="clean is-size-7"
              >{{ userInfo[item] }}</pre>
              <div v-else-if="item === 'abTestGroup'">
                <p
                  v-for="group in abTestGroups"
                  :key="group.title"
                >
                  {{ group.title }}
                  <span>{{ group.enabled ? 'Yes' : 'No' }}</span>
                </p>
              </div>
              <clipboard
                v-else
                :icon="false"
              >
                {{ userInfo[item] }}
                <span v-if="item === 'birthday'">(age {{ $moment().diff(userInfo[item], 'years') }})</span>
              </clipboard>
            </td>
            <td>
              <i
                v-if="editable.indexOf(item) !== -1"
                class="fa fa-pencil cursor"
                @click="edit(item)"
              />
            </td>
          </tr>
        </table>
      </div>
    </b-collapse>

    <!-- Tier modal -->
    <b-modal :active.sync="verificationModal">
      <button
        class="button"
        @click="manuallyVerify(0)"
      >
        Remove verification
      </button>
      <button
        class="button"
        @click="manuallyVerify(10)"
      >
        Set as Tier 10
      </button>
      <button
        class="button"
        @click="manuallyVerify(20)"
      >
        Set as Tier 20
      </button>
      <button
        class="button"
        @click="manuallyVerify(30)"
      >
        Set as Tier 30
      </button>
      <button
        class="button"
        @click="manuallyVerify(40)"
      >
        Set as Tier 40
      </button>
    </b-modal>

    <!-- Gender modal -->
    <b-modal :active.sync="editGender">
      <button
        class="button"
        @click="changeGender('male')"
      >
        Male
      </button>
      <button
        class="button"
        @click="changeGender('female')"
      >
        Female
      </button>
      <button
        class="button"
        @click="changeGender('unknown')"
      >
        Unknown
      </button>
    </b-modal>

    <!-- Address modal -->
    <b-modal :active.sync="editAddress">
      <EditUserAddress
        @update="updateAddress"
        :address-data="userData.verification === null ? userAddress : userData.verification"
        :uid="userData.user.uid"
      />
    </b-modal>

    <!-- Edit bank account modal -->
    <b-modal
      :active.sync="editBankAccounts"
    >
      <EditUserBankAccount
        @update="updateBankField"
        :bank-data="userData.user.bankAccount"
      />
    </b-modal>

    <!-- docType modal -->
    <b-modal :active.sync="editDoctype">
      <button
        class="button"
        @click="changeDoctype('Passport')"
      >
        Passport
      </button>
      <button
        class="button"
        @click="changeDoctype('Drivers Licence')"
      >
        Drivers Licence
      </button>
      <button
        class="button"
        @click="changeDoctype('null')"
      >
        None
      </button>
    </b-modal>
  </section>
</template>

<script>
import Clipboard from '../../parts/Clipboard.vue'
import EditUserAddress from '../../parts/user/EditUserAddress.vue'
import EditUserBankAccount from '../../parts/user/EditUserBankAccount.vue'
import userMixin from './userMixin'

export default {
  name: 'UserSummary',
  components: {
    Clipboard,
    EditUserAddress,
    EditUserBankAccount
  },
  mixins: [userMixin],
  props: {
    userData: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      userW2AGroup: null,
      editGender: false,
      editAddress: false,
      verificationModal: false,
      editBankAccounts: false,
      editDoctype: false,
      editable: [
        'bankName',
        'tier',
        'adminOverride',
        'overrideSid',
        'firstName',
        'lastName',
        'referral_id',
        'birthday',
        'verifiedFirst',
        'verifiedLast',
        'phone',
        'gender',
        'bankAccount',
        'address',
        'postcode',
        'suburb',
        'city',
        'address1',
        'address2',
        'address3',
        'linkedEmail',
        'customMargin',
        'docType',
        'country'
      ],
      helpHints: {
        uid: 'User Identifier, we use this number for identifying the customer without using their name in verification and in communications across the team.',
        twoFactor: 'Shows whether the customer has two factor authentication enabled.',
        displayName: 'This is a combination of Preferred First Name and Preferred Last Name.',
        firstName: 'Edit this field to how the customer refers to themselves. E.g. Christopher signs off as Chris, change it.',
        lastName: 'Edit this field to how the customer refers to themselves. E.g. Christopher signs off as Chris, change it.',
        verifiedFirst: 'Verified first name based on ID verification.',
        verifiedLast: 'Verified last name based on ID verification.',
        tier: 'Level of verification completed: \n T10 - ID only \n T20 - ID and Address \n T30 - ID, Address and Source of funds / crypto or Privacy Coins.',
        loginProvider: 'How the customer logs in to their account.',
        created: 'The date the account was first created.',
        verifiedDate: 'The date the account was verified.',
        showNetworks: 'Shows if a customer has enabled all networks for delivery',
        totalBuy: 'Total amount purchased from Easy Crypto (in the local fiat currency).',
        totalSell: 'Total amount sold to Easy Crypto (in the local fiat currency).',
        availableBuy: 'Total amount left on buy limits (in the local fiat currency).',
        availableSell: 'Total amount left on sell limits (in the local fiat currency).',
        sus: 'A system analysis of their profile and activity and the risk',
        susText: 'Information about how the SUS Score is calculated',
        bankName: 'Verified name used to match against order payments.',
        verificationMethod: 'Shows the verification method used at onboarding.',
        idNumber: 'Shows the number for the identity document used during verification.',
        docType: 'Document type for user\'s verification',
        w2aTestGroup: 'A1 = has EC wallet, control (50%), B1 = has EC wallet, treatment (50%), A0 = no EC wallet, control (80%), B0 = no EC wallet, treatment (20%)',
        sellLimitsRemoved: 'Sell limits removed as per Jira ticket CI-953',
        accountType: '1 = Individual, 2 = Company, 3 = Hybrid, 4 = Sole Trader',
        linkedEmail: 'This field is for storing emails related to private relay or hidden emails. Ensure that you have obtained customer consent before adding an email here.',
        verificationSource: 'This field indicates the source the user took to complete the verification process. Possible values: Web Browser, Mobile Browser, EC Wallet App (iOS/Android).'
      },
      userFields: {
        general: {
          title: 'General',
          items: {
            uid: 'Unique Identifier',
            birthday: 'Birthday',
            tier: 'Account level',
            email: 'Email',
            linkedEmail: 'Linked Email',
            // displayName: 'Preferred name',
            firstName: 'Preferred first name',
            lastName: 'Preferred last name',
            verifiedFirst: 'Verified first name',
            verifiedLast: 'Verified last name',
            twoFactor: '2FA',
            loginProvider: 'Registration Method',
            created: 'Account creation date',
            gender: 'Gender',
            showNetworks: 'Enabled all networks',
            w2aTestGroup: 'W2A Test group',
            sellLimitsRemoved: 'Sell Limits Removed'
          }
        },
        compliance: {
          title: 'Compliance',
          items: {
            sus: 'SUS score',
            susText: 'SUS summary',
            bankName: 'Bank name',
            verificationMethod: 'Verification method',
            verifiedDate: 'Verified Date',
            verificationSource: 'Verification Source',
            idNumber: 'ID number',
            docType: 'DocType',
            holdTilReceived: 'Hold til received',
            fraud: 'Fraud',
            suspicious: 'Suspicious',
            ban_reason: 'Ban reason',
            complianceReview: 'Compliance review',
            credit_check: 'Credit check',
          }
        },
        financial: {
          title: 'Financial',
          items: {
            totalBuy: 'Amount purchased',
            totalSell: 'Amount sold',
            availableBuy: 'Remaining buy amount',
            availableSell: 'Remaining sell amount',
            calculatedLimit: 'Calculated limit',
            customLimit: 'Custom limit',
            customMargin: 'Custom margin',
            bankAccount: 'Bank account(s)'
          }
        },
        contact: {
          title: 'Contact',
          items: {
            phone: 'Phone number',
            address: 'Address',
            suburb: 'Suburb',
            postcode: 'Postcode',
            city: 'City',
            country: 'Country',
          }
        },
        other: {
          title: 'Other',
          items: {
            id: 'Affiliate ID',
            abTestGroup: 'AB Test Groups',
            acceptPrivacy: 'Accepted privacy',
            acceptTerms: 'Accepted terms',
            accountType: 'Account Type',
            companyAccount: 'Company Account',
            adminOverride: 'Admin override',
            affPercent: 'affPercent',
            alternate_emails: 'Alternate emails',
            apisUpdated: 'apisUpdated',
            banner: 'Banner',
            address2: 'Complement',
            dripId: 'Drip ID',
            ecWallet: 'EC wallet',
            foreign: 'Foreign',
            freshDeskId: 'freshDeskId',
            helpScoutId: 'helpScoutId',
            howHear: 'howHear',
            ignore_ip: 'Ignore IP',
            label: 'label',
            lastLogin: 'Last login',
            lbc: 'LBC User',
            level: 'Level',
            notes: 'Notes',
            overrideDevice: 'overrideDevice',
            overrideSid: 'overrideSid',
            pah: 'pah',
            passwordLastUpdated: 'passwordLastUpdated',
            portfolio_value: 'Portfolio value',
            portfolio_updated: 'Portfolio Updated',
            purpose: 'Purpose',
            purposeOther: 'purposeOther',
            referral_id: 'Referred by',
            riskType: 'Risk level',
            region: 'region',
            sanctionsMatch: 'sanctionsMatch',
            scamTest: 'scamTest',
            sid: 'sid',
            address3: 'State',
            stitch_bank_info: 'Stitch bank info',
            stitch_refresh_token: 'Stitch refresh token',
            tierSell: 'tierSell',
            trading_limit: 'Trading limit',
            address1: 'Unit No, / House No.',
            updated_at: 'Updated at',
            verifyFirstTime: 'verifyFirstTime'
          }
        }
      },
      userAddress: {
        //if user is not verified verification data is null
        //create empty object to send to editAddress component
        address: '',
        postcode: '',
        city: '',
        suburb: '',
        address1: '',
        address2: '',
        address3: '',
      }
    }
  },
  async created () {
    const res = await this.getUserW2AGroup(this.userData.user.uid)
    this.userW2AGroup = res && res.test_group
  },
  computed: {
    userInfo() {
      const verificationData = this.userData.verification || {}
      const combinedData = Object.assign({}, this.userData.user)

      const verificationFields = ['gender', 'address', 'postcode', 'city', 'country', 'address1', 'address2', 'address3', 'suburb', 'docType']
      for (const field of verificationFields) {
        if (verificationData.hasOwnProperty(field)) {
          combinedData[field] = verificationData[field]
        }
      }
      return combinedData
    },
    abTestGroups () {
      const groups = []
      // PTR Group
      const res = this.ptrUserGroup(this.userData.user.id)
      if (res) {
        groups.push({title: 'PTR Group (original) - ', enabled: res})
      } else {
        groups.push({title: 'PTR Group (expand) - ', enabled: 1})
      }
      return groups
    }
  },
  methods: {
    //update all inputattrs
    edit (field) {
      let current, text = ''
      let uid = this.userData.user.uid
      switch (field) {
      case 'tier':
        this.verificationModal = true
        break
      case 'gender' :
        this.editGender = true
        break
      case 'docType' :
        this.editDoctype = true
        break
      case 'bankName':
        this.$buefy.dialog.prompt({
          message: 'What do you want the bank name to be? This will be the value that the deposit needs to match.',
          inputAttrs: {
            value: this.userData.user[field]
          },
          onConfirm: (value) => {
            this.ecApi('admin', 'setValue', {
              uid: uid,
              table: 'user',
              column: 'bankName',
              value: value
            })
              .then(() => {
                this.$buefy.toast.open('Done!')
                this.$emit('updated')
              })
          }
        })
        break
      case 'address':
      case 'postcode':
      case 'city':
      case 'suburb':
      case 'address1':
      case 'address2':
      case 'address3':
      case 'country':
        this.editAddress = true
        break
      case 'firstName':
      case 'lastName':
      case 'verifiedLast':
      case 'verifiedFirst':
        this.$buefy.dialog.prompt({
          message: `Enter ${field}`,
          inputAttrs: {
            value: this.userData.user[field],
            maxlength: 40
          },
          onConfirm: (value) => {
            this.ecApi('admin', 'setValue', {
              uid: this.userData.user.uid,
              table: 'user',
              column: field,
              value: value
            },
            )
              .then(() => {
                this.$buefy.toast.open('Done!')
                this.$emit('updated')
              })
          }
        })
        break
      case 'referral_id':
      case 'phone':
      case 'birthday':
        let placeholder = null
        if (field === 'birthday') {
          placeholder = 'YYYY-MM-DD'
        }
        this.$buefy.dialog.prompt({
          message: `Enter ${field}`,
          inputAttrs: {
            value: this.userData.user[field],
            placeholder: placeholder,
            maxlength: 20
          },
          onConfirm: (value) => {
            this.ecApi('admin', 'setValue', {
              uid: uid,
              table: 'user',
              column: field,
              value: value
            })
              .then(() => {
                this.$buefy.toast.open('Done!')
                this.$emit('updated')
              })
          }
        })
        break
      case 'adminOverride':
        current = this.userData.user.adminOverride
        text = current ? 'OFF' : 'ON'
        this.$buefy.dialog.confirm({
          message: 'When the admin override is turned <b>on</b>, a user will never be marked as suspicious automatically. You can still mark a user suspicious manually.<br><br>Are you sure you want to turn <b>' + text + '</b> the admin override?',
          onConfirm: () => {
            this.ecApi('admin', 'setValue', {
              uid: uid,
              table: 'user',
              column: 'adminOverride',
              value: (current) ? 0 : 1
            })
              .then(() => {
                this.$buefy.toast.open('Admin override turned ' + text)
                this.$emit('updated')
              })
          }
        })
        break
      case 'overrideSid':
        current = this.userData.user.overrideSid
        text = current ? 'OFF' : 'ON'
        this.$buefy.dialog.confirm({
          message: 'When the SID override is turned <b>on</b>, this specific account will not be automatically marked as suspicious if it shares an SID.<br><br>Are you sure you want to turn <b>' + text + '</b> the SID override?',
          onConfirm: () => {
            this.ecApi('admin', 'setValue', {
              uid: uid,
              table: 'user',
              column: 'overrideSid',
              value: (current) ? 0 : 1
            })
              .then(() => {
                this.$buefy.toast.open('SID override turned ' + text)
                this.$emit('updated')
              })
          }
        })
        break
      case 'bankAccount':
        this.editBankAccounts = true
        break
      case 'linkedEmail':
        this.$buefy.dialog.prompt({
          message: 'Enter Email (private relay/hidden email)',
          inputAttrs: {
            value: this.userData.user[field]
          },
          onConfirm: (value) => {
            this.ecApi('admin', 'setValue', {
              uid: uid,
              table: 'user',
              column: 'linkedEmail',
              value: value
            })
              .then(() => {
                this.apiv2('admin', 'complianceLog', {
                  uid: uid,
                  what: 'Updated linked email',
                  who: this.$store.getters['goauth/logName'],
                  why: this.userData.user[field] ? `Updated linked email. \n Original: ${this.userData.user[field]} \n New: ${value}` : `Added linked email ${value}`,
                })
              })
              .then(() => {
                this.$buefy.toast.open('Done!')
                this.$emit('updated')
              })
          }
        })
        break
      case 'customMargin':
        if (this.hasAccess(this.$roles.Admin)) {
          this.$buefy.dialog.prompt({
            title: 'Enter custom margin',
            message: 'Enter the custom margin for this user ie 0.79',
            inputAttrs: {
              type: 'number',
              value: this.userData.user[field],
              min: 0.45,
              max: 2.0,
              step: 0.01
            },
            onConfirm: (value) => {
              this.ecApi('admin', 'setValue', {
                uid: uid,
                table: 'user',
                column: 'customMargin',
                value: value
              })
                .then(() => {
                  this.apiv2('admin', 'complianceLog', {
                    uid: uid,
                    what: 'Updated custom margin',
                    who: this.$store.getters['goauth/logName'],
                    why: `Custom margin has been changed from ${this.userData.user[field]} to ${value}`
                  })
                })
                .then(() => {
                  this.$buefy.toast.open('Done!')
                  this.$emit('updated')
                })
            }
          })
        } else {
          this.$buefy.dialog.alert('Editing custom margin admin access')
        }
      }
    },
    manuallyVerify (tier) {
      this.verificationModal = false
      this.$buefy.dialog.confirm({
        message: 'Are you sure you want to verify ' + this.userData.user.displayName + ' as Tier ' + tier + '?',
        onConfirm: () => {
          this.apiv2('admin', 'manuallyVerify', {
            uid: this.userData.user.uid,
            tier: tier,
            sendEmail: false
          })
            .then((res) => {
              this.$buefy.toast.open('Verified')
              this.$emit('updated')
              this.$emit('getLimitsData')
            })
        }
      })
    },
    async changeGender (gender) {
      this.editGender = false
      try {
        await this.ecApi('admin', 'setValue', {
          uid: this.userData.user.uid,
          table: 'user',
          column: 'gender',
          value: gender
        })
        this.$buefy.toast.open('Done!')
        this.$emit('updated')
      } catch (e) {
        console.log(e)
      }
    },
    async changeDoctype (docType) {
      this.editDoctype = false
      try {
        await this.ecApi('admin', 'setValue', {
          uid: this.userData.user.uid,
          table: 'verification',
          docType: docType
        })
        this.$buefy.toast.open('Done!')
        this.$emit('updated')
      } catch (e) {
        console.log(e)
      }
    },
    updateAddress () {
      this.editAddress = false
      this.$emit('updated')
    },
    updateBankField () {
      this.editBankAccounts = false
      this.$emit('updated')
    }
  }
}
</script>

<style scoped>
.cursor {
  cursor: pointer;
}

.break-all {
  word-break: break-all;
}

.b-tooltip.is-multiline.is-medium:after {
white-space:  pre-line;
}
</style>
