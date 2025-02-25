<template>
  <div v-if="matrix.length">
    <table class="table is-size-6 is-size-7-mobile">
      <thead>
        <tr>
          <th>Src</th>
          <th>Name</th>
          <th>DOB</th>
          <th>Addr</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in matrix"
          :key="'matrix'+i"
        >
          <td>{{ ($root.mobile) ? row.abbreviation : row.source }}</td>
          <td>
            <i
              v-if="row.name"
              class="fa"
              :class="row.name.icon + ' ' + row.name.colour"
              :title="row.name.text"
            />
          </td>
          <td>
            <i
              v-if="row.dob"
              class="fa"
              :class="row.dob.icon + ' ' + row.dob.colour"
              :title="row.dob.text"
            />
          </td>
          <td>
            <i
              v-if="row.address"
              class="fa"
              :class="row.address.icon + ' ' + row.address.colour"
              :title="row.address.text"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import mixins from './origin-mixin'

export default {
  name: 'OriginDetail',
  mixins: [mixins],
  computed: {
    matrix () {
      if (!this.validOrigin) {
        return []
      }

      // Create verification matrix
      let icons = {
        Match: {
          icon: 'fa-check',
          colour: 'has-text-success',
          text: 'Match'
        },
        NA: {
          icon: 'fa-ban',
          colour: 'has-text-warning',
          text: 'NA'
        },
        NoMatch: {
          icon: 'fa-times',
          colour: 'has-text-danger',
          text: 'No match'
        },
        NotPresent: {
          icon: 'fa-question',
          colour: 'has-text-warning',
          text: 'Not present'
        },
        NotSearched: {
          icon: 'fa-ban',
          colour: 'has-text-grey-lighter',
          text: 'Not searched'
        }
      }

      // Data sources
      let sources = {
        ComprehensiveAccount: 'COMP',
        RetailEnergyAccount: 'NRGY',
        NZPropertyOwner: 'PROP',
        NZTADriverLicence: 'NZTA',
        DIAPassport: 'DIA'
      }

      let array = []
      if (this.payload.details.hasOwnProperty('centrix')) {
        // Old Origin format
        if (this.payload.details.centrix.hasOwnProperty('data_sets')) {
          array = this.payload.details.centrix.data_sets.smart_id_data
        } else if (this.payload.details.centrix.hasOwnProperty('result')) {
          array = this.payload.details.centrix.result.smart_id_data
        }
      } else if (this.payload.details.hasOwnProperty('Centrix')) {
        // New Sumsub format
        if (this.payload.details.Centrix.hasOwnProperty('data_sets')) {
          array = this.payload.details.Centrix.smart_id_data
        } else if (this.payload.details.Centrix.hasOwnProperty('result')) {
          array = this.payload.details.Centrix.result.smart_id_data
        }
      }
      let matrix = []
      if (array) {
        array.forEach((e) => {
          matrix.push({
            source: e.description,
            abbreviation: sources[e.name],
            name: icons[e.name_match_status],
            dob: icons[e.dateofbirth_match_status],
            address: icons[e.address_match_status]
          })
        })
      }
      return matrix
    }
  }
}
</script>
