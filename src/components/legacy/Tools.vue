<template>
  <div>
    <b-loading
      :is-full-page="true"
      :active="loading"
    />
    <section class="section">
      <div class="box">
        <p>Message at top of website</p>
        <b-input
          v-model="banner"
          type="textarea"
        />
        <button
          class="button"
          @click="saveMessage"
        >
          Save banner
        </button>
      </div>
      <div
        class="field"
        @click="switcher('killBuying')"
      >
        <b-switch
          v-model="killBuying"
          :true-value="'1'"
          :false-value="'0'"
        >
          Kill all buying
        </b-switch>
      </div>
      <div
        class="field"
        @click="switcher('killSelling')"
      >
        <b-switch
          v-model="killSelling"
          :true-value="'1'"
          :false-value="'0'"
        >
          Kill all selling
        </b-switch>
      </div>
      <div
        class="field"
        @click="switcher('killTrading')"
      >
        <b-switch
          v-model="killTrading"
          :true-value="'1'"
          :false-value="'0'"
        >
          Kill ALL trading automation - like everything!
        </b-switch>
      </div>
      <div
        class="field"
        @click="switcher('holdAll')"
      >
        <b-switch
          v-model="holdAll"
          :true-value="'1'"
          :false-value="'0'"
        >
          Hold all new orders for 24 hours
        </b-switch>
      </div>
      <div
        class="field"
        @click="updateSomsAddressChange"
      >
        <b-switch v-model="somsAddressChange">
          <p>Enable SOMS address change message</p>
        </b-switch>
      </div>
    </section>
    <!--<section class="section">
      <div class="content">
        <h2>Upload bank CSV</h2>
        <div class="field"><input type="file" @change="onFileChange"></div>
        <div class="field">
          <button :disabled="!csvText" @click="uploadCsv" class="button is-success">Upload CSV</button>
        </div>
      </div>
    </section>-->
    <div class="box">
      <bank-csv-upload />
    </div>
    <section class="section">
      <div class="content">
        <h2>Notify about new coin</h2>
        <b-input v-model="newCoin" />
        <button
          class="button"
          @click="notifyNewCoin"
        >
          Tell the people!
        </button>
      </div>
    </section>
    <h1 class="title is-4">
      Make a test portfolio
    </h1>
    <p class="field">
      <textarea
        v-model="jsonText"
        class="textarea"
        placeholder="Paste JSON here..."
        rows="6"
      />
    </p>
    <b-field label="Password">
      <b-input v-model="manualPassword" />
    </b-field>
    <p class="field">
      <a
        class="button"
        @click="writePortfolio()"
      >Write test portfolio</a>
    </p>
    <section class="section content">
      <h1>Change sell order to user instead of staff</h1>
      <p>
        When you've created an order manually for a customer, you'll need to change the new sell order
        to have their bank account details and their email.
      </p>
      <div class="field">
        <b-input
          v-model="sellMine"
          placeholder="My sell order ID"
        />
      </div>
      <div class="field">
        <b-input
          v-model="sellTheirs"
          placeholder="Their original buy order"
        />
      </div>
      <pre>
UPDATE `orders` AS mine JOIN `orders` AS theirs ON theirs.orderId = '{{ sellTheirs.trim() }}'
SET    mine.uid = theirs.uid, mine.email = theirs.email, mine.bankAccount = theirs.bankAccount, mine.tier = theirs.tier
WHERE  mine.orderId = '{{ sellMine.trim() }}';
            </pre>
    </section>
    <section class="section content">
      <h1>Migrate one user account to another</h1>
      <div class="field">
        <b-input
          v-model="accountOldInput"
          placeholder="Old/bad account"
        />
      </div>
      <div class="field">
        <b-input
          v-model="accountNewInput"
          placeholder="New/good account"
        />
      </div>
      <div class="content">
        <p><a @click="copyMergeSql">Copy merge code to clipboard</a></p>
      </div>
      <pre id="user-merge-sql">
UPDATE bank_accounts SET uid='{{ accountNew }}' WHERE uid = '{{ accountOld }}';

UPDATE bank_logs SET uid='{{ accountNew }}' WHERE uid = '{{ accountOld }}';

UPDATE logins SET uid='{{ accountNew }}' WHERE uid = '{{ accountOld }}';

UPDATE orders SET uid='{{ accountNew }}' WHERE uid = '{{ accountOld }}';

UPDATE suspect_logs SET uid='{{ accountNew }}' WHERE uid = '{{ accountOld }}';

UPDATE verification SET uid='{{ accountNew }}' WHERE uid = '{{ accountOld }}';

UPDATE verifications SET uid='{{ accountNew }}' WHERE uid = '{{ accountOld }}';

UPDATE verification_queue SET uid='{{ accountNew }}' WHERE uid = '{{ accountOld }}';

UPDATE verification_tokens SET uid='{{ accountNew }}' WHERE uid = '{{ accountOld }}';

UPDATE addresses SET uid='{{ accountNew }}' WHERE uid = '{{ accountOld }}';

UPDATE autopayments SET uid='{{ accountNew }}' WHERE uid = '{{ accountOld }}';

UPDATE portfolio SET users_id = (SELECT id FROM users WHERE uid = '{{ accountNew }}') WHERE users_id = (SELECT id FROM users WHERE uid = '{{ accountOld }}');

UPDATE verifiedCrypto SET users_id = (SELECT id FROM users WHERE uid = '{{ accountNew }}') WHERE users_id = (SELECT id FROM users WHERE uid = '{{ accountOld }}');

UPDATE verifiedComputed SET users_id = (SELECT id FROM users WHERE uid = '{{ accountNew }}') WHERE users_id = (SELECT id FROM users WHERE uid = '{{ accountOld }}');

UPDATE limits SET users_id = (SELECT id FROM users WHERE uid = '{{ accountNew }}') WHERE users_id = (SELECT id FROM users WHERE uid = '{{ accountOld }}');

UPDATE verifiedUsers SET users_id = (SELECT id FROM users WHERE uid = '{{ accountNew }}') WHERE users_id = (SELECT id FROM users WHERE uid = '{{ accountOld }}');

UPDATE users AS target LEFT JOIN users AS source ON source.uid = '{{ accountOld }}'
  SET {{ userMigrationFields }}
  WHERE target.uid = '{{ accountNew }}';

UPDATE users SET tier = 0, fraud = 1 WHERE uid = '{{ accountOld }}';
DELETE FROM verifiedUsers WHERE users_id = (SELECT id FROM users WHERE uid = '{{ accountOld }}');

INSERT INTO suspect_logs (date, uid, what, why, who) VALUES (NOW(), '{{ accountNew }}', 'Account migration', 'Migrated from UID {{ accountOld }} to UID {{ accountNew }}', '{{ $store.getters['goauth/logName'] }}');
INSERT INTO suspect_logs (date, uid, what, why, who) VALUES (NOW(), '{{ accountOld }}', 'Account migration', 'Migrated from UID {{ accountOld }} to UID {{ accountNew }}', '{{ $store.getters['goauth/logName'] }}');
            </pre>
    </section>
  </div>
</template>

<script>
import BankCsvUpload from './parts/BankCsvUpload.vue'

export default {
  name: 'Test',
  components: { BankCsvUpload},
  data () {
    return {
      admin: {
        first: '',
        last: '',
        email: '',
        password: ''
      },
      loading: false,
      manualPassword: 'password',
      manualId: '',
      jsonText: '',
      pathId: null,
      pathText: '',
      symbol: 'XRP',
      nzd: 300,
      percent: 1.0,
      initial: 0.0,
      ratePath: '',
      rateText: null,
      rateText2: null,
      banner: null,
      killBuying: '0',
      killSelling: '0',
      killTrading: '0',
      holdAll: '0',
      newCoin: null,
      accountOldInput: '',
      accountNewInput: '',
      sellMine: '',
      sellTheirs: '',
      csvText: false,
      buyLastRow: null,
      sellLastRow: null,
      somsAddressChange: false
    }
  },
  computed: {
    userMigrationFields () {
      let fields = ['created', 'tier', 'phone', 'bankName', 'bankAccount', 'verifiedFirst', 'verifiedLast', 'birthday', 'idNumber', 'pah', 'suspicious', 'fraud', 'totalBuy', 'totalSell', 'holdTilReceived']
      fields = fields.map(x => `target.${x} = source.${x}`)
      fields = fields.join(', ')
      // Only update the name fields if the target fields are NULL
      fields += ', target.firstName = COALESCE(target.firstName, source.firstName), target.lastName = COALESCE(target.lastName, source.lastName), target.displayName = COALESCE(target.displayName, source.displayName)'
      return fields
    },
    accountNew () {
      return this.accountNewInput.trim()
    },
    accountOld () {
      return this.accountOldInput.trim()
    }
  },
  mounted () {
    this.loadInfo()
  },
  methods: {
    loadInfo () {
      this.loading = true
      this.ecApi('admin', 'getInfo')
        .then((data) => {
          this.info = data
          this.killBuying = data.killBuying
          this.killSelling = data.killSelling
          this.killTrading = data.killTrading
          this.banner = data.banner
          this.loading = false
        })
        .catch(err => console.log(err))
      this.apiv2('api-admin/index', 'info/getSomsAddressChange')
        .then(data => {
          this.somsAddressChange = data.display
        })
        .catch(err => console.log(err))
    },
    saveMessage () {
      this.loading = true
      this.ecApi('admin', 'setValue', {
        table: 'info',
        field: 'banner',
        value: this.banner
      })
        .then(() => {
          this.$buefy.toast.open('Banner is set!')
          this.loading = false
        })
    },
    switcher (f) {
      let val = (this[f] === '0') ? '1' : '0'
      let data = {}
      data[f] = val
      this.ecApi('admin', f, data)
        .then(() => {
          this.loadInfo()
        })
        .catch(err => console.log(err))
    },
    notifyNewCoin () {
      this.apiv2('admin', 'newCoin', {
        coin: this.newCoin
      })
        .then(() => {
          this.newCoin = null
          this.$buefy.toast.open('It\'s done!!')
        })
        .catch(e => console.error(e))
    },
    manualQueue () {
      let id = this.manualId.replace(/\W/g, '')
      if (id.length !== 6 && id.length !== 7) {
        return
      }
      this.$db.ref('admin/orders/manual').push(id)
      this.$buefy.toast.open('Order marked as paid')
    },
    findRate () {
      let standard = this.findRates(this.symbol, this.nzd, 0.01, 0)
      let newRate = this.findRates(this.symbol, this.nzd, this.percent / 100, this.initial / 100)

      let currency = new Intl.NumberFormat('en-NZ', {
        style: 'decimal',
        useGrouping: true,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })

      this.rateText = '$' + currency.format(this.nzd / standard[0].amount)
      this.rateText2 = '$' + currency.format(this.nzd / newRate[0].amount)
      this.ratePath = standard[0].path
    },
    getPath () {
      if (!this.pathId.length) {
        return
      }

      this.$db.ref('admin/orders/completed/' + this.pathId.toUpperCase().trim()).once('value')
        .then((snapshot) => {
          let order = snapshot.val()
          if (!order) {
            return
          }

          let all = ''

          for (let symbol in order.coins) {
            if (!order.coins.hasOwnProperty(symbol)) {
              continue
            }

            let text = ''
            let steps = order.coins[symbol].result
            for (let i = 0; i < steps.length; i++) {
              let step = steps[i]
              if (step.type === 'exchange') {
                text += 'Exchanged ' + this.niceNumber(step.fromAmount, 6) + ' ' + step.fromSymbol + ' to ' + this.niceNumber(step.toAmount, 6) + ' ' + step.toSymbol + ' on ' + step.toExchange + '<br>'
              } else if (step.type === 'transfer') {
                let fee = this.niceNumber(parseFloat(steps[i - 1].toAmount) - parseFloat(steps[i + 1].fromAmount))
                text += 'Transfered to ' + step.toExchange
                if (fee) {
                  text += ', with an exchange transaction fee of ' + fee
                }
                text += '<br>'
              }
            }
            let lastBalance = order.coins[symbol].result[steps.length - 1].toAmount
            let finalBalance = order.coins[symbol].finalAmount
            let withdrawFee = this.niceNumber(lastBalance - finalBalance)
            if (withdrawFee > 0) {
              text += 'Less an exchange withdraw fee of ' + withdrawFee + ' ' + steps[steps.length - 1].toSymbol
            }
            all += '<p>' + text + '</p>'
            all += '<p>Giving you a final Portfolio balance of ' + finalBalance + ' ' + symbol + '</p>'
          }
          this.pathText = all
        })
    },
    writePortfolio () {
      let data = JSON.parse(this.jsonText)
      this.createPortfolio(data, this.manualPassword)
    },
    onFileChange (e) {
      let files = e.target.files || e.dataTransfer.files
      if (!files.length) {
        return
      }
      let reader = new FileReader()
      let vm = this
      reader.onload = (e) => {
        vm.csvText = e.target.result
      }
      reader.readAsText(files[0])
    },
    /* test () {
      this.sendApi(this.$local.pdb + '/get-csv.php', {})
        .then((r) => {
          console.log(r)
        })
        .catch((r) => { console.log(r) })
    },
    uploadCsv () {
      this.sendApi(this.$local.pdb + '/csv/', {
        action: 'upload',
        csv: this.csvText
      })
        .then((r) => {
          this.$buefy.toast.open('CSV uploaded')
        })
        .catch((r) => {
          this.$buefy.toast.open({
            message: r,
            type: 'is-danger'
          })
          console.log(r)
        })
    }, */
    settleBundles () {
      this.apiv2('admin', 'markBundles', {
        buy: this.buyLastRow,
        sell: this.sellLastRow
      })
        .then(() => {
          this.$buefy.toast.open('Bundles marked as settled')
        })
    },
    copyMergeSql () {
      const el = document.getElementById('user-merge-sql')
      navigator.clipboard.writeText(el.innerText)
    },
    updateSomsAddressChange () {
      this.loading = true
      const label = this.somsAddressChange ? 'off' : 'on'
      this.apiv2('api-admin/index', 'info/toggleSomsAddressChangePopup', {
        display: !this.somsAddressChange
      })
        .then(() => {
          this.$buefy.toast.open(`SOMS address change popup is switched ${label}!`)
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
  pre {
    white-space: pre-wrap; /* Since CSS 2.1 */
    white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
    white-space: -o-pre-wrap; /* Opera 7 */
    word-wrap: break-word; /* Internet Explorer 5.5+ */
  }
</style>
