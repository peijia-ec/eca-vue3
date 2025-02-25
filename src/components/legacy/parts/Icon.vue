<template>
  <span
    v-if="icon"
    class="icon"
  ><i
    class="fa"
    :class="classComp"
  /></span>
</template>

<script>
export default {
  name: 'Icon',
  props: ['type', 'classes'],
  data () {
    return {
      icons: {
        address: 'fa-home',
        crypto: 'fa-btc',
        fiat: 'fa-money',
        privacy: 'fa-user-secret'
      }
    }
  },
  computed: {
    icon () {
      return (this.type && this.icons.hasOwnProperty(this.type)) ? this.icons[this.type] : null
    },
    classComp () {
      let classes = []
      if (this.icon) {
        classes.push(this.icon)
      }
      if (this.classes) {
        classes.push(this.classes)
      }
      return classes.join(' ')
    }
  }
}
</script>
