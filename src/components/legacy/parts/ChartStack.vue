<template>
  <horizontal-bar :chart-data="datacollection" />
</template>

<script>
import { HorizontalBar } from 'vue-chartjs'

export default {
  extends: HorizontalBar,
  mounted () {
    // Overwriting base render method with actual data.
    this.renderChart(data, options)
  }
}
</script>

<style scoped>

</style>