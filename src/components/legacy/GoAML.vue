<template>
  <div>
    <div class="tabs">
      <ul>
        <li :class="{'is-active': activeTab === 'ptr'}">
          <a @click="activeTab = 'ptr'">PTR</a>
        </li>
        <li :class="{'is-active': activeTab === 'str'}">
          <a @click="activeTab = 'str'">STR</a>
        </li>
        <!--        <li :class="{'is-active': activeTab === 'sar'}">-->
        <!--          <a @click="activeTab = 'sar'">SAR</a>-->
        <!--        </li>-->
      </ul>
    </div>
    <div class="block">
      <PTR v-if="activeTab === 'ptr'" />
      <STR v-if="activeTab === 'str'" />
      <!--      <SAR v-if="activeTab === 'sar'" />-->
    </div>
  </div>
</template>

<script>
import STR from './goaml/STR.vue'
import PTR from './goaml/PTR.vue';

export default {
  name: 'GoAML',
  components: {
    PTR,
    STR
  },
  data () {
    return {
      activeTab: 'str'
    }
  },
}
</script>
