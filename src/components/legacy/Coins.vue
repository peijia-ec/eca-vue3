<template>
  <section class="section">
    <b-tabs v-model="activeTab">
      <template v-for="tab in tabs">
        <b-tab-item
          :key="tab.id"
          :value="tab.id"
          :label="tab.label"
        >
          <component :is="tab.content" />
        </b-tab-item>
      </template>
    </b-tabs>
  </section>
</template>

<script>
import WebCoins from './coins/WebCoins.vue'
import AppCoins from './coins/AppCoins.vue'

export default {
  name: 'Coins',
  components: [WebCoins, AppCoins],
  data () {
    return {
      activeTab: 'web',
      tabs: [{
        id: 'web',
        label: 'Web',
        content: WebCoins
      }, {
        id: 'app',
        label: 'App',
        content: AppCoins
      }]
    }
  }
}
</script>
