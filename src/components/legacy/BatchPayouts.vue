<template>
  <div>
    <section class="section">
      <div class="block content">
        <h1>Batch payouts</h1>
      </div>
      <div
        class="block"
        style="position:relative"
      >
        <b-loading
          :is-full-page="false"
          :active="loading && !info"
        />
        <div
          v-if="info"
          class="content is-size-5"
        >
          <p>
            {{ info.count }} payments in the next batch<br>
            {{ currency(info.total, 2) }} in total
          </p>
        </div>
      </div>
      <div class="block">
        <template v-if="!loaded">
          <div class="field">
            <b-button
              type="is-primary"
              :loading="loading"
              @click="getBatch"
            >
              Generate batch payment file
            </b-button>
          </div>
          <div
            v-if="!loading"
            class="field"
          >
            <p>
              <span class="icon"><i class="fa fa-exclamation-triangle has-text-danger" /></span>
              Please only click the Generate button if you're planning to download the generated file and upload to Kiwibank.
            </p>
          </div>
        </template>
        <div
          v-if="csv"
          class="field"
        >
          <a
            class="button is-success"
            :href="downloadLink.href"
            :download="downloadLink.download"
          >
            <span class="icon"><i class="fa fa-download" /></span>
            <span>Download this batch payout</span>
          </a>
        </div>
        <p v-if="loaded && !batch.length">
          Nothing to pay! 😊
        </p>
      </div>
      <table
        v-if="batch.length"
        class="table"
      >
        <thead>
          <tr>
            <th
              v-for="(key, i) in Object.keys(batch[0])"
              :key="'th'+i"
            >
              {{ key }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in batch"
            :key="i+'row'"
          >
            <td
              v-for="(value, j) in Object.values(row)"
              :key="i+j+'value'"
            >
              {{ value }}
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-if="csv"
        class="block"
      >
        <pre>{{ csv }}</pre>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'BatchPayouts',
  data () {
    return {
      batch: [],
      info: null,
      loading: false,
      loaded: false
    }
  },
  computed: {
    csv () {
      if (!this.batch.length) {
        return null
      }
      /*
      This is NOT actually a CSV as there is not a consistent number
      of fields per row

      Sample format:

      1,,,,3890190616690000,7,200813,200813,
      2,0306260816407000,50,25077,Majorie Nikora,,,,,EC Group Lim,,,
      2,0604590107565003,50,23233,Baz Wood,,,,,EC Group Lim,,,

       */
      let csv = []

      const safeString = function (text, defaultText = '') {
        return text ? text.replace(/[^a-zA-Z0-9 -]/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase() : defaultText
      }

      // Add the header
      const header = [
        1, // Record type
        null, // Auth code
        null, // Batch number
        null, // Batch sequence number
        '3890190616690001', // Account number
        7, // Batch type
        this.$moment().format('YYMMDD'), // Batch due date
        this.$moment().format('YYMMDD'), // File date
        null // Indicator
      ]
      csv.push(header.join(','))

      // Add the transactions
      let total = 0
      let count = 0
      let hash = 0
      for (let row of this.batch) {
        // Validate the bank account
        if (!row.bank1) {
          continue
        }
        row.bank1 = row.bank1.trim()
        if (row.bank1.match(/[^\d-]/)) {
          continue
        } // invalid bank account
        if (row.bank1 === '00-0000-0000000-00') {
          continue
        } // internal order
        let parts = row.bank1.split('-')
        if (parts.length !== 4) {
          continue
        }

        // Increment the hash total
        hash += parseInt(parts[1] + '' + parts[2])

        // Convert the bank account to the right format
        parts[3] = parts[3].padStart(3, '0') // pad the suffix to be 3 characters long
        const account = parts.join('')
        // Set the payee name
        let name = safeString(row.bank2, 'TRANSFER')
        name = name.slice(0, 20)
        const orderId = safeString(row.orderId)
        // Amount
        const amount = Math.floor(parseFloat(row.amount) * 100)
        if (isNaN(amount)) {
          continue
        }
        total += amount
        count++

        let transaction = [
          2, // Record type
          account, // Account number
          50, // Tran code
          amount, // Amount
          name, // Other party name
          null, // Other party reference
          null, // Other party code
          null, // Other party Alpha Ref
          orderId, // Other party particulars
          'EC GROUP', // This party name
          null, // This party code
          null, // This party reference
          orderId || 'EC GROUP' // This party particulars
        ]
        csv.push(transaction.join(','))
      }

      // Add the footer
      const len = 11
      hash = hash.toString()
      if (hash.length > len) {
        hash = hash.substr(hash.length - len, len)
      }
      if (hash.length < len) {
        hash = hash.padStart(len, '0')
      }
      const footer = [
        3, // Record type
        total, // Transaction amount (total)
        count, // Transaction count
        hash // Hash total
      ]
      csv.push(footer.join(','))

      return csv.join('\n') + '\n'
    },
    downloadLink () {
      return {
        href: 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.csv),
        download: 'kiwibank-payout-' + this.$moment().format('YYYYMMDD-HHmmss') + '.KBB'
      }
    }
  },
  async mounted () {
    await this.getInfo()
  },
  methods: {
    async getInfo () {
      this.loading = true
      try {
        this.info = await this.pdbApi('/pdb/eca/outstanding-payout-info', {}, true, 'GET')
      } catch (e) {
        console.log(e)
      }
      this.loading = false
    },
    async getBatch () {
      if (this.loading) {
        return
      }
      this.loading = true
      try {
        let res = await this.pdbApi('/pdb/eca/payments-to-make', {}, true, 'GET')
        if (Array.isArray(res)) {
          this.batch = res
          this.loaded = true
        }
      } catch (e) {
        console.log(e)
      }
      this.loading = false
    }
  }
}
</script>
