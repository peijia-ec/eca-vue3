<template>
  <table
    v-if="checks.length"
    style="width:fit-content;"
    class="is-size-5"
  >
    <tr
      v-for="(row, i) in checks"
      :key="'osummary'+i"
    >
      <td style="padding-right:1em;">
        {{ row.name }}
      </td>
      <td>
        <span class="icon"><i
          class="fa"
          :class="row.icon + ' ' + row.colour"
        /></span>
      </td>
    </tr>
  </table>
</template>

<script>
import mixins from './origin-mixin'

export default {
  name: 'OriginSummary',
  mixins: [mixins],
  computed: {
    checks () {
      if (!this.validOrigin) {
        return []
      }

      // Do flag checks
      let sumsub = true
      let origin = this.payload.details
      let pep = false
      let smartid = false
      let liveness = false
      let asf = false
      let face = false

      // Old Origin checks
      if (origin.hasOwnProperty('centrix')) {
        sumsub = false
        let results = this.payload.results
        if (origin.hasOwnProperty('face_scan')) {
          face = origin.face_scan.confidence
          liveness = origin.face_scan.liveness.result
        } else if (results.hasOwnProperty('faceMatch') || results.hasOwnProperty('liveness')) {
          face = (results.faceMatch.fraudAssessment.overall === 'PASS')
          // for main flow only
          if (this.payload.hasOwnProperty('flow') && this.payload.flow === 'MAIN') {
            liveness = results.liveness.fraudAssessment.overall === 'PASS'
          }
        }
        if (origin.centrix.hasOwnProperty('data_sets')) {
          pep = origin.centrix.data_sets.pep_watchlist.is_success && origin.centrix.data_sets.pep_watchlist.international_watchlist_is_clear
          smartid = origin.centrix.data_sets.smart_id.is_verified
        } else if (origin.centrix.hasOwnProperty('result')) {
          pep = origin.centrix.result.pep_watchlist.is_success && origin.centrix.result.pep_watchlist.international_watchlist_is_clear
          smartid = origin.centrix.result.smart_id.is_verified
        }
        if (results.hasOwnProperty('documents') && Array.isArray(results.documents)) {
          let documents = results.documents.shift()
          if (documents && documents.hasOwnProperty('fraudAssessment')) {
            asf = documents.fraudAssessment.overall === 'LOW_RISK'
          }
        } else {
          asf = origin.hasOwnProperty('card') && origin.card.asf_check.document_authenticity
        }
      }

      // New Sumsub checks
      if (origin.hasOwnProperty('Centrix') && origin.Centrix.hasOwnProperty('result')) {
        pep = origin.Centrix.result.pep_watchlist.is_success && origin.Centrix.result.pep_watchlist.international_watchlist_is_clear
        smartid = origin.Centrix.result.smart_id.is_verified
      }

      let passIcon = 'fa-check'
      let failIcon = 'fa-times'
      let passCol = 'has-text-success'
      let failCol = 'has-text-danger'
      let checks = []
      let checkPush = (name, value) => {
        if (value) {
          checks.push({
            name: name,
            icon: passIcon,
            colour: passCol
          })
        } else {
          checks.push({
            name: name,
            icon: failIcon,
            colour: failCol
          })
        }
      }
      checkPush('PEP', pep)
      checkPush('Smart ID', smartid)
      if (!sumsub) {
        // Old Origin checks
        checkPush('Face', face)
        checkPush('Liveness', liveness)
        checkPush('ASF', asf)
      }
      return checks
    }
  }
}
</script>
