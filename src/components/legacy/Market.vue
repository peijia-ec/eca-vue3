<template>
  <div class="container">
    <GChart
      v-if="chartData"
      type="BarChart"
      :data="chartData"
      :options="chartOptions"
    />
    <GChart
      v-if="chartData"
      type="BarChart"
      :data="chartData"
      :options="chartOptions2"
    />
    <table
      v-if="days.length"
      class="table is-fullwidth"
    >
      <thead>
        <tr>
          <th>Date</th>
          <th
            v-for="merchant in merchants"
            :key="'head'+merchant"
          >
            {{ merchant }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in days"
          :key="'day'+i"
        >
          <td>{{ row.date }}</td>
          <td
            v-for="merchant in merchants"
            :key="'data'+merchant"
          >
            {{ vol(row, merchant) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { GChart } from 'vue-google-charts/legacy'

export default {
  name: 'Market',
  components: {GChart},
  data () {
    return {
      days: [],
      merchants: [],
      chartData: null,
      chartOptions: {
        isStacked: 'percent',
        height: 600,
        legend: {position: 'top', maxLines: 3},
        hAxis: {
          minValue: 0,
          ticks: [0, 0.25, 0.5, 0.75, 1]
        }
      },
      chartOptions2: {
        isStacked: true,
        height: 600,
        legend: {position: 'top', maxLines: 3}
      }
    }
  },
  mounted () {
    this.ecApi('admin', 'getMarket')
      .then((data) => {
        if (!data || !data.hasOwnProperty('market')) {
          return
        }
        if (data.market.length === 0) {
          return
        }
        // Get the list of merchants
        this.merchants = [...new Set(['Easy Crypto'].concat(data.market.map(x => x.merchant)))]
        let date = data.market[0].date
        let dayData = {}
        for (let row of data.market) {
          if (row.date !== date) {
            // new date
            date = row.date
            this.days.push(dayData)
            dayData = {}
          }
          dayData.date = row.date
          dayData[row.merchant] = parseFloat(row.volume)
        }
        this.days.push(dayData)

        let cdata = [['Date'].concat(this.merchants)]
        for (let i = 0; i < Math.min(30, this.days.length); i++) {
          let day = this.days[i]
          let row = [day.date]
          for (let merchant of this.merchants) {
            let vol = day[merchant] ? parseFloat(day[merchant]) : 0
            if (vol < 0) {
              vol = 0
            }
            row.push(vol)
          }
          cdata.push(row)
        }
        this.chartData = cdata
      })
      .catch(e => console.log(e))
  },
  methods: {
    vol (row, merchant) {
      return row.hasOwnProperty(merchant) && row[merchant] ? parseFloat(row[merchant]).toFixed(2) : ''
    },
    total (row) {
      let total = 0
      for (let merchant of this.merchants) {
        if (row[merchant]) {
          total += row[merchant]
        }
      }
      return total
    },
    width (row, merchant) {
      if (!row[merchant]) {
        return 0
      } else {
        return Math.round(row[merchant] / this.total(row) * 10000) / 100
      }
    },
    round (val) {
      return Math.round(val * 100) / 100
    }
  }
}
</script>
